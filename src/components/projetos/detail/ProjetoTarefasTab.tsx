import { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Plus,
  Trash2,
  Star,
  Users,
  CheckSquare,
  LayoutGrid,
  CheckCircle2,
  CalendarDays,
  Flag,
  AlertTriangle,
  ArrowUp,
  Minus,
  ArrowDown,
  FileText,
  MoreHorizontal,
  Copy,
  Edit2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useProjetoTarefas,
  useCreateProjetoTarefa,
  useDeleteProjetoTarefa,
  useUpdateProjetoTarefa,
  ProjetoTarefa,
  getAssignedUsers,
} from "@/hooks/useProjetoTarefas";
import { useToggleTarefaPrioridade, Tarefa } from "@/hooks/useTarefas";
import { useTarefaBoardColumns } from "@/hooks/useTarefaBoardColumns";
import { useProfiles, Profile } from "@/hooks/useProfiles";
import { TemplateSelector } from "@/components/templates/TemplateSelector";
import { useDefaultTemplates, useApplyTemplate, TaskTemplate } from "@/hooks/useTaskTemplates";
import { useTaskTemplates } from "@/hooks/useTaskTemplates";
import { UserMultiSelect } from "@/components/layout/UserMultiSelect";
import { TarefaDetailModal } from "@/components/tarefas/TarefaDetailModal";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ProjetoTarefasTabProps {
  projetoId: string;
}

const PRIORITY_OPTIONS = [
  { value: "urgent", label: "Urgente", icon: AlertTriangle, color: "text-red-500" },
  { value: "high", label: "Alta", icon: ArrowUp, color: "text-orange-500" },
  { value: "medium", label: "Média", icon: Minus, color: "text-blue-500" },
  { value: "low", label: "Baixa", icon: ArrowDown, color: "text-green-500" },
];

const STATUS_OPTIONS = [
  { value: "pendente", label: "Pendente", color: "text-muted-foreground", bg: "bg-muted/50" },
  { value: "em_progresso", label: "Em Progresso", color: "text-blue-500", bg: "bg-blue-500/10" },
  { value: "concluido", label: "Concluído", color: "text-emerald-500", bg: "bg-emerald-500/10" },
];

function getStatusInfo(status: string) {
  return STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];
}

