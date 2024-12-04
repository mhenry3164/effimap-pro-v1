import * as React from "react"
import { NavLink } from "react-router-dom"
import { LucideIcon } from "lucide-react"
import { cn } from "../../lib/utils"

export interface NavMenuItem {
  title: string
  href: string
  icon: LucideIcon
}

interface NavMenuProps {
  items: NavMenuItem[]
  collapsed?: boolean
  className?: string
}

export function NavMenu({ items, collapsed = false, className }: NavMenuProps) {
  return (
    <nav className={cn("space-y-1", className)}>
      {items.map((item) => (
        <NavLink
          key={item.href}
          to={item.href}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground",
              "text-muted-foreground",
              isActive && "bg-accent text-accent-foreground",
              collapsed ? "justify-center px-2" : "px-4"
            )
          }
        >
          <item.icon className="h-4 w-4 flex-shrink-0" />
          {!collapsed && (
            <span>{item.title}</span>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
