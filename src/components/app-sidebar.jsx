"use client"

import * as React from "react"
import {
  Home,
  User,
  Settings,
  BarChart2,
  Layers,
  ChevronRight,
  Search,
  Plus,
  RefreshCcw,
  DollarSign,
  LogOut
} from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,

  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { useAuthStore } from "@/store/useAuthStore"
import { useLanguage } from "@/components/providers/language-provider"

export function AppSidebar({ ...props }) {
  const pathname = usePathname()
  const { user, signOut } = useAuthStore()
  const { state } = useSidebar()
  const { t } = useLanguage()

  // Menu items with role-based access control
  const menuItems = [
    {
      title: t("home"),
      url: "/dashboard",
      icon: Home,
    },
    {
      title: t("romGenerator"),
      url: "#",
      icon: Layers,
      items: [
        { title: t("createNew"), url: "/new-rom-form" },
        { title: t("searchRom"), url: "#" },
        { title: t("myRoms"), url: "#" },
        { title: t("approvals"), url: "#" },
      ],
    },
    {
      title: t("coveragePlot"),
      url: "#",
      icon: BarChart2,
      items: [
        { title: t("createNew"), url: "/coverage-plot/new-form" },
      ],
    },
    {
      title: t("settings"),
      url: "#",
      icon: Settings,
      items: [
        // Only Admin and Super Admin can see System User
        ...(['Admin', 'Super Admin'].includes(user?.app_metadata?.role) ? [
          { title: t("systemUser"), url: "/settings/users" }
        ] : []),
        { title: t("systemSettings"), url: "#" },
      ],
    },
  ]

  return (
    <Sidebar collapsible="icon" className="border-r-4 border-[var(--boingo-red)] bg-[var(--sidebar)] text-[var(--sidebar-foreground)]" {...props}>
      <SidebarHeader className="px-2 py-4">
        <div className={`flex items-center ${state === 'collapsed' ? 'justify-center' : 'justify-start'}`}>
          {state === 'collapsed' ? (
            <Image
              src="/images.jpg"
              alt="Boingo Logo"
              width={32}
              height={32}
              className="object-contain rounded-full border-2 border-[var(--sidebar-border)]"
              priority
            />
          ) : (
            <Image
              src="/SocialShare_400x225-removebg-preview.png"
              alt="Boingo Logo"
              width={100}
              height={56}
              className="object-contain object-left"
              priority
            />
          )}
        </div>
      </SidebarHeader>
      <SidebarContent className="text-[var(--sidebar-foreground)] px-2">
        <SidebarMenu>
          {menuItems.map((item) => (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={false}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                {item.items ? (
                  <>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={item.title} className="text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-foreground)] font-medium text-sm px-2">
                        {item.icon && <item.icon className="size-4 text-[var(--sidebar-foreground)]" />}
                        <span className="font-sans text-[var(--sidebar-foreground)]">{item.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 text-[var(--sidebar-foreground)]" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub className="border-l-[var(--sidebar-border)] ml-4">
                        {item.items.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton asChild className="text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-foreground)] font-normal text-sm">
                              <Link href={subItem.url}>
                                <span className="font-sans text-[var(--sidebar-foreground)]">{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </>
                ) : (
                  <SidebarMenuButton asChild tooltip={item.title} className={`text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-foreground)] font-medium text-sm px-2 ${pathname === item.url ? 'bg-[var(--sidebar-accent)] font-bold' : ''}`}>
                    <Link href={item.url}>
                      {item.icon && <item.icon className="size-4 text-[var(--sidebar-foreground)]" />}
                      <span className="font-sans text-[var(--sidebar-foreground)]">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            </Collapsible>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="px-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={signOut}
              className="text-[var(--sidebar-foreground)] hover:bg-red-600 hover:text-[var(--sidebar-foreground)] transition-colors font-medium text-sm px-2"
              tooltip={t("logout")}
            >
              <LogOut className="size-4 text-[var(--sidebar-foreground)]" />
              <span className="font-sans text-[var(--sidebar-foreground)]">{t("logout")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar >
  )
}

