import { useState, useEffect, useRef, useCallback } from "react";
import { InlineMarkdownEditor } from "@/components/ui/markdown-editor";
import { useUpdateClienteDescription } from "@/hooks/useClienteComments";

interface DescriptionEditorProps {
  clienteId: number;
  initialDescription: string | null;
}

export function DescriptionEditor({ clienteId, initialDescription }: DescriptionEditorProps) {
  const [description, setDescription] = useState(initialDescription || "");
  const updateDescription = useUpdateClienteDescription();
  const lastSavedRef = useRef(initialDescription || "");

  useEffect(() => {
    setDescription(initialDescription || "");
    lastSavedRef.current = initialDescription || "";
  }, [initialDescription]);

  const handleSave = useCallback(async (value: string) => {
    if (value === lastSavedRef.current) return;
    await updateDescription.mutateAsync({ clienteId, description: value });
    lastSavedRef.current = value;
  }, [clienteId, updateDescription]);

  return (
    <InlineMarkdownEditor
      value={description}
      onChange={setDescription}
      onSave={handleSave}
      isSaving={updateDescription.isPending}
      autoSave
      debounceMs={1000}
      minHeight="120px"
      emptyPreviewMessage="Clique para adicionar descrição..."
    />
  );
}
