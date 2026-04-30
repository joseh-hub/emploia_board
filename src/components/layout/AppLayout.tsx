import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";

export function AppLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background gap-0">
        <AppSidebar />
        <SidebarInset className="flex flex-col flex-1 min-w-0 mt-2 mb-2 mr-2">
          <main className="flex-1 flex flex-col">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
