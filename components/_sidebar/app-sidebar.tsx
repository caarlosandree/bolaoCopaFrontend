"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { LogOut, ShieldAlert, User, PanelLeftClose, PanelLeftOpen } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarSeparator,
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
          ? "text-nina-purple/90 bg-nina-purple/10 border-nina-purple/25"
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
  const user = getUser()
  const isAdmin = user?.role === "admin"
  const collapsed = state === "collapsed"

  function handleLogout() {
    clearAuth()
    router.push("/login")
  }

  return (
    <Sidebar
      collapsible="icon"
      style={{ "--sidebar": "#3D0618", "--sidebar-border": "#6D0E2B66" } as React.CSSProperties}
      className="border-r border-nina-wine/40"
    >
      {/* Trigger na borda */}
      <CollapseHandle />

      {/* Header — logo */}
      <SidebarHeader className="px-4 py-4 border-b border-nina-wine/40">
        <div className="flex items-center gap-3 min-w-0">
          {/* Ícone compacto sempre visível */}
          <div className="h-8 w-8 rounded-lg bg-nina-wine/60 border border-nina-wine/40 flex items-center justify-center flex-shrink-0">
            <span className="text-sm leading-none">⚽</span>
          </div>
          {/* Logo e subtítulo — ocultam ao colapsar */}
          <div className="group-data-[collapsible=icon]:hidden flex flex-col min-w-0 overflow-hidden">
            <Image
              src="/logo-branca-nina.png"
              alt="Nina Logo"
              width={100}
              height={20}
              priority
              className="h-auto w-auto object-contain"
            />
            <span className="text-[9px] font-black text-white/30 uppercase tracking-widest mt-0.5">
              Bolão da Copa 2026
            </span>
          </div>
        </div>
      </SidebarHeader>

      {/* Nav */}
      <SidebarContent className="px-2 py-4 gap-0">
        {/* Seção Jogador */}
        <SidebarGroup className="p-0">
          <SectionChip label="Jogador" icon={User} variant="default" />
          <NavJogador />
        </SidebarGroup>

        {/* Seção Admin */}
        {isAdmin && (
          <>
            <SidebarSeparator className="my-3 bg-nina-wine/40" />
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
