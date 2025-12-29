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
    // User section for Admin and Super Admin only (check app_metadata for role)
    ...(['Admin', 'Super Admin'].includes(user?.app_metadata?.role) ? [{
      title: "User",
      url: "/dashboard/users",
      icon: User,
    }] : []),
    {
      title: "ROM Generator",
      url: "#",
      icon: Layers,
      items: [
        { title: "Create New", url: "/new-rom-form" },
        { title: "Search ROM", url: "#" },
        { title: "My ROM's", url: "#" },
        { title: "Approvals", url: "#" },
      ],
    },
    {
      title: "Coverage Plot",
      url: "#",
      icon: BarChart2,
      items: [
      { title: "Create New", url: "/coverage-plot/new-form" },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings,
      items: [
        { title: "System Users", url: "#" },
        { title: "System Settings", url: "#" },
      ],
    },
  ]

  return (
    <Sidebar collapsible="icon" className="border-r-4 border-[var(--boingo-red)] bg-[#3D434A] text-white" {...props}>
      <SidebarHeader className="px-2 py-4">
        <div className={`flex items-center ${state === 'collapsed' ? 'justify-center' : 'justify-start'}`}>
          {state === 'collapsed' ? (
            <Image
              src="/images.jpg"
              alt="Boingo Logo"
              width={32}
              height={32}
              className="object-contain rounded-full border-2 border-white"
              priority
            />
          ) : (
            <Image
              src="/SocialShare_400x225.png"
              alt="Boingo Logo"
              width={100}
              height={56}
              className="object-contain object-left"
              priority
            />
          )}
        </div>
      </SidebarHeader>
      <SidebarContent className="text-white px-2">
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
                      <SidebarMenuButton tooltip={item.title} className="text-white hover:bg-white/10 hover:text-white font-medium text-sm px-2">
                        {item.icon && <item.icon className="size-4 text-white" />}
                        <span className="font-sans text-white">{item.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 text-white" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub className="border-l-white/20 ml-4">
                        {item.items.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton asChild className="text-white hover:bg-white/10 hover:text-white font-normal text-sm">
                              <Link href={subItem.url}>
                                <span className="font-sans text-white">{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </>
                ) : (
                  <SidebarMenuButton asChild tooltip={item.title} className={`text-white hover:bg-white/10 hover:text-white font-medium text-sm px-2 ${pathname === item.url ? 'bg-white/10 font-bold' : ''}`}>
                    <Link href={item.url}>
                      {item.icon && <item.icon className="size-4 text-white" />}
                      <span className="font-sans text-white">{item.title}</span>
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
          {/* User Info - Only show when expanded */}
          {state === 'expanded' && (
            <SidebarMenuItem>
              <div className="flex items-center gap-3 px-2 py-2">
                <Avatar className="h-8 w-8 rounded-lg flex-shrink-0">
                  <AvatarFallback className="rounded-lg bg-red-600 text-white">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                  <span className="truncate font-semibold text-white">{user?.email?.split('@')[0] || 'User'}</span>
                  <span className="truncate text-xs text-white/70">{user?.email || ''}</span>
                </div>
              </div>
            </SidebarMenuItem>
          )}

          {/* Logout Button */}
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={signOut}
              className="text-white hover:bg-red-600 hover:text-white transition-colors font-medium text-sm px-2"
              tooltip="Logout"
            >
              <LogOut className="size-4 text-white" />
              <span className="font-sans text-white">Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar >
  )
}
