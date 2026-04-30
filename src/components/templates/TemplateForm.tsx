import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import {
  TaskTemplate,
  useCreateTaskTemplate,
  useUpdateTaskTemplate,
} from "@/hooks/useTaskTemplates";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface TemplateFormProps {
  initialData?: TaskTemplate;
  onSuccess: () => void;
}

export function TemplateForm({ initialData, onSuccess }: TemplateFormProps) {
  const isEditing = !!initialData;

  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [tituloPadrao, setTituloPadrao] = useState(initialData?.titulo_padrao || "");
  const [descricaoPadrao, setDescricaoPadrao] = useState(initialData?.descricao_padrao || "");
  const [isGlobal, setIsGlobal] = useState(initialData?.is_global || false);
  const [isDefault, setIsDefault] = useState(initialData?.is_default || false);
  const [dueDaysOffset, setDueDaysOffset] = useState<string>(
    initialData?.due_days_offset != null ? String(initialData.due_days_offset) : ""
  );
  const [sendMessageOnComplete, setSendMessageOnComplete] = useState(initialData?.send_message_on_complete || false);
  const [completionMessage, setCompletionMessage] = useState(initialData?.completion_message || "");
  const [checklistItems, setChecklistItems] = useState<string[]>(
    initialData?.checklists?.map((c) => c.texto) || []
  );
  const [newChecklistItem, setNewChecklistItem] = useState("");

  const createTemplate = useCreateTaskTemplate();
  const updateTemplate = useUpdateTaskTemplate();

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description || "");
      setTituloPadrao(initialData.titulo_padrao);
      setDescricaoPadrao(initialData.descricao_padrao || "");
      setIsGlobal(initialData.is_global);
      setIsDefault(initialData.is_default);
      setDueDaysOffset(initialData.due_days_offset != null ? String(initialData.due_days_offset) : "");
      setSendMessageOnComplete(initialData.send_message_on_complete || false);
      setCompletionMessage(initialData.completion_message || "");
      setChecklistItems(initialData.checklists?.map((c) => c.texto) || []);
    }
  }, [initialData]);

  const handleAddChecklist = () => {
    if (!newChecklistItem.trim()) return;
    setChecklistItems([...checklistItems, newChecklistItem.trim()]);
    setNewChecklistItem("");
  };

  const handleRemoveChecklist = (index: number) => {
    setChecklistItems(checklistItems.filter((_, i) => i !== index));
  };

  const handleMoveChecklist = (fromIndex: number, direction: "up" | "down") => {
    const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= checklistItems.length) return;
    
    const newItems = [...checklistItems];
    [newItems[fromIndex], newItems[toIndex]] = [newItems[toIndex], newItems[fromIndex]];
    setChecklistItems(newItems);
  };

  const handleSubmit = async () => {
    if (!name.trim() || !tituloPadrao.trim()) return;

    if (isEditing && initialData) {
      try {
        // Update template basic info
        const parsedOffset = dueDaysOffset.trim() !== "" ? parseInt(dueDaysOffset, 10) : null;
        await updateTemplate.mutateAsync({
          id: initialData.id,
          data: {
            name: name.trim(),
            description: description.trim() || undefined,
            titulo_padrao: tituloPadrao.trim(),
            descricao_padrao: descricaoPadrao.trim() || undefined,
            is_global: isGlobal,
            is_default: isDefault,
            send_message_on_complete: sendMessageOnComplete,
            completion_message: sendMessageOnComplete ? completionMessage.trim() || undefined : undefined,
            due_days_offset: isDefault ? parsedOffset : null,
          },
        });

        // Update checklists: delete all and recreate
        await supabase
          .from("task_template_checklists")
          .delete()
          .eq("template_id", initialData.id);

        if (checklistItems.length > 0) {
          const checklistsData = checklistItems.map((texto, index) => ({
            template_id: initialData.id,
            texto,
            position: index,
          }));

          await supabase.from("task_template_checklists").insert(checklistsData);
        }

        toast({ title: "Template atualizado com sucesso" });
        onSuccess();
      } catch (error) {
        toast({ title: "Erro ao atualizar template", variant: "destructive" });
      }
    } else {
      const parsedOffset = dueDaysOffset.trim() !== "" ? parseInt(dueDaysOffset, 10) : null;
      createTemplate.mutate(
        {
          name: name.trim(),
          description: description.trim() || undefined,
          titulo_padrao: tituloPadrao.trim(),
          descricao_padrao: descricaoPadrao.trim() || undefined,
          is_global: isGlobal,
          is_default: isDefault,
          send_message_on_complete: sendMessageOnComplete,
          completion_message: sendMessageOnComplete ? completionMessage.trim() || undefined : undefined,
          due_days_offset: isDefault ? parsedOffset : null,
          checklists: checklistItems,
        },
        {
          onSuccess: () => {
            onSuccess();
            setName("");
            setDescription("");
            setTituloPadrao("");
            setDescricaoPadrao("");
            setIsGlobal(false);
            setIsDefault(false);
            setDueDaysOffset("");
            setSendMessageOnComplete(false);
            setCompletionMessage("");
            setChecklistItems([]);
          },
        }
      );
    }
  };

  return (
    <ScrollArea className="max-h-[70vh]">
      <div className="space-y-4 pr-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome do Template *</Label>
          <Input
            id="name"
            placeholder="Ex: Tarefa de Onboarding"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Input
            id="description"
            placeholder="Descrição do template (opcional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="titulo">Título Padrão da Tarefa *</Label>
          <Input
            id="titulo"
            placeholder="Ex: [Cliente] Onboarding"
            value={tituloPadrao}
            onChange={(e) => setTituloPadrao(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="descricao">Descrição Padrão</Label>
          <Textarea
            id="descricao"
            placeholder="Descrição padrão da tarefa (opcional)"
            value={descricaoPadrao}
            onChange={(e) => setDescricaoPadrao(e.target.value)}
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label>Itens do Checklist</Label>
          <div className="space-y-2">
            {checklistItems.map((item, index) => (
              <div key={index} className="flex items-center gap-2 group">
                <div className="flex flex-col gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 opacity-0 group-hover:opacity-100"
                    onClick={() => handleMoveChecklist(index, "up")}
                    disabled={index === 0}
                  >
                    <GripVertical className="h-3 w-3 rotate-90" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 opacity-0 group-hover:opacity-100"
                    onClick={() => handleMoveChecklist(index, "down")}
                    disabled={index === checklistItems.length - 1}
                  >
                    <GripVertical className="h-3 w-3 -rotate-90" />
                  </Button>
                </div>
                <div className="flex-1 p-2 bg-muted rounded text-sm">{item}</div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleRemoveChecklist(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <Input
                placeholder="Adicionar item..."
                value={newChecklistItem}
                onChange={(e) => setNewChecklistItem(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddChecklist();
                  }
                }}
              />
              <Button variant="outline" size="sm" onClick={handleAddChecklist}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Template Global</Label>
            <p className="text-xs text-muted-foreground">
              Disponível para todos os projetos
            </p>
          </div>
          <Switch checked={isGlobal} onCheckedChange={setIsGlobal} />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Template Padrão</Label>
            <p className="text-xs text-muted-foreground">
              Aplicado automaticamente em todos os projetos
            </p>
          </div>
          <Switch checked={isDefault} onCheckedChange={setIsDefault} />
        </div>

        {isDefault && (
          <div className="space-y-2 pl-4 border-l-2 border-primary/20">
            <Label htmlFor="dueDaysOffset">Prazo D+ (dias após criação do projeto)</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground font-medium">D+</span>
              <Input
                id="dueDaysOffset"
                type="number"
                min={0}
                placeholder="Ex: 7"
                value={dueDaysOffset}
                onChange={(e) => setDueDaysOffset(e.target.value)}
                className="w-24"
              />
              <span className="text-xs text-muted-foreground">dias</span>
            </div>
            <p className="text-xs text-muted-foreground">
              A data de vencimento será calculada automaticamente com base na data de criação do projeto.
            </p>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enviar mensagem ao finalizar o checklist?</Label>
              <p className="text-xs text-muted-foreground">
                Exibe um pop-up ao concluir todos os itens
              </p>
            </div>
            <Switch checked={sendMessageOnComplete} onCheckedChange={setSendMessageOnComplete} />
          </div>
          {sendMessageOnComplete && (
            <div className="space-y-2">
              <Label htmlFor="completionMessage">Mensagem padrão</Label>
              <Textarea
                id="completionMessage"
                placeholder="Ex: Olá! A etapa foi concluída com sucesso. Segue o relatório..."
                value={completionMessage}
                onChange={(e) => setCompletionMessage(e.target.value)}
                rows={3}
              />
            </div>
          )}
        </div>

        <Button
          className="w-full"
          onClick={handleSubmit}
          disabled={
            !name.trim() ||
            !tituloPadrao.trim() ||
            createTemplate.isPending ||
            updateTemplate.isPending
          }
        >
          {isEditing ? "Salvar Alterações" : "Criar Template"}
        </Button>
      </div>
    </ScrollArea>
  );
}
