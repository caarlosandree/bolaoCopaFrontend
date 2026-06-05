"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Clock,
  Save,
  AlertCircle,
  TrendingUp,
  LogOut,
  Calendar,
  CheckCircle2,
  Lock,
} from "lucide-react"
import { getActiveRound, saveGuess } from "@/lib/api"
import { getUser, clearAuth, isLoggedIn } from "@/lib/auth"
import type { Match, Round } from "@/lib/types"

type GuessState = {
  homeGuess: string
  awayGuess: string
  saved: boolean
  loading: boolean
}

export default function DashboardPage() {
  const router = useRouter()
  const user = getUser()

  const [round, setRound] = useState<Round | null>(null)
  const [matches, setMatches] = useState<Match[]>([])
  const [guesses, setGuesses] = useState<Record<number, GuessState>>({})
  const [pageLoading, setPageLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())

  async function loadRound() {
    try {
      const data = await getActiveRound()
      setRound(data.round)
      setMatches(data.matches)

      const initialGuesses: Record<number, GuessState> = {}
      for (const m of data.matches) {
        if (m.user_guess) {
          initialGuesses[m.id] = {
            homeGuess: String(m.user_guess.home_guess),
            awayGuess: String(m.user_guess.away_guess),
            saved: true,
            loading: false,
          }
        }
      }
      setGuesses(initialGuesses)
    } catch {
      router.push("/login")
    } finally {
      setPageLoading(false)
    }
  }

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/login")
      return
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadRound()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  function handleInputChange(matchId: number, field: "homeGuess" | "awayGuess", value: string) {
    const clean = value.replace(/\D/g, "")
    setGuesses((prev) => ({
      ...prev,
      [matchId]: {
        ...(prev[matchId] ?? { homeGuess: "", awayGuess: "", saved: false, loading: false }),
        [field]: clean,
        saved: false,
      },
    }))
  }

  async function handleSave(matchId: number) {
    const g = guesses[matchId]
    if (!g || g.homeGuess === "" || g.awayGuess === "") return

    setGuesses((prev) => ({ ...prev, [matchId]: { ...prev[matchId], loading: true } }))
    try {
      await saveGuess(matchId, Number(g.homeGuess), Number(g.awayGuess))
      setGuesses((prev) => ({ ...prev, [matchId]: { ...prev[matchId], loading: false, saved: true } }))
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao salvar palpite")
      setGuesses((prev) => ({ ...prev, [matchId]: { ...prev[matchId], loading: false } }))
    }
  }

  function isLocked(match: Match): boolean {
    if (match.status !== "scheduled") return true
    const diff = new Date(match.match_time).getTime() - currentTime.getTime()
    return diff <= 5 * 60 * 1000
  }

  function formatCountdown(matchTime: string): string {
    const diff = new Date(matchTime).getTime() - currentTime.getTime()
    if (diff <= 0) return "Em andamento"
    const h = Math.floor(diff / 3600000)
    const m = Math.floor((diff % 3600000) / 60000)
    const s = Math.floor((diff % 60000) / 1000)
    return h > 0 ? `${h}h ${m}m` : `${m}m ${s}s`
  }

  function formatMatchDate(matchTime: string): string {
    return new Date(matchTime).toLocaleDateString("pt-BR", { day: "numeric", month: "short" })
  }

  function handleLogout() {
    clearAuth()
    router.push("/login")
  }

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-nina-red border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      {/* HEADER */}
      <header className="max-w-4xl mx-auto flex items-center justify-between border-b border-slate-800 pb-6 mb-8">
        <div className="flex items-center gap-4">
          <Image
            src="/logo-branca-nina.png"
            alt="Nina Logo"
            width={120}
            height={24}
            priority
            className="h-auto w-auto object-contain"
          />
          <div className="h-6 w-px bg-slate-800 hidden sm:block" />
          <div>
            <h1 className="text-lg md:text-xl font-black bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent tracking-tight">
              BOLÃO DA COPA
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">Copa do Mundo FIFA 2026 • Corporativo</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-3 bg-slate-900/60 border border-slate-800 rounded-full px-4 py-2">
            <div className="h-2 w-2 rounded-full bg-nina-green animate-pulse" />
            <span className="text-xs font-semibold">
              {user?.name ?? "Usuário"}{" "}
              <span className="text-nina-orange">{user?.total_points ?? 0} pts</span>
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/ranking")}
              className="text-slate-400 hover:text-white text-xs gap-1.5 cursor-pointer"
            >
              <TrendingUp className="h-4 w-4" />
              Ranking
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-slate-400 hover:text-white text-xs gap-1.5 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto space-y-6">
        {round ? (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-200">{round.name}</h2>
              <span className="text-xs bg-nina-wine/30 text-nina-red border border-nina-wine/40 px-3 py-1 rounded-full font-bold">
                Rodada Ativa
              </span>
            </div>

            {matches.length === 0 ? (
              <Card className="bg-slate-900/40 border border-slate-800 p-8 text-center rounded-2xl">
                <p className="text-slate-400 text-sm">Nenhuma partida nesta rodada.</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {matches.map((match) => {
                  const g = guesses[match.id] ?? { homeGuess: "", awayGuess: "", saved: false, loading: false }
                  const locked = isLocked(match)
                  const diffMs = new Date(match.match_time).getTime() - currentTime.getTime()
                  const minutesLeft = diffMs / 60000
                  const warning = minutesLeft > 0 && minutesLeft <= 15

                  return (
                    <Card
                      key={match.id}
                      className={`relative overflow-hidden bg-gradient-to-r from-slate-900/90 to-slate-950 border transition-all duration-300 ${
                        locked
                          ? "border-slate-800/60"
                          : warning
                            ? "border-amber-500/50 shadow-md shadow-amber-500/5"
                            : "border-slate-800 hover:border-nina-red/30"
                      }`}
                    >
                      {/* Barra de status */}
                      <div
                        className={`h-[3px] w-full absolute top-0 left-0 ${
                          match.status === "finished"
                            ? "bg-slate-700"
                            : locked
                              ? "bg-red-500/60"
                              : warning
                                ? "bg-amber-400 animate-pulse"
                                : "bg-nina-red/50"
                        }`}
                      />

                      <CardContent className="p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        {/* Metadados */}
                        <div className="flex flex-row md:flex-col items-center md:items-start justify-between md:justify-center gap-1.5 border-b border-slate-800/50 md:border-b-0 pb-3 md:pb-0 md:min-w-[140px]">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatMatchDate(match.match_time)}
                          </div>

                          {match.status === "finished" ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-slate-800 text-slate-300 rounded-full px-2.5 py-0.5 mt-1 border border-slate-700/50">
                              <CheckCircle2 className="h-3 w-3 text-slate-400" />
                              Finalizado
                            </span>
                          ) : locked ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-red-950/40 text-red-400 rounded-full px-2.5 py-0.5 mt-1 border border-red-900/30">
                              <Lock className="h-3 w-3" />
                              Bloqueado
                            </span>
                          ) : (
                            <span
                              className={`inline-flex items-center gap-1 text-[11px] font-bold rounded-full px-2.5 py-0.5 mt-1 border ${
                                warning
                                  ? "bg-amber-950/55 text-amber-400 border-amber-900/40 animate-pulse"
                                  : "bg-nina-wine/20 text-nina-red border-nina-wine/30"
                              }`}
                            >
                              <Clock className="h-3 w-3" />
                              Fecha em {formatCountdown(match.match_time)}
                            </span>
                          )}
                        </div>

                        {/* Times e inputs */}
                        <div className="flex items-center justify-center flex-1 gap-4 md:gap-8 py-2">
                          <div className="flex items-center justify-end gap-3 flex-1">
                            <span className="text-sm md:text-base font-bold text-slate-200 truncate max-w-[90px] md:max-w-none">
                              {match.home_team}
                            </span>
                            <div className="h-8 w-8 rounded-full bg-nina-wine/30 border border-nina-wine/50 flex items-center justify-center text-[10px] font-black text-slate-200">
                              {match.home_team.substring(0, 2).toUpperCase()}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Input
                              type="text"
                              maxLength={2}
                              disabled={locked}
                              value={match.status === "finished" ? String(match.home_score ?? "-") : g.homeGuess}
                              onChange={(e) => handleInputChange(match.id, "homeGuess", e.target.value)}
                              className={`h-11 w-11 md:h-12 md:w-12 text-center text-lg font-black p-0 border rounded-lg transition-all ${
                                locked
                                  ? "bg-slate-950 text-slate-400 border-slate-800 cursor-not-allowed opacity-60"
                                  : "bg-slate-900 text-white border-slate-700 hover:border-nina-red/50 focus:border-nina-red"
                              }`}
                              placeholder="-"
                            />
                            <span className="text-slate-600 font-extrabold text-sm px-0.5">x</span>
                            <Input
                              type="text"
                              maxLength={2}
                              disabled={locked}
                              value={match.status === "finished" ? String(match.away_score ?? "-") : g.awayGuess}
                              onChange={(e) => handleInputChange(match.id, "awayGuess", e.target.value)}
                              className={`h-11 w-11 md:h-12 md:w-12 text-center text-lg font-black p-0 border rounded-lg transition-all ${
                                locked
                                  ? "bg-slate-950 text-slate-400 border-slate-800 cursor-not-allowed opacity-60"
                                  : "bg-slate-900 text-white border-slate-700 hover:border-nina-red/50 focus:border-nina-red"
                              }`}
                              placeholder="-"
                            />
                          </div>

                          <div className="flex items-center justify-start gap-3 flex-1">
                            <div className="h-8 w-8 rounded-full bg-nina-wine/30 border border-nina-wine/50 flex items-center justify-center text-[10px] font-black text-slate-200">
                              {match.away_team.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="text-sm md:text-base font-bold text-slate-200 truncate max-w-[90px] md:max-w-none">
                              {match.away_team}
                            </span>
                          </div>
                        </div>

                        {/* Ação / pontos */}
                        <div className="flex items-center justify-center md:min-w-[120px]">
                          {match.status === "finished" ? (
                            <div className="text-center bg-nina-wine/20 border border-nina-wine/30 px-4 py-2 rounded-xl">
                              {match.user_guess?.points_earned !== undefined ? (
                                <>
                                  <span className="text-[10px] uppercase font-bold text-nina-orange block tracking-wider">Pontos</span>
                                  <span className="text-lg font-extrabold text-nina-red">
                                    +{match.user_guess.points_earned} pts
                                  </span>
                                </>
                              ) : (
                                <span className="text-xs text-slate-400">Sem palpite</span>
                              )}
                            </div>
                          ) : locked ? (
                            <div className="text-center text-slate-500 border border-slate-800/60 bg-slate-900/20 px-4 py-2.5 rounded-xl w-full">
                              <span className="text-[10px] uppercase font-bold block">Fechado</span>
                              <span className="text-xs font-semibold text-slate-400">
                                {g.homeGuess || g.awayGuess
                                  ? `Palpite: ${g.homeGuess || 0}x${g.awayGuess || 0}`
                                  : "Sem palpite"}
                              </span>
                            </div>
                          ) : (
                            <Button
                              onClick={() => handleSave(match.id)}
                              disabled={g.saved || g.loading || !g.homeGuess || !g.awayGuess}
                              className={`w-full font-bold text-xs h-10 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                g.saved
                                  ? "bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-900 cursor-default"
                                  : "bg-gradient-to-r from-nina-red to-nina-orange hover:opacity-90 text-white shadow-lg shadow-nina-red/20 active:scale-95"
                              }`}
                            >
                              {g.loading ? (
                                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : g.saved ? (
                                <>
                                  <CheckCircle2 className="h-4 w-4 text-nina-green" />
                                  Salvo
                                </>
                              ) : (
                                <>
                                  <Save className="h-4 w-4" />
                                  Salvar
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </>
        ) : (
          <Card className="bg-slate-900/40 border border-slate-800 p-10 text-center rounded-2xl">
            <AlertCircle className="h-8 w-8 text-nina-red/60 mx-auto mb-3" />
            <h3 className="font-bold text-slate-200">Nenhuma rodada ativa</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Os palpites serão abertos assim que o administrador ativar uma rodada.
            </p>
          </Card>
        )}

        <footer className="bg-slate-900/20 border border-slate-900 rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-nina-red/60 flex-shrink-0" />
            <span>Placar Exato = 5 pts | Saldo + Vencedor = 3 pts | Vencedor = 2 pts</span>
          </div>
        </footer>
      </main>
    </div>
  )
}
