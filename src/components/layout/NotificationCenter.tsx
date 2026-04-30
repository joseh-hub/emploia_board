import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Bell, Check, CheckCheck, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  useNotifications,
  useUnreadNotificationsCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification,
  Notification,
} from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";

function NotificationItem({
  notification,
  onMarkRead,
  onDelete,
  onNavigate,
}: {
  notification: Notification;
  onMarkRead: () => void;
  onDelete: () => void;
  onNavigate: () => void;
}) {
  const typeIcons: Record<Notification["type"], string> = {
    mention: "💬",
    assignment: "👤",
    due_date: "📅",
    comment: "💭",
    status_change: "🔄",
  };

  const handleClick = () => {
    onMarkRead();
    onNavigate();
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-3 hover:bg-muted/50 transition-colors cursor-pointer group",
        !notification.read && "bg-primary/5"
      )}
      onClick={handleClick}
    >
      <span className="text-lg mt-0.5">{typeIcons[notification.type]}</span>
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm", !notification.read && "font-medium")}>
          {notification.title}
        </p>
        {notification.message && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {notification.message}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          {formatDistanceToNow(new Date(notification.created_at), {
            addSuffix: true,
            locale: ptBR,
          })}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon-sm"
        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { data: notifications, isLoading } = useNotifications();
  const { data: unreadCount } = useUnreadNotificationsCount();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const deleteNotification = useDeleteNotification();

  const handleMarkRead = (id: string) => {
    markRead.mutate(id);
  };

  const handleMarkAllRead = () => {
    markAllRead.mutate();
  };

  const handleDelete = (id: string) => {
    deleteNotification.mutate(id);
  };

  const handleNavigate = (notification: Notification) => {
    setOpen(false);
    if (!notification.entity_type || !notification.entity_id) return;
    switch (notification.entity_type) {
      case "tarefa":
        navigate("/tarefas", { state: { openTarefaId: notification.entity_id } });
        break;
      case "projeto":
        navigate("/projetos");
        break;
      case "cliente":
        navigate("/clientes");
        break;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground hover:text-foreground relative"
        >
          <Bell className="h-4 w-4" />
          {(unreadCount ?? 0) > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px] font-medium"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-semibold text-sm">Notificações</h3>
          {(unreadCount ?? 0) > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={handleMarkAllRead}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Marcar todas como lidas
            </Button>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
              Carregando...
            </div>
          ) : notifications && notifications.length > 0 ? (
            <div className="divide-y">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkRead={() => handleMarkRead(notification.id)}
                  onDelete={() => handleDelete(notification.id)}
                  onNavigate={() => handleNavigate(notification)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">
                Nenhuma notificação
              </p>
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
