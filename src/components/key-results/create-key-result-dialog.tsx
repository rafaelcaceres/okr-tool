"use client";

import { useMutation, useQuery } from "convex/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Id } from "../../../convex/_generated/dataModel";
import {
  KR_TYPES,
  type KrType,
  getStrategy,
} from "@/lib/kr-types";
import { KrTypeSelector } from "./kr-type-selector";

const directionOptions = [
  { value: "INCREASING", label: "Crescente" },
  { value: "DECREASING", label: "Decrescente" },
] as const;

const formSchema = z
  .object({
    title: z
      .string()
      .min(2, { message: "O título deve ter pelo menos 2 caracteres." }),
    krType: z.enum(KR_TYPES as unknown as [string, ...string[]]),
    targetValue: z.string().optional(),
    initialValue: z.string().optional(),
    unit: z.string().optional(),
    direction: z.enum(["INCREASING", "DECREASING"]),
    currency: z.string().optional(),
    externalLink: z.string().optional(),
    responsibles: z.array(z.string()).optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.krType !== "STAGE_GATE" &&
      data.krType !== "CHECKLIST_COMPLIANCE" &&
      data.krType !== "MULTI_PHASE_WITH_RISK"
    ) {
      if (!data.targetValue || data.targetValue.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "O valor meta é obrigatório.",
          path: ["targetValue"],
        });
      }
    }

    if (data.externalLink && data.externalLink.trim() !== "") {
      if (!/^https?:\/\/.+/.test(data.externalLink)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "O link deve começar com http:// ou https://.",
          path: ["externalLink"],
        });
      }
    }
  });

type FormValues = z.infer<typeof formSchema>;

