"use client";
import Image from 'next/image'
import { useLanguage } from "@/components/providers/language-provider"

export default function DashboardPage() {
  const { t } = useLanguage()
  return (
    <div className="flex flex-1 flex-col items-center justify-center min-h-[50vh]">
      {/* Emblem from description: small yellow/gold square emblem/icon with a geometric pattern */}
      {/* Since I don't have the exact emblem, I'll use a placeholder or generic icon */}
      <div className="p-10 text-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{t("welcome")}</h1>
        <p className="text-muted-foreground mt-2">{t("selectOption")}</p>
      </div>
    </div>
  )
}

