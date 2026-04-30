import { useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  FileText,
  Plus,
  MoreHorizontal,
  Trash2,
  Pencil,
  CheckSquare,
  Globe,
  Copy,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Star,
} from "lucide-react";
import {
  useTaskTemplates,
  useDeleteTaskTemplate,
  TaskTemplate,
} from "@/hooks/useTaskTemplates";
import { useDuplicateTemplate } from "@/hooks/useDuplicateTemplate";
import { TemplateForm } from "@/components/templates/TemplateForm";

export default function Templates() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TaskTemplate | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterGlobal, setFilterGlobal] = useState<boolean | null | "default">(null);

  const { data: templates, isLoading } = useTaskTemplates();

  const filteredTemplates = templates?.filter((t) => {
    const matchesSearch = !searchQuery || 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.titulo_padrao.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterGlobal === null 
      || (filterGlobal === "default" ? t.is_default : t.is_global === filterGlobal);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Templates de Tarefas">
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Novo Template</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Criar Template</DialogTitle>
            </DialogHeader>
            <TemplateForm onSuccess={() => setIsCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      </TopBar>

      {/* Edit Modal */}
      <Dialog open={!!editingTemplate} onOpenChange={(open) => !open && setEditingTemplate(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Template</DialogTitle>
          </DialogHeader>
          {editingTemplate && (
            <TemplateForm
              initialData={editingTemplate}
              onSuccess={() => setEditingTemplate(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <div className="flex-1 min-h-0 overflow-hidden p-4 lg:p-6">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar templates..."
              className="pl-8 h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Filter className="h-4 w-4" />
                {filterGlobal === true ? "Globais" : filterGlobal === false ? "Específicos" : filterGlobal === "default" ? "Padrão" : "Todos"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilterGlobal(null)}>Todos</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterGlobal(true)}>Apenas Globais</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterGlobal(false)}>Específicos de Projeto</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterGlobal("default")}>Apenas Padrão</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-pulse text-muted-foreground">Carregando templates...</div>
          </div>
        ) : filteredTemplates && filteredTemplates.length > 0 ? (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.map((template) => (
              <TemplateCard 
                key={template.id} 
                template={template} 
                onEdit={() => setEditingTemplate(template)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium">
              {searchQuery || filterGlobal !== null ? "Nenhum template encontrado" : "Nenhum template criado"}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              {searchQuery || filterGlobal !== null
                ? "Tente ajustar os filtros de busca."
                : "Templates permitem criar tarefas padronizadas rapidamente. Crie seu primeiro template para agilizar seu fluxo de trabalho."}
            </p>
            {!searchQuery && filterGlobal === null && (
              <Button className="mt-4 gap-2" onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4" />
                Criar Template
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function TemplateCard({ template, onEdit }: { template: TaskTemplate; onEdit: () => void }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const deleteTemplate = useDeleteTaskTemplate();
  const duplicateTemplate = useDuplicateTemplate();

  return (
    <Card className="group">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {template.is_global && (
                  <Badge variant="outline" className="text-xs gap-1">
                    <Globe className="h-3 w-3" />
                    Global
                  </Badge>
                )}
                {template.is_default && (
                  <Badge variant="outline" className="text-xs gap-1 border-warning text-warning">
                    <Star className="h-3 w-3 fill-warning" />
                    Padrão
                  </Badge>
                )}
            </div>
            <CardTitle className="text-base mt-1 truncate">{template.name}</CardTitle>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => duplicateTemplate.mutate(template)}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => deleteTemplate.mutate(template.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {template.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {template.description}
          </p>
        )}
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Título padrão:</div>
          <div className="text-sm font-medium truncate">{template.titulo_padrao}</div>
        </div>

        {template.checklists && template.checklists.length > 0 && (
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs gap-1 w-full justify-start">
                <CheckSquare className="h-3.5 w-3.5" />
                {template.checklists.length} itens de checklist
                {isExpanded ? <ChevronUp className="h-3 w-3 ml-auto" /> : <ChevronDown className="h-3 w-3 ml-auto" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                {template.checklists.map((item, i) => (
                  <li key={item.id} className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border flex items-center justify-center text-[10px]">
                      {i + 1}
                    </span>
                    <span className="truncate">{item.texto}</span>
                  </li>
                ))}
              </ul>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
}
