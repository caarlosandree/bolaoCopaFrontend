"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/_sidebar/app-sidebar"
import { isLoggedIn } from "@/lib/auth"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/login")
    }
  }, [router])

  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex flex-col flex-1 min-h-screen bg-slate-950">
        {/* Topbar mobile */}
        <header className="flex md:hidden items-center gap-3 px-4 py-3 border-b border-slate-800/60 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
          <SidebarTrigger className="text-slate-400 hover:text-white" />
          <div className="h-5 w-px bg-slate-800" />
          <p className="text-sm font-black text-white tracking-tight">BOLÃO DA COPA</p>
        </header>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </SidebarProvider>
  )
}
