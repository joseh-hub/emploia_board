import { useState, useMemo } from "react";
import { Check, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProfiles, Profile } from "@/hooks/useProfiles";
import { cn } from "@/lib/utils";

interface UserMultiSelectProps {
  selectedUsers: string[];
  onSelectionChange: (userIds: string[]) => void;
  excludeUserId?: string;
}

export function UserMultiSelect({
  selectedUsers,
  onSelectionChange,
  excludeUserId,
}: UserMultiSelectProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: profiles = [], isLoading } = useProfiles();

  const filteredProfiles = useMemo(() => {
    return profiles
      .filter((profile) => profile.id !== excludeUserId)
      .filter((profile) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
          profile.email?.toLowerCase().includes(query) ||
          profile.full_name?.toLowerCase().includes(query)
        );
      });
  }, [profiles, searchQuery, excludeUserId]);

  const selectedProfiles = useMemo(() => {
    return profiles.filter((p) => selectedUsers.includes(p.id));
  }, [profiles, selectedUsers]);

  const toggleUser = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      onSelectionChange(selectedUsers.filter((id) => id !== userId));
    } else {
      onSelectionChange([...selectedUsers, userId]);
    }
  };

  const removeUser = (userId: string) => {
    onSelectionChange(selectedUsers.filter((id) => id !== userId));
  };

  const getInitials = (profile: Profile) => {
    if (profile.full_name) {
      return profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return profile.email?.charAt(0).toUpperCase() || "U";
  };

  return (
    <div className="space-y-2">
      {/* Selected users badges */}
      {selectedProfiles.length > 0 && (
        <div className="flex flex-wrap gap-1 max-h-[60px] overflow-y-auto">
          {selectedProfiles.map((profile) => (
            <Badge
              key={profile.id}
              variant="secondary"
              className="flex items-center gap-1 pl-1 pr-1"
            >
              <Avatar className="h-4 w-4">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="text-[8px]">
                  {getInitials(profile)}
                </AvatarFallback>
              </Avatar>
              <span className="max-w-[100px] truncate text-xs">
                {profile.full_name || profile.email}
              </span>
              <button
                type="button"
                onClick={() => removeUser(profile.id)}
                className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar usuários..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* User list */}
      <ScrollArea className="h-[140px] rounded-md border">
        <div className="p-2 space-y-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">
              Carregando usuários...
            </div>
          ) : filteredProfiles.length === 0 ? (
            <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">
              {searchQuery
                ? "Nenhum usuário encontrado"
                : "Nenhum usuário disponível"}
            </div>
          ) : (
            filteredProfiles.map((profile) => {
              const isSelected = selectedUsers.includes(profile.id);
              return (
                <div
                  key={profile.id}
                  onClick={() => toggleUser(profile.id)}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleUser(profile.id);
                    }
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors",
                    "hover:bg-accent",
                    isSelected && "bg-accent"
                  )}
                >
                  <div className={cn(
                    "h-4 w-4 shrink-0 rounded-sm border border-primary flex items-center justify-center",
                    isSelected && "bg-primary text-primary-foreground"
                  )}>
                    {isSelected && <Check className="h-3 w-3" />}
                  </div>
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={profile.avatar_url || undefined} />
                    <AvatarFallback className="text-xs">
                      {getInitials(profile)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {profile.full_name || "Usuário"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {profile.email}
                    </p>
                  </div>
                  {isSelected && (
                    <Check className="h-4 w-4 text-primary shrink-0" />
                  )}
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      <p className="text-xs text-muted-foreground">
        {selectedUsers.length} usuário(s) selecionado(s)
      </p>
    </div>
  );
}
