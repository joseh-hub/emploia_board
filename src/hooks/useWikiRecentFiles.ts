import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { WikiFile } from "@/hooks/useWikiFiles";

const STORAGE_KEY = "wiki-recent-files";
const MAX_RECENT = 8;

interface RecentFileEntry {
  fileId: string;
  accessedAt: string;
}

export function useWikiRecentFiles() {
  const [recentFiles, setRecentFiles] = useState<WikiFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load recent files from localStorage and fetch their data
  const loadRecentFiles = useCallback(async () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        setRecentFiles([]);
        setIsLoading(false);
        return;
      }

      const entries: RecentFileEntry[] = JSON.parse(stored);
      if (!entries.length) {
        setRecentFiles([]);
        setIsLoading(false);
        return;
      }

      const fileIds = entries.map((e) => e.fileId);
      const { data, error } = await supabase
        .from("wiki_files")
        .select("*")
        .in("id", fileIds);

      if (error) {
        console.error("Error loading recent files:", error);
        setRecentFiles([]);
      } else {
        // Sort by access order (most recent first)
        const filesMap = new Map((data || []).map((f) => [f.id, f as WikiFile]));
        const sorted = entries
          .map((e) => filesMap.get(e.fileId))
          .filter((f): f is WikiFile => !!f);
        setRecentFiles(sorted);
      }
    } catch (err) {
      console.error("Error parsing recent files:", err);
      setRecentFiles([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecentFiles();
  }, [loadRecentFiles]);

  // Add or update a file in recents
  const addRecentFile = useCallback((fileId: string) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      let entries: RecentFileEntry[] = stored ? JSON.parse(stored) : [];

      // Remove existing entry if present
      entries = entries.filter((e) => e.fileId !== fileId);

      // Add to beginning
      entries.unshift({
        fileId,
        accessedAt: new Date().toISOString(),
      });

      // Limit to MAX_RECENT
      entries = entries.slice(0, MAX_RECENT);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));

      // Reload to get updated data
      loadRecentFiles();
    } catch (err) {
      console.error("Error saving recent file:", err);
    }
  }, [loadRecentFiles]);

  // Remove a file from recents
  const removeRecentFile = useCallback((fileId: string) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;

      let entries: RecentFileEntry[] = JSON.parse(stored);
      entries = entries.filter((e) => e.fileId !== fileId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));

      setRecentFiles((prev) => prev.filter((f) => f.id !== fileId));
    } catch (err) {
      console.error("Error removing recent file:", err);
    }
  }, []);

  // Clear all recents
  const clearRecentFiles = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setRecentFiles([]);
  }, []);

  return {
    recentFiles,
    isLoading,
    addRecentFile,
    removeRecentFile,
    clearRecentFiles,
    refresh: loadRecentFiles,
  };
}
