import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  CustomBoardCard,
  ChecklistItem,
  CardTag,
  useCustomBoardCards,
  useUpdateCustomBoardCard,
  useDeleteCustomBoardCard,
  useArchiveCustomBoardCard,
  useMoveCustomBoardCard,
} from "@/hooks/useCustomBoardCards";
import { useCustomBoardColumns } from "@/hooks/useCustomBoardColumns";
import { useProfiles } from "@/hooks/useProfiles";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CheckSquare, LayoutList } from "lucide-react";
import { CustomBoardTagsSection } from "./CustomBoardTagsSection";
import { CustomBoardChecklistSection } from "./CustomBoardChecklistSection";
import { CustomBoardDescriptionEditor } from "./CustomBoardDescriptionEditor";
import { CustomBoardActivityTimeline } from "./CustomBoardActivityTimeline";
import { SendMessageModal } from "./SendMessageModal";
import { TemplateApplyResult } from "./CustomBoardTemplateSelector";
import { CustomBoardDetailHeader } from "./detail/CustomBoardDetailHeader";
import { CustomBoardPropertySidebar } from "./detail/CustomBoardPropertySidebar";
import { CustomBoardAttachmentsSection } from "./detail/CustomBoardAttachmentsSection";
import { Tag } from "lucide-react";

const CHECKLIST_SAVE_DEBOUNCE_MS = 600;

interface CustomBoardCardModalProps {
  card: CustomBoardCard;
  boardId: string;
  boardName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomBoardCardModal({
  card,
  boardId,
  boardName,
  open,
  onOpenChange,
}: CustomBoardCardModalProps) {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || "");
  const [priority, setPriority] = useState(card.priority);
  const [dueDate, setDueDate] = useState<Date | undefined>(
    card.due_date ? new Date(card.due_date) : undefined
  );
  const [startDate, setStartDate] = useState<Date | undefined>(
    card.start_date ? new Date(card.start_date) : undefined
  );
  const [checklist, setChecklist] = useState<ChecklistItem[]>(card.checklist);
  const [tags, setTags] = useState<CardTag[]>(card.tags);
  const [assignedUsers, setAssignedUsers] = useState<string[]>(card.assigned_users);
  const [columnId, setColumnId] = useState<string | null>(card.column_id);
  const [templateCompletionMessage, setTemplateCompletionMessage] = useState<string | null>(null);
  const [sendMessageOpen, setSendMessageOpen] = useState(false);
  const [pendingSendMessage, setPendingSendMessage] = useState("");

  const { data: profiles = [] } = useProfiles();
  const { data: columns = [] } = useCustomBoardColumns(boardId);
  const { data: allCards = [] } = useCustomBoardCards(boardId);
  const updateCard = useUpdateCustomBoardCard();
  const deleteCard = useDeleteCustomBoardCard();
  const archiveCard = useArchiveCustomBoardCard();
  const moveCard = useMoveCustomBoardCard();

  const allBoardTags = useMemo(() => {
    return allCards.flatMap((c) => c.tags || []);
  }, [allCards]);

