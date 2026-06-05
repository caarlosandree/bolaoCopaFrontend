"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  RefreshCw,
  CalendarSearch,
  Flame,
  Calendar,
  Sparkles,
  Trash2,
  Database,
} from "lucide-react"
import { syncSchedule, resetSchedule, syncMatchDetails, getRecentMatches } from "@/lib/api"
import type { AdminMatch } from "@/lib/types"
import { TeamFlag } from "@/components/ui/team-flag"
import { cn } from "@/lib/utils"

const STATUS_LABEL: Record<
  AdminMatch["status"],
  { label: string; cls: string }
> = {
  scheduled: {
    label: "Agendado",
    cls: "text-slate-300 bg-slate-800/80 border-slate-700/60",
  },
  ongoing: {
    label: "Ao vivo",
    cls: "text-nina-orange bg-nina-orange/10 border-nina-orange/30",
  },
  finished: {
    label: "Finalizado",
    cls: "text-nina-green bg-nina-green/10 border-nina-green/30",
  },
}

export default function JogosPage() {
  const [matches, setMatches] = useState<AdminMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [syncingDetails, setSyncingDetails] = useState(false)
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
    addLog("Iniciando sincronização de calendário (TheSportsDB)...")
    try {
      const result = await syncSchedule()
      addLog(
        `[OK] ${result.message} — ${result.imported} partida(s) importada(s).`
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

  async function handleReset() {
    if (!confirm("Isso vai APAGAR todos os jogos, rodadas e palpites e reimportar do zero. Continuar?")) return
    setResetting(true)
    addLog("Resetando calendário e reimportando do TheSportsDB...")
    try {
      const result = await resetSchedule()
      addLog(`[OK] ${result.message} — ${result.imported} partida(s) importada(s).`)
      await loadMatches()
    } catch (err) {
      addLog(`[ERRO] ${err instanceof Error ? err.message : "erro desconhecido"}`)
    } finally {
      setResetting(false)
    }
  }

  async function handleSyncDetails() {
    setSyncingDetails(true)
    addLog("Iniciando sync de detalhes e odds das partidas...")
    try {
      const result = await syncMatchDetails()
      addLog(`[OK] Detalhes: ${result.details_updated} atualizados, ${result.odds_linked} odds vinculadas.`)
      if (result.failures?.length > 0) {
        result.failures.forEach((f) => addLog(`[AVISO] ${f}`))
      }
    } catch (err) {
      addLog(`[ERRO] ${err instanceof Error ? err.message : "erro desconhecido"}`)
    } finally {
      setSyncingDetails(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-nina-orange/30 bg-gradient-to-br from-nina-orange/20 to-nina-red/10 shadow-lg shadow-nina-orange/5">
          <CalendarSearch className="h-5 w-5 animate-pulse text-nina-orange" />
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tight text-white sm:text-2xl">
            Carga de Jogos
          </h1>
          <p className="text-xs text-slate-400">
            Sincroniza o calendário da Copa do Mundo via TheSportsDB v2
          </p>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Últimas partidas cadastradas */}
        <section className="space-y-3 lg:col-span-2">
          <h2 className="mb-2 flex items-center gap-1.5 text-xs font-bold tracking-wider text-slate-400 uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-nina-orange" />
            Últimas partidas cadastradas
          </h2>

          {loading ? (
            <div className="flex h-48 items-center justify-center rounded-2xl border border-slate-800/40 bg-slate-900/20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-nina-orange border-t-transparent" />
            </div>
          ) : matches.length === 0 ? (
            <Card className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-10 text-center shadow-inner">
              <p className="text-sm text-slate-400">
                Nenhuma partida cadastrada. Clique em Sincronizar Calendário
                para importar.
              </p>
            </Card>
          ) : (
            <div className="space-y-2.5">
              {matches.map((match) => {
                const st = STATUS_LABEL[match.status] || {
                  label: "Agendado",
                  cls: "text-slate-300 bg-slate-800/80",
                }
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
                    className="group overflow-hidden rounded-xl border border-slate-800/70 bg-slate-900/40 transition-all duration-200 hover:border-slate-700/60 hover:bg-slate-900/60 hover:shadow-lg"
                  >
                    <CardContent className="flex flex-col justify-between gap-4 p-3 sm:flex-row sm:items-center sm:p-4">
                      {/* Date & Time info */}
                      <div className="flex shrink-0 items-center gap-3">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
                          <Calendar className="h-3.5 w-3.5 text-nina-orange/90" />
                          <span className="capitalize">{date}</span>
                        </div>
                        <div className="hidden max-w-[130px] truncate rounded border border-slate-700/50 bg-slate-800/70 px-2 py-0.5 text-[10px] font-semibold text-slate-300 sm:block">
                          {match.round_name}
                        </div>
                      </div>

                      {/* Matchup with Flags */}
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

                        <span className="shrink-0 px-1.5 text-[10px] font-extrabold tracking-wider text-slate-500 select-none">
                          VS
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

                      {/* Mobile Round info and Status badge */}
                      <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
                        <div className="rounded border border-slate-700/50 bg-slate-800/70 px-2 py-0.5 text-[10px] font-semibold text-slate-300 sm:hidden">
                          {match.round_name}
                        </div>
                        <span
                          className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-[10px] font-black tracking-wider uppercase shadow-sm ${st.cls}`}
                        >
                          {st.label}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </section>

        {/* Painel de Controle de Sincronização */}
        <section className="space-y-6">
          <Card className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 p-5 shadow-xl backdrop-blur-sm">
            {/* Ambient background glow */}
            <div className="pointer-events-none absolute top-0 right-0 h-32 w-32 rounded-full bg-gradient-to-br from-nina-orange/10 to-transparent blur-2xl transition-transform duration-500 group-hover:scale-125" />

            <h2 className="mb-4 flex items-center gap-1.5 text-xs font-bold tracking-wider text-slate-400 uppercase">
              <Sparkles className="h-3.5 w-3.5 text-nina-orange" />
              Sincronizador
            </h2>
            <p className="mb-5 text-xs leading-relaxed text-slate-300">
              O sistema busca rodadas e jogos via TheSportsDB v2. Cada rodada
              agrupa todos os jogos daquela fase (ex: Rodada 1 = 24 jogos de
              todos os grupos).
            </p>

            <div className="space-y-3">
              <Button
                className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-gradient-to-r from-nina-orange to-nina-red font-bold text-white shadow-lg shadow-nina-orange/10 transition-all duration-300 hover:from-nina-orange/90 hover:to-nina-red/90 hover:shadow-nina-orange/20"
                onClick={handleSync}
                disabled={syncing || resetting}
              >
                <RefreshCw className={cn("h-4 w-4", syncing && "animate-spin")} />
                {syncing ? "Sincronizando..." : "Sincronizar Calendário"}
              </Button>

              <Button
                variant="outline"
                className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-blue-800/60 bg-blue-950/30 text-xs font-bold text-blue-400 transition-all hover:border-blue-700/80 hover:bg-blue-950/60 hover:text-blue-300"
                onClick={handleSyncDetails}
                disabled={syncing || resetting || syncingDetails}
              >
                <Database className={cn("h-3.5 w-3.5", syncingDetails && "animate-pulse")} />
                {syncingDetails ? "Sincronizando detalhes..." : "Sync Detalhes e Odds"}
              </Button>

              <Button
                variant="outline"
                className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-800/60 bg-red-950/30 text-xs font-bold text-red-400 transition-all hover:border-red-700/80 hover:bg-red-950/60 hover:text-red-300"
                onClick={handleReset}
                disabled={syncing || resetting || syncingDetails}
              >
                <Trash2 className={cn("h-3.5 w-3.5", resetting && "animate-pulse")} />
                {resetting ? "Resetando..." : "Resetar e Reimportar"}
              </Button>
            </div>
          </Card>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-nina-orange" />
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
                    syncing ? "animate-pulse bg-nina-orange" : "bg-nina-green"
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
