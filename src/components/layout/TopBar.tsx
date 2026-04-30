import { Search, Plus, Settings, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { premiumZinc } from "@/styles/premium-zinc";
import { cn } from "@/lib/utils";
import { NotificationCenter } from "./NotificationCenter";

interface TopBarProps {
  title?: string;
  onNewClick?: () => void;
  newButtonLabel?: string;
  showNewButton?: boolean;
  showSearch?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  variant?: "default" | "premiumZinc";
  children?: React.ReactNode;
}

export function TopBar({
  title,
  onNewClick,
  newButtonLabel = "Novo",
  showNewButton = false,
  showSearch = false,
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Buscar...",
  variant = "default",
  children,
}: TopBarProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const isPremium = variant === "premiumZinc";

  const userInitials = user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : "US";

  return (
    <header
      className={cn(
        "h-14 sticky top-0 z-40",
        isPremium
          ? premiumZinc.topBarHeader
          : "border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      )}
    >
      <div className="flex h-full items-center justify-between px-4 gap-4">
        {/* Left side - Title and Search */}
        <div className="flex items-center gap-6 flex-1 min-w-0">
          {title && (
            <div className="flex items-center shrink-0">
              <h1
                className={cn(
                  "text-xl font-heading",
                  isPremium ? premiumZinc.topBarTitle : "text-foreground"
                )}
              >
                {title}
              </h1>
            </div>
          )}

          {showSearch && (
            <div className="relative w-full max-w-sm">
              <Search
                className={cn(
                  "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4",
                  isPremium ? "text-zinc-500" : "text-muted-foreground"
                )}
              />
              <Input
                type="search"
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className={cn(
                  "pl-9 h-9 w-full transition-colors",
                  isPremium
                    ? "bg-zinc-900/50 border-transparent focus-visible:ring-1 focus-visible:ring-primary/50 text-zinc-200 placeholder:text-zinc-600 hover:bg-zinc-900/80"
                    : "bg-muted/50 border-transparent focus-visible:bg-background focus-visible:border-input"
                )}
              />
            </div>
          )}
        </div>

        {/* Right side - Custom Children */}
        <div className="flex items-center justify-end gap-3 shrink-0 pr-2">
          {children}
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {showNewButton && onNewClick && (
            <Button onClick={onNewClick} size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">{newButtonLabel}</span>
            </Button>
          )}

          {/* Notifications */}
          <NotificationCenter />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="rounded-full">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.email}</p>
                  <p className="text-xs text-muted-foreground">Administrador</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/configuracoes")}>
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => signOut()} className="text-destructive focus:text-destructive">
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
