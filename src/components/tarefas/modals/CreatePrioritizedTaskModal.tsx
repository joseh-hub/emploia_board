import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogTitle,
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Star,
  FolderKanban,
  CalendarDays,
  Users,
  Flag,
  Columns3,
  AlertTriangle,
  ArrowUp,
  Minus,
  ArrowDown,
  ChevronDown,
  AlignLeft,
  FileText,
  Loader2,
} from "lucide-react";
import { useProjetos } from "@/hooks/useProjetos";
import { useProfiles } from "@/hooks/useProfiles";
import { useCreateProjetoTarefa, ProjetoTarefa } from "@/hooks/useProjetoTarefas";
import { useTarefaBoardColumns } from "@/hooks/useTarefaBoardColumns";
import { useTaskTemplates } from "@/hooks/useTaskTemplates";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserMultiSelect } from "@/components/layout/UserMultiSelect";
import { cn } from "@/lib/utils";

const schema = z.object({
  titulo: z.string().min(1, "Título é obrigatório").max(200),
  projeto_id: z.string().min(1, "Selecione um projeto"),
  column_id: z.string().optional(),
  priority: z.string().default("medium"),
  status: z.string().default("pendente"),
  due_date: z.string().optional(),
  descricao: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const PRIORITY_OPTIONS = [
  { value: "urgent", label: "Urgente", icon: AlertTriangle, color: "text-red-400", dot: "bg-red-400" },
  { value: "high", label: "Alta", icon: ArrowUp, color: "text-orange-400", dot: "bg-orange-400" },
  { value: "medium", label: "Média", icon: Minus, color: "text-blue-400", dot: "bg-blue-400" },
  { value: "low", label: "Baixa", icon: ArrowDown, color: "text-green-400", dot: "bg-green-400" },
];

const STATUS_OPTIONS = [
  { value: "pendente", label: "Pendente" },
  { value: "em_progresso", label: "Em Progresso" },
  { value: "concluido", label: "Concluído" },
];

interface CreatePrioritizedTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (tarefaId: string) => void;
}

export function CreatePrioritizedTaskModal({
  open,
  onOpenChange,
  onCreated,
}: CreatePrioritizedTaskModalProps) {
  const [assignedUsers, setAssignedUsers] = useState<string[]>([]);
  const [assigneesOpen, setAssigneesOpen] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>();
  const [selectedTemplateName, setSelectedTemplateName] = useState<string | undefined>();

  const { data: projetos = [] } = useProjetos();
  const { data: profiles = [] } = useProfiles();
  const { data: columns = [] } = useTarefaBoardColumns();
  const { data: templates = [], isLoading: templatesLoading } = useTaskTemplates();
  const createTarefa = useCreateProjetoTarefa();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      titulo: "",
      projeto_id: "",
      column_id: "",
      priority: "medium",
      status: "pendente",
      due_date: "",
      descricao: "",
    },
  });

  const handleClose = () => {
    form.reset();
    setAssignedUsers([]);
    setShowDescription(false);
    setSelectedTemplateId(undefined);
    setSelectedTemplateName(undefined);
    onOpenChange(false);
  };

  const handleApplyTemplate = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (!template) return;

    setSelectedTemplateId(templateId);
    setSelectedTemplateName(template.name);

    // Pre-fill form fields from template
    if (template.titulo_padrao) form.setValue("titulo", template.titulo_padrao);
    if (template.descricao_padrao) {
      form.setValue("descricao", template.descricao_padrao);
      setShowDescription(true);
    }

    // Pre-fill assigned users from template
    const users = template.assigned_users_padrao?.length
      ? template.assigned_users_padrao
      : template.assigned_user_padrao
        ? [template.assigned_user_padrao]
        : [];
    if (users.length > 0) setAssignedUsers(users);
  };

  const onSubmit = async (data: FormData) => {
    const created: ProjetoTarefa = await createTarefa.mutateAsync({
      projeto_id: data.projeto_id,
      titulo: data.titulo,
      descricao: data.descricao || undefined,
      priority: data.priority,
      status: data.status,
      column_id: data.column_id || undefined,
      due_date: data.due_date || undefined,
      assigned_users: assignedUsers,
      priorizado: true,
      template_id: selectedTemplateId,
    });

    // Close create modal first, then open detail
    handleClose();
    onCreated?.(created.id);
  };

  const assignedProfiles = assignedUsers
    .map((id) => profiles.find((p) => p.id === id))
    .filter(Boolean);

  const selectedPriority =
    PRIORITY_OPTIONS.find((p) => p.value === form.watch("priority")) ?? PRIORITY_OPTIONS[2];

  const selectedColumnId = form.watch("column_id");
  const selectedColumn = columns.find((c) => c.id === selectedColumnId);

  const sortedProjetos = [...projetos].sort((a, b) => {
    const nameA = (a.company_name || a.project_name || "").toLowerCase();
    const nameB = (b.company_name || b.project_name || "").toLowerCase();
    return nameA.localeCompare(nameB, "pt-BR");
  });

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg p-0 overflow-hidden bg-zinc-950 border-zinc-800/60 text-zinc-100 gap-0">
        <DialogTitle className="sr-only">Nova Tarefa Priorizada</DialogTitle>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
            </div>
            <div>
              <h2 className="font-['Krona_One'] text-sm text-zinc-100 leading-snug">
                Nova Tarefa
              </h2>
              <p className="font-['Lexend_Deca'] text-[11px] text-zinc-500 leading-snug mt-0.5">
                Será adicionada às tarefas priorizadas
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Template selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-7 gap-1.5 px-2 font-['Lexend_Deca'] text-xs transition-colors",
                    selectedTemplateName
                      ? "text-indigo-400 hover:text-indigo-300 hover:bg-zinc-800"
                      : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
                  )}
                  disabled={templatesLoading}
                >
                  {templatesLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <FileText className="h-3.5 w-3.5" />
                  )}
                  {selectedTemplateName || "Template"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 bg-zinc-900 border-zinc-800">
                {templates.length === 0 ? (
                  <div className="py-4 px-3 text-center">
                    <FileText className="h-7 w-7 mx-auto mb-2 text-zinc-600" />
                    <p className="text-sm text-zinc-500 font-['Lexend_Deca']">Nenhum template</p>
                    <p className="text-xs text-zinc-600 mt-0.5 font-['Lexend_Deca']">Crie em Ferramentas → Templates</p>
                  </div>
                ) : (
                  <>
                    {selectedTemplateId && (
                      <>
                        <DropdownMenuItem
                          className="cursor-pointer text-zinc-400 text-xs font-['Lexend_Deca']"
                          onClick={() => {
                            setSelectedTemplateId(undefined);
                            setSelectedTemplateName(undefined);
                          }}
                        >
                          Remover template
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-zinc-800" />
                      </>
                    )}
                    {templates.filter((t) => !t.is_global).length > 0 && (
                      <>
                        <DropdownMenuLabel className="text-xs text-zinc-500 font-['Lexend_Deca']">Templates do Projeto</DropdownMenuLabel>
                        {templates.filter((t) => !t.is_global).map((t) => (
                          <DropdownMenuItem
                            key={t.id}
                            className="cursor-pointer font-['Lexend_Deca']"
                            onClick={() => handleApplyTemplate(t.id)}
                          >
                            <div className="flex flex-col gap-0.5">
                              <span className="text-sm font-medium text-zinc-200">{t.name}</span>
                              {t.checklists && t.checklists.length > 0 && (
                                <span className="text-xs text-zinc-500">{t.checklists.length} itens de checklist</span>
                              )}
                            </div>
                          </DropdownMenuItem>
                        ))}
                      </>
                    )}
                    {templates.filter((t) => !t.is_global).length > 0 && templates.filter((t) => t.is_global).length > 0 && (
                      <DropdownMenuSeparator className="bg-zinc-800" />
                    )}
                    {templates.filter((t) => t.is_global).length > 0 && (
                      <>
                        <DropdownMenuLabel className="text-xs text-zinc-500 font-['Lexend_Deca']">Templates Globais</DropdownMenuLabel>
                        {templates.filter((t) => t.is_global).map((t) => (
                          <DropdownMenuItem
                            key={t.id}
                            className="cursor-pointer font-['Lexend_Deca']"
                            onClick={() => handleApplyTemplate(t.id)}
                          >
                            <div className="flex flex-col gap-0.5">
                              <span className="text-sm font-medium text-zinc-200">{t.name}</span>
                              {t.checklists && t.checklists.length > 0 && (
                                <span className="text-xs text-zinc-500">{t.checklists.length} itens de checklist</span>
                              )}
                            </div>
                          </DropdownMenuItem>
                        ))}
                      </>
                    )}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Badge
              variant="outline"
              className="gap-1.5 border-amber-500/30 bg-amber-500/10 text-amber-400 font-['Lexend_Deca'] text-[10px] font-medium tracking-wider uppercase px-2 py-0.5"
            >
              <Star className="h-2.5 w-2.5 fill-amber-400" />
              Priorizada
            </Badge>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="px-6 space-y-5 pb-6">

              {/* Título */}
              <FormField
                control={form.control}
                name="titulo"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormControl>
                      <input
                        {...field}
                        placeholder="Nome da tarefa..."
                        autoFocus
                        className="w-full bg-transparent border-0 border-b border-zinc-800 focus:border-zinc-600 outline-none text-zinc-100 font-['Lexend_Deca'] text-base placeholder:text-zinc-600 pb-2 transition-colors"
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-red-400" />
                  </FormItem>
                )}
              />

              {/* Projeto */}
              <FormField
                control={form.control}
                name="projeto_id"
                render={({ field }) => (
                  <FormItem className="space-y-0">
                    <div className="flex items-center gap-3 py-1.5">
                      <div className="flex items-center gap-2 w-28 shrink-0">
                        <FolderKanban className="h-3.5 w-3.5 text-zinc-500" />
                        <span className="font-['Lexend_Deca'] text-xs text-zinc-500">Projeto</span>
                      </div>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="h-8 border-0 bg-transparent hover:bg-zinc-900 focus:ring-0 text-zinc-200 font-['Lexend_Deca'] text-sm px-2 -mx-2 gap-1.5 data-[placeholder]:text-zinc-500">
                            <SelectValue placeholder="Selecionar projeto..." />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-900 border-zinc-800 max-h-52">
                            {sortedProjetos.length === 0 && (
                              <div className="px-3 py-4 text-center text-sm text-zinc-500 font-['Lexend_Deca']">
                                Nenhum projeto cadastrado
                              </div>
                            )}
                            {sortedProjetos.map((p) => (
                              <SelectItem
                                key={p.project_id}
                                value={p.project_id}
                                className="font-['Lexend_Deca'] text-sm"
                              >
                                {p.company_name || p.project_name || "Projeto sem nome"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </div>
                    <FormMessage className="text-xs text-red-400 pl-[6.5rem]" />
                  </FormItem>
                )}
              />

              {/* Coluna */}
              <FormField
                control={form.control}
                name="column_id"
                render={({ field }) => (
                  <FormItem className="space-y-0">
                    <div className="flex items-center gap-3 py-1.5">
                      <div className="flex items-center gap-2 w-28 shrink-0">
                        <Columns3 className="h-3.5 w-3.5 text-zinc-500" />
                        <span className="font-['Lexend_Deca'] text-xs text-zinc-500">Coluna</span>
                      </div>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className="h-8 border-0 bg-transparent hover:bg-zinc-900 focus:ring-0 text-zinc-200 font-['Lexend_Deca'] text-sm px-2 -mx-2 gap-1.5 data-[placeholder]:text-zinc-500">
                            <SelectValue placeholder="Selecionar coluna...">
                              {selectedColumn && (
                                <div className="flex items-center gap-2">
                                  <span
                                    className="h-2 w-2 rounded-full shrink-0"
                                    style={{ backgroundColor: selectedColumn.color }}
                                  />
                                  <span>{selectedColumn.name}</span>
                                </div>
                              )}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-900 border-zinc-800">
                            {columns.length === 0 && (
                              <div className="px-3 py-4 text-center text-sm text-zinc-500 font-['Lexend_Deca']">
                                Nenhuma coluna configurada
                              </div>
                            )}
                            {columns.map((col) => (
                              <SelectItem
                                key={col.id}
                                value={col.id}
                                className="font-['Lexend_Deca'] text-sm"
                              >
                                <div className="flex items-center gap-2">
                                  <span
                                    className="h-2 w-2 rounded-full shrink-0"
                                    style={{ backgroundColor: col.color }}
                                  />
                                  {col.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </div>
                  </FormItem>
                )}
              />

              {/* Divider */}
              <div className="h-px bg-zinc-800/60" />

              {/* Prioridade + Status */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Flag className="h-3.5 w-3.5 text-zinc-500" />
                        <FormLabel className="font-['Lexend_Deca'] text-xs text-zinc-500 leading-none">
                          Prioridade
                        </FormLabel>
                      </div>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="h-9 bg-zinc-900/60 border-zinc-800 text-zinc-200 font-['Lexend_Deca'] text-sm focus:ring-0 focus:border-zinc-700">
                            <SelectValue>
                              <div className="flex items-center gap-2">
                                <div className={cn("w-2 h-2 rounded-full shrink-0", selectedPriority.dot)} />
                                <span className={cn("font-medium text-sm", selectedPriority.color)}>
                                  {selectedPriority.label}
                                </span>
                              </div>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-900 border-zinc-800">
                            {PRIORITY_OPTIONS.map((opt) => {
                              const Icon = opt.icon;
                              return (
                                <SelectItem key={opt.value} value={opt.value} className="font-['Lexend_Deca']">
                                  <div className="flex items-center gap-2">
                                    <Icon className={cn("h-3.5 w-3.5", opt.color)} />
                                    <span className={opt.color}>{opt.label}</span>
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="h-3.5 w-3.5 rounded-full border-2 border-zinc-500" />
                        <FormLabel className="font-['Lexend_Deca'] text-xs text-zinc-500 leading-none">
                          Status
                        </FormLabel>
                      </div>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="h-9 bg-zinc-900/60 border-zinc-800 text-zinc-200 font-['Lexend_Deca'] text-sm focus:ring-0 focus:border-zinc-700">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-900 border-zinc-800">
                            {STATUS_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value} className="font-['Lexend_Deca']">
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Data de entrega + Responsáveis */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="due_date"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <CalendarDays className="h-3.5 w-3.5 text-zinc-500" />
                        <FormLabel className="font-['Lexend_Deca'] text-xs text-zinc-500 leading-none">
                          Entrega
                        </FormLabel>
                      </div>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          className="h-9 bg-zinc-900/60 border-zinc-800 text-zinc-200 font-['Lexend_Deca'] text-sm focus:border-zinc-700 focus-visible:ring-0 [color-scheme:dark]"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Responsáveis */}
                <div className="space-y-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Users className="h-3.5 w-3.5 text-zinc-500" />
                    <span className="font-['Lexend_Deca'] text-xs text-zinc-500">Responsáveis</span>
                  </div>
                  <Popover open={assigneesOpen} onOpenChange={setAssigneesOpen}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="w-full h-9 flex items-center gap-2 px-3 rounded-md bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-colors text-left font-['Lexend_Deca'] text-sm"
                      >
                        {assignedProfiles.length > 0 ? (
                          <div className="flex items-center gap-1.5 flex-1 min-w-0">
                            <div className="flex -space-x-1">
                              {assignedProfiles.slice(0, 3).map((p) => {
                                const initials = (p!.full_name || p!.email || "U")
                                  .split(" ")
                                  .slice(0, 2)
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase();
                                return (
                                  <Avatar key={p!.id} className="h-5 w-5 border border-zinc-900">
                                    <AvatarFallback className="text-[9px] bg-[#3F1757]/40 text-purple-300">
                                      {initials}
                                    </AvatarFallback>
                                  </Avatar>
                                );
                              })}
                            </div>
                            <span className="text-zinc-300 text-xs truncate">
                              {assignedProfiles.length === 1
                                ? assignedProfiles[0]!.full_name || assignedProfiles[0]!.email?.split("@")[0]
                                : `${assignedProfiles.length} pessoas`}
                            </span>
                          </div>
                        ) : (
                          <span className="text-zinc-600 flex-1">Ninguém ainda</span>
                        )}
                        <ChevronDown className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 p-3 bg-zinc-900 border-zinc-800" align="start">
                      <UserMultiSelect
                        selectedUsers={assignedUsers}
                        onSelectionChange={setAssignedUsers}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Descrição opcional */}
              {!showDescription ? (
                <button
                  type="button"
                  onClick={() => setShowDescription(true)}
                  className="flex items-center gap-2 text-zinc-600 hover:text-zinc-400 transition-colors font-['Lexend_Deca'] text-xs"
                >
                  <AlignLeft className="h-3.5 w-3.5" />
                  Adicionar descrição
                </button>
              ) : (
                <FormField
                  control={form.control}
                  name="descricao"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <AlignLeft className="h-3.5 w-3.5 text-zinc-500" />
                        <FormLabel className="font-['Lexend_Deca'] text-xs text-zinc-500 leading-none">
                          Descrição
                        </FormLabel>
                      </div>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Descreva a tarefa, contexto, requisitos..."
                          autoFocus
                          rows={3}
                          className="bg-zinc-900/60 border-zinc-800 text-zinc-200 font-['Lexend_Deca'] text-sm placeholder:text-zinc-600 focus-visible:ring-0 focus:border-zinc-700 resize-none"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800/60 bg-zinc-900/30">
              <p className="font-['Lexend_Deca'] text-[11px] text-zinc-600">
                Abrirá o detalhe da tarefa após criar
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="h-8 px-4 font-['Lexend_Deca'] text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={createTarefa.isPending}
                  className="h-8 px-5 font-['Lexend_Deca'] text-sm font-medium bg-[#ED6A5A] hover:bg-[#e05a4a] text-white border-0 transition-colors disabled:opacity-50"
                >
                  {createTarefa.isPending ? "Criando..." : "Criar Tarefa"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
