import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { X, ChevronDown, Users, DollarSign } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ExtendedProjetoFilters } from "@/pages/Projetos";

interface ProjetoFiltersProps {
  filters: ExtendedProjetoFilters;
  onFiltersChange: (filters: ExtendedProjetoFilters) => void;
  profiles?: { id: string; full_name: string | null; email: string; avatar_url: string | null }[];
}

const STATUS_OPTIONS = [
  { value: "voo_solo", label: "Voo Solo" },
  { value: "ativo", label: "Ativo" },
  { value: "concluido", label: "Concluído" },
  { value: "pausado", label: "Pausado" },
];

const CLIENT_TYPE_OPTIONS = [
  { value: "Recorrente", label: "Recorrente" },
  { value: "Projeto", label: "Projeto" },
  { value: "Consultoria", label: "Consultoria" },
  { value: "Implantação", label: "Implantação" },
];

const VALUE_RANGE_OPTIONS = [
  { value: "ate_5k", label: "Até R$ 5.000" },
  { value: "5k_15k", label: "R$ 5.000 - R$ 15.000" },
  { value: "15k_50k", label: "R$ 15.000 - R$ 50.000" },
  { value: "acima_50k", label: "Acima de R$ 50.000" },
];

export function ProjetoFiltersBar({
  filters,
  onFiltersChange,
  profiles = [],
}: ProjetoFiltersProps) {
  const [openSections, setOpenSections] = useState<string[]>(["status", "tipo"]);

  const toggleSection = (section: string) => {
    setOpenSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const toggleFilter = (
    key: "status" | "clientType" | "valueRange" | "responsavel",
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
    (filters.clientType?.length || 0) +
    (filters.valueRange?.length || 0) +
    (filters.responsavel?.length || 0);

  const FilterSection = ({
    title,
    sectionKey,
    children,
  }: {
    title: React.ReactNode;
    sectionKey: string;
    children: React.ReactNode;
  }) => (
    <Collapsible
      open={openSections.includes(sectionKey)}
      onOpenChange={() => toggleSection(sectionKey)}
    >
      <CollapsibleTrigger asChild>
        <button className="flex w-full items-center justify-between py-2 text-sm font-medium hover:text-white text-zinc-400 group transition-colors">
          <span className="flex items-center gap-2">{title}</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform text-zinc-500 group-hover:text-zinc-300 ${
              openSections.includes(sectionKey) ? "rotate-180" : ""
            }`}
          />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-2 pb-2 mt-1">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between pb-2">
        <h4 className="font-medium text-zinc-100">Filtros Avançados</h4>
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-auto p-0 text-sm text-zinc-500 hover:text-white hover:bg-transparent"
          >
            <X className="mr-1 h-3.5 w-3.5" />
            Limpar
          </Button>
        )}
      </div>

      <Separator className="bg-white/5" />

      {/* Status */}
      <FilterSection title="Status" sectionKey="status">
        <div className="flex flex-col gap-2.5 pt-1">
          {STATUS_OPTIONS.map((status) => (
            <div key={status.value} className="flex items-center gap-2 group">
              <Checkbox
                id={`status-${status.value}`}
                checked={filters.status?.includes(status.value)}
                onCheckedChange={() => toggleFilter("status", status.value)}
                className="border-zinc-700/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <label
                htmlFor={`status-${status.value}`}
                className="text-sm cursor-pointer text-zinc-300 group-hover:text-white transition-colors"
              >
                {status.label}
              </label>
            </div>
          ))}
        </div>
      </FilterSection>

      <Separator className="bg-white/5" />

      {/* Tipo de Cliente */}
      <FilterSection
        title={
          <>
            <Users className="h-4 w-4" />
            Tipo de Cliente
          </>
        }
        sectionKey="tipo"
      >
        <div className="flex flex-col gap-2.5 pt-1">
          {CLIENT_TYPE_OPTIONS.map((type) => (
            <div key={type.value} className="flex items-center gap-2 group">
              <Checkbox
                id={`type-${type.value}`}
                checked={filters.clientType?.includes(type.value)}
                onCheckedChange={() => toggleFilter("clientType", type.value)}
                className="border-zinc-700/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <label
                htmlFor={`type-${type.value}`}
                className="text-sm cursor-pointer text-zinc-300 group-hover:text-white transition-colors"
              >
                {type.label}
              </label>
            </div>
          ))}
        </div>
      </FilterSection>

      <Separator className="bg-white/5" />

      {/* Faixa de Valor */}
      <FilterSection
        title={
          <>
            <DollarSign className="h-4 w-4" />
            Faixa de Valor
          </>
        }
        sectionKey="valor"
      >
        <div className="flex flex-col gap-2.5 pt-1">
          {VALUE_RANGE_OPTIONS.map((range) => (
            <div key={range.value} className="flex items-center gap-2 group">
              <Checkbox
                id={`range-${range.value}`}
                checked={filters.valueRange?.includes(range.value)}
                onCheckedChange={() => toggleFilter("valueRange", range.value)}
                className="border-zinc-700/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <label
                htmlFor={`range-${range.value}`}
                className="text-sm cursor-pointer text-zinc-300 group-hover:text-white transition-colors"
              >
                {range.label}
              </label>
            </div>
          ))}
        </div>
      </FilterSection>

      {profiles.length > 0 && (
        <>
          <Separator className="bg-white/5" />

          {/* Responsável Técnico */}
          <FilterSection
            title={
              <>
                <Users className="h-4 w-4" />
                Responsável Técnico
              </>
            }
            sectionKey="responsavel"
          >
            <div className="max-h-36 overflow-y-auto space-y-2.5 pt-1 pr-2">
              {profiles.map((profile) => (
                <div key={profile.id} className="flex items-center gap-2 group">
                  <Checkbox
                    id={`responsavel-${profile.id}`}
                    checked={filters.responsavel?.includes(profile.id)}
                    onCheckedChange={() => toggleFilter("responsavel", profile.id)}
                    className="border-zinc-700/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary shrink-0"
                  />
                  <label
                    htmlFor={`responsavel-${profile.id}`}
                    className="flex-1 text-sm cursor-pointer text-zinc-300 group-hover:text-white transition-colors flex items-center gap-2 truncate"
                  >
                    <Avatar className="h-5 w-5 border border-zinc-800 shrink-0">
                      <AvatarImage src={profile.avatar_url || undefined} />
                      <AvatarFallback className="text-[9px] bg-zinc-800 text-zinc-300">
                        {profile.full_name?.charAt(0) || profile.email?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate">
                      {profile.full_name || profile.email || "Sem nome"}
                    </span>
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
