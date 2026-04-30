/**
 * @file: DashboardShell.tsx
 * @responsibility: Dashboard layout shell — background layer + scrollable content area
 * @exports: DashboardShell
 * @imports: DashboardBackground
 * @layer: components
 */

import { DashboardBackground } from "./DashboardBackground";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="relative flex flex-1 flex-col min-h-0 overflow-hidden">
      <DashboardBackground />
      <div className="relative flex-1 overflow-auto p-4 lg:p-6 z-[0]">
        {children}
      </div>
    </div>
  );
}
