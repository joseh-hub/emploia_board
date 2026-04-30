import { addDays, differenceInCalendarDays, format, parseISO, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar,
  BarChart3,
  FileText,
  ShieldCheck,
  TrendingUp,
  Circle,
  type LucideIcon,
} from "lucide-react";

export type Cadencia = "unica" | "semanal" | "quinzenal" | "mensal" | "trimestral";
export type Categoria = "reuniao" | "qbr" | "report" | "auditoria" | "grow" | "outro";

export interface CategoriaMeta {
  label: string;
  icon: LucideIcon;
  /** tailwind text color class */
  color: string;
  /** tailwind bg color class */
  bg: string;
  /** tailwind border color class */
  border: string;
  /** css color used for the left bar (HSL fallback hex). */
  bar: string;
}

export const CATEGORIAS: Record<Categoria, CategoriaMeta> = {
  reuniao: {
    label: "Reunião",
    icon: Calendar,
    color: "text-sky-300",
    bg: "bg-sky-500/10",
    border: "border-sky-500/30",
    bar: "#38bdf8",
  },
  qbr: {
    label: "QBR",
    icon: BarChart3,
    color: "text-violet-300",
    bg: "bg-violet-500/10",
    border: "border-violet-500/30",
    bar: "#a78bfa",
  },
  report: {
    label: "Report",
    icon: FileText,
    color: "text-amber-300",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    bar: "#fbbf24",
  },
  auditoria: {
    label: "Auditoria",
    icon: ShieldCheck,
    color: "text-rose-300",
    bg: "bg-rose-500/10",
    border: "border-rose-500/30",
    bar: "#fb7185",
  },
  grow: {
    label: "Grow",
    icon: TrendingUp,
    color: "text-emerald-300",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    bar: "#34d399",
  },
  outro: {
    label: "Outro",
    icon: Circle,
    color: "text-zinc-300",
    bg: "bg-zinc-500/10",
    border: "border-zinc-500/30",
    bar: "#a1a1aa",
  },
};

export const CADENCIAS: Record<Cadencia, { label: string; stepDays: number }> = {
  unica: { label: "Única", stepDays: 0 },
  semanal: { label: "Semanal", stepDays: 7 },
  quinzenal: { label: "Quinzenal", stepDays: 14 },
  mensal: { label: "Mensal", stepDays: 30 },
  trimestral: { label: "Trimestral", stepDays: 90 },
};

export type DueStatus = "overdue" | "due-soon" | "ok" | "future" | "done" | "no-date";

export function getDueStatus(item: {
  due_date?: string | null;
  concluido?: boolean;
}): DueStatus {
  if (item.concluido) return "done";
  if (!item.due_date) return "no-date";
  const today = startOfDay(new Date());
  const due = startOfDay(parseISO(item.due_date));
  const diff = differenceInCalendarDays(due, today);
  if (diff < 0) return "overdue";
  if (diff <= 3) return "due-soon";
  if (diff <= 14) return "ok";
  return "future";
}

export function getDueLabel(item: {
  due_date?: string | null;
  concluido?: boolean;
  executado_em?: string | null;
  completed_at?: string | null;
}): string {
  if (item.concluido) {
    const ref = item.executado_em || item.completed_at;
    if (ref) {
      try {
        return `Concluído em ${format(parseISO(ref), "dd/MM/yyyy", { locale: ptBR })}`;
      } catch {
        return "Concluído";
      }
    }
    return "Concluído";
  }
  if (!item.due_date) return "Sem prazo";
  const today = startOfDay(new Date());
  const due = startOfDay(parseISO(item.due_date));
  const diff = differenceInCalendarDays(due, today);
  const dateStr = format(due, "dd/MM", { locale: ptBR });
  if (diff < 0) return `Atrasado há ${Math.abs(diff)}d • ${dateStr}`;
  if (diff === 0) return `Vence hoje • ${dateStr}`;
  if (diff === 1) return `Vence amanhã • ${dateStr}`;
  if (diff <= 14) return `Vence em ${diff}d • ${dateStr}`;
  return `${dateStr}`;
}

export const STATUS_STYLES: Record<DueStatus, { dot: string; bar: string; text: string }> = {
  overdue: { dot: "bg-rose-500", bar: "#f43f5e", text: "text-rose-400" },
  "due-soon": { dot: "bg-amber-500", bar: "#f59e0b", text: "text-amber-400" },
  ok: { dot: "bg-emerald-500", bar: "#10b981", text: "text-emerald-400" },
  future: { dot: "bg-zinc-600", bar: "#52525b", text: "text-zinc-400" },
  done: { dot: "bg-emerald-600", bar: "#059669", text: "text-emerald-500" },
  "no-date": { dot: "bg-zinc-700", bar: "#3f3f46", text: "text-zinc-500" },
};

export interface TemplateExpandable {
  texto: string;
  position: number;
  dias_offset: number;
  cadencia: Cadencia;
  ocorrencias: number;
  categoria: Categoria;
}

export interface ExpandedItem {
  texto: string;
  position: number;
  due_date: string; // ISO yyyy-mm-dd
  categoria: Categoria;
}

/**
 * Expands a template list into concrete checklist items with due dates,
 * generating recurring occurrences when needed.
 */
export function expandTemplate(
  template: TemplateExpandable[],
  baseDate: Date
): ExpandedItem[] {
  const out: ExpandedItem[] = [];
  let pos = 0;
  for (const t of template) {
    const cadencia = (t.cadencia || "unica") as Cadencia;
    const step = CADENCIAS[cadencia]?.stepDays ?? 0;
    const total = cadencia === "unica" ? 1 : Math.max(1, t.ocorrencias || 1);
    for (let i = 0; i < total; i++) {
      const due = addDays(baseDate, (t.dias_offset || 0) + step * i);
      const texto = total > 1 ? `${i + 1}ª ${t.texto}` : t.texto;
      out.push({
        texto,
        position: pos++,
        due_date: format(due, "yyyy-MM-dd"),
        categoria: t.categoria || "outro",
      });
    }
  }
  return out;
}

export function formatDueDateInput(iso?: string | null): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}
