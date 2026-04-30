import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface WikiTaskFile {
  id: string;
  name: string;
  folder_id: string;
}

export function useWikiTaskFile(tarefaId: string | null) {
  return useQuery({
    queryKey: ["wiki-task-file", tarefaId],
    queryFn: async (): Promise<WikiTaskFile | null> => {
      if (!tarefaId) return null;

      const { data, error } = await supabase
        .from("wiki_files")
        .select("id, name, folder_id")
        .eq("tarefa_id", tarefaId)
        .maybeSingle();

      if (error) throw error;
      return data as WikiTaskFile | null;
    },
    enabled: !!tarefaId,
  });
}
