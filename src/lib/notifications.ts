import { supabase } from "@/integrations/supabase/client";

type NotificationType = "mention" | "assignment" | "due_date" | "comment" | "status_change";
type EntityType = "tarefa" | "projeto" | "cliente" | "custom_board_card" | null;

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message?: string;
  entityType?: EntityType;
  entityId?: string;
}

export async function createNotification(params: CreateNotificationParams) {
  const { error } = await supabase.from("notifications").insert({
    user_id: params.userId,
    type: params.type,
    title: params.title,
    message: params.message || null,
    entity_type: params.entityType || null,
    entity_id: params.entityId || null,
  });

  if (error) console.error("Erro ao criar notificação:", error);
}

export async function createMentionNotifications(
  mentions: string[],
  currentUserId: string,
  currentUserName: string,
  entityType: EntityType,
  entityId: string
) {
  if (!mentions?.length) return;

  // Buscar profiles dos mencionados
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, email");

  if (!profiles) return;

  for (const mention of mentions) {
    const mentionLower = mention.toLowerCase();
    const matchedProfile = profiles.find(
      (p) =>
        p.full_name?.toLowerCase().includes(mentionLower) ||
        p.email?.toLowerCase().includes(mentionLower)
    );

    if (matchedProfile && matchedProfile.id !== currentUserId) {
      await createNotification({
        userId: matchedProfile.id,
        type: "mention",
        title: "Você foi mencionado",
        message: `${currentUserName} mencionou você em um comentário`,
        entityType,
        entityId,
      });
    }
  }
}

export async function createAssignmentNotification(
  assignedUserId: string,
  currentUserId: string,
  currentUserName: string,
  taskTitle: string,
  entityType: EntityType,
  entityId: string
) {
  if (assignedUserId === currentUserId) return;

  await createNotification({
    userId: assignedUserId,
    type: "assignment",
    title: "Nova tarefa atribuída",
    message: `${currentUserName} atribuiu você à tarefa "${taskTitle}"`,
    entityType,
    entityId,
  });
}
