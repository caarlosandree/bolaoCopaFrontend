"use client"

import React, { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
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
            <h1 className="text-xl font-black text-white tracking-tight mt-1">BOLÃO DA COPA</h1>
            <p className="text-xs text-slate-400 mt-0.5">Copa do Mundo FIFA 2026 • Corporativo</p>
          </div>
        </div>

        <Card className="bg-slate-900 border-slate-800 rounded-2xl shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-slate-100 text-base font-bold">
              {mode === "login" ? "Entrar na conta" : "Criar conta"}
            </CardTitle>
            <CardDescription className="text-slate-400 text-xs">
              {mode === "login"
                ? "Use seu e-mail corporativo para acessar"
                : "Cadastre-se com seu e-mail corporativo"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "register" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Nome</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome completo"
                    required
                    className="bg-slate-950 border-slate-700 text-white placeholder-slate-500 focus-visible:ring-nina-red"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">E-mail</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@empresa.com"
                  required
                  className="bg-slate-950 border-slate-700 text-white placeholder-slate-500 focus-visible:ring-nina-red"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Senha</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                  className="bg-slate-950 border-slate-700 text-white placeholder-slate-500 focus-visible:ring-nina-red"
                />
              </div>

              {error && (
                <p className="text-xs text-red-400 bg-red-950/30 border border-red-900/40 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 font-bold bg-gradient-to-r from-nina-red to-nina-orange hover:opacity-90 text-white rounded-xl shadow-lg shadow-nina-red/20 active:scale-95 transition-all cursor-pointer"
              >
                {loading ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : mode === "login" ? (
                  <>
                    <LogIn className="h-4 w-4 mr-2" />
                    Entrar
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
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
                className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
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
