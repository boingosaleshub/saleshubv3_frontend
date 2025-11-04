import * as React from "react"
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu"
import { cn } from "@/lib/utils"

export const NavigationMenu = React.forwardRef(function NavigationMenu(
  { className, ...props },
  ref
) {
  return (
    <NavigationMenuPrimitive.Root
      ref={ref}
      className={cn("relative z-50", className)}
      {...props}
    />
  )
})

export const NavigationMenuList = React.forwardRef(function NavigationMenuList(
  { className, ...props },
  ref
) {
  return (
    <NavigationMenuPrimitive.List
      ref={ref}
      className={cn("group flex items-center gap-2", className)}
      {...props}
    />
  )
})

export const NavigationMenuItem = NavigationMenuPrimitive.Item

export const NavigationMenuTrigger = React.forwardRef(function NavigationMenuTrigger(
  { className, ...props },
  ref
) {
  return (
    <NavigationMenuPrimitive.Trigger
      ref={ref}
      className={cn(
        "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
        className
      )}
      {...props}
    />
  )
})

export const NavigationMenuContent = React.forwardRef(function NavigationMenuContent(
  { className, ...props },
  ref
) {
  return (
    <NavigationMenuPrimitive.Content
      ref={ref}
      className={cn(
        "absolute top-full left-0 w-max rounded-md border bg-popover text-popover-foreground shadow-md",
        "data-[motion=from-start]:animate-in data-[motion=from-start]:slide-in-from-left",
        "data-[motion=from-end]:animate-in data-[motion=from-end]:slide-in-from-right",
        "data-[motion=to-start]:animate-out data-[motion=to-start]:slide-out-to-left",
        "data-[motion=to-end]:animate-out data-[motion=to-end]:slide-out-to-right",
        className
      )}
      {...props}
    />
  )
})

export const NavigationMenuLink = React.forwardRef(function NavigationMenuLink(
  { className, ...props },
  ref
) {
  return (
    <NavigationMenuPrimitive.Link
      ref={ref}
      className={cn("cursor-pointer", className)}
      {...props}
    />
  )
})