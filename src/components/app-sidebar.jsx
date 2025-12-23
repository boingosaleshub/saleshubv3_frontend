"use client"

import * as React from "react"
import {
  Home,
  User,
  Settings,
  BarChart2,
  Layers,
  LogOut,
  ChevronRight,
  Search,
  Plus,
  RefreshCcw,
  DollarSign
} from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuthStore } from "@/store/useAuthStore"

export function AppSidebar({ ...props }) {
  const pathname = usePathname()
  const { user, signOut } = useAuthStore()
  const { state } = useSidebar()

  // Define menu items
  const items = [
    {
      title: "Home",
      url: "/dashboard",
      icon: Home,
    },
    {
      title: "ROM Generator",
      url: "#",
      icon: Layers, // Using Layers as proxy for "layered squares/grid"
      items: [
        { title: "Create New", url: "/dashboard/rom/create" },
        { title: "Search ROM", url: "/dashboard/rom/search" },
        { title: "Update ROM", url: "/dashboard/rom/update" },
        { title: "Update Pricing Model", url: "/dashboard/rom/pricing" },
      ],
    },
    {
      title: "Coverage Plot",
      url: "#",
      icon: BarChart2,
      items: [
        { title: "Create New", url: "/dashboard/coverage/create" },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings,
      items: [
        // Only show System Users to Admin
        ...(user?.user_metadata?.role === 'admin' || user?.role === 'admin' ? [{ title: "System Users", url: "/dashboard/users" }] : []),
        { title: "System Settings", url: "/dashboard/settings" },
      ],
    },
  ]

  // Add "User" menu item directly if requested by user, but user said "User section can only accessible by Admin" and put it in sidebar list.
  // The user's list: "Home, User, ROM Generator, Coverage Plot, Settings"
  // The image list: "Home, ROM Generator, Coverage Plot, Settings" (with System Users under Settings)
  // I will follow the User's text instruction "Sidebar e Home, User, ROM Generator, Coverage Plot, Settings option thakbe".
  // And "Sidebar er User section can only accessible by Admin".

  // Let's adjust the items array to match User's text instruction, but keeping the submenus from image where applicable.
  // Actually, the user might mean "User" as a top level item.
  // Let's add "User" as top level for Admin.

  const menuItems = [
    {
      title: "Home",
      url: "/dashboard",
      icon: Home,
    },
    // User section for Admin only (check app_metadata for role)
    ...(user?.app_metadata?.role === 'Admin' ? [{
      title: "User",
      url: "/dashboard/users",
      icon: User,
    }] : []),
    {
      title: "ROM Generator",
      url: "#",
      icon: Layers,
      items: [
        { title: "Create New", url: "#" },
        { title: "Search ROM", url: "#" },
        { title: "Update ROM", url: "#" },
        { title: "Update Pricing Model", url: "#" },
      ],
    },
    {
      title: "Coverage Plot",
      url: "#",
      icon: BarChart2,
      items: [
        { title: "Create New", url: "#" },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings,
      items: [
        { title: "System Settings", url: "#" },
      ],
    },
  ]

  return (
    <Sidebar collapsible="offcanvas" className="border-r-4 border-[var(--boingo-red)] bg-[#2C2C2C] text-white" {...props}>
      <SidebarHeader className="border-b border-white/10">
        <div className="flex items-center gap-2 px-2 py-4">
          <div className="relative h-10 w-full">
            <Image
              src="/SalesHub 2.0 Logo Text.png"
              alt="SalesHub Logo"
              fill
              className="object-contain object-left"
              priority
            />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="text-white">
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
                      <SidebarMenuButton tooltip={item.title} className="text-black hover:bg-white/10 hover:text-black font-medium text-sm">
                        {item.icon && <item.icon className="size-4 text-black" />}
                        <span className="font-sans text-black">{item.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 text-black" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub className="border-l-white/20">
                        {item.items.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton asChild className="text-black hover:bg-white/10 hover:text-black font-normal text-sm">
                              <Link href={subItem.url}>
                                <span className="font-sans text-black">{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </>
                ) : (
                  <SidebarMenuButton asChild tooltip={item.title} className={`text-black hover:bg-white/10 hover:text-black font-medium text-sm ${pathname === item.url ? 'bg-white/10 font-bold' : ''}`}>
                    <Link href={item.url}>
                      {item.icon && <item.icon className="size-4 text-black" />}
                      <span className="font-sans text-black">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            </Collapsible>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          {/* User Info */}
          <SidebarMenuItem>
            <div className="flex items-center gap-2 px-2 py-2">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg bg-red-600 text-white">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-black">{user?.email?.split('@')[0] || 'User'}</span>
                <span className="truncate text-xs text-gray-600">{user?.email || ''}</span>
              </div>
            </div>
          </SidebarMenuItem>

          {/* Logout Button */}
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={signOut}
              className="text-black hover:bg-red-600 hover:text-white transition-colors font-medium text-sm"
              tooltip="Logout"
            >
              <LogOut className="size-4 text-black" />
              <span className="font-sans text-black">Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar >
  )
}
