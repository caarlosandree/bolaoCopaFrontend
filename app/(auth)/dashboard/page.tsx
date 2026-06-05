"use client"

import React, { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Clock,
  AlertCircle,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Lock,
  RotateCcw,
  Target,
  Trophy,
} from "lucide-react"
import { getActiveRound, saveGuess } from "@/lib/api"
import { isLoggedIn } from "@/lib/auth"
import { useRouter } from "next/navigation"
import type { Match, Round } from "@/lib/types"
import { TeamFlag } from "@/components/ui/team-flag"
import { RoundPanel } from "@/components/round-panel"

type GuessState = {
  homeGuess: string
  awayGuess: string
  saved: boolean
  loading: boolean
  error: string | null
}

export default function DashboardPage() {
  const router = useRouter()
  const [round, setRound] = useState<Round | null>(null)
  const [matches, setMatches] = useState<Match[]>([])
  const [guesses, setGuesses] = useState<Record<number, GuessState>>({})
  const [pageLoading, setPageLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())
  const debounceTimers = useRef<Record<number, ReturnType<typeof setTimeout>>>(
    {}
  )

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
            error: null,
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

  useEffect(() => {
    const timers = debounceTimers.current
    return () => Object.values(timers).forEach(clearTimeout)
  }, [])

  function handleInputChange(
    matchId: number,
    field: "homeGuess" | "awayGuess",
    value: string
  ) {
    const clean = value.replace(/\D/g, "")
    const current = guesses[matchId] ?? {
      homeGuess: "",
      awayGuess: "",
      saved: false,
      loading: false,
      error: null,
    }
    const newHome = field === "homeGuess" ? clean : current.homeGuess
    const newAway = field === "awayGuess" ? clean : current.awayGuess

    setGuesses((prev) => ({
      ...prev,
      [matchId]: {
        ...current,
        ...prev[matchId],
        [field]: clean,
        saved: false,
        error: null,
      },
    }))

    if (debounceTimers.current[matchId]) {
      clearTimeout(debounceTimers.current[matchId])
    }

    if (newHome !== "" && newAway !== "") {
      debounceTimers.current[matchId] = setTimeout(() => {
        autoSave(matchId, Number(newHome), Number(newAway))
      }, 800)
    }
  }

  async function autoSave(matchId: number, home: number, away: number) {
    setGuesses((prev) => ({
      ...prev,
      [matchId]: { ...prev[matchId], loading: true, error: null },
    }))
    try {
      await saveGuess(matchId, home, away)
      setGuesses((prev) => ({
        ...prev,
        [matchId]: {
          ...prev[matchId],
          loading: false,
          saved: true,
          error: null,
        },
      }))
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao salvar"
      setGuesses((prev) => ({
        ...prev,
        [matchId]: {
          ...prev[matchId],
          loading: false,
          saved: false,
          error: message,
        },
      }))
    }
  }

  async function handleSave(matchId: number) {
    const g = guesses[matchId]
    if (!g || g.homeGuess === "" || g.awayGuess === "") return
    await autoSave(matchId, Number(g.homeGuess), Number(g.awayGuess))
  }

  async function handleConfirmAll() {
    const pending = matches.filter((m) => {
      const g = guesses[m.id]
      return (
        g &&
        !g.saved &&
        !isLocked(m) &&
        g.homeGuess !== "" &&
        g.awayGuess !== ""
      )
    })
    await Promise.all(
      pending.map((m) => {
        const g = guesses[m.id]
        return autoSave(m.id, Number(g.homeGuess), Number(g.awayGuess))
      })
    )
  }

  function isLocked(match: Match): boolean {
    if (match.status !== "scheduled") return true
    const diff = new Date(match.match_time).getTime() - currentTime.getTime()
    return diff <= 10 * 60 * 1000
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
    return new Date(matchTime).toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "short",
    })
  }

  function getScoreReveal(pts: number): {
    icon: string
    message: string
    colorClass: string
    borderClass: string
    bgClass: string
  } {
    if (pts === 5)
      return {
        icon: "🎯",
        message: "Placar exato!",
        colorClass: "text-green-300",
        borderClass: "border-green-900/40",
        bgClass: "bg-green-950/30",
      }
    if (pts === 3)
      return {
        icon: "✅",
        message: "Vencedor e saldo corretos!",
        colorClass: "text-blue-300",
        borderClass: "border-blue-900/40",
        bgClass: "bg-blue-950/30",
      }
    if (pts === 2)
      return {
        icon: "👍",
        message: "Acertou o vencedor!",
        colorClass: "text-amber-300",
        borderClass: "border-amber-900/40",
        bgClass: "bg-amber-950/30",
      }
    return {
      icon: "❌",
      message: "Resultado errado",
      colorClass: "text-slate-400",
      borderClass: "border-slate-800/40",
      bgClass: "bg-slate-950/40",
    }
  }

  const palpitedCount = matches.filter(
    (m) => guesses[m.id]?.saved === true
  ).length

  if (pageLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-nina-red border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      {/* Header full-width da rodada */}
      {round && matches.length > 0 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-400" />
              <span className="text-sm font-black text-white">
                Copa do Mundo 2026
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-3.5 w-3.5 text-nina-red" />
              <span className="text-sm font-bold text-slate-300">
                {round.name}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-green-700 to-green-500 transition-all duration-500"
                style={{
                  width:
                    matches.length > 0
                      ? `${(palpitedCount / matches.length) * 100}%`
                      : "0%",
                }}
              />
            </div>
            <span className="flex-shrink-0 text-xs font-bold text-slate-400 tabular-nums">
              {palpitedCount === matches.length && matches.length > 0
                ? "🏆 Tudo palpitado!"
                : `${palpitedCount} de ${matches.length} palpitados`}
            </span>
          </div>
        </div>
      )}

      {/* Layout principal: grid de cards + painel lateral */}
      {round ? (
        <div className="flex flex-col items-start gap-6 lg:flex-row">
          {/* Área principal: grid de partidas */}
          <div className="min-w-0 flex-1">
            {matches.length === 0 ? (
              <Card className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-center">
                <p className="text-sm text-slate-400">
                  Nenhuma partida nesta rodada.
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {matches.map((match) => {
                  const g = guesses[match.id] ?? {
                    homeGuess: "",
                    awayGuess: "",
                    saved: false,
                    loading: false,
                  }
                  const locked = isLocked(match)
                  const diffMs =
                    new Date(match.match_time).getTime() - currentTime.getTime()
                  const minutesLeft = diffMs / 60000
                  const warning = minutesLeft > 0 && minutesLeft <= 15

                  const cardStyle =
                    !locked && match.status === "scheduled"
                      ? {
                          backgroundImage:
                            "repeating-linear-gradient(160deg, transparent, transparent 24px, rgba(26,122,58,0.04) 24px, rgba(26,122,58,0.04) 48px)",
                        }
                      : {}

                  return (
                    <Card
                      key={match.id}
                      style={cardStyle}
                      className={`relative overflow-hidden border bg-slate-900/80 backdrop-blur-md transition-all duration-300 ${
                        match.status === "finished"
                          ? "border-slate-800/40"
                          : locked
                            ? "border-slate-800/40 opacity-90"
                            : warning
                              ? "animate-pulse-slow border-amber-500/40 shadow-lg shadow-amber-500/5"
                              : "border-green-900/60 hover:border-green-700/60 hover:shadow-xl hover:shadow-green-900/10"
                      }`}
                    >
                      {/* Borda superior colorida por estado */}
                      <div
                        className={`absolute top-0 left-0 h-1 w-full transition-colors duration-300 ${
                          match.status === "finished"
                            ? "bg-slate-700/60"
                            : locked
                              ? "bg-red-800/50"
                              : warning
                                ? "animate-pulse bg-gradient-to-r from-amber-500 to-orange-500"
                                : "bg-gradient-to-r from-green-700 to-green-500"
                        }`}
                      />

                      <CardContent className="flex flex-col gap-4 p-4 pt-5">
                        {/* Zona 1: Meta-info */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                            <Calendar className="h-3 w-3" />
                            {formatMatchDate(match.match_time)}
                          </div>

                          {match.status === "finished" ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-slate-800/80 bg-slate-900/60 px-2.5 py-0.5 text-[10px] font-extrabold text-slate-400">
                              <CheckCircle2 className="h-3 w-3" />
                              Finalizado
                            </span>
                          ) : locked ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-red-900/30 bg-red-950/40 px-2.5 py-0.5 text-[10px] font-extrabold text-red-400">
                              <Lock className="h-3 w-3" />
                              Bloqueado
                            </span>
                          ) : (
                            <span
                              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold ${
                                warning
                                  ? "animate-pulse border-amber-900/40 bg-amber-950/40 text-amber-400"
                                  : "border-green-900/40 bg-green-950/30 text-green-400"
                              }`}
                            >
                              <Clock className="h-3 w-3" />
                              Fecha em {formatCountdown(match.match_time)}
                            </span>
                          )}
                        </div>

                        {/* Zona 2: Confronto — bandeiras + inputs */}
                        <div className="flex items-center justify-between gap-2">
                          {/* Mandante */}
                          <div className="flex min-w-0 flex-1 flex-col items-center gap-2">
                            <TeamFlag
                              teamName={match.home_team}
                              className="h-12 w-12 border border-white/10 shadow-lg"
                            />
                            <span className="w-full truncate text-center text-xs font-extrabold text-white">
                              {match.home_team}
                            </span>
                          </div>

                          {/* Inputs */}
                          <div className="flex flex-shrink-0 flex-col items-center gap-1">
                            <div className="flex items-center gap-1.5 rounded-2xl border border-slate-800/80 bg-slate-950/70 p-1.5 shadow-inner">
                              <Input
                                type="text"
                                maxLength={2}
                                inputMode="numeric"
                                pattern="[0-9]*"
                                disabled={locked}
                                value={
                                  match.status === "finished"
                                    ? String(match.home_score ?? "-")
                                    : g.homeGuess
                                }
                                onChange={(e) =>
                                  handleInputChange(
                                    match.id,
                                    "homeGuess",
                                    e.target.value
                                  )
                                }
                                className={`h-12 w-12 rounded-xl border-0 p-0 text-center text-xl font-black transition-all ${
                                  locked
                                    ? "cursor-not-allowed bg-transparent text-slate-500 opacity-60"
                                    : "bg-slate-900 text-white focus:ring-1 focus:ring-green-600/50"
                                }`}
                                placeholder="-"
                              />
                              <span className="text-sm font-black text-slate-600 select-none">
                                ×
                              </span>
                              <Input
                                type="text"
                                maxLength={2}
                                inputMode="numeric"
                                pattern="[0-9]*"
                                disabled={locked}
                                value={
                                  match.status === "finished"
                                    ? String(match.away_score ?? "-")
                                    : g.awayGuess
                                }
                                onChange={(e) =>
                                  handleInputChange(
                                    match.id,
                                    "awayGuess",
                                    e.target.value
                                  )
                                }
                                className={`h-12 w-12 rounded-xl border-0 p-0 text-center text-xl font-black transition-all ${
                                  locked
                                    ? "cursor-not-allowed bg-transparent text-slate-500 opacity-60"
                                    : "bg-slate-900 text-white focus:ring-1 focus:ring-green-600/50"
                                }`}
                                placeholder="-"
                              />
                            </div>
                          </div>

                          {/* Visitante */}
                          <div className="flex min-w-0 flex-1 flex-col items-center gap-2">
                            <TeamFlag
                              teamName={match.away_team}
                              className="h-12 w-12 border border-white/10 shadow-lg"
                            />
                            <span className="w-full truncate text-center text-xs font-extrabold text-white">
                              {match.away_team}
                            </span>
                          </div>
                        </div>

                        {/* Zona 3: Status / Auto-save */}
                        <div className="border-t border-slate-800/60 pt-3">
                          {match.status === "finished" ? (
                            match.user_guess?.points_earned !== undefined ? (
                              (() => {
                                const reveal = getScoreReveal(
                                  match.user_guess.points_earned
                                )
                                return (
                                  <div
                                    className={`w-full rounded-xl border ${reveal.borderClass} ${reveal.bgClass} px-3 py-2`}
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <div className="flex min-w-0 items-center gap-1.5">
                                        <span className="flex-shrink-0 text-base">
                                          {reveal.icon}
                                        </span>
                                        <span
                                          className={`truncate text-xs font-bold ${reveal.colorClass}`}
                                        >
                                          {reveal.message}
                                        </span>
                                      </div>
                                      <span className="flex-shrink-0 text-sm font-black text-white">
                                        +{match.user_guess.points_earned} pts
                                      </span>
                                    </div>
                                    <p className="mt-1 text-[10px] text-slate-500">
                                      Seu palpite: {match.user_guess.home_guess}{" "}
                                      × {match.user_guess.away_guess}
                                    </p>
                                  </div>
                                )
                              })()
                            ) : (
                              <div className="w-full rounded-xl border border-slate-800/40 bg-slate-950/40 px-3 py-2 text-center">
                                <span className="text-xs font-bold text-slate-600">
                                  — Sem palpite registrado
                                </span>
                              </div>
                            )
                          ) : locked ? (
                            <div className="w-full rounded-xl border border-slate-800/40 bg-slate-950/40 px-4 py-2 text-center">
                              <span className="mb-0.5 block text-[9px] font-black tracking-wider text-slate-500 uppercase">
                                Palpite registrado
                              </span>
                              <span className="text-xs font-bold text-slate-300">
                                {g.homeGuess !== "" || g.awayGuess !== ""
                                  ? `${g.homeGuess || 0} × ${g.awayGuess || 0}`
                                  : "Sem palpite"}
                              </span>
                            </div>
                          ) : g.loading ? (
                            <div className="flex items-center justify-center gap-2 py-1.5 text-xs text-slate-400">
                              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
                              Salvando...
                            </div>
                          ) : g.error ? (
                            <div className="flex items-center justify-between gap-2 rounded-xl border border-amber-900/30 bg-amber-950/20 px-3 py-2">
                              <div className="flex items-center gap-1.5 text-xs text-amber-400">
                                <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                                <span className="truncate">{g.error}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSave(match.id)}
                                className="h-6 cursor-pointer gap-1 px-2 text-[10px] font-bold text-amber-400 hover:bg-amber-950/40 hover:text-amber-300"
                              >
                                <RotateCcw className="h-3 w-3" />
                                Tentar
                              </Button>
                            </div>
                          ) : g.saved ? (
                            <div className="flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold text-green-400">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Salvo
                            </div>
                          ) : (
                            <div className="py-1.5 text-center text-[11px] text-slate-600">
                              Preencha o placar para salvar automaticamente
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>

          {/* Painel lateral */}
          <aside className="sticky top-8 hidden w-72 flex-shrink-0 self-start lg:block">
            <RoundPanel
              roundName={round.name}
              matches={matches}
              palpitedCount={palpitedCount}
              guesses={guesses}
              onConfirmAll={handleConfirmAll}
            />
          </aside>
        </div>
      ) : (
        <Card className="rounded-2xl border border-slate-800 bg-slate-900/40 p-10 text-center">
          <AlertCircle className="mx-auto mb-3 h-8 w-8 text-nina-red/60" />
          <h3 className="font-bold text-slate-200">Nenhuma rodada ativa</h3>
          <p className="mx-auto mt-1 max-w-sm text-xs text-slate-400">
            Os palpites serão abertos assim que o administrador ativar uma
            rodada.
          </p>
        </Card>
      )}
    </div>
  )
}
