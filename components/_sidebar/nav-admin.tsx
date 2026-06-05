"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { CalendarPlus, ClipboardList, Users, Layers } from "lucide-react"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

const items = [
  { label: "Jogos", href: "/admin/jogos", icon: CalendarPlus },
  { label: "Resultados", href: "/admin/resultados", icon: ClipboardList },
  { label: "Usuários", href: "/admin/usuarios", icon: Users },
  { label: "Rodadas", href: "/admin/rodadas", icon: Layers },
]

export function NavAdmin() {
  const pathname = usePathname()

  return (
    <SidebarMenu>
      {items.map(({ label, href, icon: Icon }) => {
        const active = pathname === href
        return (
          <SidebarMenuItem key={href}>
            <SidebarMenuButton
              asChild
              isActive={active}
              className={cn(
                "group h-10 rounded-xl font-semibold text-sm transition-all",
                active
                  ? "bg-gradient-to-r from-nina-wine to-nina-purple text-white shadow-md shadow-nina-purple/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60",
              )}
            >
              <Link href={href} className="flex items-center gap-3">
                <Icon
                  className={cn(
                    "h-4 w-4 flex-shrink-0 transition-colors",
                    active ? "text-white" : "text-slate-500 group-hover:text-slate-300",
                  )}
                />
                {label}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}
