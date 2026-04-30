import { BookOpen, FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WikiEmptyStateProps {
  onCreateFolder: () => void;
}

export function WikiEmptyState({ onCreateFolder }: WikiEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <BookOpen className="h-10 w-10 text-primary" />
      </div>
      
      <h2 className="text-2xl font-bold mb-2">Bem-vindo à Wiki</h2>
      <p className="text-muted-foreground max-w-md mb-6">
        Sua central de documentação para clientes, projetos e tarefas.
        Selecione uma pasta na barra lateral ou crie sua primeira pasta para começar.
      </p>
      
      <Button onClick={onCreateFolder} size="lg">
        <FolderPlus className="h-5 w-5 mr-2" />
        Criar Primeira Pasta
      </Button>
      
      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl">
        <div className="p-4 rounded-lg border bg-card text-left">
          <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center mb-3">
            <span className="text-success text-lg">📁</span>
          </div>
          <h3 className="font-semibold mb-1">Pastas Automáticas</h3>
          <p className="text-sm text-muted-foreground">
            Pastas criadas automaticamente para cada cliente e projeto.
          </p>
        </div>
        
        <div className="p-4 rounded-lg border bg-card text-left">
          <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center mb-3">
            <span className="text-info text-lg">📝</span>
          </div>
          <h3 className="font-semibold mb-1">Documentos Markdown</h3>
          <p className="text-sm text-muted-foreground">
            Crie e edite documentação com formatação rica.
          </p>
        </div>
        
        <div className="p-4 rounded-lg border bg-card text-left">
          <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center mb-3">
            <span className="text-warning text-lg">📤</span>
          </div>
          <h3 className="font-semibold mb-1">Upload de Arquivos</h3>
          <p className="text-sm text-muted-foreground">
            Anexe PDFs, imagens e outros documentos.
          </p>
        </div>
      </div>
    </div>
  );
}
