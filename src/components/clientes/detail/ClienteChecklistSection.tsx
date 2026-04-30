import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ListChecks,
  Sparkles,
  Plus,
  X,
  AlertTriangle,
  CalendarDays,
  CalendarClock,
  CheckCircle2,
} from "lucide-react";
import { differenceInCalendarDays, parseISO, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import {
  useClienteChecklist,
  useAddClienteChecklistItem,
  useApplyDefaultChecklistToCliente,
} from "@/hooks/useClienteChecklist";
import {
  CATEGORIAS,
  CLUSTERS,
  CLUSTER_LABELS,
  clusterFromTipo,
  type Categoria,
  type Cluster,
  getDueStatus,
} from "@/lib/checklistDates";
import { ClienteChecklistItemRow } from "./ClienteChecklistItemRow";

interface Props {
  clienteId: number;
}

type Filter = "todos" | "atrasados" | "semana" | "proximos" | "concluidos";

export function ClienteChecklistSection({ clienteId }: Props) {
  const { data: items = [], isLoading } = useClienteChecklist(clienteId);
  const addItem = useAddClienteChecklistItem();
  const applyDefault = useApplyDefaultChecklistToCliente();

  // Read client's Tipo to suggest the right cluster.
  const { data: cliMeta } = useQuery({
    queryKey: ["cliente-tipo", clienteId],
    queryFn: async () => {
      const { data } = await supabase
        .from("metadata_clientes")
        .select("Tipo")
        .eq("id", clienteId)
        .maybeSingle();
      return (data as { Tipo?: string | null } | null) ?? null;
    },
  });
  const tipo = cliMeta?.Tipo ?? null;
  const suggestedCluster: Cluster = clusterFromTipo(tipo);
  const tipoMissing = !tipo || tipo.trim() === "";
  const [pickerCluster, setPickerCluster] = useState<Cluster>(suggestedCluster);

  const [filter, setFilter] = useState<Filter>("todos");
  const [showAdd, setShowAdd] = useState(false);
  const [newText, setNewText] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newCat, setNewCat] = useState<Categoria>("outro");

  const counts = useMemo(() => {
    const today = startOfDay(new Date());
    let overdue = 0;
    let semana = 0;
    let proximos = 0;
    let concluidos = 0;
    for (const i of items) {
      if (i.concluido) {
        concluidos++;
        continue;
      }
      const status = getDueStatus(i);
      if (status === "overdue") overdue++;
      if (i.due_date && !i.concluido) {
        const diff = differenceInCalendarDays(parseISO(i.due_date), today);
        if (diff >= 0 && diff <= 7) semana++;
        if (diff > 7) proximos++;
      }
    }
    return { overdue, semana, proximos, concluidos };
  }, [items]);

  const filtered = useMemo(() => {
    const today = startOfDay(new Date());
    return items.filter((i) => {
      switch (filter) {
        case "atrasados":
          return !i.concluido && getDueStatus(i) === "overdue";
        case "semana":
          if (i.concluido || !i.due_date) return false;
          {
            const d = differenceInCalendarDays(parseISO(i.due_date), today);
            return d >= 0 && d <= 7;
          }
        case "proximos":
          if (i.concluido || !i.due_date) return false;
          return differenceInCalendarDays(parseISO(i.due_date), today) > 7;
        case "concluidos":
          return i.concluido;
        default:
          return true;
      }
    });
  }, [items, filter]);

  const total = items.length;
  const completed = counts.concluidos;
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

  const handleAdd = () => {
    if (!newText.trim()) return;
    addItem.mutate(
      {
        cliente_id: clienteId,
        texto: newText.trim(),
        due_date: newDate || null,
        categoria: newCat,
      },
      {
        onSuccess: () => {
          setNewText("");
          setNewDate("");
          setNewCat("outro");
        },
      }
    );
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-muted-foreground" />
          <h4 className="text-sm font-medium">Plano de Sucesso (CS)</h4>
          {total > 0 && (
            <span className="text-xs text-muted-foreground tabular-nums">
              {completed}/{total}
            </span>
          )}
        </div>
        {total > 0 && (
          <span className="text-xs font-medium text-muted-foreground tabular-nums">
            {progress}%
          </span>
        )}
      </div>

      {total > 0 && <Progress value={progress} className="h-1.5" />}

      {isLoading ? (
        <p className="text-xs text-muted-foreground py-2">Carregando…</p>
      ) : total === 0 ? (
        <div className="flex flex-col items-start gap-2 py-4 px-3 rounded-md border border-dashed border-muted-foreground/30 bg-muted/30">
          <p className="text-sm text-muted-foreground">
            Sem plano de sucesso para este cliente.
          </p>
          <p className="text-[11px] text-muted-foreground">
            {tipoMissing ? (
              <>
                <strong className="text-amber-400">Tipo do cliente não definido.</strong> Escolha
                qual cluster aplicar abaixo.
              </>
            ) : (
              <>
                Será aplicado o template do{" "}
                <strong className="text-foreground">{CLUSTER_LABELS[suggestedCluster]}</strong>{" "}
                (Tipo: {tipo}).
              </>
            )}
          </p>
          <div className="flex flex-wrap gap-2 items-center">
            {tipoMissing ? (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    size="sm"
                    className="gap-1.5 h-8 bg-[#3F1757] hover:bg-[#4d1c6c] text-white"
                    disabled={applyDefault.isPending}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Escolher cluster e aplicar
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-64 space-y-2">
                  <p className="text-xs font-medium">Qual cluster aplicar?</p>
                  <Select
                    value={pickerCluster}
                    onValueChange={(v) => setPickerCluster(v as Cluster)}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CLUSTERS.map((c) => (
                        <SelectItem key={c} value={c}>
                          {CLUSTER_LABELS[c]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    className="w-full h-8"
                    onClick={() =>
                      applyDefault.mutate({ clienteId, cluster: pickerCluster })
                    }
                    disabled={applyDefault.isPending}
                  >
                    Aplicar {CLUSTER_LABELS[pickerCluster]}
                  </Button>
                </PopoverContent>
              </Popover>
            ) : (
              <Button
                size="sm"
                className="gap-1.5 h-8 bg-[#3F1757] hover:bg-[#4d1c6c] text-white"
                onClick={() => applyDefault.mutate(clienteId)}
                disabled={applyDefault.isPending}
              >
                <Sparkles className="h-3.5 w-3.5" />
                Aplicar {CLUSTER_LABELS[suggestedCluster]}
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 h-8"
              onClick={() => setShowAdd(true)}
            >
              <Plus className="h-3.5 w-3.5" />
              Adicionar item manualmente
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <FilterChip
              active={filter === "todos"}
              onClick={() => setFilter("todos")}
              label="Todos"
              count={total}
            />
            <FilterChip
              active={filter === "atrasados"}
              onClick={() => setFilter("atrasados")}
              label="Atrasados"
              count={counts.overdue}
              icon={<AlertTriangle className="h-3 w-3" />}
              tone="danger"
            />
            <FilterChip
              active={filter === "semana"}
              onClick={() => setFilter("semana")}
              label="Esta semana"
              count={counts.semana}
              icon={<CalendarClock className="h-3 w-3" />}
              tone="warning"
            />
            <FilterChip
              active={filter === "proximos"}
              onClick={() => setFilter("proximos")}
              label="Próximos"
              count={counts.proximos}
              icon={<CalendarDays className="h-3 w-3" />}
            />
            <FilterChip
              active={filter === "concluidos"}
              onClick={() => setFilter("concluidos")}
              label="Concluídos"
              count={counts.concluidos}
              icon={<CheckCircle2 className="h-3 w-3" />}
              tone="success"
            />
          </div>

          {/* Items */}
          <div className="space-y-1.5">
            {filtered.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                Nenhum item neste filtro.
              </p>
            ) : (
              filtered.map((item) => (
                <ClienteChecklistItemRow
                  key={item.id}
                  item={item}
                  clienteId={clienteId}
                />
              ))
            )}
          </div>
        </>
      )}

      {/* Add inline */}
      {showAdd ? (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-2.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-primary/80">
              Novo item
            </span>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={() => {
                setShowAdd(false);
                setNewText("");
              }}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
          <Input
            autoFocus
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Ex.: Reunião de alinhamento"
            className="h-8 text-sm bg-background"
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <div className="grid grid-cols-12 gap-2">
            <Select
              value={newCat}
              onValueChange={(v) => setNewCat(v as Categoria)}
            >
              <SelectTrigger className="col-span-6 h-8 text-xs bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(CATEGORIAS) as Categoria[]).map((c) => (
                  <SelectItem key={c} value={c}>
                    {CATEGORIAS[c].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="col-span-4 h-8 text-xs bg-background"
            />
            <Button
              size="sm"
              className="col-span-2 h-8 px-2"
              onClick={handleAdd}
              disabled={!newText.trim() || addItem.isPending}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ) : total > 0 ? (
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="py-1.5 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors w-full text-left"
        >
          + Adicionar item
        </button>
      ) : null}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  count,
  icon,
  tone,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  icon?: React.ReactNode;
  tone?: "danger" | "warning" | "success";
}) {
  const toneClass =
    tone === "danger"
      ? "text-rose-300 border-rose-500/30 data-[active=true]:bg-rose-500/15"
      : tone === "warning"
      ? "text-amber-300 border-amber-500/30 data-[active=true]:bg-amber-500/15"
      : tone === "success"
      ? "text-emerald-300 border-emerald-500/30 data-[active=true]:bg-emerald-500/15"
      : "text-muted-foreground border-border data-[active=true]:bg-muted";
  return (
    <button
      type="button"
      data-active={active}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md border text-[11px] font-medium transition-colors",
        "hover:bg-muted/60",
        toneClass,
        active && "ring-1 ring-inset ring-current/40"
      )}
    >
      {icon}
      {label}
      <span className="tabular-nums opacity-80">{count}</span>
    </button>
  );
}
