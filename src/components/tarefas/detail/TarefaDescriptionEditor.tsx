import { useState, useEffect, useCallback, useRef } from "react";
import { InlineMarkdownEditor } from "@/components/ui/markdown-editor";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { AlignLeft, Loader2, Check } from "lucide-react";

interface TarefaDescriptionEditorProps {
  tarefaId: string;
  initialDescription: string | null;
}

export function TarefaDescriptionEditor({
  tarefaId,
  initialDescription,
}: TarefaDescriptionEditorProps) {
  const [description, setDescription] = useState(initialDescription || "");
  const [isSaving, setIsSaving] = useState(false);
  const [savedJustNow, setSavedJustNow] = useState(false);
  const savedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    setDescription(initialDescription || "");
  }, [initialDescription]);

  // Mostrar "Salvo" por 2s após o save terminar com sucesso
  useEffect(() => {
    if (!isSaving && savedJustNow) {
      if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
      savedTimeoutRef.current = setTimeout(() => setSavedJustNow(false), 2000);
    }
    return () => {
      if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
    };
  }, [isSaving, savedJustNow]);

  const handleSave = useCallback(
    async (value: string) => {
      if (value === (initialDescription ?? "")) return;

      setIsSaving(true);
      setSavedJustNow(false);
      try {
        const { error } = await supabase
          .from("projeto_tarefas")
          .update({ descricao: value })
          .eq("id", tarefaId);

        if (error) throw error;

        queryClient.invalidateQueries({ queryKey: ["tarefas"] });
        queryClient.invalidateQueries({ queryKey: ["projeto-tarefas"] });
        setSavedJustNow(true);
      } catch (error) {
        console.error("Error saving description:", error);
        toast({
          title: "Erro ao salvar",
          description: "Não foi possível salvar a descrição.",
          variant: "destructive",
        });
      } finally {
        setIsSaving(false);
      }
    },
    [initialDescription, tarefaId, queryClient, toast]
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-[#3F1757]/10 flex items-center justify-center">
            <AlignLeft className="h-4 w-4 text-[#CBC5EA]" />
          </div>
          <h3 className="font-semibold text-sm text-zinc-100">Descrição</h3>
        </div>
        {(isSaving || savedJustNow) && (
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            {isSaving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Salvando...</span>
              </>
            ) : (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-emerald-500">Salvo</span>
              </>
            )}
          </div>
        )}
      </div>

      <InlineMarkdownEditor
        value={description}
        onChange={setDescription}
        onSave={handleSave}
        isSaving={isSaving}
        autoSave
        debounceMs={1000}
        minHeight="120px"
        placeholder="Adicione o contexto da tarefa ou digite '/' para comandos..."
        emptyPreviewMessage="Adicione o contexto da tarefa ou digite '/' para comandos..."
        showLabel={false}
        containerClassName="bg-transparent border-transparent hover:border-zinc-800/50 hover:bg-zinc-900/40 transition-colors"
      />
    </div>
  );
}
