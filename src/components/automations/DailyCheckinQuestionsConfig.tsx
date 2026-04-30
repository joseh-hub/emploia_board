import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Save, HelpCircle } from "lucide-react";
import {
  DailyCheckinConfig,
  DailyCheckinQuestion,
  useUpdateDailyCheckinConfig,
} from "@/hooks/useDailyCheckin";
import { toast } from "@/hooks/use-toast";

const AVAILABLE_VARIABLES = [
  { label: "{card.nome}", description: "Título da tarefa" },
  { label: "{card.status}", description: "Status atual" },
  { label: "{card.coluna}", description: "Nome da coluna" },
  { label: "{card.dataEntrega}", description: "Data de entrega" },
  { label: "{card.dataInicio}", description: "Data de início" },
  { label: "{card.prioridade}", description: "Prioridade" },
  { label: "{card.projeto}", description: "Nome do projeto" },
  { label: "{card.checklist.pendentes}", description: "Itens pendentes do checklist" },
  { label: "{card.checklist.total}", description: "Total de itens do checklist" },
  { label: "{usuario.nome}", description: "Nome do usuário" },
];

interface DailyCheckinQuestionsConfigProps {
  config: DailyCheckinConfig;
}

export function DailyCheckinQuestionsConfig({ config }: DailyCheckinQuestionsConfigProps) {
  const [questions, setQuestions] = useState<DailyCheckinQuestion[]>(config.questions);
  const [activeInputIndex, setActiveInputIndex] = useState<number | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const updateConfig = useUpdateDailyCheckinConfig();

  const handleSave = () => {
    updateConfig.mutate(
      { id: config.id, questions },
      {
        onSuccess: () => {
          toast({ title: "Perguntas salvas", description: "As perguntas foram atualizadas." });
        },
        onError: (err) => {
          toast({ title: "Erro ao salvar", description: err.message, variant: "destructive" });
        },
      }
    );
  };

  const handleAddQuestion = () => {
    const newId = `q${Date.now()}`;
    setQuestions((prev) => [...prev, { id: newId, text: "" }]);
  };

  const handleRemoveQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const handleChangeQuestion = (id: string, text: string) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, text } : q)));
  };

  const insertVariable = (variable: string) => {
    if (activeInputIndex === null) return;
    const input = inputRefs.current[activeInputIndex];
    if (!input) return;

    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? input.value.length;
    const currentText = questions[activeInputIndex]?.text ?? "";
    const newText = currentText.slice(0, start) + variable + currentText.slice(end);

    const id = questions[activeInputIndex]?.id;
    if (id) {
      handleChangeQuestion(id, newText);
      // Reposicionar cursor após a variável inserida
      setTimeout(() => {
        input.setSelectionRange(start + variable.length, start + variable.length);
        input.focus();
      }, 0);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-primary" />
            Perguntas Chave
          </CardTitle>
          <Button size="sm" onClick={handleSave} disabled={updateConfig.isPending} className="gap-1.5">
            <Save className="h-3.5 w-3.5" />
            {updateConfig.isPending ? "Salvando..." : "Salvar"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          As perguntas são enviadas para cada tarefa ativa do usuário. Clique em uma variável para inserir no campo ativo.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Variáveis disponíveis */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">
            Variáveis disponíveis
          </Label>
          <div className="flex flex-wrap gap-1.5">
            {AVAILABLE_VARIABLES.map((v) => (
              <Badge
                key={v.label}
                variant="secondary"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-xs font-mono"
                title={v.description}
                onClick={() => insertVariable(v.label)}
              >
                {v.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Lista de perguntas */}
        <div className="space-y-2">
          {questions.map((q, idx) => (
            <div key={q.id} className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-5 text-right shrink-0">{idx + 1}.</span>
              <Input
                ref={(el) => (inputRefs.current[idx] = el)}
                value={q.text}
                onChange={(e) => handleChangeQuestion(q.id, e.target.value)}
                onFocus={() => setActiveInputIndex(idx)}
                placeholder="Ex: Como está o andamento de {card.nome}?"
                className="h-8 text-sm font-mono"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-destructive hover:text-destructive"
                onClick={() => handleRemoveQuestion(q.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>

        <Button variant="outline" size="sm" onClick={handleAddQuestion} className="gap-1.5 w-full">
          <Plus className="h-3.5 w-3.5" />
          Adicionar pergunta
        </Button>
      </CardContent>
    </Card>
  );
}
