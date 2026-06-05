"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  RefreshCw,
  ClipboardCheck,
  Flame,
  Calendar,
  Sparkles,
} from "lucide-react"
import { syncResults, getRecentMatches } from "@/lib/api"
import type { AdminMatch } from "@/lib/types"
import { TeamFlag } from "@/components/ui/team-flag"
import { cn } from "@/lib/utils"

export default function ResultadosPage() {
  const [matches, setMatches] = useState<AdminMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [logs, setLogs] = useState<string[]>([])

  async function loadMatches() {
    try {
      const data = await getRecentMatches(30)
      setMatches(data)
    } catch (err) {
      addLog(
        `[ERRO] Falha ao carregar partidas: ${err instanceof Error ? err.message : "erro desconhecido"}`
      )
    } finally {
      setLoading(false)
    }
  }

  function addLog(msg: string) {
    const ts = new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
    setLogs((prev) => [`[${ts}] ${msg}`, ...prev])
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadMatches()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSync() {
    setSyncing(true)
    addLog("Iniciando sincronização de resultados (worldcup26)...")
    try {
      const result = await syncResults()
      addLog(
        `[OK] ${result.message} — vinculados: ${result.linked}, placares atualizados: ${result.scores_updated}, ignorados: ${result.scores_skipped}.`
      )
      await loadMatches()
    } catch (err) {
      addLog(
        `[ERRO] ${err instanceof Error ? err.message : "erro desconhecido"}`
      )
    } finally {
      setSyncing(false)
    }
  }

  const finished = matches.filter((m) => m.status === "finished")
  const pending = matches.filter((m) => m.status !== "finished")

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-nina-purple/30 bg-gradient-to-br from-nina-purple/20 to-nina-wine/20 shadow-lg shadow-nina-purple/5">
          <ClipboardCheck className="h-5 w-5 animate-pulse text-nina-purple" />
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tight text-white sm:text-2xl">
            Carga de Resultados
          </h1>
          <p className="text-xs text-slate-400">
            Sincroniza placar final e pontuação via worldcup26
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Lista de Partidas */}
        <section className="space-y-5 lg:col-span-2">
          {loading ? (
            <div className="flex h-48 items-center justify-center rounded-2xl border border-slate-800/40 bg-slate-900/20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-nina-purple border-t-transparent" />
            </div>
          ) : (
            <>
              {/* Resultados Registrados */}
              {finished.length > 0 && (
                <div className="space-y-3">
                  <h2 className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-slate-400 uppercase">
                    <span className="h-1.5 w-1.5 rounded-full bg-nina-green" />
                    Últimos resultados registrados ({finished.length})
                  </h2>
                  <div className="space-y-2.5">
                    {finished.map((match) => {
                      const date = new Date(match.match_time).toLocaleString(
                        "pt-BR",
                        {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )
                      return (
                        <Card
                          key={match.id}
                          className="group overflow-hidden rounded-xl border border-emerald-500/20 bg-slate-900/40 transition-all duration-200 hover:border-emerald-500/40 hover:bg-slate-900/60 hover:shadow-lg"
                        >
                          <CardContent className="flex flex-col justify-between gap-4 p-3 sm:flex-row sm:items-center sm:p-4">
                            {/* Date info */}
                            <div className="flex shrink-0 items-center gap-3">
                              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
                                <Calendar className="h-3.5 w-3.5 text-nina-purple/90" />
                                <span className="capitalize">{date}</span>
                              </div>
                              <div className="hidden max-w-[130px] truncate rounded border border-slate-700/50 bg-slate-800/70 px-2 py-0.5 text-[10px] font-semibold text-slate-300 sm:block">
                                {match.round_name}
                              </div>
                            </div>

                            {/* Match Score with Flags */}
                            <div className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-800/50 bg-slate-950/40 px-3 py-2 shadow-inner transition-colors duration-200 group-hover:bg-slate-950/60 sm:gap-3 sm:px-4">
                              <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
                                <span className="truncate text-right text-xs font-bold text-slate-100 sm:text-sm">
                                  {match.home_team}
                                </span>
                                <TeamFlag
                                  teamName={match.home_team}
                                  className="h-5.5 w-5.5 border-white/20 shadow-sm"
                                />
                              </div>

                              <span className="min-w-[70px] shrink-0 rounded-lg border border-slate-800/60 bg-slate-900/95 px-3 py-1 text-center text-sm font-black text-white tabular-nums shadow-md">
                                {match.home_score} × {match.away_score}
                              </span>

                              <div className="flex min-w-0 flex-1 items-center justify-start gap-2">
                                <TeamFlag
                                  teamName={match.away_team}
                                  className="h-5.5 w-5.5 border-white/20 shadow-sm"
                                />
                                <span className="truncate text-left text-xs font-bold text-slate-100 sm:text-sm">
                                  {match.away_team}
                                </span>
                              </div>
                            </div>

                            {/* Mobile Round info & Finished status */}
                            <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
                              <div className="rounded border border-slate-700/50 bg-slate-800/70 px-2 py-0.5 text-[10px] font-semibold text-slate-300 sm:hidden">
                                {match.round_name}
                              </div>
                              <span className="inline-flex shrink-0 items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-black tracking-wider text-emerald-400 uppercase shadow-sm">
                                Finalizado
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Partidas Aguardando Resultado */}
              {pending.length > 0 && (
                <div className="space-y-3">
                  <h2 className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-slate-400 uppercase">
                    <span className="h-1.5 w-1.5 rounded-full bg-nina-orange" />
                    Partidas aguardando resultado ({pending.length})
                  </h2>
                  <div className="space-y-2.5">
                    {pending.map((match) => {
                      const date = new Date(match.match_time).toLocaleString(
                        "pt-BR",
                        {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )
                      return (
                        <Card
                          key={match.id}
                          className="group overflow-hidden rounded-xl border border-slate-800/50 bg-slate-900/20 opacity-75 transition-all duration-200 hover:border-slate-700/50 hover:bg-slate-900/30"
                        >
                          <CardContent className="flex flex-col justify-between gap-4 p-3 sm:flex-row sm:items-center sm:p-4">
                            {/* Date info */}
                            <div className="flex shrink-0 items-center gap-3">
                              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                                <Calendar className="h-3.5 w-3.5 text-slate-500" />
                                <span className="capitalize">{date}</span>
                              </div>
                              <div className="hidden max-w-[130px] truncate rounded border border-slate-800/50 bg-slate-800/40 px-2 py-0.5 text-[10px] font-semibold text-slate-400 sm:block">
                                {match.round_name}
                              </div>
                            </div>

                            {/* Matchup with Flags */}
                            <div className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-800/30 bg-slate-950/20 px-3 py-2 shadow-inner sm:gap-3 sm:px-4">
                              <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
                                <span className="truncate text-right text-xs font-semibold text-slate-300 sm:text-sm">
                                  {match.home_team}
                                </span>
                                <TeamFlag
                                  teamName={match.home_team}
                                  className="h-5 w-5 border-white/10 opacity-90 shadow-sm"
                                />
                              </div>

                              <span className="shrink-0 px-1.5 text-[10px] font-extrabold tracking-wider text-slate-600 select-none">
                                VS
                              </span>

                              <div className="flex min-w-0 flex-1 items-center justify-start gap-2">
                                <TeamFlag
                                  teamName={match.away_team}
                                  className="h-5 w-5 border-white/10 opacity-90 shadow-sm"
                                />
                                <span className="truncate text-left text-xs font-semibold text-slate-300 sm:text-sm">
                                  {match.away_team}
                                </span>
                              </div>
                            </div>

                            {/* Mobile Round info & Scheduled status */}
                            <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
                              <div className="rounded border border-slate-800/50 bg-slate-800/40 px-2 py-0.5 text-[10px] font-semibold text-slate-400 sm:hidden">
                                {match.round_name}
                              </div>
                              <span className="inline-flex shrink-0 items-center rounded-full border border-slate-700/50 bg-slate-800/40 px-2.5 py-0.5 text-[10px] font-semibold tracking-wider text-slate-400 uppercase shadow-sm">
                                Pendente
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              )}

              {matches.length === 0 && (
                <Card className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-10 text-center shadow-inner">
                  <p className="text-sm text-slate-400">
                    Nenhuma partida cadastrada. Clique em Sincronizar para
                    importar.
                  </p>
                </Card>
              )}
            </>
          )}
        </section>

        {/* Painel de Sincronização */}
        <section className="space-y-6">
          <Card className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 p-5 shadow-xl backdrop-blur-sm">
            {/* Ambient background glow */}
            <div className="pointer-events-none absolute top-0 right-0 h-32 w-32 rounded-full bg-gradient-to-br from-nina-purple/10 to-transparent blur-2xl transition-transform duration-500 group-hover:scale-125" />

            <h2 className="mb-4 flex items-center gap-1.5 text-xs font-bold tracking-wider text-slate-400 uppercase">
              <Sparkles className="h-3.5 w-3.5 text-nina-purple" />
              Sincronizador
            </h2>
            <p className="mb-5 text-xs leading-relaxed text-slate-300">
              O sistema sincroniza os resultados reais dos jogos e calcula as
              pontuações correspondentes de cada palpite de usuário.
            </p>

            <Button
              className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-gradient-to-r from-nina-wine to-nina-purple font-bold text-white shadow-lg shadow-nina-wine/10 transition-all duration-300 hover:from-nina-wine/90 hover:to-nina-purple/90 hover:shadow-nina-wine/20"
              onClick={handleSync}
              disabled={syncing}
            >
              <RefreshCw className={cn("h-4 w-4", syncing && "animate-spin")} />
              {syncing ? "Sincronizando..." : "Atualizar Resultados"}
            </Button>
          </Card>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-nina-purple" />
              <h2 className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                Log de carga
              </h2>
            </div>

            <div className="relative flex h-80 flex-col overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/95 p-4 shadow-2xl">
              <div className="flex-1 scrollbar-thin space-y-2 overflow-y-auto font-mono text-[10px] leading-relaxed text-slate-300">
                {logs.length === 0 ? (
                  <div className="py-20 text-center text-slate-500 italic">
                    [Aguardando execução da carga...]
                  </div>
                ) : (
                  logs.map((log, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "border-b border-slate-900/30 py-1 last:border-0",
                        log.includes("[ERRO]")
                          ? "font-bold text-red-400"
                          : log.includes("[OK]")
                            ? "font-bold text-nina-green"
                            : "text-slate-400"
                      )}
                    >
                      {log}
                    </div>
                  ))
                )}
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-slate-900 pt-2.5 text-[10px] text-slate-500">
                <span className="font-semibold tracking-wider">
                  STATUS: {syncing ? "SINCRONIZANDO" : "PRONTO"}
                </span>
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    syncing ? "animate-pulse bg-nina-purple" : "bg-nina-green"
                  )}
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
