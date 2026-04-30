import { useClienteProjetos } from "@/hooks/useClienteProjetos";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FolderKanban, Calendar, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";

interface ClienteProjetosTabProps {
  clienteId: number;
}

const STATUS_LABELS: Record<string, string> = {
  voo_solo: "Voo Solo",
  ativo: "Ativo",
  concluido: "Concluído",
  pausado: "Pausado",
};

const STATUS_COLORS: Record<string, string> = {
  voo_solo: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  ativo: "bg-green-500/10 text-green-500 border-green-500/20",
  concluido: "bg-muted text-muted-foreground border-muted",
  pausado: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
};

export function ClienteProjetosTab({ clienteId }: ClienteProjetosTabProps) {
  const { data: projetos, isLoading } = useClienteProjetos(clienteId);

  const formatCurrency = (value: number | null) => {
    if (!value) return "R$ 0";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("pt-BR");
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!projetos?.length) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <FolderKanban className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p className="text-sm font-medium">Nenhum projeto vinculado</p>
        <p className="text-xs mt-1">
          Vincule projetos a este cliente na tela de{" "}
          <Link to="/projetos" className="text-primary hover:underline">
            Projetos
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground mb-4">
        {projetos.length} projeto{projetos.length !== 1 ? "s" : ""} vinculado{projetos.length !== 1 ? "s" : ""}
      </p>
      
      {projetos.map((projeto) => (
        <Card key={projeto.project_id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">
                  {projeto.project_name || projeto.company_name || "Projeto sem nome"}
                </h4>
                
                <div className="flex items-center gap-2 mt-2">
                  <Badge 
                    variant="outline" 
                    className={STATUS_COLORS[projeto.status || ""] || ""}
                  >
                    {STATUS_LABELS[projeto.status || ""] || projeto.status || "Sem status"}
                  </Badge>
                  {projeto.client_type && (
                    <Badge variant="outline" className="text-xs">
                      {projeto.client_type}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                <span>{formatCurrency(projeto.monthly_value)}/mês</span>
              </div>
              
              {projeto.v1_delivery_date && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>V1: {formatDate(projeto.v1_delivery_date)}</span>
                </div>
              )}
              
              {projeto.horas && (
                <span>{projeto.horas}h</span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
