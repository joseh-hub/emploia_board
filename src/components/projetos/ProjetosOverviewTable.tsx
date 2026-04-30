import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useProjetosOverview, OverviewRow } from "@/hooks/useProjetosOverview";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import { semanticBadge } from "@/components/shared/BadgeStyles";

function StatusBadge({ status }: { status: OverviewRow["status"] }) {
  switch (status) {
    case "feito":
      return (
        <Badge variant="outline" className={semanticBadge.success}>
          Feito
        </Badge>
      );
    case "fazendo":
      return (
        <Badge variant="outline" className={semanticBadge.primary}>
          Fazendo
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className={semanticBadge.muted}>
          A fazer
        </Badge>
      );
  }
}

const STATUS_OPTIONS = [
  { value: "a_fazer", label: "A fazer" },
  { value: "fazendo", label: "Fazendo" },
  { value: "feito", label: "Feito" },
] as const;

export function ProjetosOverviewTable() {
  const { data: rows, isLoading } = useProjetosOverview();

  const [filterCliente, setFilterCliente] = useState("");
  const [filterProjeto, setFilterProjeto] = useState("");
  const [filterChecklist, setFilterChecklist] = useState("");
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [filterDateRange, setFilterDateRange] = useState<DateRange | undefined>();

  const hasFilters = filterCliente || filterProjeto || filterChecklist || filterStatus.length > 0 || filterDateRange?.from;

  const clearFilters = () => {
    setFilterCliente("");
    setFilterProjeto("");
    setFilterChecklist("");
    setFilterStatus([]);
    setFilterDateRange(undefined);
  };

  const toggleStatus = (value: string) => {
    setFilterStatus((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    );
  };

  const filteredRows = useMemo(() => {
    if (!rows) return [];
    return rows.filter((row) => {
      if (filterCliente && !row.clienteName.toLowerCase().includes(filterCliente.toLowerCase())) return false;
      if (filterProjeto && !row.projetoName.toLowerCase().includes(filterProjeto.toLowerCase())) return false;
      if (filterChecklist && !row.checklistName.toLowerCase().includes(filterChecklist.toLowerCase())) return false;
      if (filterStatus.length > 0 && !filterStatus.includes(row.status)) return false;
      if (filterDateRange?.from && row.dueDate) {
        const d = new Date(row.dueDate);
        if (d < filterDateRange.from) return false;
        if (filterDateRange.to && d > filterDateRange.to) return false;
      }
      if (filterDateRange?.from && !row.dueDate) return false;
      return true;
    });
  }, [rows, filterCliente, filterProjeto, filterChecklist, filterStatus, filterDateRange]);

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded" />
        ))}
      </div>
    );
  }

  if (!rows || rows.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Nenhum checklist de template padrão encontrado nos projetos.
        </p>
      </div>
    );
  }

  const dateLabel = filterDateRange?.from
    ? filterDateRange.to
      ? `${format(filterDateRange.from, "dd/MM/yy")} – ${format(filterDateRange.to, "dd/MM/yy")}`
      : format(filterDateRange.from, "dd/MM/yyyy")
    : "Data";

  return (
    <div className="space-y-3">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Cliente"
          value={filterCliente}
          onChange={(e) => setFilterCliente(e.target.value)}
          className="h-8 w-36 bg-zinc-900/50 border-zinc-800 text-sm text-zinc-300 placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-zinc-700"
        />
        <Input
          placeholder="Projeto"
          value={filterProjeto}
          onChange={(e) => setFilterProjeto(e.target.value)}
          className="h-8 w-36 bg-zinc-900/50 border-zinc-800 text-sm text-zinc-300 placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-zinc-700"
        />
        <Input
          placeholder="Checklist"
          value={filterChecklist}
          onChange={(e) => setFilterChecklist(e.target.value)}
          className="h-8 w-36 bg-zinc-900/50 border-zinc-800 text-sm text-zinc-300 placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-zinc-700"
        />

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 gap-1.5 text-xs font-normal border border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors",
                filterDateRange?.from && "border-[#3F1757]/50 text-[#CBC5EA] bg-[#3F1757]/10"
              )}
            >
              <CalendarIcon className="h-3.5 w-3.5" />
              {dateLabel}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={filterDateRange}
              onSelect={setFilterDateRange}
              numberOfMonths={2}
              locale={ptBR}
              className="p-3 pointer-events-auto bg-zinc-950 border-zinc-800"
            />
          </PopoverContent>
        </Popover>

        {STATUS_OPTIONS.map((opt) => (
          <Button
            key={opt.value}
            variant="ghost"
            size="sm"
            className={cn(
               "h-8 text-xs border border-zinc-800 transition-colors",
               filterStatus.includes(opt.value) 
                  ? "bg-zinc-800 text-white" 
                  : "bg-zinc-900/50 text-zinc-400 hover:text-white hover:bg-zinc-800/80"
            )}
            onClick={() => toggleStatus(opt.value)}
          >
            {opt.label}
          </Button>
        ))}

        {hasFilters && (
          <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 text-zinc-400 hover:text-white" onClick={clearFilters}>
            <X className="h-3.5 w-3.5" />
            Limpar
          </Button>
        )}

        <span className="ml-auto text-xs text-muted-foreground">
          {filteredRows.length} de {rows.length}
        </span>
      </div>

      {/* Table */}
      <div className="h-full overflow-auto rounded-lg border border-zinc-800/50 bg-zinc-900/20">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Projeto</TableHead>
              <TableHead>Checklist</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRows.map((row) => (
              <TableRow key={row.tarefaId}>
                <TableCell className="font-medium">{row.clienteName}</TableCell>
                <TableCell>{row.projetoName}</TableCell>
                <TableCell>{row.checklistName}</TableCell>
                <TableCell>
                  {row.dueDate
                    ? format(new Date(row.dueDate), "dd/MM/yyyy", { locale: ptBR })
                    : "—"}
                </TableCell>
                <TableCell>
                  <StatusBadge status={row.status} />
                </TableCell>
              </TableRow>
            ))}
            {filteredRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Nenhum resultado encontrado para os filtros aplicados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
