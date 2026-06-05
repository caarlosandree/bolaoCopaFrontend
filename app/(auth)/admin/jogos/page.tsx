"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, CalendarSearch, Flame, Calendar, Sparkles } from "lucide-react"
import { syncSchedule, getRecentMatches } from "@/lib/api"
import type { AdminMatch } from "@/lib/types"
import { TeamFlag } from "@/components/ui/team-flag"
import { cn } from "@/lib/utils"

const STATUS_LABEL: Record<AdminMatch["status"], { label: string; cls: string }> = {
  scheduled: { label: "Agendado", cls: "text-slate-300 bg-slate-800/80 border-slate-700/60" },
  ongoing: { label: "Ao vivo", cls: "text-nina-orange bg-nina-orange/10 border-nina-orange/30" },
  finished: { label: "Finalizado", cls: "text-nina-green bg-nina-green/10 border-nina-green/30" },
}

export default function JogosPage() {
  const [matches, setMatches] = useState<AdminMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [logs, setLogs] = useState<string[]>([])

  async function loadMatches() {
    try {
      const data = await getRecentMatches(30)
      setMatches(data)
    } catch (err) {
      addLog(`[ERRO] Falha ao carregar partidas: ${err instanceof Error ? err.message : "erro desconhecido"}`)
    } finally {
      setLoading(false)
    }
  }

  function addLog(msg: string) {
    const ts = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    setLogs((prev) => [`[${ts}] ${msg}`, ...prev])
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadMatches()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSync() {
    setSyncing(true)
    addLog("Iniciando sincronização de calendário (openfootball)...")
    try {
      const result = await syncSchedule()
      addLog(`[OK] ${result.message} — ${result.imported} partida(s) importada(s).`)
      await loadMatches()
    } catch (err) {
      addLog(`[ERRO] ${err instanceof Error ? err.message : "erro desconhecido"}`)
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-nina-orange/20 to-nina-red/10 border border-nina-orange/30 flex items-center justify-center shadow-lg shadow-nina-orange/5">
          <CalendarSearch className="h-5 w-5 text-nina-orange animate-pulse" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Carga de Jogos</h1>
          <p className="text-xs text-slate-400">Sincroniza o calendário da Copa do Mundo via base openfootball</p>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Últimas partidas cadastradas */}
        <section className="lg:col-span-2 space-y-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-nina-orange" />
            Últimas partidas cadastradas
          </h2>

          {loading ? (
            <div className="flex items-center justify-center h-48 bg-slate-900/20 border border-slate-800/40 rounded-2xl">
              <div className="h-8 w-8 border-2 border-nina-orange border-t-transparent rounded-full animate-spin" />
            </div>
          ) : matches.length === 0 ? (
            <Card className="bg-slate-900/40 border border-slate-800/60 p-10 text-center rounded-2xl shadow-inner">
              <p className="text-slate-400 text-sm">Nenhuma partida cadastrada. Clique em Sincronizar Calendário para importar.</p>
            </Card>
          ) : (
            <div className="space-y-2.5">
              {matches.map((match) => {
                const st = STATUS_LABEL[match.status] || { label: "Agendado", cls: "text-slate-300 bg-slate-800/80" }
                const date = new Date(match.match_time).toLocaleString("pt-BR", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })
                return (
                  <Card
                    key={match.id}
                    className="bg-slate-900/40 border border-slate-800/70 hover:border-slate-700/60 hover:bg-slate-900/60 hover:shadow-lg transition-all duration-200 rounded-xl group overflow-hidden"
                  >
                    <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Date & Time info */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
                          <Calendar className="h-3.5 w-3.5 text-nina-orange/90" />
                          <span className="capitalize">{date}</span>
                        </div>
                        <div className="hidden sm:block text-[10px] font-semibold bg-slate-800/70 text-slate-300 border border-slate-700/50 rounded px-2 py-0.5 truncate max-w-[130px]">
                          {match.round_name}
                        </div>
                      </div>

                      {/* Matchup with Flags */}
                      <div className="flex-1 flex items-center justify-center gap-2 sm:gap-3 min-w-0 bg-slate-950/40 py-2 px-3 sm:px-4 rounded-xl border border-slate-800/50 shadow-inner group-hover:bg-slate-950/60 transition-colors duration-200">
                        <div className="flex items-center justify-end gap-2 flex-1 min-w-0">
                          <span className="text-xs sm:text-sm font-bold text-slate-100 truncate text-right">
                            {match.home_team}
                          </span>
                          <TeamFlag teamName={match.home_team} className="h-5.5 w-5.5 border-white/20 shadow-sm" />
                        </div>
                        
                        <span className="text-slate-500 font-extrabold text-[10px] shrink-0 px-1.5 select-none tracking-wider">VS</span>
                        
                        <div className="flex items-center justify-start gap-2 flex-1 min-w-0">
                          <TeamFlag teamName={match.away_team} className="h-5.5 w-5.5 border-white/20 shadow-sm" />
                          <span className="text-xs sm:text-sm font-bold text-slate-100 truncate text-left">
                            {match.away_team}
                          </span>
                        </div>
                      </div>

                      {/* Mobile Round info and Status badge */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                        <div className="sm:hidden text-[10px] font-semibold bg-slate-800/70 text-slate-300 border border-slate-700/50 rounded px-2 py-0.5">
                          {match.round_name}
                        </div>
                        <span
                          className={`inline-flex items-center text-[10px] font-black border rounded-full px-2.5 py-0.5 shadow-sm shrink-0 uppercase tracking-wider ${st.cls}`}
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
          <Card className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-sm relative overflow-hidden group">
            {/* Ambient background glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-nina-orange/10 to-transparent rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
            
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-nina-orange" />
              Sincronizador
            </h2>
            <p className="text-xs text-slate-300 mb-5 leading-relaxed">
              O sistema busca as rodadas e jogos diretamente da API OpenFootball. Certifique-se de que os dados de rodadas estejam cadastrados antes de atualizar o calendário.
            </p>
            
            <Button
              className="w-full bg-gradient-to-r from-nina-orange to-nina-red hover:from-nina-orange/90 hover:to-nina-red/90 text-white font-bold h-11 rounded-xl shadow-lg shadow-nina-orange/10 hover:shadow-nina-orange/20 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 border-0"
              onClick={handleSync}
              disabled={syncing}
            >
              <RefreshCw className={cn("h-4 w-4", syncing && "animate-spin")} />
              {syncing ? "Sincronizando..." : "Sincronizar Calendário"}
            </Button>
          </Card>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-nina-orange" />
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Log de carga</h2>
            </div>
            
            <div className="bg-slate-950/95 border border-slate-800/80 rounded-2xl p-4 h-80 flex flex-col shadow-2xl relative overflow-hidden">
              <div className="space-y-2 overflow-y-auto flex-1 font-mono text-[10px] text-slate-300 leading-relaxed scrollbar-thin">
                {logs.length === 0 ? (
                  <div className="text-slate-500 text-center py-20 italic">[Aguardando execução da carga...]</div>
                ) : (
                  logs.map((log, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "py-1 border-b border-slate-900/30 last:border-0",
                        log.includes("[ERRO]")
                          ? "text-red-400 font-bold"
                          : log.includes("[OK]")
                            ? "text-nina-green font-bold"
                            : "text-slate-400"
                      )}
                    >
                      {log}
                    </div>
                  ))
                )}
              </div>
              <div className="border-t border-slate-900 pt-2.5 mt-2 flex items-center justify-between text-[10px] text-slate-500">
                <span className="font-semibold tracking-wider">STATUS: {syncing ? "SINCRONIZANDO" : "PRONTO"}</span>
                <span className={cn(
                  "h-2 w-2 rounded-full",
                  syncing ? "bg-nina-orange animate-pulse" : "bg-nina-green"
                )} />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
