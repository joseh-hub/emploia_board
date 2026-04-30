import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { Cliente } from "@/hooks/useClientes";
import { Skeleton } from "@/components/ui/skeleton";

interface ClientesTableProps {
  clientes: Cliente[];
  isLoading?: boolean;
  onView?: (cliente: Cliente) => void;
}

export function ClientesTable({
  clientes,
  isLoading,
  onView,
}: ClientesTableProps) {
  const formatCurrency = (value: number | null) => {
    if (!value) return "R$ 0,00";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Receita</TableHead>
              <TableHead>Horas</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                <TableCell><Skeleton className="h-8 w-8" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Receita</TableHead>
            <TableHead>Horas</TableHead>
            <TableHead>Responsável</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clientes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                Nenhum cliente encontrado
              </TableCell>
            </TableRow>
          ) : (
            clientes.map((cliente) => (
              <TableRow 
                key={cliente.id} 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onView?.(cliente)}
              >
                <TableCell className="font-medium">{cliente.name}</TableCell>
                <TableCell>
                  <Badge
                    variant={cliente.status === "ATIVO" ? "default" : "secondary"}
                  >
                    {cliente.status || "Sem status"}
                  </Badge>
                </TableCell>
                <TableCell>{cliente.Tipo || "-"}</TableCell>
                <TableCell>{formatCurrency(cliente.receita)}</TableCell>
                <TableCell>{cliente.horas}h</TableCell>
                <TableCell className="max-w-[150px] truncate">
                  {cliente.responsavelTecnico?.join(", ") || "-"}
                </TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      onView?.(cliente);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