function TarefaRow({
  tarefa,
  projetoId,
  onDelete,
  onDuplicate,
  onRename,
  columnName,
  columnColor,
  onOpenDetail,
}: {
  tarefa: ProjetoTarefa;
  projetoId: string;
  onDelete: () => void;
  onDuplicate: (t: ProjetoTarefa) => void;
  onRename: (t: ProjetoTarefa) => void;
  columnName?: string;
  columnColor?: string;
  onOpenDetail: (id: string) => void;
}) {
  const togglePrioridade = useToggleTarefaPrioridade();

  const completedCount = tarefa.checklists?.filter((c) => c.concluido).length || 0;
  const totalCount = tarefa.checklists?.length || 0;
  const isPriorizado = tarefa.priorizado ?? false;

  const handleTogglePrioridade = () => {
    togglePrioridade.mutate({
      tarefaId: tarefa.id,
      priorizado: !isPriorizado,
      projetoId,
    });
  };

  const statusInfo = getStatusInfo(tarefa.status || "pendente");
  const isOverdue = tarefa.due_date && tarefa.status !== "concluido" && new Date(tarefa.due_date) < new Date();

  return (
    <div 
      onClick={() => onOpenDetail(tarefa.id)}
      className="group grid grid-cols-[24px_minmax(0,1fr)_120px_100px_32px] items-center gap-4 py-2.5 px-4 hover:bg-zinc-800/40 border-b border-zinc-800/50 cursor-pointer transition-colors w-full"
    >
      {/* 1. Prioridade Star */}
      <button
        onClick={(e) => { e.stopPropagation(); handleTogglePrioridade(); }}
        className="flex items-center justify-center w-6 h-6 outline-none flex-shrink-0"
        title={isPriorizado ? "Despriorizar" : "Priorizar"}
      >
        <Star className={cn("h-4 w-4 transition-colors", isPriorizado ? "fill-warning text-warning" : "text-zinc-600 group-hover:text-zinc-400")} />
      </button>

      {/* 2. Title & Info (Strict Truncation Zone) */}
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-medium text-zinc-200 truncate group-hover:text-white transition-colors" title={tarefa.titulo || "Sem Nome"}>
          {tarefa.titulo || "Sem Nome"}
        </span>
        <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-500 font-medium">
          {totalCount > 0 && (
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-sm bg-zinc-950 border border-zinc-800/60 text-zinc-400">
              <CheckSquare className="h-[10px] w-[10px]" />
              {completedCount}/{totalCount}
            </span>
          )}
          {tarefa.due_date && (
            <span className={cn("flex items-center gap-1", isOverdue ? "text-red-400" : "")}>
              {totalCount > 0 && <span className="opacity-40">•</span>}
              <CalendarDays className="h-3 w-3" />
              {format(new Date(tarefa.due_date), "dd/MMM", { locale: ptBR })}
            </span>
          )}
        </div>
      </div>

      {/* 3. Column Badge (Fixed Width container via grid cell) */}
      <div className="flex items-center min-w-0 w-full overflow-hidden">
        {columnName ? (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-zinc-950/60 rounded border border-zinc-800/60 max-w-full">
             <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: columnColor || "#71717a" }} />
             <span className="text-[9px] font-bold text-zinc-400 truncate uppercase tracking-widest">{columnName}</span>
          </div>
        ) : (
          <span className="text-[10px] text-zinc-600 italic px-1 truncate">Sem coluna</span>
        )}
      </div>

      {/* 4. Status Dot (Fixed Width container via grid cell) */}
      <div className="flex items-center gap-1.5 px-1 min-w-0 w-full">
         <div className="w-1.5 h-1.5 rounded-full shadow-sm flex-shrink-0" style={{ backgroundColor: statusInfo.bg.includes('emerald') ? '#34d399' : statusInfo.bg.includes('blue') ? '#60a5fa' : '#71717a' }} />
         <span className={cn("text-[10px] font-medium truncate capitalize text-zinc-400")}>{statusInfo.label}</span>
      </div>

      {/* 5. Dropdown Actions (Fixed Width via grid cell) */}
      <div className="flex items-center justify-end w-full">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              onClick={(e) => e.stopPropagation()}
              className="h-7 w-7 flex items-center justify-center text-zinc-600 hover:text-zinc-300 opacity-0 group-hover:opacity-100 transition-all rounded-md hover:bg-zinc-800 outline-none flex-shrink-0"
              title="Ações"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-zinc-950 border-zinc-800 text-zinc-300 w-40">
            <DropdownMenuItem
              onClick={(e) => { e.stopPropagation(); onRename(tarefa); }}
              className="focus:bg-zinc-900 focus:text-white cursor-pointer"
            >
              <Edit2 className="mr-2 h-3.5 w-3.5" />
              Renomear
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => { e.stopPropagation(); onDuplicate(tarefa); }}
              className="focus:bg-zinc-900 focus:text-white cursor-pointer"
            >
              <Copy className="mr-2 h-3.5 w-3.5" />
              Duplicar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export function ProjetoTarefasTab({ projetoId }: ProjetoTarefasTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskUsers, setNewTaskUsers] = useState<string[]>([]);
  const [newTaskColumn, setNewTaskColumn] = useState("");
  const [newTaskPriorizado, setNewTaskPriorizado] = useState(false);
  const [newTaskPriority, setNewTaskPriority] = useState("");
  const [newTaskStatus, setNewTaskStatus] = useState("");
  const [newTaskStartDate, setNewTaskStartDate] = useState<Date | undefined>(undefined);
  const [newTaskDueDate, setNewTaskDueDate] = useState<Date | undefined>(undefined);
  const [newTaskTemplateId, setNewTaskTemplateId] = useState("");

  const [selectedTarefaId, setSelectedTarefaId] = useState<string | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [tarefaToRename, setTarefaToRename] = useState<ProjetoTarefa | null>(null);
  const [renameTitle, setRenameTitle] = useState("");

  const { data: tarefas, isLoading } = useProjetoTarefas(projetoId);
  const { data: columns } = useTarefaBoardColumns();
  const { data: defaultTemplates } = useDefaultTemplates();
  const { data: allTemplates } = useTaskTemplates();
  const applyTemplate = useApplyTemplate();
  const appliedTemplatesRef = useRef<Set<string>>(new Set());
  const createTarefa = useCreateProjetoTarefa();
  const deleteTarefa = useDeleteProjetoTarefa();
  const updateTarefa = useUpdateProjetoTarefa();

  const columnMap = columns?.reduce((acc, col) => {
    acc[col.id] = { name: col.name, color: col.color };
    return acc;
  }, {} as Record<string, { name: string; color: string }>) || {};

  // Auto-apply default templates
  useEffect(() => {
    if (!defaultTemplates || !tarefas || isLoading) return;
    const existingTitles = new Set(tarefas.map(t => t.titulo));
    for (const template of defaultTemplates) {
      if (appliedTemplatesRef.current.has(template.id)) continue;
      if (existingTitles.has(template.titulo_padrao)) {
        appliedTemplatesRef.current.add(template.id);
        continue;
      }
      appliedTemplatesRef.current.add(template.id);
      applyTemplate.mutate({ templateId: template.id, projetoId });
    }
  }, [defaultTemplates, tarefas, isLoading, projetoId]);

  const selectedTarefa = useMemo(() => {
    if (!selectedTarefaId || !tarefas) return null;
    const found = tarefas.find(t => t.id === selectedTarefaId);
    if (!found) return null;
    return found as unknown as Tarefa;
  }, [tarefas, selectedTarefaId]);

  const sortedTarefas = useMemo(() => {
    if (!tarefas) return [];
    return [...tarefas].sort((a, b) => {
      if (a.priorizado === b.priorizado) return 0;
      return a.priorizado ? -1 : 1;
    });
  }, [tarefas]);

  const totalCount = tarefas?.length || 0;

  const handleTemplateSelect = (templateId: string) => {
    const realId = templateId === "none" ? "" : templateId;
    setNewTaskTemplateId(realId);
    if (realId) {
      const tpl = allTemplates?.find(t => t.id === realId);
      if (tpl) {
        if (tpl.titulo_padrao) setNewTaskTitle(tpl.titulo_padrao);
        if (tpl.description) setNewTaskDescription(tpl.description);
      }
    }
  };

  const resetModalForm = () => {
    setNewTaskTitle("");
    setNewTaskDescription("");
    setNewTaskUsers([]);
    setNewTaskColumn("");
    setNewTaskPriorizado(false);
    setNewTaskPriority("");
    setNewTaskStatus("");
    setNewTaskStartDate(undefined);
    setNewTaskDueDate(undefined);
    setNewTaskTemplateId("");
  };

  const handleOpenModal = () => {
    resetModalForm();
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetModalForm();
  };

  const handleCreateTask = () => {
    if (!newTaskTitle.trim()) return;
    createTarefa.mutate(
      {
        projeto_id: projetoId,
        titulo: newTaskTitle.trim(),
        descricao: newTaskDescription.trim() || undefined,
        assigned_users: newTaskUsers.length > 0 ? newTaskUsers : undefined,
        column_id: newTaskColumn || undefined,
        priority: newTaskPriority || undefined,
        priorizado: newTaskPriorizado,
        status: newTaskStatus || undefined,
        start_date: newTaskStartDate ? newTaskStartDate.toISOString() : undefined,
        due_date: newTaskDueDate ? newTaskDueDate.toISOString() : undefined,
        template_id: newTaskTemplateId || undefined,
      },
      { onSuccess: () => handleCloseModal() }
    );
  };

  const handleDeleteTask = (tarefaId: string) => {
    deleteTarefa.mutate({ id: tarefaId, projetoId });
  };

  const handleDuplicateTask = (tarefa: ProjetoTarefa) => {
    createTarefa.mutate({
      projeto_id: projetoId,
      titulo: `${tarefa.titulo} (Cópia)`,
      descricao: tarefa.descricao || undefined,
      assigned_users: tarefa.assigned_users?.length ? tarefa.assigned_users : undefined,
      column_id: tarefa.column_id || undefined,
      priority: tarefa.priority || undefined,
      priorizado: false,
      status: tarefa.status || "pendente",
      template_id: tarefa.template_id || undefined,
    });
  };

  const handleOpenRename = (tarefa: ProjetoTarefa) => {
    setTarefaToRename(tarefa);
    setRenameTitle(tarefa.titulo);
    setRenameModalOpen(true);
  };

  const handleConfirmRename = () => {
    if (!tarefaToRename || !renameTitle.trim()) return;
    updateTarefa.mutate(
      {
        id: tarefaToRename.id,
        projetoId,
        data: { titulo: renameTitle.trim() },
      },
      {
        onSuccess: () => {
          setRenameModalOpen(false);
          setTarefaToRename(null);
        }
      }
    );
  };

  const handleOpenDetail = (id: string) => {
    setSelectedTarefaId(id);
    setDetailModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-pulse text-muted-foreground">Carregando tarefas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Minimalista Premium */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/50">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-zinc-900 border border-zinc-800/60 rounded-md shadow-inner">
             <CheckSquare className="h-4 w-4 text-zinc-400" />
          </div>
          <h3 className="text-zinc-100 font-heading text-lg tracking-wide">Tarefas do Projeto</h3>
          {totalCount > 0 && (
            <Badge variant="secondary" className="bg-zinc-800/50 text-zinc-300 font-medium px-2 py-0.5 ml-1">
              {totalCount}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3">
          <TemplateSelector projetoId={projetoId} />
          <Button size="sm" onClick={handleOpenModal} className="h-9 gap-2 bg-zinc-100 text-zinc-900 hover:bg-zinc-200 font-medium font-sans shadow-sm transition-all hover:scale-[1.02]">
            <Plus className="h-4 w-4" />
            Nova Tarefa
          </Button>
        </div>
      </div>

      {/* Lista de tarefas (Grid Absoluta para truncamento perfeito) */}
      {totalCount > 0 ? (
        <div className="flex flex-col rounded-xl border border-zinc-800/60 bg-zinc-900/40 overflow-hidden shadow-inner w-full">
          {sortedTarefas.map((tarefa) => {
            const columnInfo = tarefa.column_id ? columnMap[tarefa.column_id] : undefined;
            return (
              <TarefaRow
                key={tarefa.id}
                tarefa={tarefa}
                projetoId={projetoId}
                onDelete={() => handleDeleteTask(tarefa.id)}
                onDuplicate={handleDuplicateTask}
                onRename={handleOpenRename}
                columnName={columnInfo?.name}
                columnColor={columnInfo?.color}
                onOpenDetail={handleOpenDetail}
              />
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-zinc-900/20 border border-dashed border-zinc-800/60 rounded-xl">
          <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
            <CheckSquare className="h-5 w-5 text-zinc-600" />
          </div>
          <h4 className="text-zinc-200 font-medium mb-1 font-heading">Nenhuma tarefa encontrada</h4>
          <p className="text-zinc-500 text-sm mb-6 text-center max-w-sm">
            Comece criando a primeira tarefa deste projeto para organizar o trabalho da sua equipe.
          </p>
          <Button onClick={handleOpenModal} className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200 font-medium shadow-lg hover:scale-[1.02] transition-transform">
            <Plus className="h-4 w-4 mr-2" />
            Criar Primeira Tarefa
          </Button>
        </div>
      )}

      {/* Rename Modal */}
      <Dialog open={renameModalOpen} onOpenChange={(open) => { if (!open) setRenameModalOpen(false); }}>
        <DialogContent className="max-w-md w-[95vw] bg-zinc-950/95 backdrop-blur-2xl border border-zinc-800/60 shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-4 border-b border-zinc-800/50 bg-zinc-900/20">
            <DialogTitle className="font-heading text-lg text-zinc-100 flex items-center gap-2">
              <Edit2 className="h-4 w-4 text-zinc-400" />
              Renomear Tarefa
            </DialogTitle>
          </DialogHeader>
          <div className="p-6">
            <div className="space-y-2">
               <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Novo Título</label>
               <Input
                 value={renameTitle}
                 onChange={(e) => setRenameTitle(e.target.value)}
                 placeholder="Digite o novo título..."
                 autoFocus
                 className="h-10 bg-zinc-900/50 border-zinc-800 text-sm focus-visible:ring-[#3F1757]/50"
                 onKeyDown={(e) => { if (e.key === "Enter") handleConfirmRename(); }}
               />
            </div>
          </div>
          <DialogFooter className="p-6 pt-0 sm:justify-end gap-2">
            <Button variant="outline" onClick={() => setRenameModalOpen(false)} className="bg-transparent border-zinc-700 hover:bg-zinc-800 hover:text-white">Cancelar</Button>
            <Button onClick={handleConfirmRename} disabled={!renameTitle.trim() || updateTarefa.isPending} className="bg-[#ED6A5A] hover:bg-[#e05a4a] text-white border-0">Salvar Modificação</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Nova Tarefa Modal */}
      <Dialog open={isModalOpen} onOpenChange={(open) => { if (!open) handleCloseModal(); }}>
        <DialogContent className="max-w-2xl w-[95vw] bg-zinc-950/95 backdrop-blur-2xl border border-zinc-800/60 shadow-2xl p-0 overflow-hidden gap-0">
          <DialogHeader className="p-5 border-b border-zinc-800/50 bg-zinc-900/20 flex flex-row items-center justify-between pr-14 space-y-0">
            <DialogTitle className="font-heading text-lg text-zinc-100 flex items-center gap-2 m-0">
              <Plus className="h-4 w-4 text-[#CBC5EA]" />
              Criar Nova Tarefa
            </DialogTitle>
            
            <button
              type="button"
              onClick={() => setNewTaskPriorizado(!newTaskPriorizado)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                newTaskPriorizado 
                  ? "bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-[0_0_10px_rgba(251,191,36,0.1)]" 
                  : "bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:text-zinc-200 hover:bg-zinc-700"
              )}
            >
              <Star className={cn("h-3.5 w-3.5", newTaskPriorizado && "fill-current drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]")} />
              {newTaskPriorizado ? "Prioridade Tática" : "Tornar Prioridade"}
            </button>
          </DialogHeader>
          
          <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
            {/* Título */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Título da Tarefa <span className="text-destructive">*</span></label>
              <Input
                placeholder="Ex: Implementar autenticação via OAuth..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                autoFocus
                className="h-12 bg-zinc-900/50 border-zinc-800 text-base focus-visible:ring-[#3F1757]/50 text-zinc-100"
              />
            </div>

            {/* Template */}
            {allTemplates && allTemplates.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5" />
                  Carregar Template
                </label>
                <Select value={newTaskTemplateId} onValueChange={handleTemplateSelect}>
                  <SelectTrigger className="bg-zinc-900/50 border-zinc-800 text-zinc-200">
                    <SelectValue placeholder="Selecione um template..." />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-950 border-zinc-800">
                    <SelectItem value="none" className="text-zinc-500 italic">— Começar do zero —</SelectItem>
                    {allTemplates.map((tpl) => (
                      <SelectItem key={tpl.id} value={tpl.id} className="focus:bg-zinc-900 cursor-pointer">
                        <div className="flex flex-col py-1">
                          <span className="font-medium text-zinc-200">{tpl.name}</span>
                          {tpl.checklists && tpl.checklists.length > 0 && (
                            <span className="text-xs text-zinc-500 mt-0.5">{tpl.checklists.length} itens inclusos</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Descrição Detalhada */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 text-left w-full block">Descrição Detalhada</label>
              <Textarea
                placeholder="Adicione diretrizes ou observações sobre a tarefa..."
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                rows={3}
                className="resize-none bg-zinc-900/50 border-zinc-800 focus-visible:ring-[#3F1757]/50 font-sans text-sm text-zinc-200"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                  <Users className="h-3.5 w-3.5" />
                  Responsáveis
                </label>
                <UserMultiSelect
                  selectedUsers={newTaskUsers}
                  onSelectionChange={setNewTaskUsers}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                  <LayoutGrid className="h-3.5 w-3.5" />
                  Coluna no Board
                </label>
                <Select value={newTaskColumn} onValueChange={setNewTaskColumn}>
                  <SelectTrigger className="bg-zinc-900/50 border-zinc-800 text-zinc-200">
                    <SelectValue placeholder="Selecionar coluna..." />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-950 border-zinc-800">
                    {columns?.map((column) => (
                      <SelectItem key={column.id} value={column.id} className="focus:bg-zinc-900 cursor-pointer text-zinc-200">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: column.color }} />
                          <span className="font-medium">{column.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                  <Flag className="h-3.5 w-3.5" />
                  Prioridade
                </label>
                <Select value={newTaskPriority} onValueChange={setNewTaskPriority}>
                  <SelectTrigger className="bg-zinc-900/50 border-zinc-800 text-zinc-200">
                    <SelectValue placeholder="Selecionar nível..." />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-950 border-zinc-800">
                    {PRIORITY_OPTIONS.map((opt) => {
                      const Icon = opt.icon;
                      return (
                        <SelectItem key={opt.value} value={opt.value} className="focus:bg-zinc-900 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <Icon className={cn("h-3.5 w-3.5", opt.color)} />
                            <span className="font-medium text-zinc-200">{opt.label}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Status Inicial
                </label>
                <Select value={newTaskStatus} onValueChange={setNewTaskStatus}>
                  <SelectTrigger className="bg-zinc-900/50 border-zinc-800 text-zinc-200">
                    <SelectValue placeholder="Situação inicial..." />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-950 border-zinc-800">
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value} className="focus:bg-zinc-900 cursor-pointer">
                        <span className="font-medium text-zinc-200">{opt.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 bg-zinc-900/30 rounded-lg border border-zinc-800/40">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Data Início
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-100 h-10">
                      {newTaskStartDate
                        ? format(newTaskStartDate, "dd 'de' MMM, yyyy", { locale: ptBR })
                        : <span className="text-zinc-500">Selecionar...</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-zinc-950 border-zinc-800 text-zinc-200" align="start">
                    <Calendar mode="single" selected={newTaskStartDate} onSelect={setNewTaskStartDate} locale={ptBR} className="bg-zinc-950 text-zinc-100" />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Vencimento
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-100 h-10">
                      {newTaskDueDate
                        ? format(newTaskDueDate, "dd 'de' MMM, yyyy", { locale: ptBR })
                        : <span className="text-zinc-500">Selecionar...</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-zinc-950 border-zinc-800 text-zinc-200" align="start">
                    <Calendar mode="single" selected={newTaskDueDate} onSelect={setNewTaskDueDate} locale={ptBR} className="bg-zinc-950 text-zinc-100" />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          
          <DialogFooter className="p-6 border-t border-zinc-800/50 bg-zinc-900/20 sm:justify-between items-center gap-4">
            <span className="text-xs text-zinc-500 hidden sm:inline-block">
              Campos com <span className="text-destructive">*</span> são obrigatórios.
            </span>
            <div className="flex gap-3 w-full sm:w-auto">
              <Button variant="outline" onClick={handleCloseModal} className="w-full sm:w-auto bg-transparent border-zinc-700 hover:bg-zinc-800 hover:text-white">
                Cancelar
              </Button>
              <Button
                onClick={handleCreateTask}
                disabled={!newTaskTitle.trim() || createTarefa.isPending}
                className="w-full sm:w-auto bg-[#ED6A5A] hover:bg-[#e05a4a] text-white shadow-lg disabled:opacity-50 border-0"
              >
                Criar Tarefa
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detalhe da tarefa */}
      <TarefaDetailModal
        tarefa={selectedTarefa}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
      />
    </div>
  );
}
