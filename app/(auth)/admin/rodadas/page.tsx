"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Layers,
  PlayCircle,
  CheckCircle2,
  Clock,
  Calendar,
  Info,
} from "lucide-react"
import type { RoundSummary } from "@/lib/types"
import { getRounds, activateRound } from "@/lib/api"
import { cn } from "@/lib/utils"

const STATUS_CONFIG: Record<
  RoundSummary["status"],
  { label: string; color: string; icon: React.ReactNode }
> = {
  upcoming: {
    label: "Aguardando",
    color: "text-slate-400 bg-slate-800/50 border-slate-700/50",
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  active: {
    label: "Ativa",
    color:
      "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-sm shadow-emerald-500/5",
    icon: <PlayCircle className="h-3.5 w-3.5 animate-pulse" />,
  },
  finished: {
    label: "Finalizada",
    color: "text-slate-500 bg-slate-900/80 border-slate-800",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
}

function formatDate(iso: string | Date | null): string {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function RodasPage() {
  const [rounds, setRounds] = useState<RoundSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [activating, setActivating] = useState<number | null>(null)

  const fetchRounds = useCallback(async () => {
    try {
      const data = await getRounds()
      setRounds(data)
    } catch (error) {
      console.error("Erro ao buscar rodadas:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRounds()
  }, [fetchRounds])

  async function handleActivate(roundId: number) {
    setActivating(roundId)
    try {
      await activateRound(roundId)
      await fetchRounds()
    } catch (err) {
      console.error("Erro ao ativar rodada:", err)
    } finally {
      setActivating(null)
    }
  }

  const activeRound = rounds.find((r) => r.status === "active")

  return (
    <div className="mx-auto max-w-3xl animate-in space-y-8 duration-300 fade-in">
      {/* Page header */}
      <div className="flex items-center gap-4 border-b border-slate-800/60 pb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 shadow-lg shadow-emerald-500/5">
          <Layers className="h-6 w-6 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Gerenciar Rodadas
          </h1>
          <p className="text-xs font-medium text-slate-400">
            Visão geral das fases do bolão
          </p>
        </div>
      </div>

      {/* Card informativo */}
      <Card className="overflow-hidden rounded-2xl border border-emerald-500/10 bg-emerald-950/20">
        <CardContent className="flex items-start gap-3 p-4">
          <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" />
          <div className="space-y-1 text-xs text-slate-300">
            <p className="font-bold text-emerald-300">
              Gerenciamento automático
            </p>
            <p>
              As rodadas são criadas automaticamente ao sincronizar o calendário
              via TheSportsDB. Uma rodada é ativada automaticamente{" "}
              <span className="font-bold text-white">
                24h antes do primeiro jogo
              </span>{" "}
              e finalizada quando{" "}
              <span className="font-bold text-white">
                todos os jogos terminarem
              </span>
              . Use o botão <span className="font-bold text-white">Ativar</span>{" "}
              para liberar palpites antecipadamente.
            </p>
            {activeRound && (
              <p className="mt-2 font-bold text-white">
                Rodada ativa agora:{" "}
                <span className="text-emerald-400">{activeRound.name}</span>
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lista de rodadas */}
      <div className="space-y-4">
        <h2 className="px-1 text-xs font-bold tracking-wider text-slate-400 uppercase">
          Rodadas Cadastradas
        </h2>
        {loading ? (
          <div className="flex h-48 items-center justify-center rounded-2xl border border-slate-800/40 bg-slate-900/20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {rounds.map((round) => {
              const cfg = STATUS_CONFIG[round.status]
              return (
                <Card
                  key={round.id}
                  className={cn(
                    "rounded-xl border bg-slate-900/40 backdrop-blur-md transition-all duration-200 hover:bg-slate-900/60",
                    round.status === "active"
                      ? "border-emerald-500/20 shadow-md shadow-emerald-500/2"
                      : "border-slate-800/80"
                  )}
                >
                  <CardContent className="flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-lg text-xs font-black transition-all",
                          round.status === "active"
                            ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-inner"
                            : "border border-slate-800 bg-slate-950/60 text-slate-400"
                        )}
                      >
                        #{round.number}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-100">
                          {round.name}
                        </p>
                        <div className="mt-0.5 flex items-center gap-3">
                          <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                            {round.match_count} jogo
                            {round.match_count !== 1 ? "s" : ""}
                          </span>
                          {round.first_match_at && (
                            <span className="flex items-center gap-1 text-[10px] text-slate-600">
                              <Calendar className="h-2.5 w-2.5" />
                              {formatDate(round.first_match_at)}
                              {round.last_match_at &&
                                round.last_match_at !==
                                  round.first_match_at && (
                                  <> → {formatDate(round.last_match_at)}</>
                                )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 border-t border-slate-800/40 pt-3 sm:justify-end sm:border-0 sm:pt-0">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-black tracking-wider uppercase",
                          cfg.color
                        )}
                      >
                        {cfg.icon}
                        {cfg.label}
                      </span>

                      {round.status === "upcoming" && (
                        <Button
                          size="sm"
                          className="h-7 cursor-pointer rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 text-[10px] font-black tracking-wider text-emerald-400 uppercase transition-all hover:bg-emerald-500/20 hover:text-emerald-300"
                          onClick={() => handleActivate(round.id)}
                          disabled={activating === round.id}
                        >
                          {activating === round.id ? "..." : "Ativar"}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {!loading && rounds.length === 0 && (
          <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-10 text-center shadow-inner">
            <p className="text-sm text-slate-400">
              Nenhuma rodada cadastrada ainda. Sincronize o calendário em{" "}
              <span className="font-bold text-slate-300">Carga de Jogos</span>.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
