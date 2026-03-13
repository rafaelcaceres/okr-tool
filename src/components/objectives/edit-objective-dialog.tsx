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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import { Pencil } from "lucide-react";

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
});

interface EditObjectiveDialogProps {
  objective: Doc<"objectives">;
}

export function EditObjectiveDialog({ objective }: EditObjectiveDialogProps) {
  const [open, setOpen] = useState(false);
  const updateObjective = useMutation(api.objectives.updateObjective);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: objective.title,
      description: objective.description ?? "",
    },
  });

  const descriptionValue = form.watch("description") ?? "";

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await updateObjective({
        id: objective._id,
        title: values.title,
        description: values.description || undefined,
      });
      toast.success("Objetivo atualizado com sucesso");
      setOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao atualizar objetivo"
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-gray-400 hover:text-gray-600"
          aria-label="Editar objetivo"
        >
          <Pencil className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Objetivo</DialogTitle>
          <DialogDescription>
            Atualize o título e a descrição do objetivo.
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
                    <Input {...field} />
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
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
