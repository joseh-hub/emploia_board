import { CheckCircle2, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TasksEmptyStateProps {
  hasFilters?: boolean;
  onClearFilters?: () => void;
}

export function TasksEmptyState({ hasFilters, onClearFilters }: TasksEmptyStateProps) {
  if (hasFilters) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-6">
          <Star className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Nenhuma tarefa encontrada</h3>
        <p className="text-muted-foreground max-w-sm mb-6">
          Não encontramos tarefas que correspondam aos filtros selecionados.
        </p>
        {onClearFilters && (
          <Button variant="outline" onClick={onClearFilters}>
            Limpar filtros
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="h-20 w-20 rounded-full bg-success/10 flex items-center justify-center mb-6">
        <CheckCircle2 className="h-10 w-10 text-success" />
      </div>
      <h3 className="text-xl font-semibold mb-2">Tudo em dia! 🎉</h3>
      <p className="text-muted-foreground max-w-md mb-6">
        Você não tem nenhuma tarefa priorizada no momento.
        Marque tarefas como prioridade nos projetos para vê-las aqui.
      </p>
      <Button variant="outline" className="gap-2" asChild>
        <a href="/projetos">
          Ver Projetos
          <ArrowRight className="h-4 w-4" />
        </a>
      </Button>
    </div>
  );
}
