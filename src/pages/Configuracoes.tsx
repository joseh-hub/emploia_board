import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TopBar } from "@/components/layout/TopBar";
import { useAuth } from "@/contexts/AuthContext";
import { useProfiles } from "@/hooks/useProfiles";
import { useTarefaTags, useCreateTarefaTag, useDeleteTarefaTag, useUpdateTarefaTag } from "@/hooks/useTarefaTags";
import {
  LogOut, User, Info, Tag, Users, Bell, ListChecks,
  Plus, Trash2, Pencil, Check, X,
} from "lucide-react";
import { ClienteChecklistTemplateConfig } from "@/components/clientes/ClienteChecklistTemplateConfig";
import { cn } from "@/lib/utils";

const TAG_COLORS = [
  { value: "#ef4444", label: "Vermelho" },
  { value: "#f97316", label: "Laranja" },
  { value: "#eab308", label: "Amarelo" },
  { value: "#22c55e", label: "Verde" },
  { value: "#3b82f6", label: "Azul" },
  { value: "#a855f7", label: "Roxo" },
  { value: "#ec4899", label: "Rosa" },
  { value: "#6b7280", label: "Cinza" },
];

const NOTIF_PREFS_KEY = (userId: string) => `notif_prefs_${userId}`;
const DEFAULT_PREFS = {
  mention: true,
  assignment: true,
  due_date: true,
  comment: true,
  status_change: true,
};

function getNotifPrefs(userId: string) {
  try {
    const stored = localStorage.getItem(NOTIF_PREFS_KEY(userId));
    if (stored) return { ...DEFAULT_PREFS, ...JSON.parse(stored) };
  } catch { /* ignore */ }
  return DEFAULT_PREFS;
}

function saveNotifPrefs(userId: string, prefs: typeof DEFAULT_PREFS) {
  localStorage.setItem(NOTIF_PREFS_KEY(userId), JSON.stringify(prefs));
}