  const checklistSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setTitle(card.title);
    setDescription(card.description || "");
    setPriority(card.priority);
    setDueDate(card.due_date ? new Date(card.due_date) : undefined);
    setStartDate(card.start_date ? new Date(card.start_date) : undefined);
    setChecklist(card.checklist);
    setTags(card.tags);
    setAssignedUsers(card.assigned_users);
    setColumnId(card.column_id);
    setTemplateCompletionMessage(null);
  }, [card]);

  useEffect(() => {
    return () => {
      if (checklistSaveTimeoutRef.current) clearTimeout(checklistSaveTimeoutRef.current);
    };
  }, []);

  const handleTitleBlur = useCallback(() => {
    const t = title.trim();
    if (t && t !== card.title) {
      updateCard.mutate({ id: card.id, boardId, title: t });
    }
  }, [card.id, card.title, boardId, title, updateCard]);

  const handleTitleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
  }, []);

  const handleDescriptionSave = useCallback(
    (value: string) => {
      updateCard.mutate({ id: card.id, boardId, description: value || null });
    },
    [card.id, boardId, updateCard]
  );

  const handleTagsChange = useCallback(
    (newTags: CardTag[]) => {
      setTags(newTags);
      updateCard.mutate({ id: card.id, boardId, tags: newTags });
    },
    [card.id, boardId, updateCard]
  );

  const handleChecklistChange = useCallback(
    (newChecklist: ChecklistItem[]) => {
      setChecklist(newChecklist);
      if (checklistSaveTimeoutRef.current) clearTimeout(checklistSaveTimeoutRef.current);
      checklistSaveTimeoutRef.current = setTimeout(() => {
        updateCard.mutate({ id: card.id, boardId, checklist: newChecklist });
        checklistSaveTimeoutRef.current = null;
      }, CHECKLIST_SAVE_DEBOUNCE_MS);
    },
    [card.id, boardId, updateCard]
  );

  const handlePriorityChange = useCallback(
    (v: string) => {
      setPriority(v as CustomBoardCard["priority"]);
      updateCard.mutate({ id: card.id, boardId, priority: v as CustomBoardCard["priority"] });
    },
    [card.id, boardId, updateCard]
  );

  const handleStartDateChange = useCallback(
    (d: Date | null) => {
      const next = d ?? undefined;
      setStartDate(next);
      updateCard.mutate({ id: card.id, boardId, start_date: next?.toISOString() ?? null });
    },
    [card.id, boardId, updateCard]
  );

  const handleDueDateChange = useCallback(
    (d: Date | null) => {
      const next = d ?? undefined;
      setDueDate(next);
      updateCard.mutate({ id: card.id, boardId, due_date: next?.toISOString() ?? null });
    },
    [card.id, boardId, updateCard]
  );

  const handleAssigneesChange = useCallback(
    (userIds: string[]) => {
      setAssignedUsers(userIds);
      updateCard.mutate({ id: card.id, boardId, assigned_users: userIds });
    },
    [card.id, boardId, updateCard]
  );

  const handleColumnChange = (newColumnId: string) => {
    moveCard.mutate(
      { cardId: card.id, boardId, columnId: newColumnId },
      { onSuccess: () => setColumnId(newColumnId) }
    );
  };

  const handleArchive = () => {
    archiveCard.mutate({ id: card.id, boardId, archived: true });
    onOpenChange(false);
  };

  const handleDelete = () => {
    deleteCard.mutate({ id: card.id, boardId });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[95vw] h-[90vh] p-0 flex flex-col overflow-hidden gap-0 bg-zinc-950 border-zinc-800/60 text-zinc-100">
        <DialogTitle className="sr-only">
          Detalhes do Card - {card.title}
        </DialogTitle>

        <CustomBoardDetailHeader
          title={title}
          boardName={boardName}
          onTitleChange={setTitle}
          onTitleBlur={handleTitleBlur}
          onTitleKeyDown={handleTitleKeyDown}
          onArchive={handleArchive}
          onDelete={handleDelete}
          onClose={() => onOpenChange(false)}
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
                  {checklist.length > 0 && (
                    <span className="ml-1 text-xs text-zinc-500">
                      {checklist.filter((i) => i.completed).length}/{checklist.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* Geral tab */}
              <TabsContent value="geral" className="flex-1 h-full overflow-hidden mt-0 focus-visible:outline-none relative">
                <ScrollArea className="h-full">
                  <div className="p-6 md:p-8 xl:p-10 space-y-12 max-w-4xl mx-auto">
                    {/* Description */}
                    <div>
                      <CustomBoardDescriptionEditor
                        description={description}
                        onChange={setDescription}
                        onSave={handleDescriptionSave}
                        autoSave
                        debounceMs={1000}
                      />
                    </div>

                    <div className="h-px bg-zinc-800/40" />

                    {/* Attachments */}
                    <div>
                      <CustomBoardAttachmentsSection cardId={card.id} boardId={boardId} />
                    </div>

                    <div className="h-px bg-zinc-800/40" />

                    {/* Activity */}
                    <div>
                      <CustomBoardActivityTimeline cardId={card.id} />
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* Checklist tab */}
              <TabsContent value="checklist" className="flex-1 h-full overflow-hidden mt-0 focus-visible:outline-none">
                <ScrollArea className="h-full">
                  <div className="p-6 md:p-8 xl:p-10 max-w-4xl mx-auto">
                    <CustomBoardChecklistSection
                      checklist={checklist}
                      onChange={handleChecklistChange}
                      completionMessage={templateCompletionMessage}
                      onAllCompleted={(message) => {
                        setPendingSendMessage(message);
                        setSendMessageOpen(true);
                      }}
                      onTemplateApplied={(result: TemplateApplyResult) => {
                        if (result.sendMessageOnComplete && result.completionMessage) {
                          setTemplateCompletionMessage(result.completionMessage);
                        } else {
                          setTemplateCompletionMessage(null);
                        }
                      }}
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
                <CustomBoardPropertySidebar
                  boardId={boardId}
                  cardId={card.id}
                  columnId={columnId}
                  columns={columns}
                  onColumnChange={handleColumnChange}
                  priority={priority}
                  onPriorityChange={handlePriorityChange}
                  startDate={startDate?.toISOString() ?? null}
                  dueDate={dueDate?.toISOString() ?? null}
                  onStartDateChange={handleStartDateChange}
                  onDueDateChange={handleDueDateChange}
                  assignedUsers={assignedUsers}
                  onAssigneesChange={handleAssigneesChange}
                  profiles={profiles}
                  isMovingColumn={moveCard.isPending}
                />

                {/* Tags */}
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 px-1 mb-3">
                    Tags do Card
                  </div>
                  <div className="flex items-center gap-3">
                    <Tag className="h-4 w-4 text-zinc-400 shrink-0" />
                    <CustomBoardTagsSection
                      tags={tags}
                      onChange={handleTagsChange}
                      allBoardTags={allBoardTags}
                    />
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>

      {sendMessageOpen && (
        <SendMessageModal
          open={sendMessageOpen}
          onOpenChange={setSendMessageOpen}
          defaultMessage={pendingSendMessage}
        />
      )}
    </Dialog>
  );
}
