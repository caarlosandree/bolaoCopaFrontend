"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { LogOut, ShieldAlert } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { NavJogador } from "./nav-jogador"
import { NavAdmin } from "./nav-admin"
import { clearAuth, getUser } from "@/lib/auth"

export function AppSidebar() {
  const router = useRouter()
  const user = getUser()
  const isAdmin = user?.role === "admin"

  function handleLogout() {
    clearAuth()
    router.push("/login")
  }

  return (
    <Sidebar
      style={{ "--sidebar": "#3D0618", "--sidebar-border": "#6D0E2B66" } as React.CSSProperties}
      className="border-r border-nina-wine/40"
    >
      {/* Header — logo Nina */}
      <SidebarHeader className="px-5 py-5 border-b border-nina-wine/40">
        <div className="flex flex-col gap-2">
          <Image
            src="/logo-branca-nina.png"
            alt="Nina Logo"
            width={110}
            height={22}
            priority
            className="h-auto w-auto object-contain"
          />
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">
              Bolão da Copa 2026
            </span>
          </div>
        </div>
      </SidebarHeader>

      {/* Nav */}
      <SidebarContent className="px-3 py-4 gap-0">
        {/* Seção Jogador */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-2 mb-1">
            Jogador
          </SidebarGroupLabel>
          <NavJogador />
        </SidebarGroup>

        {/* Seção Admin — só para admins */}
        {isAdmin && (
          <>
            <SidebarSeparator className="my-4 bg-nina-wine/40" />
            <SidebarGroup>
              <SidebarGroupLabel className="flex items-center gap-1.5 text-[10px] font-bold text-nina-purple/70 uppercase tracking-widest px-2 mb-1">
                <ShieldAlert className="h-3 w-3" />
                Administrador
              </SidebarGroupLabel>
              <NavAdmin />
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="px-4 py-4 border-t border-nina-wine/40">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-8 w-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xs font-black text-white flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase() ?? "U"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white/90 truncate leading-tight">{user?.name ?? "Usuário"}</p>
              <p className="text-[10px] text-nina-orange font-bold">{user?.total_points ?? 0} pts</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="h-8 w-8 text-white/30 hover:text-white hover:bg-white/10 flex-shrink-0 cursor-pointer"
            title="Sair"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
