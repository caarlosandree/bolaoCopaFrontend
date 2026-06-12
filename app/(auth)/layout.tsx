"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/_sidebar/app-sidebar"
import { isLoggedIn, getToken, setAuth } from "@/lib/auth"
import { getMe } from "@/lib/api"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/login")
      return
    }
    // Sincroniza o usuário em cache com o servidor para não ficar com dados velhos
    // (ex: avatar_url desatualizado após migração de armazenamento)
    const token = getToken()
    getMe()
      .then((user) => {
        if (token) setAuth(token, user)
      })
      .catch(() => {
        // Silencia erros de rede — o cache existente é usado como fallback
      })
  }, [router])

  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex min-h-screen flex-1 flex-col bg-slate-950">
        {/* Topbar mobile */}
        <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-slate-800/60 bg-slate-900/80 px-4 py-3 backdrop-blur-sm md:hidden">
          <SidebarTrigger className="text-slate-400 hover:text-white" />
          <div className="h-5 w-px bg-slate-800" />
          <p className="text-sm font-black tracking-tight text-white">
            BOLÃO DA COPA
          </p>
        </header>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </SidebarProvider>
  )
}
