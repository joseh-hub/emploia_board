import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useClientes } from "@/hooks/useClientes";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { MessageCircle, Send } from "lucide-react";

interface SendMessageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMessage: string;
}

export function SendMessageModal({
  open,
  onOpenChange,
  defaultMessage,
}: SendMessageModalProps) {
  const [message, setMessage] = useState(defaultMessage);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [isSending, setIsSending] = useState(false);

  const { data: clientes } = useClientes();

  // Only clients that have a group_id configured
  const clientesComGrupo = (clientes || []).filter((c) => c.group_id);

  const handleSend = async () => {
    if (!selectedClientId || !message.trim()) return;

    const cliente = clientesComGrupo.find((c) => String(c.id) === selectedClientId);
    if (!cliente?.group_id) return;

    setIsSending(true);
    try {
      const { error } = await supabase.functions.invoke("send-webhook-message", {
        body: {
          groupid: cliente.group_id,
          mensagem: message.trim(),
        },
      });

      if (error) throw error;

      toast({
        title: "Mensagem enviada!",
        description: `Mensagem enviada para o grupo de ${cliente.name}.`,
      });
      onOpenChange(false);
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
      toast({
        title: "Erro ao enviar mensagem",
        description: "Não foi possível enviar a mensagem. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-500" />
            Enviar Mensagem ao Cliente
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cliente-select">Cliente</Label>
            <Select value={selectedClientId} onValueChange={setSelectedClientId}>
              <SelectTrigger id="cliente-select">
                <SelectValue placeholder="Selecione o cliente..." />
              </SelectTrigger>
              <SelectContent>
                {clientesComGrupo.length === 0 ? (
                  <div className="py-3 px-3 text-sm text-muted-foreground text-center">
                    Nenhum cliente com grupo configurado
                  </div>
                ) : (
                  clientesComGrupo.map((cliente) => (
                    <SelectItem key={cliente.id} value={String(cliente.id)}>
                      {cliente.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message-textarea">Mensagem</Label>
            <Textarea
              id="message-textarea"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              placeholder="Digite a mensagem..."
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSend}
            disabled={!selectedClientId || !message.trim() || isSending}
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            {isSending ? "Enviando..." : "Enviar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
