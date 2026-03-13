"use client";

import { useMutation, useQuery } from "convex/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
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
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";

const formSchema = z.object({
  title: z
    .string()
    .min(2, { message: "O título deve ter pelo menos 2 caracteres." })
    .max(250, { message: "O título deve ter no máximo 250 caracteres." }),
  description: z
    .string()
    .max(500, { message: "A descrição deve ter no máximo 500 caracteres." })
    .optional()
    .or(z.literal("")),
  cycleId: z.string().min(1, { message: "Selecione um ciclo." }),
  franchiseId: z.string().min(1, { message: "Selecione uma franquia." }),
});

export function CreateObjectiveDialog() {
  const [open, setOpen] = useState(false);
  const createObjective = useMutation(api.objectives.createObjective);
  const cycles = useQuery(api.cycles.getCycles);
  const franchises = useQuery(api.franchises.getFranchises);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      cycleId: "",
      franchiseId: "",
    },
  });

  const descriptionValue = form.watch("description") ?? "";

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await createObjective({
        title: values.title,
        description: values.description || undefined,
        cycleId: values.cycleId as Id<"cycles">,
        franchiseId: values.franchiseId as Id<"franchises">,
      });
      toast.success("Objetivo criado com sucesso");
      setOpen(false);
      form.reset();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao criar objetivo"
      );
    }
  }

  const availableCycles = cycles ?? [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Objetivo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Criar Objetivo</DialogTitle>
          <DialogDescription>
            Defina um novo objetivo para o ciclo de planejamento.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="cycleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ciclo</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um ciclo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableCycles.map((cycle) => (
                        <SelectItem key={cycle._id} value={cycle._id}>
                          {cycle.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="franchiseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Franquia</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma franquia" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {franchises?.map((franchise) => (
                        <SelectItem key={franchise._id} value={franchise._id}>
                          {franchise.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Aumentar a satisfação dos clientes"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva o objetivo de forma clara e inspiradora..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <div className="flex justify-between">
                    <FormMessage />
                    <span className="text-xs text-muted-foreground">
                      {descriptionValue.length}/500
                    </span>
                  </div>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Criar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
