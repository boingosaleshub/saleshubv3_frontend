"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useLanguage } from "@/components/providers/language-provider";
import { useTheme } from "@/components/providers/theme-provider";
import { useHighContrast } from "@/components/providers/high-contrast-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
    Settings,
    User,
    Mail,
    Shield,
    Globe,
    Sun,
    Moon,
    Eye,
    Languages,
    Palette,
    Sparkles,
    ChevronRight,
} from "lucide-react";

const FlagIcon = ({ code }) => {
    switch (code) {
        case 'en': return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 30" width="24" height="16"><rect width="50" height="30" fill="#B22234" /><rect width="50" height="26" y="2" fill="#3C3B6E" /><rect width="50" height="22" y="4" fill="#B22234" /><rect width="50" height="18" y="6" fill="#FFF" /><rect width="50" height="14" y="8" fill="#B22234" /><rect width="50" height="10" y="10" fill="#FFF" /><rect width="50" height="6" y="12" fill="#B22234" /><rect width="20" height="15" fill="#3C3B6E" /><path d="M0 0h50v30H0z" fill="none" stroke="#000" strokeWidth="0" /></svg>
        case 'es': return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 750 500" width="24" height="16"><rect width="750" height="500" fill="#c60b1e" /><rect width="750" height="250" y="125" fill="#ffc400" /></svg>
        case 'pt': return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 700" width="24" height="16"><rect width="1000" height="700" fill="#009c3b" /><path d="M500 115L887 350 500 585 113 350z" fill="#ffdf00" /><circle cx="500" cy="350" r="130" fill="#002776" /></svg>
        case 'fr': return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" width="24" height="16"><rect width="900" height="600" fill="#ED2939" /><rect width="600" height="600" fill="#fff" /><rect width="300" height="600" fill="#002395" /></svg>
        default: return null
    }
}

