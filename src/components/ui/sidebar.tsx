import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Constants
const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_COLLAPSED_WIDTH = "4rem"
const SIDEBAR_WIDTH_MOBILE = "18rem"
const SIDEBAR_COOKIE_NAME = "sidebar:state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

// Context
interface SidebarContextValue {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
  isCollapsed: boolean
  setIsCollapsed: (isCollapsed: boolean) => void
}

const SidebarContext = React.createContext<SidebarContextValue | undefined>(undefined)

// Provider
interface SidebarProviderProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  defaultCollapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  children: React.ReactNode
}

export function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  defaultCollapsed = false,
  onCollapsedChange,
  children,
  ...props
}: SidebarProviderProps) {
  const [open, _setOpen] = React.useState(defaultOpen)
  const [openMobile, setOpenMobile] = React.useState(false)
  const [isMobile, setIsMobile] = React.useState(false)
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed)

  const setOpen = React.useCallback(
    (value: boolean) => {
      if (setOpenProp) {
        setOpenProp(value)
      } else {
        _setOpen(value)
      }
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${value}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
    },
    [setOpenProp]
  )

  React.useEffect(() => {
    if (onCollapsedChange) {
      onCollapsedChange(isCollapsed)
    }
  }, [isCollapsed, onCollapsedChange])

  const toggleSidebar = React.useCallback(() => {
    if (isMobile) {
      setOpenMobile((prev) => !prev)
    } else {
      setOpen(!open)
    }
  }, [isMobile, open, setOpen])

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === SIDEBAR_KEYBOARD_SHORTCUT && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        toggleSidebar()
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [toggleSidebar])

  const contextValue = React.useMemo(
    () => ({
      state: open ? "expanded" : "collapsed",
      open: openProp ?? open,
      setOpen,
      openMobile,
      setOpenMobile,
      isMobile,
      toggleSidebar,
      isCollapsed,
      setIsCollapsed,
    }),
    [open, openProp, setOpen, openMobile, isMobile, toggleSidebar, isCollapsed]
  )

  return (
    <SidebarContext.Provider value={contextValue}>
      <div
        {...props}
        style={{
          "--sidebar-width": SIDEBAR_WIDTH,
          "--sidebar-width-mobile": SIDEBAR_WIDTH_MOBILE,
          ...props.style,
        } as React.CSSProperties}
        className={cn("text-sidebar-foreground", props.className)}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  )
}

// Hook
export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

// Sidebar Component
interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultCollapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
}

export function Sidebar({
  className,
  defaultCollapsed = false,
  onCollapsedChange,
  children,
  ...props
}: SidebarProps) {
  const { isCollapsed, setIsCollapsed } = useSidebar()

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-30 flex h-screen flex-col border-r bg-background transition-all duration-300 ease-in-out",
        isCollapsed ? `w-[${SIDEBAR_COLLAPSED_WIDTH}]` : `w-[${SIDEBAR_WIDTH}]`,
        className
      )}
      data-collapsed={isCollapsed}
      {...props}
    >
      {children}
    </aside>
  )
}

interface SidebarHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarHeader({
  className,
  ...props
}: SidebarHeaderProps) {
  return (
    <div
      className={cn("flex h-14 items-center border-b px-3", className)}
      {...props}
    />
  )
}

interface SidebarContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarContent({
  className,
  ...props
}: SidebarContentProps) {
  return (
    <div
      className={cn("flex-1 overflow-auto", className)}
      {...props}
    />
  )
}

interface SidebarFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarFooter({
  className,
  ...props
}: SidebarFooterProps) {
  return (
    <div
      className={cn("mt-auto border-t", className)}
      {...props}
    />
  )
}

interface SidebarTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function SidebarTrigger({
  className,
  ...props
}: SidebarTriggerProps) {
  const { toggleSidebar } = useSidebar()
  return (
    <button
      type="button"
      onClick={toggleSidebar}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-md text-sidebar-foreground hover:bg-sidebar-accent",
        className
      )}
      {...props}
    />
  )
}
