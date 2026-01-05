"use client";

import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Bell,
    Moon,
    Sun,
    Settings,
    User,
    LogOut,
    ChevronDown,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useLanguage } from "@/components/providers/language-provider";
import { useTheme } from "@/components/providers/theme-provider";
import { useAutomation } from "@/components/providers/automation-provider";
import { useRouter } from "next/navigation";

const FlagIcon = ({ code }) => {
    switch (code) {
        case 'en': return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 30" width="24" height="15"><rect width="50" height="30" fill="#B22234" /><rect width="50" height="26" y="2" fill="#3C3B6E" /><rect width="50" height="22" y="4" fill="#B22234" /><rect width="50" height="18" y="6" fill="#FFF" /><rect width="50" height="14" y="8" fill="#B22234" /><rect width="50" height="10" y="10" fill="#FFF" /><rect width="50" height="6" y="12" fill="#B22234" /><rect width="20" height="15" fill="#3C3B6E" /><path d="M0 0h50v30H0z" fill="none" stroke="#000" strokeWidth="0" /></svg> // Simplified US Placeholder
        case 'es': return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 750 500" width="24" height="16"><rect width="750" height="500" fill="#c60b1e" /><rect width="750" height="250" y="125" fill="#ffc400" /></svg>
        case 'pt': return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 700" width="24" height="16"><rect width="1000" height="700" fill="#009c3b" /><path d="M500 115L887 350 500 585 113 350z" fill="#ffdf00" /><circle cx="500" cy="350" r="130" fill="#002776" /></svg>
        case 'fr': return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" width="24" height="16"><rect width="900" height="600" fill="#ED2939" /><rect width="600" height="600" fill="#fff" /><rect width="300" height="600" fill="#002395" /></svg>
        default: return null
    }
}

export function TopBar() {
    const { user, signOut } = useAuthStore();
    const { language, changeLanguage, t } = useLanguage();
    const { theme, toggleTheme } = useTheme();
    const { isLoading } = useAutomation();
    const router = useRouter();

    // Check both context state and localStorage for active automation
    const [hasActiveCoverageAutomation, setHasActiveCoverageAutomation] = React.useState(false);

    React.useEffect(() => {
        // Check localStorage for active job
        const checkActiveJob = () => {
            try {
                const stored = localStorage.getItem('coverage_plot_automation_state');
                if (stored) {
                    const state = JSON.parse(stored);
                    const age = Date.now() - (state.timestamp || 0);
                    const oneHour = 60 * 60 * 1000;
                    // Consider active if state exists and is less than 1 hour old
                    return state.isLoading && age < oneHour;
                }
            } catch (e) {
                // Ignore errors
            }
            return false;
        };

        // Set initial state
        setHasActiveCoverageAutomation(isLoading || checkActiveJob());

        // Poll localStorage periodically to catch updates from other tabs/components
        const interval = setInterval(() => {
            setHasActiveCoverageAutomation(isLoading || checkActiveJob());
        }, 2000); // Check every 2 seconds

        return () => clearInterval(interval);
    }, [isLoading]);

    const handleNotificationsClick = () => {
        if (hasActiveCoverageAutomation) {
            router.push("/coverage-plot/new-form");
        }
    };

    const languageLabels = {
        en: "English",
        es: "Español",
        pt: "Português",
        fr: "Français",
    };

    return (
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-white dark:bg-zinc-900 px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 sticky top-0 z-10 w-full">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <h1 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {/* Dynamic page title would go here, for now using Dashboard as default context */}
                    {t("dashboard")}
                </h1>
            </div>

            <div className="flex items-center gap-4">
                {/* Language Switcher */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="gap-2 px-2">
                            <span className="leading-none flex items-center"><FlagIcon code={language} /></span>
                            <span className="hidden md:inline-block font-medium">{languageLabels[language]}</span>
                            <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => changeLanguage("en")}>
                            <span className="mr-2 flex items-center"><FlagIcon code="en" /></span> English
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => changeLanguage("es")}>
                            <span className="mr-2 flex items-center"><FlagIcon code="es" /></span> Español
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => changeLanguage("pt")}>
                            <span className="mr-2 flex items-center"><FlagIcon code="pt" /></span> Português
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => changeLanguage("fr")}>
                            <span className="mr-2 flex items-center"><FlagIcon code="fr" /></span> Français
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Theme Toggle */}
                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={toggleTheme}>
                    <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>

                {/* Notifications / Coverage Automation Reminder */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-9 w-9"
                    onClick={handleNotificationsClick}
                >
                    <Bell className="h-4 w-4" />
                    {hasActiveCoverageAutomation && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                            <span className="relative inline-flex h-3 w-3 rounded-full bg-red-600" />
                        </span>
                    )}
                    <span className="sr-only">
                        {hasActiveCoverageAutomation
                            ? "Coverage plot automation is running"
                            : "Notifications"}
                    </span>
                </Button>

                <Separator orientation="vertical" className="h-6" />

                {/* User Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-9 flex items-center gap-2 rounded-full px-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                            <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-red-600 text-white">
                                    {user?.user_metadata?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="hidden md:flex flex-col items-start gap-0.5">
                                <span className="text-sm font-medium leading-none">
                                    {user?.user_metadata?.name || user?.email?.split("@")[0] || "User"}
                                </span>
                                <span className="text-xs text-muted-foreground leading-none">
                                    {user?.email || ""}
                                </span>
                            </div>
                            <ChevronDown className="h-3 w-3 opacity-50" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{user?.user_metadata?.name || user?.email?.split("@")[0]}</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {user?.email}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <User className="mr-2 h-4 w-4" />
                            <span>{t("profile")}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>{t("settings")}</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={signOut}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>{t("logout")}</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}