export default function SystemSettingsPage() {
    const { user } = useAuthStore();
    const { language, changeLanguage, t } = useLanguage();
    const { theme, toggleTheme } = useTheme();
    const { highContrast, toggleHighContrast } = useHighContrast();

    const languageLabels = {
        en: t("english"),
        es: t("spanish"),
        pt: t("portuguese"),
        fr: t("french"),
    };

    const languages = [
        { code: "en", label: t("english") },
        { code: "es", label: t("spanish") },
        { code: "pt", label: t("portuguese") },
        { code: "fr", label: t("french") },
    ];

    return (
        <div className="w-full">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-[#3D434A] to-[#4a5058] dark:from-[#3D434A] dark:to-[#4a5058] py-5 px-6 border-b-4 border-red-600 rounded-t-2xl mx-4 mt-6 shadow-lg">
                <div className="flex items-center gap-3">
                    <Settings className="h-6 w-6 text-white animate-spin-slow" />
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold text-white">
                            {t("systemSettings")}
                        </h2>
                        <p className="text-gray-300 text-sm">
                            Customize your experience and accessibility preferences
                        </p>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="mx-4 py-5 space-y-3">
                {/* Account Info - Simple Text Section */}
                <div className="bg-white dark:bg-zinc-900/80 rounded-xl border border-gray-200 dark:border-zinc-800 p-4 shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <User className="h-4 w-4 text-[#E41F26]" />
                        {t("accountInfo")}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                        <div className="flex items-center gap-2">
                            <User className="h-3.5 w-3.5 text-gray-400" />
                            <span className="text-gray-500 dark:text-gray-400">Name:</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                                {user?.user_metadata?.name || user?.email?.split("@")[0] || "User"}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Mail className="h-3.5 w-3.5 text-gray-400" />
                            <span className="text-gray-500 dark:text-gray-400">Email:</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                                {user?.email || "No email"}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Shield className="h-3.5 w-3.5 text-gray-400" />
                            <span className="text-gray-500 dark:text-gray-400">{t("role")}:</span>
                            <Badge variant="secondary" className="text-xs font-medium bg-[#E41F26]/10 text-[#E41F26] border border-[#E41F26]/20 py-0">
                                {user?.app_metadata?.role || "User"}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                            <Globe className="h-3.5 w-3.5 text-gray-400" />
                            <span className="text-gray-500 dark:text-gray-400">{t("currentLanguageLabel")}:</span>
                            <div className="flex items-center gap-1.5">
                                <FlagIcon code={language} />
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {languageLabels[language]}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Settings Tabs - Compact */}
                <div className="space-y-2">
                    {/* Theme Tab */}
                    <Card className="bg-white dark:bg-zinc-900/80 border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md cursor-pointer"
                        onClick={toggleTheme}>
                        <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg transition-all duration-300 ${theme === 'dark'
                                        ? 'bg-gradient-to-br from-indigo-600 to-purple-700'
                                        : 'bg-gradient-to-br from-amber-400 to-orange-500'
                                        }`}>
                                        <div className="relative w-4 h-4">
                                            <Sun className={`h-4 w-4 text-white absolute transition-all duration-300 ${theme === 'dark' ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
                                                }`} />
                                            <Moon className={`h-4 w-4 text-white absolute transition-all duration-300 ${theme === 'dark' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
                                                }`} />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                                            <Palette className="h-3.5 w-3.5 text-[#E41F26]" />
                                            {t("themeTab")}
                                        </h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {t("themeDescription")}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="hidden sm:flex items-center gap-1 text-xs">
                                        <span className={theme === 'light' ? 'font-medium text-amber-600' : 'text-gray-400'}>{t("brightMode")}</span>
                                        <ChevronRight className="h-3 w-3 text-gray-400" />
                                        <span className={theme === 'dark' ? 'font-medium text-indigo-500' : 'text-gray-400'}>{t("darkModeLabel")}</span>
                                    </div>
                                    <Switch
                                        checked={theme === 'dark'}
                                        onCheckedChange={toggleTheme}
                                        onClick={(e) => e.stopPropagation()}
                                        className="data-[state=checked]:bg-indigo-600"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Language Tab */}
                    <Card className="bg-white dark:bg-zinc-900/80 border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
                        <CardContent className="p-3">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600">
                                    <Languages className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                                        <Globe className="h-3.5 w-3.5 text-[#E41F26]" />
                                        {t("languageTab")}
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {t("languageDescription")}
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {languages.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => changeLanguage(lang.code)}
                                        className={`py-2 px-3 rounded-lg border transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[1.02] ${language === lang.code
                                            ? 'border-[#E41F26] bg-[#E41F26]/10 shadow-sm'
                                            : 'border-gray-200 dark:border-zinc-700 hover:border-[#E41F26]/50 bg-gray-50 dark:bg-zinc-800/50'
                                            }`}
                                    >
                                        <FlagIcon code={lang.code} />
                                        <span className={`text-xs font-medium ${language === lang.code
                                            ? 'text-[#E41F26]'
                                            : 'text-gray-700 dark:text-gray-300'
                                            }`}>
                                            {lang.label}
                                        </span>
                                        {language === lang.code && (
                                            <Sparkles className="h-3 w-3 text-[#E41F26]" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* High Contrast Mode Tab */}
                    <Card className="bg-white dark:bg-zinc-900/80 border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md cursor-pointer"
                        onClick={toggleHighContrast}>
                        <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg transition-all duration-300 ${highContrast
                                        ? 'bg-black border border-white'
                                        : 'bg-gradient-to-br from-emerald-500 to-teal-600'
                                        }`}>
                                        <Eye className="h-4 w-4 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                                            <Eye className="h-3.5 w-3.5 text-[#E41F26]" />
                                            {t("highContrastTab")}
                                        </h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {t("highContrastDescription")}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge
                                        variant="outline"
                                        className={`text-xs py-0 ${highContrast
                                            ? 'bg-black text-white border-white'
                                            : 'text-gray-500 border-gray-300 dark:border-gray-600'
                                            }`}
                                    >
                                        {highContrast ? 'ON' : 'OFF'}
                                    </Badge>
                                    <Switch
                                        checked={highContrast}
                                        onCheckedChange={toggleHighContrast}
                                        onClick={(e) => e.stopPropagation()}
                                        className="data-[state=checked]:bg-black"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Custom animation style */}
            <style jsx global>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 8s linear infinite;
                }
            `}</style>
        </div>
    );
}