export function CreateKeyResultDialog({
  objectiveId,
}: {
  objectiveId: Id<"objectives">;
}) {
  const [open, setOpen] = useState(false);
  const createKeyResult = useMutation(api.keyResults.createKeyResult);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      krType: "CUMULATIVE_NUMERIC",
      targetValue: "100",
      initialValue: "0",
      unit: "",
      direction: "INCREASING",
      currency: "",
      externalLink: "",
      responsibles: [],
    },
  });

  const members = useQuery(api.members.getMembers);

  const selectedKrType = form.watch("krType") as KrType;
  const strategy = getStrategy(selectedKrType);

  const showNumericFields =
    selectedKrType === "CUMULATIVE_NUMERIC" ||
    selectedKrType === "PROGRESSIVE_PERCENTAGE" ||
    selectedKrType === "PERIODIC_INDEX" ||
    selectedKrType === "CHECKLIST_COMPLIANCE";
  const showUnitField =
    selectedKrType === "CUMULATIVE_NUMERIC" ||
    selectedKrType === "PERIODIC_INDEX";
  const showCurrencyField = selectedKrType === "CUMULATIVE_NUMERIC";
  const showDirectionField = strategy.supportsDirection;
  const isStructuredType =
    selectedKrType === "STAGE_GATE" ||
    selectedKrType === "CHECKLIST_COMPLIANCE" ||
    selectedKrType === "MULTI_PHASE_WITH_RISK";

  async function onSubmit(values: FormValues) {
    try {
      const krType = values.krType as KrType;
      let unit = values.unit || "";
      let targetValue = Number(values.targetValue) || 0;
      let initialValue = Number(values.initialValue) || 0;
      let typeConfig: Record<string, unknown>;

      switch (krType) {
        case "CUMULATIVE_NUMERIC":
          if (values.currency) unit = values.currency;
          typeConfig = {
            direction: values.direction,
            unit: unit || "unidades",
            ...(values.currency ? { currency: values.currency } : {}),
          };
          break;
        case "PROGRESSIVE_PERCENTAGE":
          unit = "%";
          typeConfig = { direction: values.direction };
          break;
        case "STAGE_GATE":
          unit = "estágios";
          targetValue = 0;
          initialValue = 0;
          typeConfig = { stages: [] };
          break;
        case "PERIODIC_INDEX":
          typeConfig = {
            direction: values.direction,
            unit: unit || "pontos",
          };
          break;
        case "CHECKLIST_COMPLIANCE":
          unit = "%";
          typeConfig = {
            categories: [],
            evaluationFrequency: "QUARTERLY",
          };
          break;
        case "MULTI_PHASE_WITH_RISK":
          unit = "fases";
          targetValue = 100;
          initialValue = 0;
          typeConfig = {
            workstreams: [],
            phaseWeight: 0.7,
            riskWeight: 0.3,
            criticalIncidents: [],
            maxTolerableIncidents: 0,
          };
          break;
        default:
          typeConfig = { direction: values.direction, unit };
      }

      await createKeyResult({
        objectiveId,
        title: values.title,
        targetValue,
        unit: unit || "unidades",
        initialValue,
        krType,
        typeConfig,
        direction: values.direction,
        responsibles: values.responsibles?.length
          ? (values.responsibles as Id<"members">[])
          : undefined,
      });
      toast.success("Key Result criado com sucesso");
      setOpen(false);
      form.reset();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao criar Key Result"
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          className="bg-secondary/80 hover:bg-secondary"
        >
          <Plus className="h-4 w-4 mr-1" /> Adicionar KR
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Adicionar Key Result</DialogTitle>
          <DialogDescription>
            Defina um resultado-chave mensurável para este objetivo.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Alcançar 1000 usuários ativos"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="krType"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <KrTypeSelector
                      value={field.value as KrType}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {showNumericFields && (
              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="initialValue"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Valor Inicial</FormLabel>
                      <FormControl>
                        <Input type="number" step="any" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="targetValue"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Valor Meta</FormLabel>
                      <FormControl>
                        <Input type="number" step="any" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {showCurrencyField && (
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Moeda{" "}
                      <span className="text-muted-foreground font-normal">
                        (opcional)
                      </span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a moeda (se financeiro)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="BRL">R$ (BRL)</SelectItem>
                        <SelectItem value="USD">$ (USD)</SelectItem>
                        <SelectItem value="EUR">€ (EUR)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {showUnitField && (
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidade de Medida</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: clientes, tickets, pontos"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {showDirectionField && (
              <FormField
                control={form.control}
                name="direction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Direção</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {directionOptions.map((dir) => (
                          <SelectItem key={dir.value} value={dir.value}>
                            {dir.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {isStructuredType && (
              <p className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-md border">
                {selectedKrType === "STAGE_GATE" &&
                  "Os estágios serão configurados após a criação do Key Result."}
                {selectedKrType === "CHECKLIST_COMPLIANCE" &&
                  "As categorias e itens do checklist serão configurados após a criação do Key Result."}
                {selectedKrType === "MULTI_PHASE_WITH_RISK" &&
                  "Os workstreams e fases serão configurados após a criação do Key Result."}
              </p>
            )}

            {members && members.length > 0 && (
              <FormField
                control={form.control}
                name="responsibles"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Responsável{" "}
                      <span className="text-muted-foreground font-normal">
                        (opcional)
                      </span>
                    </FormLabel>
                    <div className="space-y-2">
                      <Select
                        onValueChange={(memberId) => {
                          const current = field.value ?? [];
                          if (!current.includes(memberId)) {
                            field.onChange([...current, memberId]);
                          }
                        }}
                        value=""
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um membro" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {members
                            .filter((m) => !(field.value ?? []).includes(m._id))
                            .map((m) => (
                              <SelectItem key={m._id} value={m._id}>
                                {m.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      {(field.value ?? []).length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {(field.value ?? []).map((id) => {
                            const member = members.find((m) => m._id === id);
                            return (
                              <Badge
                                key={id}
                                variant="secondary"
                                className="gap-1 pr-1"
                              >
                                {member?.name ?? "..."}
                                <button
                                  type="button"
                                  onClick={() =>
                                    field.onChange(
                                      (field.value ?? []).filter((v) => v !== id)
                                    )
                                  }
                                  className="rounded-full hover:bg-muted p-0.5"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="externalLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Link Externo{" "}
                    <span className="text-muted-foreground font-normal">
                      (opcional)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://jira.example.com/epic/123"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90"
              >
                Adicionar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
