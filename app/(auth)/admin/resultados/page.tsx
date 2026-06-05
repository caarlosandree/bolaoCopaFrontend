"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, ClipboardCheck, Flame, Calendar, Sparkles } from "lucide-react"
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
    addLog("Iniciando sincronização de resultados (worldcup26)...")
    try {
      const result = await syncResults()
      addLog(
        `[OK] ${result.message} — vinculados: ${result.linked}, placares atualizados: ${result.scores_updated}, ignorados: ${result.scores_skipped}.`,
      )
      await loadMatches()
    } catch (err) {
      addLog(`[ERRO] ${err instanceof Error ? err.message : "erro desconhecido"}`)
    } finally {
      setSyncing(false)
    }
  }

  const finished = matches.filter((m) => m.status === "finished")
  const pending = matches.filter((m) => m.status !== "finished")

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-nina-purple/20 to-nina-wine/20 border border-nina-purple/30 flex items-center justify-center shadow-lg shadow-nina-purple/5">
          <ClipboardCheck className="h-5 w-5 text-nina-purple animate-pulse" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Carga de Resultados</h1>
          <p className="text-xs text-slate-400">Sincroniza placar final e pontuação via worldcup26</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Partidas */}
        <section className="lg:col-span-2 space-y-5">
          {loading ? (
            <div className="flex items-center justify-center h-48 bg-slate-900/20 border border-slate-800/40 rounded-2xl">
              <div className="h-8 w-8 border-2 border-nina-purple border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Resultados Registrados */}
              {finished.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-nina-green" />
                    Últimos resultados registrados ({finished.length})
                  </h2>
                  <div className="space-y-2.5">
                    {finished.map((match) => {
                      const date = new Date(match.match_time).toLocaleString("pt-BR", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                      return (
                        <Card
                          key={match.id}
                          className="bg-slate-900/40 border border-emerald-500/20 hover:border-emerald-500/40 hover:bg-slate-900/60 hover:shadow-lg transition-all duration-200 rounded-xl group overflow-hidden"
                        >
                          <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            {/* Date info */}
                            <div className="flex items-center gap-3 shrink-0">
                              <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
                                <Calendar className="h-3.5 w-3.5 text-nina-purple/90" />
                                <span className="capitalize">{date}</span>
                              </div>
                              <div className="hidden sm:block text-[10px] font-semibold bg-slate-800/70 text-slate-300 border border-slate-700/50 rounded px-2 py-0.5 truncate max-w-[130px]">
                                {match.round_name}
                              </div>
                            </div>

                            {/* Match Score with Flags */}
                            <div className="flex-1 flex items-center justify-center gap-2 sm:gap-3 min-w-0 bg-slate-950/40 py-2 px-3 sm:px-4 rounded-xl border border-slate-800/50 shadow-inner group-hover:bg-slate-950/60 transition-colors duration-200">
                              <div className="flex items-center justify-end gap-2 flex-1 min-w-0">
                                <span className="text-xs sm:text-sm font-bold text-slate-100 truncate text-right">
                                  {match.home_team}
                                </span>
                                <TeamFlag teamName={match.home_team} className="h-5.5 w-5.5 border-white/20 shadow-sm" />
                              </div>
                              
                              <span className="text-sm font-black text-white bg-slate-900/95 border border-slate-800/60 px-3 py-1 rounded-lg shadow-md shrink-0 tabular-nums text-center min-w-[70px]">
                                {match.home_score} × {match.away_score}
                              </span>
                              
                              <div className="flex items-center justify-start gap-2 flex-1 min-w-0">
                                <TeamFlag teamName={match.away_team} className="h-5.5 w-5.5 border-white/20 shadow-sm" />
                                <span className="text-xs sm:text-sm font-bold text-slate-100 truncate text-left">
                                  {match.away_team}
                                </span>
                              </div>
                            </div>

                            {/* Mobile Round info & Finished status */}
                            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                              <div className="sm:hidden text-[10px] font-semibold bg-slate-800/70 text-slate-300 border border-slate-700/50 rounded px-2 py-0.5">
                                {match.round_name}
                              </div>
                              <span className="inline-flex items-center text-[10px] font-black border border-emerald-500/20 text-emerald-400 bg-emerald-500/10 rounded-full px-2.5 py-0.5 uppercase tracking-wider shadow-sm shrink-0">
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
                  <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-nina-orange" />
                    Partidas aguardando resultado ({pending.length})
                  </h2>
                  <div className="space-y-2.5">
                    {pending.map((match) => {
                      const date = new Date(match.match_time).toLocaleString("pt-BR", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                      return (
                        <Card
                          key={match.id}
                          className="bg-slate-900/20 border border-slate-800/50 hover:border-slate-700/50 hover:bg-slate-900/30 transition-all duration-200 rounded-xl opacity-75 group overflow-hidden"
                        >
                          <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            {/* Date info */}
                            <div className="flex items-center gap-3 shrink-0">
                              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                                <Calendar className="h-3.5 w-3.5 text-slate-500" />
                                <span className="capitalize">{date}</span>
                              </div>
                              <div className="hidden sm:block text-[10px] font-semibold bg-slate-800/40 text-slate-400 border border-slate-800/50 rounded px-2 py-0.5 truncate max-w-[130px]">
                                {match.round_name}
                              </div>
                            </div>

                            {/* Matchup with Flags */}
                            <div className="flex-1 flex items-center justify-center gap-2 sm:gap-3 min-w-0 bg-slate-950/20 py-2 px-3 sm:px-4 rounded-xl border border-slate-800/30 shadow-inner">
                              <div className="flex items-center justify-end gap-2 flex-1 min-w-0">
                                <span className="text-xs sm:text-sm font-semibold text-slate-300 truncate text-right">
                                  {match.home_team}
                                </span>
                                <TeamFlag teamName={match.home_team} className="h-5 w-5 border-white/10 shadow-sm opacity-90" />
                              </div>
                              
                              <span className="text-slate-600 font-extrabold text-[10px] shrink-0 px-1.5 select-none tracking-wider">VS</span>
                              
                              <div className="flex items-center justify-start gap-2 flex-1 min-w-0">
                                <TeamFlag teamName={match.away_team} className="h-5 w-5 border-white/10 shadow-sm opacity-90" />
                                <span className="text-xs sm:text-sm font-semibold text-slate-300 truncate text-left">
                                  {match.away_team}
                                </span>
                              </div>
                            </div>

                            {/* Mobile Round info & Scheduled status */}
                            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                              <div className="sm:hidden text-[10px] font-semibold bg-slate-800/40 text-slate-400 border border-slate-800/50 rounded px-2 py-0.5">
                                {match.round_name}
                              </div>
                              <span className="inline-flex items-center text-[10px] font-semibold border border-slate-700/50 text-slate-400 bg-slate-800/40 rounded-full px-2.5 py-0.5 uppercase tracking-wider shadow-sm shrink-0">
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
                <Card className="bg-slate-900/40 border border-slate-800/60 p-10 text-center rounded-2xl shadow-inner">
                  <p className="text-slate-400 text-sm">Nenhuma partida cadastrada. Clique em Sincronizar para importar.</p>
                </Card>
              )}
            </>
          )}
        </section>

        {/* Painel de Sincronização */}
        <section className="space-y-6">
          <Card className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-sm relative overflow-hidden group">
            {/* Ambient background glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-nina-purple/10 to-transparent rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
            
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-nina-purple" />
              Sincronizador
            </h2>
            <p className="text-xs text-slate-300 mb-5 leading-relaxed">
              O sistema sincroniza os resultados reais dos jogos e calcula as pontuações correspondentes de cada palpite de usuário.
            </p>
            
            <Button
              className="w-full bg-gradient-to-r from-nina-wine to-nina-purple hover:from-nina-wine/90 hover:to-nina-purple/90 text-white font-bold h-11 rounded-xl shadow-lg shadow-nina-wine/10 hover:shadow-nina-wine/20 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 border-0"
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
                  syncing ? "bg-nina-purple animate-pulse" : "bg-nina-green"
                )} />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
