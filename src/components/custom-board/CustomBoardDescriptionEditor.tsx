import { InlineMarkdownEditor } from "@/components/ui/markdown-editor";

interface CustomBoardDescriptionEditorProps {
  description: string;
  onChange: (value: string) => void;
  onSave?: (value: string) => void | Promise<void>;
  autoSave?: boolean;
  debounceMs?: number;
}

export function CustomBoardDescriptionEditor({
  description,
  onChange,
  onSave,
  autoSave = false,
  debounceMs = 1000,
}: CustomBoardDescriptionEditorProps) {
  return (
    <InlineMarkdownEditor
      value={description}
      onChange={onChange}
      onSave={onSave}
      autoSave={autoSave}
      debounceMs={debounceMs}
      minHeight="100px"
      placeholder="Adicione uma descrição..."
      emptyPreviewMessage="Clique para adicionar descrição..."
    />
  );
}
