import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CheckSquare, LayoutList } from "lucide-react";
import { TaskDetailHeader } from "./detail/TaskDetailHeader";
import { TaskPropertySidebar } from "./detail/TaskPropertySidebar";
import { TaskChecklistSection } from "./detail/TaskChecklistSection";
import { TaskTagsSection } from "./detail/TaskTagsSection";
import { TaskAttachmentsSection } from "./detail/TaskAttachmentsSection";
import { TarefaDescriptionEditor } from "./detail/TarefaDescriptionEditor";
import { TaskActivityTimeline } from "./detail/TaskActivityTimeline";
import { CompletionMessageModal } from "@/components/projetos/detail/CompletionMessageModal";
import { useProfiles } from "@/hooks/useProfiles";
import { useProjetos } from "@/hooks/useProjetos";
import { Tarefa } from "@/hooks/useTarefas";
import { useTarefaTagAssignments, TarefaTag } from "@/hooks/useTarefaTags";
import {
  useToggleChecklistItem,
  useMarkMessageSent,
  useReorderTarefaChecklist,
  useUpdateProjetoTarefa,
} from "@/hooks/useProjetoTarefas";
import { useDeleteTarefa } from "@/hooks/useTarefas";
import { useTaskTemplates } from "@/hooks/useTaskTemplates";
import { useWikiTaskFile } from "@/hooks/useWikiTaskFile";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface TarefaDetailModalProps {
  tarefa: Tarefa | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TarefaDetailModal({
  tarefa,
  open,
  onOpenChange,
}: TarefaDetailModalProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: profiles = [] } = useProfiles();
  const { data: projetos } = useProjetos();
  const { data: wikiFile } = useWikiTaskFile(tarefa?.id || null);
  const { data: tagAssignments = [] } = useTarefaTagAssignments(tarefa?.id || null);

  const toggleChecklistItem = useToggleChecklistItem();
  const reorderChecklist = useReorderTarefaChecklist();
  const markMessageSent = useMarkMessageSent();
  const updateTarefa = useUpdateProjetoTarefa();
  const deleteTarefa = useDeleteTarefa();
  const { data: templates } = useTaskTemplates();

  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const linkedTemplate = tarefa?.template_id
    ? templates?.find((t) => t.id === tarefa.template_id)
    : undefined;
  const hasCompletionMessage = linkedTemplate?.send_message_on_complete ?? false;

  const assignedTags: TarefaTag[] = tagAssignments
    .map((ta) => ta.tag)
    .filter(Boolean) as TarefaTag[];

  if (!tarefa) return null;

  const projeto = tarefa.projeto || projetos?.find((p) => p.project_id === tarefa.projeto_id);

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["tarefas"] });
    queryClient.invalidateQueries({ queryKey: ["all-tarefas"] });
    queryClient.invalidateQueries({ queryKey: ["projeto-tarefas"] });
  };

  const handleStatusChange = async (status: string) => {
    await supabase
      .from("projeto_tarefas")
      .update({ status })
      .eq("id", tarefa.id);
    invalidateQueries();
  };

  const handlePriorityChange = async (priority: string) => {
    await supabase
      .from("projeto_tarefas")
      .update({ priority })
      .eq("id", tarefa.id);
    invalidateQueries();
  };

  const handleAssigneeChange = async (assignee: string) => {
    const newAssignee = assignee === "none" ? null : assignee;
    await supabase
      .from("projeto_tarefas")
      .update({
        assigned_user: newAssignee,
        assigned_users: newAssignee ? [newAssignee] : [],
      })
      .eq("id", tarefa.id);
    invalidateQueries();
  };

  const handleAssigneesChange = async (assignees: string[]) => {
    await supabase
      .from("projeto_tarefas")
      .update({
        assigned_user: assignees[0] || null,
        assigned_users: assignees,
      })
      .eq("id", tarefa.id);
    invalidateQueries();
  };

  const handleStartDateChange = async (date: Date | null) => {
    await supabase
      .from("projeto_tarefas")
      .update({ start_date: date?.toISOString() || null })
      .eq("id", tarefa.id);
    invalidateQueries();
  };

  const handleDueDateChange = async (date: Date | null) => {
    await supabase
      .from("projeto_tarefas")
      .update({ due_date: date?.toISOString() || null })
      .eq("id", tarefa.id);
    invalidateQueries();
  };

  const handleOpenWiki = () => {
    if (wikiFile) {
      onOpenChange(false);
      navigate(`/wiki?file=${wikiFile.id}&folder=${wikiFile.folder_id}`);
    }
  };

  const handleToggleChecklist = (id: string, checked: boolean) => {
    toggleChecklistItem.mutate({
      id,
      concluido: checked,
      tarefaId: tarefa.id,
      projetoId: tarefa.projeto_id,
    });

    if (checked && hasCompletionMessage && !tarefa.message_sent) {
      const otherItems = tarefa.checklists?.filter((c) => c.id !== id) || [];
      const allOthersCompleted = otherItems.every((c) => c.concluido);
      if (allOthersCompleted) {
        setTimeout(() => setShowCompletionModal(true), 500);
      }
    }
  };

  const checklistItems = (tarefa.checklists || []).map((c) => ({
    id: c.id,
    texto: c.texto,
    concluido: c.concluido,
    completed_at: c.completed_at,
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[95vw] h-[90vh] p-0 flex flex-col overflow-hidden gap-0 bg-zinc-950 border-zinc-800/60 text-zinc-100">
        <DialogTitle className="sr-only">
          Detalhes da Tarefa - {tarefa.titulo}
        </DialogTitle>

        <TaskDetailHeader
          title={tarefa.titulo}
          projectName={projeto?.company_name}
          isPrioritized={tarefa.priorizado || false}
          hasWikiFile={!!wikiFile}
          onOpenWiki={handleOpenWiki}
          onClose={() => onOpenChange(false)}
          onRename={(newTitle) => {
            updateTarefa.mutate({
              id: tarefa.id,
              projetoId: tarefa.projeto_id || projeto?.project_id || "",
              data: { titulo: newTitle },
            });
          }}
          onDelete={() => {
            deleteTarefa.mutate(tarefa.id, {
              onSuccess: () => {
                onOpenChange(false);
              },
            });
          }}
        />

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Main Content Area */}
          <div className="flex-1 min-w-0 overflow-hidden flex flex-col">
            <Tabs defaultValue="geral" className="flex-1 flex flex-col overflow-hidden">
              {/* Tab navigation */}
              <TabsList className="w-full bg-transparent border-b border-zinc-800 rounded-none px-5 gap-0 h-auto pb-0 justify-start shrink-0">
                <TabsTrigger
                  value="geral"
                  className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-['Lexend_Deca'] text-zinc-500 bg-transparent rounded-none border-b-2 border-transparent data-[state=active]:border-[#3F1757] data-[state=active]:text-white data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  <LayoutList className="h-4 w-4" />
                  Geral
                </TabsTrigger>
                <TabsTrigger
                  value="checklist"
                  className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-['Lexend_Deca'] text-zinc-500 bg-transparent rounded-none border-b-2 border-transparent data-[state=active]:border-[#3F1757] data-[state=active]:text-white data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  <CheckSquare className="h-4 w-4" />
                  Checklist
                </TabsTrigger>
              </TabsList>

              {/* Geral tab */}
              <TabsContent value="geral" className="flex-1 h-full overflow-hidden mt-0 focus-visible:outline-none relative">
                <ScrollArea className="h-full">
                  <div className="p-6 md:p-8 xl:p-10 space-y-12 max-w-4xl mx-auto">
                    {/* Description */}
                    <div>
                      <TarefaDescriptionEditor
                        tarefaId={tarefa.id}
                        initialDescription={tarefa.descricao}
                      />
                    </div>

                    <div className="h-px bg-zinc-800/40" />

                    {/* Attachments */}
                    <div>
                      <TaskAttachmentsSection tarefaId={tarefa.id} />
                    </div>

                    <div className="h-px bg-zinc-800/40" />

                    {/* Activity */}
                    <div>
                      <TaskActivityTimeline tarefaId={tarefa.id} />
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* Checklist tab */}
              <TabsContent value="checklist" className="flex-1 h-full overflow-hidden mt-0 focus-visible:outline-none">
                <ScrollArea className="h-full">
                  <div className="p-6 md:p-8 xl:p-10 max-w-4xl mx-auto">
                    <TaskChecklistSection
                      tarefaId={tarefa.id}
                      projetoId={tarefa.projeto_id || projeto?.project_id || ""}
                      items={checklistItems}
                      onToggle={handleToggleChecklist}
                      onReorder={(orderedIds) =>
                        reorderChecklist.mutate({
                          tarefaId: tarefa.id,
                          projetoId: tarefa.projeto_id,
                          orderedIds,
                        })
                      }
                    />
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar (Fixed) */}
          <div className="w-full md:w-[320px] shrink-0 border-t md:border-t-0 md:border-l border-zinc-800/40 bg-zinc-950/30 overflow-hidden flex flex-col">
            <ScrollArea className="h-full">
              <div className="p-6 space-y-8">
                <TaskPropertySidebar
                  status={tarefa.status}
                  assignedUser={tarefa.assigned_user}
                  assignedUsers={tarefa.assigned_users || []}
                  startDate={tarefa.start_date}
                  dueDate={tarefa.due_date}
                  projectName={projeto?.company_name}
                  projectId={tarefa.projeto_id || projeto?.project_id}
                  onGoToProject={(projectId) => {
                    onOpenChange(false);
                    navigate("/projetos", { state: { openProjetoId: projectId } });
                  }}
                  profiles={profiles}
                  priority={tarefa.priority}
                  onStatusChange={handleStatusChange}
                  onAssigneeChange={handleAssigneeChange}
                  onAssigneesChange={handleAssigneesChange}
                  onStartDateChange={handleStartDateChange}
                  onDueDateChange={handleDueDateChange}
                  onPriorityChange={handlePriorityChange}
                />

                {/* Tags */}
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 px-1 mb-3">
                    Tags da Tarefa
                  </div>
                  <TaskTagsSection tarefaId={tarefa.id} tags={assignedTags} />
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>

      {showCompletionModal && (
        <CompletionMessageModal
          open={showCompletionModal}
          onOpenChange={setShowCompletionModal}
          defaultMessage={linkedTemplate?.completion_message || ""}
          messageSent={tarefa.message_sent}
          messageSentAt={tarefa.message_sent_at}
          onSend={(message) => {
            markMessageSent.mutate({
              tarefaId: tarefa.id,
              projetoId: tarefa.projeto_id,
              mensagem: message,
            });
            setShowCompletionModal(false);
          }}
          isSending={markMessageSent.isPending}
        />
      )}
    </Dialog>
  );
}
