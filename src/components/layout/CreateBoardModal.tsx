import { useState } from "react";
import { z } from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Button } from "@/components/ui/button";
import { useCreateBoard } from "@/hooks/useCustomBoards";
import { useAuth } from "@/contexts/AuthContext";
import { UserMultiSelect } from "./UserMultiSelect";
import { Loader2, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { premiumZinc } from "@/styles/premium-zinc";

const formSchema = z.object({
  name: z
    .string()
    .min(1, "Nome é obrigatório")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  description: z.string().max(500, "Descrição deve ter no máximo 500 caracteres").optional(),
  visibility: z.enum(["all", "private", "specific"]),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateBoardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateBoardModal({ open, onOpenChange }: CreateBoardModalProps) {
  const createBoard = useCreateBoard();
  const { user } = useAuth();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      visibility: "all",
    },
  });

  const visibility = useWatch({
    control: form.control,
    name: "visibility",
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await createBoard.mutateAsync({
        name: values.name,
        description: values.description,
        visibility: values.visibility,
        selectedUsers: values.visibility === "specific" ? selectedUsers : [],
      });
      form.reset();
      setSelectedUsers([]);
      onOpenChange(false);
    } catch (error) {
      // Error is handled in the mutation
    }
  };

  const handleClose = () => {
    form.reset();
    setSelectedUsers([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] flex flex-col bg-zinc-950 border border-zinc-800/60 text-zinc-100">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-zinc-100 font-['Krona_One']">
            <LayoutGrid className="h-5 w-5 text-[#CBC5EA]" />
            Criar Novo Board
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Crie um novo board para organizar suas tarefas e projetos.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 overflow-y-auto flex-1 pr-1">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">Nome do Board *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Sprint Backlog, Pipeline de Vendas..."
                      className={premiumZinc.input}
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
                  <FormLabel className="text-zinc-300">Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva o propósito deste board..."
                      className={cn("resize-none", premiumZinc.input)}
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="visibility"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">Visibilidade</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className={premiumZinc.selectTrigger}>
                        <SelectValue placeholder="Selecione quem pode ver" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className={premiumZinc.popoverContent}>
                      <SelectItem value="all">
                        <div className="flex flex-col">
                          <span>Todos os usuários</span>
                          <span className="text-xs text-zinc-500">
                            Qualquer usuário autenticado pode ver
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="private">
                        <div className="flex flex-col">
                          <span>Apenas eu</span>
                          <span className="text-xs text-zinc-500">
                            Somente você pode ver e editar
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="specific">
                        <div className="flex flex-col">
                          <span>Usuários específicos</span>
                          <span className="text-xs text-zinc-500">
                            Selecione quem pode acessar
                          </span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Conditional user selector */}
            {visibility === "specific" && (
              <div className="space-y-2">
                <FormLabel className="text-zinc-300">Selecionar usuários</FormLabel>
                <UserMultiSelect
                  selectedUsers={selectedUsers}
                  onSelectionChange={setSelectedUsers}
                  excludeUserId={user?.id}
                />
                <FormDescription className="text-zinc-500">
                  Você será incluído automaticamente como membro do board.
                </FormDescription>
              </div>
            )}

            <DialogFooter className="gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createBoard.isPending}
                className="bg-[#ED6A5A] hover:bg-[#e05a4a] text-white border-0"
              >
                {createBoard.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Criar Board
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
