import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Send, X, CheckCircle2, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CompletionMessageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMessage: string;
  messageSent: boolean;
  messageSentAt: string | null;
  onSend: (message: string) => void;
  isSending?: boolean;
}

export function CompletionMessageModal({
  open,
  onOpenChange,
  defaultMessage,
  messageSent,
  messageSentAt,
  onSend,
  isSending,
}: CompletionMessageModalProps) {
  const [message, setMessage] = useState(defaultMessage);

  const handleSend = () => {
    onSend(message);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg">
            Etapa concluída! 🎉
          </DialogTitle>
          <DialogDescription>
            Deseja enviar essa comunicação pro cliente?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status badge */}
          <div className="flex items-center gap-2">
            {messageSent ? (
              <Badge className="gap-1.5 bg-emerald-500/15 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/15">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Mensagem enviada em{" "}
                {messageSentAt
                  ? format(new Date(messageSentAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                  : ""}
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1.5 text-warning border-warning/30">
                <Clock className="h-3.5 w-3.5" />
                Mensagem não enviada
              </Badge>
            )}
          </div>

          {/* Editable message */}
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            placeholder="Escreva a mensagem para o cliente..."
            disabled={messageSent}
            className="resize-none"
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          {!messageSent && (
            <Button
              onClick={handleSend}
              disabled={isSending || !message.trim()}
            >
              <Send className="h-4 w-4 mr-2" />
              Enviar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
