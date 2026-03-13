"use client";

import { useMutation } from "convex/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "../../../convex/_generated/api";
import { Doc } from "../../../convex/_generated/dataModel";
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
import { Pencil } from "lucide-react";
import { type KrType, getKrTypeLabel, getStrategy } from "@/lib/kr-types";

const directionOptions = [
  { value: "INCREASING", label: "Crescente" },
  { value: "DECREASING", label: "Decrescente" },
] as const;

function resolveKrType(kr: Doc<"keyResults">): KrType {
  if (kr.krType) return kr.krType as KrType;
  switch (kr.measurementType) {
    case "FINANCIAL":
    case "NUMERIC":
      return "CUMULATIVE_NUMERIC";
    case "PERCENTUAL":
      return "PROGRESSIVE_PERCENTAGE";
    case "MILESTONE":
      return "STAGE_GATE";
    default:
      return "CUMULATIVE_NUMERIC";
  }
}

const formSchema = z.object({
  title: z
    .string()
    .min(2, { message: "O título deve ter pelo menos 2 caracteres." }),
  targetValue: z.string().optional(),
  initialValue: z.string().optional(),
  unit: z.string().optional(),
  direction: z.enum(["INCREASING", "DECREASING"]),
  currency: z.string().optional(),
  externalLink: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.trim() === "" || /^https?:\/\/.+/.test(val),
      { message: "O link deve começar com http:// ou https://." }
    ),
});

type FormValues = z.infer<typeof formSchema>;

interface EditKeyResultDialogProps {
  keyResult: Doc<"keyResults">;
}

export function EditKeyResultDialog({ keyResult }: EditKeyResultDialogProps) {
  const [open, setOpen] = useState(false);
  const updateKeyResult = useMutation(api.keyResults.updateKeyResult);

  const hasProgress = keyResult.hasProgress;
  const krType = resolveKrType(keyResult);
  const strategy = getStrategy(krType);
  const isMilestone = krType === "STAGE_GATE";
  const isPercentual = krType === "PROGRESSIVE_PERCENTAGE";
  const isFinancial = keyResult.measurementType === "FINANCIAL" ||
    (krType === "CUMULATIVE_NUMERIC" && !!(keyResult.typeConfig as Record<string, unknown>)?.currency);
  const isNumeric = krType === "CUMULATIVE_NUMERIC" && !isFinancial;
  const showDirection = strategy.supportsDirection;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: keyResult.title,
      targetValue: String(keyResult.targetValue),
      initialValue: String(keyResult.initialValue),
      unit: keyResult.unit,
      direction: keyResult.direction ?? "INCREASING",
      currency: keyResult.currency ?? "",
      externalLink: keyResult.externalLink ?? "",
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      await updateKeyResult({
        id: keyResult._id,
        title: values.title,
        ...((!isMilestone && !isPercentual) && {
          targetValue: Number(values.targetValue),
          initialValue: Number(values.initialValue),
        }),
        ...(!isMilestone && {
          direction: values.direction,
        }),
        ...(isNumeric && { unit: values.unit }),
        ...(isFinancial && { currency: values.currency }),
        externalLink: values.externalLink || undefined,
      });
      toast.success("Key Result atualizado com sucesso");
      setOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao atualizar Key Result"
      );
    }
  }

  const measurementLabel = getKrTypeLabel(krType);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
          aria-label="Editar Key Result"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Key Result</DialogTitle>
          <DialogDescription>
            Tipo de medida: {measurementLabel}
            {hasProgress && " — Progresso registrado"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isMilestone && !isPercentual && (
              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="initialValue"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Valor Inicial</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="any"
                          {...field}
                        />
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
                        <Input
                          type="number"
                          step="any"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {isFinancial && (
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Moeda</FormLabel>
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

            {isNumeric && (
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidade de Medida</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: clientes, tickets" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {showDirection && (
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

            </div>
            <DialogFooter>
              <Button type="submit" className="bg-primary hover:bg-primary/90">Salvar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
