"use client"

import * as React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  LogOut,
  ShieldAlert,
  User,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react"
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
import { clearAuth, getUser, setAuth, getToken } from "@/lib/auth"
import { cn } from "@/lib/utils"
import { UserAvatar } from "@/components/ui/user-avatar"
import { AvatarUpload } from "@/components/avatar-upload"

function CollapseHandle() {
  const { state, toggleSidebar } = useSidebar()
  const collapsed = state === "collapsed"

  return (
    <button
      onClick={toggleSidebar}
      title={collapsed ? "Expandir sidebar" : "Recolher sidebar"}
      className={cn(
        "absolute top-1/2 -right-3 z-50 -translate-y-1/2",
        "h-6 w-6 rounded-full border border-nina-wine/60 bg-nina-wine-dark",
        "flex items-center justify-center",
        "text-white/60 hover:border-white/30 hover:bg-nina-wine hover:text-white",
        "cursor-pointer shadow-lg shadow-black/40 transition-all"
      )}
    >
      {collapsed ? (
        <PanelLeftOpen className="h-3 w-3" />
      ) : (
        <PanelLeftClose className="h-3 w-3" />
      )}
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
        "mx-2 mb-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5",
        "border text-[10px] font-bold tracking-wider uppercase",
        variant === "admin"
          ? "border-nina-orange/25 bg-nina-orange/10 text-nina-orange/90"
          : "border-white/10 bg-white/5 text-white/50"
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
  const [showAvatarUpload, setShowAvatarUpload] = React.useState(false)

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(getUser())
  }, [])

  const isAdmin = user?.role === "admin"

  function handleLogout() {
    clearAuth()
    router.push("/login")
  }

  function handleAvatarSuccess(avatarUrl: string) {
    if (!user) return
    const token = getToken()
    const updated = { ...user, avatar_url: avatarUrl }
    if (token) setAuth(token, updated)
    setUser(updated)
    setShowAvatarUpload(false)
  }

  return (
    <Sidebar
      collapsible="icon"
      style={
        {
          "--sidebar": "#3D0618",
          "--sidebar-border": "#6D0E2B66",
          "--sidebar-accent": "rgba(255,255,255,0.12)",
          "--sidebar-accent-foreground": "#ffffff",
        } as React.CSSProperties
      }
      className="border-r border-nina-wine/40"
    >
      {/* Trigger na borda */}
      <CollapseHandle />

      {/* Header */}
      <SidebarHeader className="border-b border-nina-wine/40 px-4 py-4 group-data-[collapsible=icon]:px-1 group-data-[collapsible=icon]:py-3">
        {/* Expandido */}
        <div className="flex flex-col gap-1 group-data-[collapsible=icon]:hidden">
          <Image
            src="/logo-branca-nina.png"
            alt="Nina Logo"
            width={160}
            height={32}
            priority
            className="h-auto w-full object-contain"
          />
          <span className="mt-0.5 text-center text-[9px] font-black tracking-widest text-white/30 uppercase">
            Bolão da Copa 2026
          </span>
        </div>
        {/* Colapsado */}
        <div className="hidden items-center justify-center group-data-[collapsible=icon]:flex">
          <Image
            src="/logo-nina.png"
            alt="Nina"
            width={48}
            height={48}
            priority
            className="h-auto w-full rounded-lg object-contain"
          />
        </div>
      </SidebarHeader>

      {/* Nav */}
      <SidebarContent className="gap-0 px-2 py-4">
        <SidebarGroup className="p-0">
          <SectionChip label="Jogador" icon={User} variant="default" />
          <NavJogador />
        </SidebarGroup>

        {isAdmin && (
          <>
            {/* Separador iluminado */}
            <div className="relative mx-3 my-4 h-px">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent blur-sm" />
            </div>
            <SidebarGroup className="p-0">
              <SectionChip
                label="Administrador"
                icon={ShieldAlert}
                variant="admin"
              />
              <NavAdmin />
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-nina-wine/40 px-3 py-3">
        {/* Popup de upload de avatar */}
        {showAvatarUpload && !collapsed && (
          <div className="mb-3 rounded-xl border border-white/10 bg-nina-wine-dark/80 p-4">
            <p className="mb-3 text-center text-xs font-bold text-white/70">
              Foto de Perfil
            </p>
            <AvatarUpload onSuccess={handleAvatarSuccess} />
            <button
              type="button"
              onClick={() => setShowAvatarUpload(false)}
              className="mt-2 w-full text-center text-[11px] text-white/40 hover:text-white/70"
            >
              Cancelar
            </button>
          </div>
        )}

        <div
          className={cn(
            "flex items-center gap-2",
            collapsed ? "justify-center" : "justify-between"
          )}
        >
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              title="Alterar foto de perfil"
              onClick={() => setShowAvatarUpload((v) => !v)}
              className="flex-shrink-0 cursor-pointer rounded-full transition-opacity group-data-[collapsible=icon]:pointer-events-none group-data-[collapsible=icon]:cursor-default hover:opacity-80"
            >
              <UserAvatar
                avatarUrl={user?.avatar_url}
                name={user?.name ?? "U"}
                size={28}
                className="border-white/20"
              />
            </button>
            <div className="min-w-0 group-data-[collapsible=icon]:hidden">
              <p className="truncate text-xs leading-tight font-bold text-white/90">
                {user?.name ?? "Usuário"}
              </p>
              <p className="text-[10px] font-bold text-nina-orange">
                {user?.total_points ?? 0} pts
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="h-7 w-7 flex-shrink-0 cursor-pointer text-white/30 group-data-[collapsible=icon]:hidden hover:bg-white/10 hover:text-white"
            title="Sair"
          >
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
