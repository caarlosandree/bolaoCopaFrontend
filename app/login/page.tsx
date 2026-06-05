"use client"

import React, { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { LogIn, UserPlus } from "lucide-react"
import { login, register } from "@/lib/api"
import { setAuth } from "@/lib/auth"

type Mode = "login" | "register"

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>("login")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const data =
        mode === "login"
          ? await login(email, password)
          : await register(name, email, password)
      setAuth(data.token, data.user)
      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao entrar")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 text-center">
          <Image
            src="/logo-branca-nina.png"
            alt="Nina Logo"
            width={180}
            height={35}
            priority
            className="h-auto w-auto object-contain"
          />
          <div>
            <h1 className="mt-1 text-xl font-black tracking-tight text-white">
              BOLÃO DA COPA
            </h1>
            <p className="mt-0.5 text-xs text-slate-400">
              Copa do Mundo FIFA 2026 • Corporativo
            </p>
          </div>
        </div>

        <Card className="rounded-2xl border-slate-800 bg-slate-900 shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-bold text-slate-100">
              {mode === "login" ? "Entrar na conta" : "Criar conta"}
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              {mode === "login"
                ? "Use seu e-mail corporativo para acessar"
                : "Cadastre-se com seu e-mail corporativo"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "register" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Nome
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome completo"
                    required
                    className="border-slate-700 bg-slate-950 text-white placeholder-slate-500 focus-visible:ring-nina-red"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  E-mail
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@empresa.com"
                  required
                  className="border-slate-700 bg-slate-950 text-white placeholder-slate-500 focus-visible:ring-nina-red"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Senha
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                  className="border-slate-700 bg-slate-950 text-white placeholder-slate-500 focus-visible:ring-nina-red"
                />
              </div>

              {error && (
                <p className="rounded-lg border border-red-900/40 bg-red-950/30 px-3 py-2 text-xs text-red-400">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="h-11 w-full cursor-pointer rounded-xl bg-gradient-to-r from-nina-red to-nina-orange font-bold text-white shadow-lg shadow-nina-red/20 transition-all hover:opacity-90 active:scale-95"
              >
                {loading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : mode === "login" ? (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Entrar
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Criar conta
                  </>
                )}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  setMode(mode === "login" ? "register" : "login")
                  setError("")
                }}
                className="text-xs text-slate-400 transition-colors hover:text-slate-200"
              >
                {mode === "login"
                  ? "Não tem conta? Cadastre-se"
                  : "Já tem conta? Entrar"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
