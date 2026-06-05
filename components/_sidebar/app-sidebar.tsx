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
    <Sidebar className="border-r border-slate-800/60 bg-slate-900">
      {/* Header */}
      <SidebarHeader className="px-4 py-5 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-nina-wine to-nina-purple flex items-center justify-center flex-shrink-0 shadow-lg shadow-nina-purple/20">
            <span className="text-white text-base">⚽</span>
          </div>
          <div>
            <p className="font-black text-sm text-white tracking-tight leading-tight">BOLÃO DA COPA</p>
            <p className="text-[10px] text-slate-500 font-medium">Copa do Mundo 2026</p>
          </div>
        </div>
      </SidebarHeader>

      {/* Nav */}
      <SidebarContent className="px-3 py-4 gap-0">
        {/* Seção Jogador */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 mb-1">
            Jogador
          </SidebarGroupLabel>
          <NavJogador />
        </SidebarGroup>

        {/* Seção Admin — só para admins */}
        {isAdmin && (
          <>
            <SidebarSeparator className="my-4 bg-slate-800/60" />
            <SidebarGroup>
              <SidebarGroupLabel className="flex items-center gap-1.5 text-[10px] font-bold text-nina-purple/80 uppercase tracking-widest px-2 mb-1">
                <ShieldAlert className="h-3 w-3" />
                Administrador
              </SidebarGroupLabel>
              <NavAdmin />
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="px-4 py-4 border-t border-slate-800/60">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-8 w-8 rounded-full bg-nina-wine/30 border border-nina-wine/50 flex items-center justify-center text-xs font-black text-slate-200 flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase() ?? "U"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-200 truncate leading-tight">{user?.name ?? "Usuário"}</p>
              <p className="text-[10px] text-nina-orange font-bold">{user?.total_points ?? 0} pts</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="h-8 w-8 text-slate-500 hover:text-white hover:bg-slate-800/60 flex-shrink-0 cursor-pointer"
            title="Sair"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
