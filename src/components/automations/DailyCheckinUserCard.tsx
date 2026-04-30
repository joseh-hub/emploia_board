import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Phone, Trash2, Clock, FolderOpen, CheckSquare } from "lucide-react";
import { Profile } from "@/hooks/useProfiles";
import { DailyCheckinUserConfig, useUpsertDailyCheckinUserConfig, useDeleteDailyCheckinUserConfig, useUpdateProfilePhone } from "@/hooks/useDailyCheckin";
import { TarefaBoardColumn } from "@/hooks/useTarefaBoardColumns";
import { ProjetoBoardColumn } from "@/hooks/useProjetoBoardColumns";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface DailyCheckinUserCardProps {
  profile: Profile;
  config: DailyCheckinUserConfig | undefined;
  tarefaColumns: TarefaBoardColumn[];
  projetoColumns: ProjetoBoardColumn[];
}

export function DailyCheckinUserCard({
  profile,
  config,
  tarefaColumns,
  projetoColumns,
}: DailyCheckinUserCardProps) {
  const [isActive, setIsActive] = useState(config?.is_active ?? true);
  const [scheduleTime, setScheduleTime] = useState(
    config?.schedule_time?.substring(0, 5) ?? "11:00"
  );
  const [selectedTarefaCols, setSelectedTarefaCols] = useState<string[]>(
    config?.selected_columns_tarefas ?? []
  );
  const [selectedProjetoCols, setSelectedProjetoCols] = useState<string[]>(
    config?.selected_columns_projetos ?? []
  );
  const [phoneDialogOpen, setPhoneDialogOpen] = useState(false);
  const [phoneInput, setPhoneInput] = useState(profile.whatsapp_phone ?? "");
  const [isDirty, setIsDirty] = useState(false);

  const upsertConfig = useUpsertDailyCheckinUserConfig();
  const deleteConfig = useDeleteDailyCheckinUserConfig();
  const updatePhone = useUpdateProfilePhone();

  const getInitials = () => {
    const name = profile.full_name ?? profile.email ?? "?";
    return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
  };

  const toggleColumn = (type: "tarefas" | "projetos", colId: string) => {
    if (type === "tarefas") {
      setSelectedTarefaCols((prev) =>
        prev.includes(colId) ? prev.filter((c) => c !== colId) : [...prev, colId]
      );
    } else {
      setSelectedProjetoCols((prev) =>
        prev.includes(colId) ? prev.filter((c) => c !== colId) : [...prev, colId]
      );
    }
    setIsDirty(true);
  };

  const handleSave = () => {
    upsertConfig.mutate(
      {
        user_id: profile.id,
        is_active: isActive,
        schedule_time: `${scheduleTime}:00`,
        selected_columns_tarefas: selectedTarefaCols,
        selected_columns_projetos: selectedProjetoCols,
      },
      {
        onSuccess: () => {
          setIsDirty(false);
          toast({ title: "Configuração salva", description: `Check-in de ${profile.full_name ?? profile.email} atualizado.` });
        },
        onError: (err) => {
          toast({ title: "Erro ao salvar", description: err.message, variant: "destructive" });
        },
      }
    );
  };

  const handleDelete = () => {
    deleteConfig.mutate(profile.id, {
      onSuccess: () => {
        toast({ title: "Usuário removido", description: "Removido do check-in diário." });
      },
    });
  };

  const handleSavePhone = () => {
    updatePhone.mutate(
      { userId: profile.id, phone: phoneInput.trim() },
      {
        onSuccess: () => {
          setPhoneDialogOpen(false);
          toast({ title: "Número atualizado", description: "WhatsApp salvo no perfil." });
        },
        onError: (err) => {
          toast({ title: "Erro", description: err.message, variant: "destructive" });
        },
      }
    );
  };

  const handleToggleActive = (val: boolean) => {
    setIsActive(val);
    setIsDirty(true);
  };

  const handleTimeChange = (val: string) => {
    setScheduleTime(val);
    setIsDirty(true);
  };

  return (
    <>
      <Card className={cn("transition-opacity", !isActive && "opacity-60")}>
        <CardContent className="pt-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarImage src={profile.avatar_url ?? undefined} />
                <AvatarFallback className="text-xs">{getInitials()}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{profile.full_name ?? "—"}</p>
                <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Switch
                checked={isActive}
                onCheckedChange={handleToggleActive}
                title={isActive ? "Desativar" : "Ativar"}
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={handleDelete}
                title="Remover do check-in"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* WhatsApp */}
          <div className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            {profile.whatsapp_phone ? (
              <span className="text-sm text-muted-foreground flex-1">{profile.whatsapp_phone}</span>
            ) : (
              <span className="text-sm text-destructive/80 flex-1">Sem número cadastrado</span>
            )}
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => {
                setPhoneInput(profile.whatsapp_phone ?? "");
                setPhoneDialogOpen(true);
              }}
            >
              {profile.whatsapp_phone ? "Editar" : "Adicionar"}
            </Button>
          </div>

          {/* Horário */}
          <div className="flex items-center gap-3">
            <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <Label className="text-xs text-muted-foreground w-16 shrink-0">Horário</Label>
            <Input
              type="time"
              value={scheduleTime}
              onChange={(e) => handleTimeChange(e.target.value)}
              className="h-8 w-32 text-sm"
            />
            <span className="text-xs text-muted-foreground">seg–sex</span>
          </div>

          {/* Colunas de Tarefas */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <CheckSquare className="h-3.5 w-3.5 text-muted-foreground" />
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                Tarefas — colunas incluídas
              </Label>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {tarefaColumns.map((col) => (
                <Badge
                  key={col.id}
                  variant={selectedTarefaCols.includes(col.id) ? "default" : "outline"}
                  className="cursor-pointer text-xs transition-colors"
                  style={
                    selectedTarefaCols.includes(col.id)
                      ? { backgroundColor: col.color, borderColor: col.color, color: "#fff" }
                      : { borderColor: col.color, color: col.color }
                  }
                  onClick={() => toggleColumn("tarefas", col.id)}
                >
                  {col.name}
                </Badge>
              ))}
              {tarefaColumns.length === 0 && (
                <span className="text-xs text-muted-foreground">Nenhuma coluna encontrada</span>
              )}
            </div>
          </div>

          {/* Colunas de Projetos */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <FolderOpen className="h-3.5 w-3.5 text-muted-foreground" />
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                Projetos — colunas incluídas
              </Label>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {projetoColumns.map((col) => (
                <Badge
                  key={col.id}
                  variant={selectedProjetoCols.includes(col.id) ? "default" : "outline"}
                  className="cursor-pointer text-xs transition-colors"
                  style={
                    selectedProjetoCols.includes(col.id)
                      ? { backgroundColor: col.color, borderColor: col.color, color: "#fff" }
                      : { borderColor: col.color, color: col.color }
                  }
                  onClick={() => toggleColumn("projetos", col.id)}
                >
                  {col.name}
                </Badge>
              ))}
              {projetoColumns.length === 0 && (
                <span className="text-xs text-muted-foreground">Nenhuma coluna encontrada</span>
              )}
            </div>
          </div>

          {/* Botão salvar */}
          {isDirty && (
            <Button
              size="sm"
              className="w-full"
              onClick={handleSave}
              disabled={upsertConfig.isPending}
            >
              {upsertConfig.isPending ? "Salvando..." : "Salvar configuração"}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Modal de telefone */}
      <Dialog open={phoneDialogOpen} onOpenChange={setPhoneDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {profile.whatsapp_phone ? "Editar número WhatsApp" : "Adicionar número WhatsApp"}
            </DialogTitle>
            <DialogDescription>
              Número utilizado para enviar o check-in diário via WhatsApp.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              Número de <strong>{profile.full_name ?? profile.email}</strong> para receber o check-in.
            </p>
            <div className="space-y-1">
              <Label>Número (com DDD e código do país)</Label>
              <Input
                placeholder="Ex: 5511999999999"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Formato internacional sem espaços ou caracteres especiais.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPhoneDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSavePhone}
              disabled={updatePhone.isPending || !phoneInput.trim()}
            >
              {updatePhone.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
