"use client"

import * as React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { LogOut, ShieldAlert, User, PanelLeftClose, PanelLeftOpen } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { NavJogador } from "./nav-jogador"
import { NavAdmin } from "./nav-admin"
import { clearAuth, getUser } from "@/lib/auth"
import { cn } from "@/lib/utils"

function CollapseHandle() {
  const { state, toggleSidebar } = useSidebar()
  const collapsed = state === "collapsed"

  return (
    <button
      onClick={toggleSidebar}
      title={collapsed ? "Expandir sidebar" : "Recolher sidebar"}
      className={cn(
        "absolute -right-3 top-1/2 -translate-y-1/2 z-50",
        "h-6 w-6 rounded-full border border-nina-wine/60 bg-nina-wine-dark",
        "flex items-center justify-center",
        "text-white/60 hover:text-white hover:border-white/30 hover:bg-nina-wine",
        "shadow-lg shadow-black/40 transition-all cursor-pointer",
      )}
    >
      {collapsed
        ? <PanelLeftOpen className="h-3 w-3" />
        : <PanelLeftClose className="h-3 w-3" />
      }
    </button>
  )
}

function SectionChip({
  label,
  icon: Icon,
  variant = "default",
}: {
  label: string
  icon: React.ElementType
  variant?: "default" | "admin"
}) {
  return (
    <div
      className={cn(
        "group-data-[collapsible=icon]:hidden",
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 mb-2 mx-2",
        "text-[10px] font-bold uppercase tracking-wider border",
        variant === "admin"
          ? "text-nina-orange/90 bg-nina-orange/10 border-nina-orange/25"
          : "text-white/50 bg-white/5 border-white/10",
      )}
    >
      <Icon className="h-3 w-3 flex-shrink-0" />
      {label}
    </div>
  )
}

export function AppSidebar() {
  const router = useRouter()
  const { state } = useSidebar()
  const collapsed = state === "collapsed"

  const [user, setUser] = React.useState<ReturnType<typeof getUser>>(null)

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(getUser())
  }, [])

  const isAdmin = user?.role === "admin"

  function handleLogout() {
    clearAuth()
    router.push("/login")
  }

  return (
    <Sidebar
      collapsible="icon"
      style={{
        "--sidebar": "#3D0618",
        "--sidebar-border": "#6D0E2B66",
        "--sidebar-accent": "rgba(255,255,255,0.12)",
        "--sidebar-accent-foreground": "#ffffff",
      } as React.CSSProperties}
      className="border-r border-nina-wine/40"
    >
      {/* Trigger na borda */}
      <CollapseHandle />

      {/* Header */}
      <SidebarHeader className="px-4 py-4 group-data-[collapsible=icon]:px-1 group-data-[collapsible=icon]:py-3 border-b border-nina-wine/40">
        {/* Expandido */}
        <div className="group-data-[collapsible=icon]:hidden flex flex-col gap-1">
          <Image
            src="/logo-branca-nina.png"
            alt="Nina Logo"
            width={160}
            height={32}
            priority
            className="w-full h-auto object-contain"
          />
          <span className="text-[9px] font-black text-white/30 uppercase tracking-widest text-center mt-0.5">
            Bolão da Copa 2026
          </span>
        </div>
        {/* Colapsado */}
        <div className="hidden group-data-[collapsible=icon]:flex justify-center items-center">
          <Image
            src="/logo-nina.png"
            alt="Nina"
            width={48}
            height={48}
            priority
            className="w-full h-auto rounded-lg object-contain"
          />
        </div>
      </SidebarHeader>

      {/* Nav */}
      <SidebarContent className="px-2 py-4 gap-0">
        <SidebarGroup className="p-0">
          <SectionChip label="Jogador" icon={User} variant="default" />
          <NavJogador />
        </SidebarGroup>

        {isAdmin && (
          <>
            {/* Separador iluminado */}
            <div className="relative my-4 mx-3 h-px">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <div className="absolute inset-0 blur-sm bg-gradient-to-r from-transparent via-white/15 to-transparent" />
            </div>
            <SidebarGroup className="p-0">
              <SectionChip label="Administrador" icon={ShieldAlert} variant="admin" />
              <NavAdmin />
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="px-3 py-3 border-t border-nina-wine/40">
        <div className={cn("flex items-center gap-2", collapsed ? "justify-center" : "justify-between")}>
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-7 w-7 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xs font-black text-white flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase() ?? "U"}
            </div>
            <div className="group-data-[collapsible=icon]:hidden min-w-0">
              <p className="text-xs font-bold text-white/90 truncate leading-tight">{user?.name ?? "Usuário"}</p>
              <p className="text-[10px] text-nina-orange font-bold">{user?.total_points ?? 0} pts</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="group-data-[collapsible=icon]:hidden h-7 w-7 text-white/30 hover:text-white hover:bg-white/10 flex-shrink-0 cursor-pointer"
            title="Sair"
          >
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
