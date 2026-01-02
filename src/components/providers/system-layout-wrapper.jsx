"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { TopBar } from "@/components/top-bar";
import { ThemeProvider } from "@/components/providers/theme-provider";

export function SystemLayoutWrapper({ children }) {
    return (
        <ThemeProvider>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <TopBar />
                    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-gray-50 dark:bg-zinc-950 transition-colors duration-300">
                        {children}
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </ThemeProvider>
    );
}
