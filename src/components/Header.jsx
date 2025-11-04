"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu"
import { Menu, X, Monitor, Shield, BarChart3, Users } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div 
            className="flex items-center space-x-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/logo boingo B_Round_PS FILE.png"
                alt="SalesHub Logo"
                width={32}
                height={32}
                className="rounded-lg"
                priority
              />
              <span className="text-xl font-bold text-gray-900">SalesHub</span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Products</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-3 p-6 w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                      <div className="row-span-3">
                        <NavigationMenuLink asChild>
                          <div
                            className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-blue-500 to-blue-600 p-6 no-underline outline-none focus:shadow-md cursor-not-allowed pointer-events-none"
                            aria-disabled="true"
                            role="link"
                            tabIndex={-1}
                          >
                            <Monitor className="h-6 w-6 text-white" />
                            <div className="mb-2 mt-4 text-lg font-medium text-white">
                              UptimeX Platform
                            </div>
                            <p className="text-sm leading-tight text-white/90">
                              Comprehensive monitoring and observability solution for modern applications.
                            </p>
                          </div>
                        </NavigationMenuLink>
                      </div>
                      <div className="grid gap-3">
                        <NavigationMenuLink asChild>
                          <div className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-not-allowed pointer-events-none" aria-disabled="true" role="link" tabIndex={-1}>
                            <div className="flex items-center space-x-2">
                              <BarChart3 className="h-4 w-4" />
                              <div className="text-sm font-medium leading-none">Monitoring</div>
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Real-time application and infrastructure monitoring.
                            </p>
                          </div>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <div className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-not-allowed pointer-events-none" aria-disabled="true" role="link" tabIndex={-1}>
                            <div className="flex items-center space-x-2">
                              <Shield className="h-4 w-4" />
                              <div className="text-sm font-medium leading-none">Security</div>
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Advanced security monitoring and threat detection.
                            </p>
                          </div>
                        </NavigationMenuLink>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Solutions</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium leading-none">By Industry</h4>
                        <NavigationMenuLink asChild>
                          <div className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-not-allowed pointer-events-none" aria-disabled="true" role="link" tabIndex={-1}>
                            <div className="text-sm font-medium leading-none">E-commerce</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Monitor your online store performance and customer experience.
                            </p>
                          </div>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <div className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-not-allowed pointer-events-none" aria-disabled="true" role="link" tabIndex={-1}>
                            <div className="text-sm font-medium leading-none">Fintech</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Ensure compliance and security for financial applications.
                            </p>
                          </div>
                        </NavigationMenuLink>
                      </div>
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium leading-none">By Team Size</h4>
                        <NavigationMenuLink asChild>
                          <div className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-not-allowed pointer-events-none" aria-disabled="true" role="link" tabIndex={-1}>
                            <div className="text-sm font-medium leading-none">Startups</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Scale-friendly monitoring for growing companies.
                            </p>
                          </div>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <div className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-not-allowed pointer-events-none" aria-disabled="true" role="link" tabIndex={-1}>
                            <div className="text-sm font-medium leading-none">Enterprise</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Enterprise-grade monitoring with advanced features.
                            </p>
                          </div>
                        </NavigationMenuLink>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <span className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium text-gray-500 cursor-not-allowed select-none">
                    Pricing
                  </span>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <span className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium text-gray-500 cursor-not-allowed select-none">
                    About
                  </span>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Desktop CTA */}
          <motion.div 
            className="hidden md:flex items-center space-x-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 px-6 py-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
              <Link href="/login">Login</Link>
            </Button>
          </motion.div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <motion.div
            className="md:hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
              <span className="block px-3 py-2 text-base font-medium text-gray-400 rounded-md cursor-not-allowed select-none">Products</span>
              <span className="block px-3 py-2 text-base font-medium text-gray-400 rounded-md cursor-not-allowed select-none">Solutions</span>
              <span className="block px-3 py-2 text-base font-medium text-gray-400 rounded-md cursor-not-allowed select-none">Pricing</span>
              <span className="block px-3 py-2 text-base font-medium text-gray-400 rounded-md cursor-not-allowed select-none">About</span>
              <div className="pt-4 pb-2 border-t border-gray-200">
                <Button asChild className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700">
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </header>
  )
}
