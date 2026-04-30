import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  MessageCircle,
  Send,
  Pencil,
  X,
  RefreshCw,
  Check,
  Filter,
} from "lucide-react";

type Suggestion = {
  id: string;
  cliente_id: number;
  projeto_id: string | null;
  group_id: string;
  mensagem_sugerida: string;
  mensagem_final: string | null;
  motivo: string;
  tipo_comunicacao: string;
  status: string;
  created_at: string;
  cliente_nome?: string;
};

const TIPO_LABELS: Record<string, { label: string; color: string }> = {
  update_tarefa: { label: "Update", color: "bg-[#CBC5EA]/15 text-[#CBC5EA]" },
  check_in: { label: "Check-in", color: "bg-[#97EAD2]/15 text-[#97EAD2]" },
  entrega: { label: "Entrega", color: "bg-[#3F1757]/20 text-[#CBC5EA]" },
  cobranca: { label: "Cobrança", color: "bg-[#ED6A5A]/15 text-[#ED6A5A]" },
  acompanhamento: { label: "Acompanhamento", color: "bg-[#E8DAB2]/15 text-[#E8DAB2]" },
  alerta_atraso: { label: "Atraso", color: "bg-red-500/15 text-red-400" },
};

export default function Comunicacoes() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [filterTipo, setFilterTipo] = useState<string | null>(null);

  useEffect(() => {
    fetchPending();
  }, []);

  async function fetchPending() {
    setLoading(true);
    const { data, error } = await supabase
      .from("comunicacoes_sugeridas")
      .select("*")
      .eq("status", "pendente")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar sugestões");
      console.error(error);
    } else {
      // Fetch client names
      const clienteIds = [...new Set((data || []).map((s: any) => s.cliente_id).filter(Boolean))];
      let clienteMap: Record<number, string> = {};
      if (clienteIds.length > 0) {
        const { data: clientes } = await supabase
          .from("metadata_clientes")
          .select("id, name")
          .in("id", clienteIds);
        clienteMap = Object.fromEntries((clientes || []).map((c: any) => [c.id, c.name]));
      }
      setSuggestions(
        (data || []).map((s: any) => ({ ...s, cliente_nome: clienteMap[s.cliente_id] || "Cliente" }))
      );
    }
    setLoading(false);
  }

  async function handleGenerate() {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-client-comms");

      if (error) {
        toast.error("Erro ao gerar sugestões: " + error.message);
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      const count = data?.suggestions?.length || 0;
      if (count === 0) {
        toast.info(data?.message || "Nenhuma sugestão gerada.");
      } else {
        toast.success(`${count} sugestão(ões) gerada(s)!`);
      }

      await fetchPending();
    } catch (e: any) {
      toast.error("Erro inesperado: " + e.message);
    } finally {
      setGenerating(false);
    }
  }

  async function handleApprove(suggestion: Suggestion) {
    setSendingId(suggestion.id);
    try {
      // Send via webhook
      const { error: sendError } = await supabase.functions.invoke("send-webhook-message", {
        body: { groupid: suggestion.group_id, mensagem: suggestion.mensagem_sugerida },
      });

      if (sendError) throw sendError;

      // Update status
      await supabase
        .from("comunicacoes_sugeridas")
        .update({
          status: "aprovada",
          resolved_at: new Date().toISOString(),
          resolved_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .eq("id", suggestion.id);

      setSuggestions((prev) => prev.filter((s) => s.id !== suggestion.id));
      toast.success("Mensagem enviada com sucesso!");
    } catch (e: any) {
      toast.error("Erro ao enviar: " + e.message);
    } finally {
      setSendingId(null);
    }
  }

  async function handleEdit(suggestion: Suggestion) {
    if (editingId === suggestion.id) {
      // Confirm edit and send
      if (!editText.trim()) {
        toast.error("Mensagem não pode ser vazia");
        return;
      }
      setSendingId(suggestion.id);
      try {
        const { error: sendError } = await supabase.functions.invoke("send-webhook-message", {
          body: { groupid: suggestion.group_id, mensagem: editText },
        });

        if (sendError) throw sendError;

        await supabase
          .from("comunicacoes_sugeridas")
          .update({
            status: "editada",
            mensagem_final: editText,
            resolved_at: new Date().toISOString(),
            resolved_by: (await supabase.auth.getUser()).data.user?.id,
          })
          .eq("id", suggestion.id);

        setSuggestions((prev) => prev.filter((s) => s.id !== suggestion.id));
        setEditingId(null);
        toast.success("Mensagem editada e enviada!");
      } catch (e: any) {
        toast.error("Erro ao enviar: " + e.message);
      } finally {
        setSendingId(null);
      }
    } else {
      setEditingId(suggestion.id);
      setEditText(suggestion.mensagem_sugerida);
    }
  }

  async function handleReject(suggestion: Suggestion) {
    await supabase
      .from("comunicacoes_sugeridas")
      .update({
        status: "recusada",
        resolved_at: new Date().toISOString(),
        resolved_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .eq("id", suggestion.id);

    setSuggestions((prev) => prev.filter((s) => s.id !== suggestion.id));
    toast.info("Sugestão recusada.");
  }

  const filtered = filterTipo
    ? suggestions.filter((s) => s.tipo_comunicacao === filterTipo)
    : suggestions;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-primary" />
            Comunicações
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sugestões inteligentes de mensagens para seus clientes
          </p>
        </div>
        <Button onClick={handleGenerate} disabled={generating} className="gap-2">
          {generating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Gerar Sugestões
        </Button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <button
          onClick={() => setFilterTipo(null)}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            !filterTipo ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
          }`}
        >
          Todos
        </button>
        {Object.entries(TIPO_LABELS).map(([key, val]) => (
          <button
            key={key}
            onClick={() => setFilterTipo(key)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filterTipo === key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            {val.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-3">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-16 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : generating ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-3 animate-pulse">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
          <p className="text-center text-sm text-muted-foreground">Gerando sugestões com IA...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground/40" />
          <p className="text-muted-foreground">Nenhuma sugestão pendente.</p>
          <p className="text-sm text-muted-foreground/70">
            Clique em "Gerar Sugestões" para a IA analisar seus clientes.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((s) => {
            const tipo = TIPO_LABELS[s.tipo_comunicacao] || TIPO_LABELS.check_in;
            const isEditing = editingId === s.id;
            const isSending = sendingId === s.id;

            return (
              <div
                key={s.id}
                className="rounded-xl border border-border bg-card p-5 space-y-3 transition-all hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{s.cliente_nome}</span>
                    <Badge variant="secondary" className={tipo.color}>
                      {tipo.label}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(s.created_at).toLocaleDateString("pt-BR")}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground">{s.motivo}</p>

                {isEditing ? (
                  <Textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="min-h-[80px]"
                    autoFocus
                  />
                ) : (
                  <div className="bg-muted/50 rounded-lg p-3 text-sm text-foreground whitespace-pre-wrap">
                    {s.mensagem_sugerida}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <Button
                    size="sm"
                    onClick={() => handleApprove(s)}
                    disabled={isSending || isEditing}
                    className="gap-1.5"
                  >
                    {isSending && !isEditing ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Send className="h-3.5 w-3.5" />
                    )}
                    Enviar
                  </Button>
                  <Button
                    size="sm"
                    variant={isEditing ? "default" : "outline"}
                    onClick={() => handleEdit(s)}
                    disabled={isSending && !isEditing}
                    className="gap-1.5"
                  >
                    {isEditing ? (
                      isSending ? (
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Check className="h-3.5 w-3.5" />
                      )
                    ) : (
                      <Pencil className="h-3.5 w-3.5" />
                    )}
                    {isEditing ? "Confirmar" : "Editar"}
                  </Button>
                  {isEditing && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingId(null)}
                      className="gap-1.5"
                    >
                      Cancelar
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleReject(s)}
                    disabled={isSending}
                    className="gap-1.5 text-destructive hover:text-destructive"
                  >
                    <X className="h-3.5 w-3.5" />
                    Recusar
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
