import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, FolderOpen } from "lucide-react";

export type WikiTabValue = "clientes" | "geral";

interface WikiTabsProps {
  value: WikiTabValue;
  onChange: (value: WikiTabValue) => void;
}

export function WikiTabs({ value, onChange }: WikiTabsProps) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as WikiTabValue)}>
      <TabsList className="bg-muted/50">
        <TabsTrigger value="clientes" className="gap-2">
          <Users className="h-4 w-4" />
          Clientes
        </TabsTrigger>
        <TabsTrigger value="geral" className="gap-2">
          <FolderOpen className="h-4 w-4" />
          Geral / Interno
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
