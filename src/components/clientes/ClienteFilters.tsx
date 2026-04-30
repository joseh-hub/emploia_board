import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Filter, X, ChevronDown } from "lucide-react";
import { ClienteFilters } from "@/hooks/useClientes";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface ClienteFiltersProps {
  filters: ClienteFilters;
  onFiltersChange: (filters: ClienteFilters) => void;
  responsaveis: string[];
}

const STATUS_OPTIONS = ["ATIVO", "INATIVO", "ARQUIVADO", "CHURN"];
const TIPO_OPTIONS = ["Recorrente", "Projeto", "Consultoria"];
const RECEITA_OPTIONS = [
  { label: "Até R$ 5.000", min: 0, max: 5000 },
  { label: "R$ 5.000 - R$ 15.000", min: 5000, max: 15000 },
  { label: "R$ 15.000 - R$ 50.000", min: 15000, max: 50000 },
  { label: "Acima de R$ 50.000", min: 50000, max: Infinity },
];
const HEALTH_OPTIONS = [
  { label: "Crítico (< 5)", value: "critical" },
  { label: "Atenção (5-7)", value: "attention" },
  { label: "Saudável (> 7)", value: "healthy" },
];

export function ClienteFiltersBar({
  filters,
  onFiltersChange,
  responsaveis,
}: ClienteFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [openSections, setOpenSections] = useState<string[]>(["status", "tipo"]);

  const toggleSection = (section: string) => {
    setOpenSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value });
  };

  const toggleFilter = (
    key: "status" | "tipo" | "responsavel" | "receitaRange" | "healthScore",
    value: string
  ) => {
    const current = (filters[key] as string[]) || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onFiltersChange({ ...filters, [key]: updated });
  };

  const clearFilters = () => {
    onFiltersChange({ search: filters.search });
  };

  const activeFiltersCount =
    (filters.status?.length || 0) +
    (filters.tipo?.length || 0) +
    (filters.responsavel?.length || 0) +
    ((filters as any).receitaRange?.length || 0) +
    ((filters as any).healthScore?.length || 0);

  const FilterSection = ({
    title,
    sectionKey,
    children,
  }: {
    title: string;
    sectionKey: string;
    children: React.ReactNode;
  }) => (
    <Collapsible
      open={openSections.includes(sectionKey)}
      onOpenChange={() => toggleSection(sectionKey)}
    >
      <CollapsibleTrigger asChild>
        <button className="flex w-full items-center justify-between py-2 text-sm font-medium hover:text-foreground text-muted-foreground">
          {title}
          <ChevronDown
            className={`h-4 w-4 transition-transform ${
              openSections.includes(sectionKey) ? "rotate-180" : ""
            }`}
          />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-2 pb-2">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between pb-2">
        <h4 className="font-medium">Filtros Avançados</h4>
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-auto p-0 text-muted-foreground hover:text-foreground"
          >
            <X className="mr-1 h-3 w-3" />
            Limpar
          </Button>
        )}
      </div>

      <Separator />

      {/* Status */}
      <FilterSection title="Status" sectionKey="status">
        {STATUS_OPTIONS.map((status) => (
          <div key={status} className="flex items-center gap-2">
            <Checkbox
              id={`status-${status}`}
              checked={filters.status?.includes(status)}
              onCheckedChange={() => toggleFilter("status", status)}
            />
            <label
              htmlFor={`status-${status}`}
              className="text-sm cursor-pointer"
            >
              {status}
            </label>
          </div>
        ))}
      </FilterSection>

      <Separator />

      {/* Tipo */}
      <FilterSection title="Tipo" sectionKey="tipo">
        {TIPO_OPTIONS.map((tipo) => (
          <div key={tipo} className="flex items-center gap-2">
            <Checkbox
              id={`tipo-${tipo}`}
              checked={filters.tipo?.includes(tipo)}
              onCheckedChange={() => toggleFilter("tipo", tipo)}
            />
            <label
              htmlFor={`tipo-${tipo}`}
              className="text-sm cursor-pointer"
            >
              {tipo}
            </label>
          </div>
        ))}
      </FilterSection>

      <Separator />

      {/* Faixa de Receita */}
      <FilterSection title="Faixa de Receita" sectionKey="receita">
        {RECEITA_OPTIONS.map((option) => (
          <div key={option.label} className="flex items-center gap-2">
            <Checkbox
              id={`receita-${option.label}`}
              checked={((filters as any).receitaRange || []).includes(option.label)}
              onCheckedChange={() => toggleFilter("receitaRange", option.label)}
            />
            <label
              htmlFor={`receita-${option.label}`}
              className="text-sm cursor-pointer"
            >
              {option.label}
            </label>
          </div>
        ))}
      </FilterSection>

      <Separator />

      {/* Health Score */}
      <FilterSection title="Health Score" sectionKey="health">
        {HEALTH_OPTIONS.map((option) => (
          <div key={option.value} className="flex items-center gap-2">
            <Checkbox
              id={`health-${option.value}`}
              checked={((filters as any).healthScore || []).includes(option.value)}
              onCheckedChange={() => toggleFilter("healthScore", option.value)}
            />
            <label
              htmlFor={`health-${option.value}`}
              className="text-sm cursor-pointer"
            >
              {option.label}
            </label>
          </div>
        ))}
      </FilterSection>

      {responsaveis.length > 0 && (
        <>
          <Separator />

          {/* Responsável */}
          <FilterSection title="Responsável Técnico" sectionKey="responsavel">
            <div className="max-h-32 overflow-y-auto space-y-2">
              {responsaveis.map((resp) => (
                <div key={resp} className="flex items-center gap-2">
                  <Checkbox
                    id={`resp-${resp}`}
                    checked={filters.responsavel?.includes(resp)}
                    onCheckedChange={() => toggleFilter("responsavel", resp)}
                  />
                  <label
                    htmlFor={`resp-${resp}`}
                    className="text-sm cursor-pointer truncate"
                  >
                    {resp}
                  </label>
                </div>
              ))}
            </div>
          </FilterSection>
        </>
      )}
    </div>
  );
}
