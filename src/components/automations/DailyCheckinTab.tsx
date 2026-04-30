import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Users, MessageSquare, Loader2, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useDailyCheckinConfig, useDailyCheckinUserConfigs, useUpdateDailyCheckinConfig, useUpsertDailyCheckinUserConfig } from "@/hooks/useDailyCheckin";
import { useProfiles } from "@/hooks/useProfiles";
import { useTarefaBoardColumns } from "@/hooks/useTarefaBoardColumns";
import { useProjetoBoardColumns } from "@/hooks/useProjetoBoardColumns";
import { DailyCheckinQuestionsConfig } from "./DailyCheckinQuestionsConfig";
import { DailyCheckinUserCard } from "./DailyCheckinUserCard";
import { toast } from "@/hooks/use-toast";

export function DailyCheckinTab() {
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [isSendingNow, setIsSendingNow] = useState(false);

  const { data: config, isLoading: loadingConfig } = useDailyCheckinConfig();
  const { data: userConfigs, isLoading: loadingUsers } = useDailyCheckinUserConfigs();
  const { data: allProfiles, isLoading: loadingProfiles } = useProfiles();
  const { data: tarefaColumns = [] } = useTarefaBoardColumns();
  const { data: projetoColumns = [] } = useProjetoBoardColumns();
  const updateConfig = useUpdateDailyCheckinConfig();
  const upsertUserConfig = useUpsertDailyCheckinUserConfig();

  const isLoading = loadingConfig || loadingUsers || loadingProfiles;

  // Usuários já adicionados ao check-in
  const addedUserIds = new Set((userConfigs ?? []).map((c) => c.user_id));

  // Perfis não adicionados ainda
  const availableProfiles = (allProfiles ?? []).filter((p) => !addedUserIds.has(p.id));

  const handleSendNow = async () => {
    setIsSendingNow(true);
    try {
      const body = { force_all: true };
      const { data, error } = await supabase.functions.invoke("send-daily-checkin", { body });
      if (error) throw error;
      toast({
        title: "Check-in disparado!",
        description: `Processados: ${data?.processados ?? 0} usuário(s). Verifique o n8n.`,
      });
      console.log("[Check-in Teste]", data);
    } catch (err) {
      toast({
        title: "Erro ao disparar",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsSendingNow(false);
    }
  };

  const handleToggleGlobal = (value: boolean) => {
    if (!config) return;
    updateConfig.mutate(
      { id: config.id, is_active: value },
      {
        onSuccess: () => {
          toast({
            title: value ? "Check-in ativado" : "Check-in pausado",
            description: value
              ? "Os envios automáticos estão habilitados."
              : "Os envios automáticos foram pausados.",
          });
        },
      }
    );
  };

  const handleAddUser = (userId: string) => {
    upsertUserConfig.mutate(
      {
        user_id: userId,
        is_active: true,
        schedule_time: "11:00:00",
        selected_columns_tarefas: [],
        selected_columns_projetos: [],
      },
      {
        onSuccess: () => {
          setAddUserOpen(false);
          const profile = allProfiles?.find((p) => p.id === userId);
          toast({
            title: "Usuário adicionado",
            description: `${profile?.full_name ?? profile?.email} foi adicionado ao check-in.`,
          });
        },
        onError: (err) => {
          toast({ title: "Erro", description: err.message, variant: "destructive" });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-4">
      {/* TODO: remover botão de teste */}
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 border-dashed text-muted-foreground"
        onClick={handleSendNow}
        disabled={isSendingNow}
      >
        {isSendingNow ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
        {isSendingNow ? "Enviando..." : "Enviar Check-in Agora (teste)"}
      </Button>

      {/* Status global */}
      <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            <Label className="text-sm font-medium cursor-pointer">Check-in Diário Automático</Label>
          </div>
          <p className="text-xs text-muted-foreground pl-6">
            Envia perguntas via WhatsApp (n8n) para cada usuário configurado no horário definido, de segunda a sexta.
          </p>
        </div>
        <Switch
          checked={config?.is_active ?? false}
          onCheckedChange={handleToggleGlobal}
          disabled={updateConfig.isPending || !config}
        />
      </div>

      {/* Config de perguntas */}
      {config && <DailyCheckinQuestionsConfig config={config} />}

      {/* Usuários */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium">
              Usuários configurados
              {userConfigs && userConfigs.length > 0 && (
                <span className="ml-2 text-muted-foreground font-normal">({userConfigs.length})</span>
              )}
            </h3>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => setAddUserOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            Adicionar usuário
          </Button>
        </div>

        {userConfigs && userConfigs.length > 0 ? (
          <div className="grid gap-3 grid-cols-1 lg:grid-cols-2">
            {userConfigs.map((cfg) => {
              const profile = allProfiles?.find((p) => p.id === cfg.user_id);
              if (!profile) return null;
              return (
                <DailyCheckinUserCard
                  key={cfg.user_id}
                  profile={profile}
                  config={cfg}
                  tarefaColumns={tarefaColumns}
                  projetoColumns={projetoColumns}
                />
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center border rounded-lg">
            <Users className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm font-medium">Nenhum usuário configurado</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
              Adicione usuários para configurar o horário de envio e as colunas de interesse de cada um.
            </p>
            <Button
              size="sm"
              variant="outline"
              className="mt-4 gap-1.5"
              onClick={() => setAddUserOpen(true)}
            >
              <Plus className="h-3.5 w-3.5" />
              Adicionar primeiro usuário
            </Button>
          </div>
        )}
      </div>

      {/* Dialog: selecionar usuário para adicionar */}
      <Dialog open={addUserOpen} onOpenChange={setAddUserOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Selecionar usuário</DialogTitle>
            <DialogDescription>
              Escolha um usuário para adicionar ao check-in diário.
            </DialogDescription>
          </DialogHeader>
          {availableProfiles.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Todos os usuários já foram adicionados.
            </p>
          ) : (
            <ScrollArea className="max-h-72">
              <div className="space-y-1 pr-1">
                {availableProfiles.map((profile) => (
                  <button
                    key={profile.id}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-accent text-left transition-colors"
                    onClick={() => handleAddUser(profile.id)}
                    disabled={upsertUserConfig.isPending}
                  >
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage src={profile.avatar_url ?? undefined} />
                      <AvatarFallback className="text-xs">
                        {(profile.full_name ?? profile.email ?? "?")
                          .split(" ")
                          .slice(0, 2)
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{profile.full_name ?? "—"}</p>
                      <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
                    </div>
                    {!profile.whatsapp_phone && (
                      <span className="ml-auto text-xs text-destructive/80 shrink-0">sem tel.</span>
                    )}
                  </button>
                ))}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
