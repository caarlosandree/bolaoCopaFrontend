"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getUser } from "@/lib/auth"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  useEffect(() => {
    const user = getUser()
    if (!user || user.role !== "admin") {
      router.replace("/dashboard")
    }
  }, [router])

  return <>{children}</>
}
