import { useState, useCallback, useEffect } from "react";
import { InlineMarkdownEditor } from "@/components/ui/markdown-editor";
import { useUpdateProjetoDescription } from "@/hooks/useProjetos";

interface ProjetoDescriptionEditorProps {
  projetoId: string;
  initialDescription: string | null;
}

export function ProjetoDescriptionEditor({
  projetoId,
  initialDescription,
}: ProjetoDescriptionEditorProps) {
  const [description, setDescription] = useState(initialDescription || "");
  const updateDescription = useUpdateProjetoDescription();

  useEffect(() => {
    setDescription(initialDescription || "");
  }, [initialDescription]);

  const handleSave = useCallback(
    async (value: string) => {
      if (value === initialDescription) return;
      await updateDescription.mutateAsync({ id: projetoId, description: value });
    },
    [projetoId, initialDescription, updateDescription]
  );

  return (
    <InlineMarkdownEditor
      value={description}
      onChange={setDescription}
      onSave={handleSave}
      isSaving={updateDescription.isPending}
      autoSave
      debounceMs={1000}
      minHeight="150px"
      placeholder="Adicione observações sobre o projeto..."
      emptyPreviewMessage="Clique para adicionar observações..."
    />
  );
}