export default function Configuracoes() {
  const { user, signOut } = useAuth();
  const { data: profiles = [] } = useProfiles();
  const { data: tags = [] } = useTarefaTags();
  const createTag = useCreateTarefaTag();
  const deleteTag = useDeleteTarefaTag();
  const updateTag = useUpdateTarefaTag();

  // Tags form state
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[4].value);
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editingTagName, setEditingTagName] = useState("");

  // Notification prefs state
  const [notifPrefs, setNotifPrefs] = useState(DEFAULT_PREFS);
  useEffect(() => {
    if (user?.id) setNotifPrefs(getNotifPrefs(user.id));
  }, [user?.id]);

  const handleToggleNotif = (key: keyof typeof DEFAULT_PREFS) => {
    const next = { ...notifPrefs, [key]: !notifPrefs[key] };
    setNotifPrefs(next);
    if (user?.id) saveNotifPrefs(user.id, next);
  };

  const handleCreateTag = () => {
    if (!newTagName.trim()) return;
    createTag.mutate({ name: newTagName.trim(), color: newTagColor }, {
      onSuccess: () => { setNewTagName(""); setNewTagColor(TAG_COLORS[4].value); }
    });
  };

  const handleStartEditTag = (tag: { id: string; name: string }) => {
    setEditingTagId(tag.id);
    setEditingTagName(tag.name);
  };

  const handleSaveEditTag = () => {
    if (!editingTagId || !editingTagName.trim()) return;
    updateTag.mutate({ id: editingTagId, name: editingTagName.trim() }, {
      onSuccess: () => { setEditingTagId(null); setEditingTagName(""); }
    });
  };

  const getInitials = (fullName: string | null, email: string | null) => {
    if (fullName) return fullName.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();
    return email?.charAt(0).toUpperCase() || "U";
  };

  const notifLabels: Record<keyof typeof DEFAULT_PREFS, string> = {
    mention: "Menções",
    assignment: "Atribuições de tarefas",
    due_date: "Datas de vencimento",
    comment: "Comentários",
    status_change: "Mudanças de status",
  };

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Configurações" />

      <div className="flex-1 overflow-auto p-4 lg:p-6">
        <div className="max-w-4xl space-y-6">
          {/* Profile Card */}
          <Card className="border-0 shadow-clickup-sm">
            <CardHeader className="flex flex-row items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-base font-semibold">Perfil</CardTitle>
                <CardDescription className="text-sm">Informações da sua conta</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <p className="font-medium text-sm mt-0.5">{user?.email || "-"}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">ID do Usuário</Label>
                  <p className="font-mono text-xs text-muted-foreground mt-0.5">{user?.id || "-"}</p>
                </div>
              </div>
              <Separator />
              <Button variant="destructive" onClick={signOut} size="sm" className="gap-2">
                <LogOut className="h-4 w-4" />
                Sair da conta
              </Button>
            </CardContent>
          </Card>

          {/* Notification Prefs Card */}
          <Card className="border-0 shadow-clickup-sm">
            <CardHeader className="flex flex-row items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-base font-semibold">Preferências de Notificação</CardTitle>
                <CardDescription className="text-sm">Escolha quais notificações deseja receber</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {(Object.keys(notifLabels) as (keyof typeof DEFAULT_PREFS)[]).map((key) => (
                <div key={key} className="flex items-center justify-between">
                  <Label className="text-sm font-normal cursor-pointer" htmlFor={`notif-${key}`}>
                    {notifLabels[key]}
                  </Label>
                  <Switch
                    id={`notif-${key}`}
                    checked={notifPrefs[key]}
                    onCheckedChange={() => handleToggleNotif(key)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Tags Management Card */}
          <Card className="border-0 shadow-clickup-sm">
            <CardHeader className="flex flex-row items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Tag className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-base font-semibold">Gerenciar Tags</CardTitle>
                <CardDescription className="text-sm">Crie, renomeie e exclua tags de tarefas</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Create new tag */}
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Nome da nova tag..."
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateTag()}
                  className="h-8 text-sm flex-1"
                />
                <div className="flex items-center gap-1">
                  {TAG_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      className={cn(
                        "h-5 w-5 rounded-full border-2 transition-transform",
                        newTagColor === c.value ? "border-foreground scale-110" : "border-transparent"
                      )}
                      style={{ backgroundColor: c.value }}
                      onClick={() => setNewTagColor(c.value)}
                      title={c.label}
                    />
                  ))}
                </div>
                <Button
                  size="sm"
                  onClick={handleCreateTag}
                  disabled={!newTagName.trim() || createTag.isPending}
                  className="h-8 gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Criar
                </Button>
              </div>

              <Separator />

              {/* Tags list */}
              {tags.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhuma tag criada ainda</p>
              ) : (
                <div className="space-y-2">
                  {tags.map((tag) => (
                    <div key={tag.id} className="flex items-center gap-3 p-2 rounded-lg border bg-card group">
                      <div className="h-3.5 w-3.5 rounded-full shrink-0" style={{ backgroundColor: tag.color }} />
                      {editingTagId === tag.id ? (
                        <Input
                          value={editingTagName}
                          onChange={(e) => setEditingTagName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveEditTag();
                            if (e.key === "Escape") { setEditingTagId(null); setEditingTagName(""); }
                          }}
                          className="h-6 text-sm flex-1 px-1.5 py-0"
                          autoFocus
                        />
                      ) : (
                        <span className="text-sm flex-1">{tag.name}</span>
                      )}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {editingTagId === tag.id ? (
                          <>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleSaveEditTag}>
                              <Check className="h-3.5 w-3.5 text-emerald-500" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setEditingTagId(null); setEditingTagName(""); }}>
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleStartEditTag(tag)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 hover:text-destructive"
                              onClick={() => deleteTag.mutate(tag.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cliente Checklist Template Card */}
          <Card className="border-0 shadow-clickup-sm">
            <CardHeader className="flex flex-row items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <ListChecks className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-base font-semibold">Checklist Padrão de Clientes</CardTitle>
                <CardDescription className="text-sm">
                  Processo de CS aplicado automaticamente a cada novo cliente
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <ClienteChecklistTemplateConfig />
            </CardContent>
          </Card>

          {/* Members Card */}
          <Card className="border-0 shadow-clickup-sm">
            <CardHeader className="flex flex-row items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-base font-semibold">Membros</CardTitle>
                <CardDescription className="text-sm">Usuários com acesso ao sistema</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {profiles.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhum membro encontrado</p>
              ) : (
                <div className="space-y-3">
                  {profiles.map((profile) => (
                    <div key={profile.id} className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={profile.avatar_url || undefined} />
                        <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
                          {getInitials(profile.full_name, profile.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{profile.full_name || profile.email || "Usuário"}</p>
                        {profile.full_name && (
                          <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
                        )}
                      </div>
                      {profile.id === user?.id && (
                        <Badge variant="secondary" className="text-xs shrink-0">Você</Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* About Card */}
          <Card className="border-0 shadow-clickup-sm">
            <CardHeader className="flex flex-row items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Info className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-base font-semibold">Sobre o Sistema</CardTitle>
                <CardDescription className="text-sm">Informações da aplicação</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <Label className="text-xs text-muted-foreground">Versão</Label>
                  <p className="font-medium text-sm mt-0.5">1.0.0</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <Label className="text-xs text-muted-foreground">Ambiente</Label>
                  <p className="font-medium text-sm mt-0.5">Produção</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <Label className="text-xs text-muted-foreground">Backend</Label>
                  <p className="font-medium text-sm mt-0.5">Supabase</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
