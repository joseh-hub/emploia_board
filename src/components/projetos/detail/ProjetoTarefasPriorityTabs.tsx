/**
 * @file: ProjetoTarefasPriorityTabs.tsx
 * @responsibility: Renderizar abas internas de tarefas (todas/priorizadas/não priorizadas).
 * @exports: ProjetoTarefasPriorityTabs
 * @imports: Tabs (ui), Badge/Separator (ui), ProjetoTarefa (hook types)
 * @layer: components
 */
import { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, Star } from "lucide-react";
import type { ProjetoTarefa } from "@/hooks/useProjetoTarefas";

interface ProjetoTarefasPriorityTabsProps {
  /** Tarefas marcadas como priorizadas */
  priorizadas: ProjetoTarefa[];
  /** Tarefas não priorizadas */
  demais: ProjetoTarefa[];
  /** Render prop para renderizar o card de cada tarefa */
  renderTarefaCard: (tarefa: ProjetoTarefa) => ReactNode;
  /** Se true, na aba "Todas" exibe seções separadas para priorizadas e demais. Default: true */
  showSectionsOnAll?: boolean;
}

function CountBadge({ count }: { count: number }) {
  return (
    <Badge variant="secondary" className="ml-2 px-1.5 py-0 text-[10px] leading-4">
      {count}
    </Badge>
  );
}

function EmptyState({
  icon,
  title,
}: {
  icon: ReactNode;
  title: string;
}) {
  return (
    <div className="text-center py-8 text-muted-foreground">
      <div className="h-8 w-8 mx-auto mb-2 opacity-20">{icon}</div>
      <p className="text-sm">{title}</p>
    </div>
  );
}

export function ProjetoTarefasPriorityTabs({
  priorizadas,
  demais,
  renderTarefaCard,
  showSectionsOnAll = true,
}: ProjetoTarefasPriorityTabsProps) {
  const total = priorizadas.length + demais.length;

  const renderList = (items: ProjetoTarefa[]) => (
    <div className="space-y-3">
      {items.map((tarefa) => (
        <div key={tarefa.id}>{renderTarefaCard(tarefa)}</div>
      ))}
    </div>
  );

  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className="h-8 w-full justify-start">
        <TabsTrigger value="all" className="text-xs px-2 py-1">
          Todas
          <CountBadge count={total} />
        </TabsTrigger>
        <TabsTrigger value="priorizadas" className="text-xs px-2 py-1">
          Priorizadas
          <CountBadge count={priorizadas.length} />
        </TabsTrigger>
        <TabsTrigger value="demais" className="text-xs px-2 py-1">
          Não priorizadas
          <CountBadge count={demais.length} />
        </TabsTrigger>
      </TabsList>

      <TabsContent value="all" className="mt-4">
        {total === 0 ? (
          <EmptyState icon={<Search className="h-8 w-8" />} title="Nenhuma tarefa encontrada" />
        ) : showSectionsOnAll ? (
          <div className="space-y-3">
            {priorizadas.length > 0 && (
              <>
                <p className="text-xs font-medium text-warning/80 uppercase tracking-wide px-1">
                  ★ Priorizadas
                </p>
                {renderList(priorizadas)}
              </>
            )}

            {priorizadas.length > 0 && demais.length > 0 && <Separator />}

            {demais.length > 0 && (
              <>
                {priorizadas.length > 0 && (
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-1">
                    Demais tarefas
                  </p>
                )}
                {renderList(demais)}
              </>
            )}
          </div>
        ) : (
          renderList([...priorizadas, ...demais])
        )}
      </TabsContent>

      <TabsContent value="priorizadas" className="mt-4">
        {priorizadas.length === 0 ? (
          <EmptyState
            icon={<Star className="h-8 w-8" />}
            title="Nenhuma tarefa priorizada"
          />
        ) : (
          renderList(priorizadas)
        )}
      </TabsContent>

      <TabsContent value="demais" className="mt-4">
        {demais.length === 0 ? (
          <EmptyState
            icon={<Search className="h-8 w-8" />}
            title="Nenhuma tarefa não priorizada"
          />
        ) : (
          renderList(demais)
        )}
      </TabsContent>
    </Tabs>
  );
}

