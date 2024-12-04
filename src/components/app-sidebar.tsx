import React, { useState } from "react"
import { useAuth } from "../hooks/useAuth"
import { cn } from "../lib/utils"
import { Button } from "./ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { Logo } from "./logo"
import { LogOut, Menu } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { RoleNavigation } from "./navigation/RoleNavigation"
import { useStore } from "../store"
import { MapControls } from "./map/MapControls"
import { useSidebar } from "./ui/sidebar"

interface MobileNavProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

export function MobileNav({ isOpen, setIsOpen }: MobileNavProps) {
  const { user, logout } = useAuth()
  const { tenant } = useStore()

  if (!user) return null

  return (
    <>
      {/* Mobile navigation overlay */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm lg:hidden",
          isOpen ? "block" : "hidden"
        )}
        onClick={() => setIsOpen(false)}
      />
      {/* Mobile navigation menu */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-background border-r shadow-lg transition-transform duration-300 ease-in-out lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between border-b px-4">
            <Logo />
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <Menu className="h-6 w-6" />
            </Button>
          </div>
          {/* Navigation */}
          <div className="flex-1 overflow-y-auto">
            <RoleNavigation />
            <div className="px-4 py-2">
              <MapControls />
            </div>
          </div>
          {/* User */}
          <div className="border-t p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-12 w-full justify-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL || undefined} />
                    <AvatarFallback>{user.displayName?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-sm">
                    <span className="font-medium">{user.displayName}</span>
                    <span className="text-muted-foreground">{tenant?.name}</span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </>
  )
}

interface AppSidebarProps {
  className?: string
}

export function AppSidebar({ className }: AppSidebarProps) {
  const { user, logout } = useAuth()
  const { tenant } = useStore()
  const { open, isCollapsed, toggle } = useSidebar()

  if (!user) return null

  return (
    <aside
      className={cn(
        "bg-background transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : (open ? "w-64" : "w-16"),
        className
      )}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b">
          {!isCollapsed && open && <Logo />}
          <Button variant="ghost" size="icon" onClick={toggle} className="ml-auto">
            <Menu className="h-6 w-6" />
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto">
          <RoleNavigation />
          {!isCollapsed && open && (
            <div className="px-4 py-2">
              <MapControls />
            </div>
          )}
        </div>

        {/* User */}
        <div className="border-t p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className={cn(
                "h-12 w-full gap-3",
                !isCollapsed && open ? "justify-start" : "justify-center"
              )}>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.photoURL || undefined} />
                  <AvatarFallback>{user.displayName?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                {!isCollapsed && open && (
                  <div className="flex flex-col items-start text-sm">
                    <span className="font-medium">{user.displayName}</span>
                    <span className="text-muted-foreground">{tenant?.name}</span>
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </aside>
  )
}
