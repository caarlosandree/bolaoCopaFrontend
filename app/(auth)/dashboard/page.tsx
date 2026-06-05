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
    return new Date(matchTime).toLocaleDateString("pt-BR", { day: "numeric", month: "short" })
  }

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-2 border-nina-red border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-nina-wine/40 to-nina-red/30 border border-nina-wine/40 flex items-center justify-center">
            <Target className="h-4 w-4 text-nina-red" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">Palpites</h1>
            <p className="text-xs text-slate-500">
              {round ? round.name : "Nenhuma rodada ativa"}
            </p>
          </div>
        </div>
        {round && (
          <span className="text-xs bg-nina-wine/30 text-nina-red border border-nina-wine/40 px-3 py-1 rounded-full font-bold">
            Rodada Ativa
          </span>
        )}
      </div>

      {/* Conteúdo */}
      {round ? (
        <div className="space-y-4">
          {matches.length === 0 ? (
            <Card className="bg-slate-900/40 border border-slate-800 p-8 text-center rounded-2xl">
              <p className="text-slate-400 text-sm">Nenhuma partida nesta rodada.</p>
            </Card>
          ) : (
            matches.map((match) => {
              const g = guesses[match.id] ?? { homeGuess: "", awayGuess: "", saved: false, loading: false }
              const locked = isLocked(match)
              const diffMs = new Date(match.match_time).getTime() - currentTime.getTime()
              const minutesLeft = diffMs / 60000
              const warning = minutesLeft > 0 && minutesLeft <= 15

              return (
                <Card
                  key={match.id}
                  className={`relative overflow-hidden bg-gradient-to-r from-slate-950/80 via-slate-900/60 to-slate-950/80 backdrop-blur-md border transition-all duration-300 ${
                    locked
                      ? "border-slate-800/40 opacity-95"
                      : warning
                        ? "border-amber-500/40 shadow-lg shadow-amber-500/5 animate-pulse-slow"
                        : "border-slate-800/80 hover:border-nina-red/40 hover:shadow-xl hover:shadow-nina-red/5"
                  }`}
                >
                  {/* Linha indicadora premium no topo do card */}
                  <div
                    className={`h-[3px] w-full absolute top-0 left-0 transition-colors duration-300 ${
                      match.status === "finished"
                        ? "bg-slate-800"
                        : locked
                          ? "bg-red-500/40"
                          : warning
                            ? "bg-gradient-to-r from-amber-500 to-orange-500 animate-pulse"
                            : "bg-gradient-to-r from-nina-red to-nina-orange"
                    }`}
                  />

                  <CardContent className="p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
                    {/* Data / Status do Jogo */}
                    <div className="flex flex-row md:flex-col items-center md:items-start justify-between md:justify-center gap-2 border-b border-slate-800/50 md:border-b-0 pb-3 md:pb-0 md:min-w-[150px]">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {formatMatchDate(match.match_time)}
                      </div>

                      {match.status === "finished" ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold bg-slate-900/60 text-slate-300 rounded-full px-3 py-1 border border-slate-800/80">
                          <CheckCircle2 className="h-3.5 w-3.5 text-slate-400" />
                          Finalizado
                        </span>
                      ) : locked ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold bg-red-950/30 text-red-400 rounded-full px-3 py-1 border border-red-900/20">
                          <Lock className="h-3.5 w-3.5 text-red-500" />
                          Bloqueado
                        </span>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1.5 text-[11px] font-extrabold rounded-full px-3 py-1 border ${
                            warning
                              ? "bg-amber-950/40 text-amber-400 border-amber-900/40 animate-pulse"
                              : "bg-nina-wine/20 text-nina-red border-nina-wine/30"
                          }`}
                        >
                          <Clock className="h-3.5 w-3.5" />
                          Fecha em {formatCountdown(match.match_time)}
                        </span>
                      )}
                    </div>

                    {/* Placar centralizado */}
                    <div className="flex items-center justify-between flex-1 gap-3 md:gap-6 py-1 w-full">
                      {/* Mandante */}
                      <div className="flex items-center justify-end gap-2.5 flex-1 min-w-0">
                        <span className="text-sm md:text-base font-extrabold text-white truncate text-right">
                          {match.home_team}
                        </span>
                        <TeamFlag
                          teamName={match.home_team}
                          className="h-8 w-8 md:h-10 md:w-10 border border-white/10 shadow-lg"
                        />
                      </div>

                      {/* Inputs de Gols */}
                      <div className="flex items-center gap-1.5 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-800/80 shadow-inner flex-shrink-0">
                        <Input
                          type="text"
                          maxLength={2}
                          disabled={locked}
                          value={match.status === "finished" ? String(match.home_score ?? "-") : g.homeGuess}
                          onChange={(e) => handleInputChange(match.id, "homeGuess", e.target.value)}
                          className={`h-9 w-9 md:h-11 md:w-11 text-center text-base md:text-lg font-black p-0 border-0 rounded-xl transition-all ${
                            locked
                              ? "bg-transparent text-slate-400 cursor-not-allowed opacity-60"
                              : "bg-slate-900 text-white hover:bg-slate-850 focus:bg-slate-900 focus:ring-1 focus:ring-nina-red/50"
                          }`}
                          placeholder="-"
                        />
                        <span className="text-slate-600 font-black text-xs md:text-sm select-none px-0.5">x</span>
                        <Input
                          type="text"
                          maxLength={2}
                          disabled={locked}
                          value={match.status === "finished" ? String(match.away_score ?? "-") : g.awayGuess}
                          onChange={(e) => handleInputChange(match.id, "awayGuess", e.target.value)}
                          className={`h-9 w-9 md:h-11 md:w-11 text-center text-base md:text-lg font-black p-0 border-0 rounded-xl transition-all ${
                            locked
                              ? "bg-transparent text-slate-400 cursor-not-allowed opacity-60"
                              : "bg-slate-900 text-white hover:bg-slate-850 focus:bg-slate-900 focus:ring-1 focus:ring-nina-red/50"
                          }`}
                          placeholder="-"
                        />
                      </div>

                      {/* Visitante */}
                      <div className="flex items-center justify-start gap-2.5 flex-1 min-w-0">
                        <TeamFlag
                          teamName={match.away_team}
                          className="h-8 w-8 md:h-10 md:w-10 border border-white/10 shadow-lg"
                        />
                        <span className="text-sm md:text-base font-extrabold text-white truncate text-left">
                          {match.away_team}
                        </span>
                      </div>
                    </div>

                    {/* Ação de Salvar / Pontuação obtida */}
                    <div className="flex items-center justify-center md:min-w-[130px] w-full md:w-auto mt-2 md:mt-0 pt-3 md:pt-0 border-t border-slate-850 md:border-t-0">
                      {match.status === "finished" ? (
                        <div className="text-center bg-gradient-to-br from-nina-wine/20 to-nina-wine/5 border border-nina-wine/30 px-4 py-1.5 rounded-xl w-full">
                          {match.user_guess?.points_earned !== undefined ? (
                            <>
                              <span className="text-[9px] uppercase font-black text-nina-orange block tracking-wider leading-none mb-0.5">Pontos</span>
                              <span className="text-base font-black text-white">
                                +{match.user_guess.points_earned} pts
                              </span>
                            </>
                          ) : (
                            <span className="text-xs text-slate-400 font-bold">Sem palpite</span>
                          )}
                        </div>
                      ) : locked ? (
                        <div className="text-center text-slate-400 border border-slate-800/40 bg-slate-950/40 px-4 py-2 rounded-xl w-full">
                          <span className="text-[9px] uppercase font-black block text-slate-500 tracking-wider leading-none mb-0.5">Fechado</span>
                          <span className="text-xs font-bold text-slate-300">
                            {g.homeGuess || g.awayGuess
                              ? `Seu palpite: ${g.homeGuess || 0}x${g.awayGuess || 0}`
                              : "Sem palpite"}
                          </span>
                        </div>
                      ) : (
                        <Button
                          onClick={() => handleSave(match.id)}
                          disabled={g.saved || g.loading || !g.homeGuess || !g.awayGuess}
                          className={`w-full font-bold text-xs h-10 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            g.saved
                              ? "bg-slate-900/60 text-slate-400 border border-slate-800/80 hover:bg-slate-900/60 cursor-default"
                              : "bg-gradient-to-r from-nina-red to-nina-orange hover:opacity-90 text-white shadow-lg shadow-nina-red/10 active:scale-95"
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
            })
          )}
        </div>
      ) : (
        <Card className="bg-slate-900/40 border border-slate-800 p-10 text-center rounded-2xl">
          <AlertCircle className="h-8 w-8 text-nina-red/60 mx-auto mb-3" />
          <h3 className="font-bold text-slate-200">Nenhuma rodada ativa</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            Os palpites serão abertos assim que o administrador ativar uma rodada.
          </p>
        </Card>
      )}

      {/* Legenda */}
      <div className="bg-slate-900/20 border border-slate-900 rounded-2xl p-4 flex items-center gap-2 text-xs text-slate-400">
        <AlertCircle className="h-4 w-4 text-nina-red/60 flex-shrink-0" />
        <span>Placar Exato = 5 pts | Saldo + Vencedor = 3 pts | Vencedor = 2 pts</span>
      </div>
    </div>
  )
}
