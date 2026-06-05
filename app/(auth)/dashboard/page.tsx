"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Clock,
  Save,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Lock,
  Target,
  Trophy,
} from "lucide-react"
import { getActiveRound, saveGuess } from "@/lib/api"
import { isLoggedIn } from "@/lib/auth"
import { useRouter } from "next/navigation"
import type { Match, Round } from "@/lib/types"
import { TeamFlag } from "@/components/ui/team-flag"

type GuessState = {
  homeGuess: string
  awayGuess: string
  saved: boolean
  loading: boolean
}

export default function DashboardPage() {
  const router = useRouter()
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

  function handleInputChange(
    matchId: number,
    field: "homeGuess" | "awayGuess",
    value: string
  ) {
    const clean = value.replace(/\D/g, "")
    setGuesses((prev) => ({
      ...prev,
      [matchId]: {
        ...(prev[matchId] ?? {
          homeGuess: "",
          awayGuess: "",
          saved: false,
          loading: false,
        }),
        [field]: clean,
        saved: false,
      },
    }))
  }

  async function handleSave(matchId: number) {
    const g = guesses[matchId]
    if (!g || g.homeGuess === "" || g.awayGuess === "") return

    setGuesses((prev) => ({
      ...prev,
      [matchId]: { ...prev[matchId], loading: true },
    }))
    try {
      await saveGuess(matchId, Number(g.homeGuess), Number(g.awayGuess))
      setGuesses((prev) => ({
        ...prev,
        [matchId]: { ...prev[matchId], loading: false, saved: true },
      }))
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao salvar palpite")
      setGuesses((prev) => ({
        ...prev,
        [matchId]: { ...prev[matchId], loading: false },
      }))
    }
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

                  return (
                    <Card
                      key={match.id}
                      className={`relative overflow-hidden border bg-gradient-to-r from-slate-950/80 via-slate-900/60 to-slate-950/80 backdrop-blur-md transition-all duration-300 ${
                        locked
                          ? "border-slate-800/40 opacity-95"
                          : warning
                            ? "animate-pulse-slow border-amber-500/40 shadow-lg shadow-amber-500/5"
                            : "border-slate-800/80 hover:border-nina-red/40 hover:shadow-xl hover:shadow-nina-red/5"
                      }`}
                    >
                      {/* Linha indicadora premium no topo do card */}
                      <div
                        className={`absolute top-0 left-0 h-[3px] w-full transition-colors duration-300 ${
                          match.status === "finished"
                            ? "bg-slate-800"
                            : locked
                              ? "bg-red-500/40"
                              : warning
                                ? "animate-pulse bg-gradient-to-r from-amber-500 to-orange-500"
                                : "bg-gradient-to-r from-nina-red to-nina-orange"
                        }`}
                      />

                      <CardContent className="flex flex-col justify-between gap-4 p-4 md:flex-row md:items-center md:gap-6 md:p-6">
                        {/* Data / Status do Jogo */}
                        <div className="flex flex-row items-center justify-between gap-2 border-b border-slate-800/50 pb-3 md:min-w-[150px] md:flex-col md:items-start md:justify-center md:border-b-0 md:pb-0">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            {formatMatchDate(match.match_time)}
                          </div>

                          {match.status === "finished" ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-800/80 bg-slate-900/60 px-3 py-1 text-[11px] font-extrabold text-slate-300">
                              <CheckCircle2 className="h-3.5 w-3.5 text-slate-400" />
                              Finalizado
                            </span>
                          ) : locked ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-red-900/20 bg-red-950/30 px-3 py-1 text-[11px] font-extrabold text-red-400">
                              <Lock className="h-3.5 w-3.5 text-red-500" />
                              Bloqueado
                            </span>
                          ) : (
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-extrabold ${
                                warning
                                  ? "animate-pulse border-amber-900/40 bg-amber-950/40 text-amber-400"
                                  : "border-nina-wine/30 bg-nina-wine/20 text-nina-red"
                              }`}
                            >
                              <Clock className="h-3.5 w-3.5" />
                              Fecha em {formatCountdown(match.match_time)}
                            </span>
                          )}
                        </div>

                        {/* Placar centralizado */}
                        <div className="flex w-full flex-1 items-center justify-between gap-3 py-1 md:gap-6">
                          {/* Mandante */}
                          <div className="flex min-w-0 flex-1 items-center justify-end gap-2.5">
                            <span className="truncate text-right text-sm font-extrabold text-white md:text-base">
                              {match.home_team}
                            </span>
                            <TeamFlag
                              teamName={match.home_team}
                              className="h-8 w-8 border border-white/10 shadow-lg md:h-10 md:w-10"
                            />
                          </div>

                          {/* Inputs de Gols */}
                          <div className="flex flex-shrink-0 items-center gap-1.5 rounded-2xl border border-slate-800/80 bg-slate-950/60 p-1.5 shadow-inner">
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
                              className={`h-9 w-9 rounded-xl border-0 p-0 text-center text-base font-black transition-all md:h-11 md:w-11 md:text-lg ${
                                locked
                                  ? "cursor-not-allowed bg-transparent text-slate-400 opacity-60"
                                  : "hover:bg-slate-850 bg-slate-900 text-white focus:bg-slate-900 focus:ring-1 focus:ring-nina-red/50"
                              }`}
                              placeholder="-"
                            />
                            <span className="px-0.5 text-xs font-black text-slate-600 select-none md:text-sm">
                              x
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
                              className={`h-9 w-9 rounded-xl border-0 p-0 text-center text-base font-black transition-all md:h-11 md:w-11 md:text-lg ${
                                locked
                                  ? "cursor-not-allowed bg-transparent text-slate-400 opacity-60"
                                  : "hover:bg-slate-850 bg-slate-900 text-white focus:bg-slate-900 focus:ring-1 focus:ring-nina-red/50"
                              }`}
                              placeholder="-"
                            />
                          </div>

                          {/* Visitante */}
                          <div className="flex min-w-0 flex-1 items-center justify-start gap-2.5">
                            <TeamFlag
                              teamName={match.away_team}
                              className="h-8 w-8 border border-white/10 shadow-lg md:h-10 md:w-10"
                            />
                            <span className="truncate text-left text-sm font-extrabold text-white md:text-base">
                              {match.away_team}
                            </span>
                          </div>
                        </div>

                        {/* Ação de Salvar / Pontuação obtida */}
                        <div className="border-slate-850 mt-2 flex w-full items-center justify-center border-t pt-3 md:mt-0 md:w-auto md:min-w-[130px] md:border-t-0 md:pt-0">
                          {match.status === "finished" ? (
                            <div className="w-full rounded-xl border border-nina-wine/30 bg-gradient-to-br from-nina-wine/20 to-nina-wine/5 px-4 py-1.5 text-center">
                              {match.user_guess?.points_earned !== undefined ? (
                                <>
                                  <span className="mb-0.5 block text-[9px] leading-none font-black tracking-wider text-nina-orange uppercase">
                                    Pontos
                                  </span>
                                  <span className="text-base font-black text-white">
                                    +{match.user_guess.points_earned} pts
                                  </span>
                                </>
                              ) : (
                                <span className="text-xs font-bold text-slate-400">
                                  Sem palpite
                                </span>
                              )}
                            </div>
                          ) : locked ? (
                            <div className="w-full rounded-xl border border-slate-800/40 bg-slate-950/40 px-4 py-2 text-center text-slate-400">
                              <span className="mb-0.5 block text-[9px] leading-none font-black tracking-wider text-slate-500 uppercase">
                                Fechado
                              </span>
                              <span className="text-xs font-bold text-slate-300">
                                {g.homeGuess || g.awayGuess
                                  ? `Seu palpite: ${g.homeGuess || 0}x${g.awayGuess || 0}`
                                  : "Sem palpite"}
                              </span>
                            </div>
                          ) : (
                            <Button
                              onClick={() => handleSave(match.id)}
                              disabled={
                                g.saved ||
                                g.loading ||
                                !g.homeGuess ||
                                !g.awayGuess
                              }
                              className={`flex h-10 w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl px-4 text-xs font-bold transition-all ${
                                g.saved
                                  ? "cursor-default border border-slate-800/80 bg-slate-900/60 text-slate-400 hover:bg-slate-900/60"
                                  : "bg-gradient-to-r from-nina-red to-nina-orange text-white shadow-lg shadow-nina-red/10 hover:opacity-90 active:scale-95"
                              }`}
                            >
                              {g.loading ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
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
          </div>

          {/* Painel lateral (placeholder — Fase 2) */}
          <aside className="sticky top-8 hidden w-72 flex-shrink-0 self-start lg:block">
            <div className="space-y-4 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4">
              <p className="text-xs font-black tracking-wider text-slate-400 uppercase">
                Resumo da Rodada
              </p>
              <div className="flex h-32 items-center justify-center rounded-xl border border-slate-800/60 bg-slate-800/40">
                <p className="text-xs text-slate-600">Em breve</p>
              </div>
            </div>
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

      {/* Legenda */}
      <div className="flex items-center gap-2 rounded-2xl border border-slate-900 bg-slate-900/20 p-4 text-xs text-slate-400">
        <AlertCircle className="h-4 w-4 flex-shrink-0 text-nina-red/60" />
        <span>
          Placar Exato = 5 pts | Saldo + Vencedor = 3 pts | Vencedor = 2 pts
        </span>
      </div>
    </div>
  )
}
