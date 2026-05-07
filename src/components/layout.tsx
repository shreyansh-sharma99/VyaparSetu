import * as React from "react";
import { useSelector } from "react-redux";
import { SidebarProvider } from "@/components/layout/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";
import { Outlet } from "react-router-dom";
import type { RootState } from "@/store";

const LayoutContent: React.FC = () => {
  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <AppHeader />

        <div
          className="flex-1 overflow-y-auto overflow-x-auto thin-scrollbar bg-gray-100 dark:bg-background w-full px-6 md:px-2 py-2"
        >
          <div className="w-full mx-auto animate-in fade-in slide-in-from-bottom-4  duration-700">
            <Outlet />
          </div>
        </div>
        <footer className="sticky z-10 bottom-0 bg-white dark:bg-card px-4 py-2 text-center text-xs border-t dark:border-border dark:text-muted-foreground transition-colors duration-300">
          {import.meta.env.VITE_PLATFORM_NAME} © {new Date().getFullYear()} — All Rights Reserved
        </footer>

      </div>
    </div>
  );
};

export function Layout() {
  const theme = useSelector((state: RootState) => state.ui.theme);

  React.useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
}
