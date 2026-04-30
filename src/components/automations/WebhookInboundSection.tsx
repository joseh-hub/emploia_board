import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  useWebhookApiKeys,
  useCreateWebhookApiKey,
  useDeleteWebhookApiKey,
  useToggleWebhookApiKey,
} from "@/hooks/useWebhookApiKeys";
import { toast } from "@/hooks/use-toast";
import { Link2, Plus, Copy, Trash2, Power, Key, Clock } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const SUPABASE_PROJECT_ID = "imfxqgmkjpkrcjwqndxp";
const WEBHOOK_ENDPOINT = `https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1/webhook-inbound`;

export function WebhookInboundSection() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  const { data: apiKeys, isLoading } = useWebhookApiKeys();
  const createApiKey = useCreateWebhookApiKey();
  const deleteApiKey = useDeleteWebhookApiKey();
  const toggleApiKey = useToggleWebhookApiKey();

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) return;

    try {
      const result = await createApiKey.mutateAsync(newKeyName.trim());
      setGeneratedKey(result.key);
      setNewKeyName("");
    } catch {
      // Error already handled by onError toast in useCreateWebhookApiKey
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copiado!", description: "Texto copiado para a área de transferência." });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            Webhooks de Entrada
          </CardTitle>
          <Dialog open={isCreateOpen} onOpenChange={(open) => {
            setIsCreateOpen(open);
            if (!open) {
              setGeneratedKey(null);
              setNewKeyName("");
            }
          }}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1.5">
                <Plus className="h-3 w-3" />
                Nova API Key
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {generatedKey ? "API Key Criada" : "Criar Nova API Key"}
                </DialogTitle>
              </DialogHeader>

              {generatedKey ? (
                <div className="space-y-4">
                  <div className="p-4 bg-warning/10 border border-warning/30 rounded-lg">
                    <p className="text-sm text-warning font-medium mb-2">
                      ⚠️ Copie esta chave agora!
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Esta é a única vez que você verá a chave completa. Guarde-a em um local seguro.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Input
                      value={generatedKey}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => copyToClipboard(generatedKey)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>

                  <DialogFooter>
                    <Button onClick={() => setIsCreateOpen(false)}>Fechar</Button>
                  </DialogFooter>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="key-name">Nome da Chave</Label>
                    <Input
                      id="key-name"
                      placeholder="Ex: Zapier Integration"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                    />
                  </div>

                  <DialogFooter>
                    <Button
                      onClick={handleCreateKey}
                      disabled={!newKeyName.trim() || createApiKey.isPending}
                    >
                      {createApiKey.isPending ? "Criando..." : "Criar Chave"}
                    </Button>
                  </DialogFooter>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Endpoint Info */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Endpoint Base</Label>
          <div className="flex items-center gap-2">
            <Input
              value={WEBHOOK_ENDPOINT}
              readOnly
              className="font-mono text-xs"
            />
            <Button
              size="icon"
              variant="outline"
              onClick={() => copyToClipboard(WEBHOOK_ENDPOINT)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* API Keys List */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground flex items-center gap-1">
            <Key className="h-3 w-3" />
            Suas API Keys
          </Label>

          {isLoading ? (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          ) : apiKeys && apiKeys.length > 0 ? (
            <ScrollArea className="max-h-40">
              <div className="space-y-2">
                {apiKeys.map((key) => (
                  <div
                    key={key.id}
                    className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">
                          {key.name}
                        </span>
                        <Badge
                          variant={key.is_active ? "default" : "secondary"}
                          className="text-[10px]"
                        >
                          {key.is_active ? "Ativa" : "Inativa"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <code>{key.key_preview}</code>
                        {key.last_used_at && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Usado{" "}
                            {formatDistanceToNow(new Date(key.last_used_at), {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        onClick={() =>
                          toggleApiKey.mutate({
                            id: key.id,
                            isActive: !key.is_active,
                          })
                        }
                      >
                        <Power
                          className={`h-4 w-4 ${
                            key.is_active ? "text-success" : "text-muted-foreground"
                          }`}
                        />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="icon-sm" variant="ghost">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir API Key?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. Integrações que usam
                              esta chave deixarão de funcionar.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteApiKey.mutate(key.id)}
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <p className="text-xs text-muted-foreground py-2">
              Nenhuma API Key criada. Crie uma para receber webhooks externos.
            </p>
          )}
        </div>

        {/* Quick Docs */}
        <div className="p-3 bg-muted/50 rounded-lg">
          <p className="text-xs font-medium mb-2">📚 Uso Rápido</p>
          <pre className="text-[10px] text-muted-foreground overflow-x-auto">
{`POST ${WEBHOOK_ENDPOINT}/cards
Headers: X-API-Key: sua_api_key
Body: {
  "board_id": "uuid",
  "title": "Novo Card"
}`}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}
