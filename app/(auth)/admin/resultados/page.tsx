"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar, ClipboardList, CheckCircle, Flame, Save } from "lucide-react"
import { getActiveRound, updateMatchScore } from "@/lib/api"
import type { Match } from "@/lib/types"

type ScoreInput = { homeScore: string; awayScore: string }

export default function ResultadosPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [roundName, setRoundName] = useState("")
  const [inputs, setInputs] = useState<Record<number, ScoreInput>>({})
  const [finished, setFinished] = useState<Set<number>>(new Set())
  const [loadingId, setLoadingId] = useState<number | null>(null)
  const [logs, setLogs] = useState<string[]>([])
  const [pageLoading, setPageLoading] = useState(true)

  useEffect(() => {
    loadMatches()
  }, [])

  async function loadMatches() {
    try {
      const data = await getActiveRound()
      const all = data.matches ?? []
      setMatches(all)
      setRoundName(data.round?.name ?? "")

      const init: Record<number, ScoreInput> = {}
      const done = new Set<number>()
      for (const m of all) {
        if (m.status === "finished") {
          init[m.id] = { homeScore: String(m.home_score ?? ""), awayScore: String(m.away_score ?? "") }
          done.add(m.id)
        } else {
          init[m.id] = { homeScore: "", awayScore: "" }
        }
      }
      setInputs(init)
      setFinished(done)
    } finally {
      setPageLoading(false)
    }
  }

  function handleInput(matchId: number, field: "homeScore" | "awayScore", value: string) {
    const clean = value.replace(/\D/g, "")
    setInputs((prev) => ({
      ...prev,
      [matchId]: { ...(prev[matchId] ?? { homeScore: "", awayScore: "" }), [field]: clean },
    }))
  }

  async function handleFinalize(match: Match) {
    const sc = inputs[match.id]
    if (!sc || sc.homeScore === "" || sc.awayScore === "") {
      alert("Preencha o placar antes de finalizar.")
      return
    }
    setLoadingId(match.id)
    const home = Number(sc.homeScore)
    const away = Number(sc.awayScore)
    try {
      await updateMatchScore(match.id, home, away)
      setFinished((prev) => new Set(prev).add(match.id))
      setLogs((prev) => [
        `[OK] #${match.id} ${match.home_team} x ${match.away_team} → ${home}x${away} — transação ACID confirmada.`,
        ...prev,
      ])
    } catch (err) {
      setLogs((prev) => [
        `[ERRO] #${match.id}: ${err instanceof Error ? err.message : "Erro desconhecido"}`,
        ...prev,
      ])
    } finally {
      setLoadingId(null)
    }
  }

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-2 border-nina-purple border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-nina-purple/20 to-nina-wine/20 border border-nina-purple/30 flex items-center justify-center">
          <ClipboardList className="h-4 w-4 text-nina-purple" />
        </div>
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">Lançar Resultados</h1>
          <p className="text-xs text-slate-500">
            {roundName ? `Rodada ativa: ${roundName}` : "Nenhuma rodada ativa"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Jogos */}
        <section className="lg:col-span-2 space-y-4">
          {matches.length === 0 ? (
            <Card className="bg-slate-900/40 border border-slate-800 p-8 text-center rounded-2xl">
              <p className="text-slate-400 text-sm">Nenhuma partida na rodada ativa.</p>
            </Card>
          ) : (
            matches.map((match) => {
              const sc = inputs[match.id] ?? { homeScore: "", awayScore: "" }
              const isFinished = finished.has(match.id)
              const isProcessing = loadingId === match.id

              return (
                <Card
                  key={match.id}
                  className={`bg-gradient-to-r from-slate-900/90 to-slate-950 border transition-all ${
                    isFinished
                      ? "border-slate-800/40 opacity-70"
                      : "border-slate-800 hover:border-nina-purple/30"
                  }`}
                >
                  <CardContent className="p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 md:min-w-[140px]">
                      <Calendar className="h-4 w-4 text-nina-purple" />
                      {new Date(match.match_time).toLocaleString("pt-BR", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>

                    <div className="flex items-center justify-center flex-1 gap-4">
                      <div className="flex items-center gap-3 flex-1 justify-end">
                        <span className="text-sm font-bold text-slate-200">{match.home_team}</span>
                        <div className="h-8 w-8 rounded-full bg-nina-wine/30 border border-nina-wine/50 flex items-center justify-center text-[10px] font-black text-slate-200">
                          {match.home_team.substring(0, 2).toUpperCase()}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Input
                          type="text"
                          maxLength={2}
                          disabled={isFinished || isProcessing}
                          value={sc.homeScore}
                          onChange={(e) => handleInput(match.id, "homeScore", e.target.value)}
                          className="h-11 w-11 text-center font-black bg-slate-900 border-slate-800 text-lg rounded-lg text-white focus:border-nina-purple"
                          placeholder="-"
                        />
                        <span className="text-slate-600 font-extrabold">x</span>
                        <Input
                          type="text"
                          maxLength={2}
                          disabled={isFinished || isProcessing}
                          value={sc.awayScore}
                          onChange={(e) => handleInput(match.id, "awayScore", e.target.value)}
                          className="h-11 w-11 text-center font-black bg-slate-900 border-slate-800 text-lg rounded-lg text-white focus:border-nina-purple"
                          placeholder="-"
                        />
                      </div>

                      <div className="flex items-center gap-3 flex-1 justify-start">
                        <div className="h-8 w-8 rounded-full bg-nina-wine/30 border border-nina-wine/50 flex items-center justify-center text-[10px] font-black text-slate-200">
                          {match.away_team.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-sm font-bold text-slate-200">{match.away_team}</span>
                      </div>
                    </div>

                    <div>
                      {isFinished ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-nina-green bg-nina-green/10 border border-nina-green/20 rounded-full px-3 py-1.5">
                          <CheckCircle className="h-4 w-4" />
                          Lançado
                        </span>
                      ) : (
                        <Button
                          onClick={() => handleFinalize(match)}
                          disabled={sc.homeScore === "" || sc.awayScore === "" || isProcessing}
                          className="h-10 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-nina-wine to-nina-purple hover:opacity-90 text-white cursor-pointer active:scale-95 transition-all"
                        >
                          {isProcessing ? (
                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-1" />
                              Finalizar
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
        </section>

        {/* Console */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-nina-orange" />
            <h2 className="text-base font-bold text-slate-200">Console de Transações</h2>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 h-[340px] flex flex-col justify-between shadow-xl">
            <div className="space-y-2 overflow-y-auto pr-1 flex-1 font-mono text-[10px] text-slate-300 leading-normal">
              {logs.length === 0 ? (
                <div className="text-slate-500 text-center py-12">
                  [Aguardando lançamento de resultados...]
                </div>
              ) : (
                logs.map((log, idx) => (
                  <div key={idx} className={log.startsWith("[ERRO]") ? "text-red-400" : "text-nina-green"}>
                    {log}
                  </div>
                ))
              )}
            </div>
            <div className="border-t border-slate-800 pt-3 mt-3 flex items-center justify-between text-[10px] text-slate-500">
              <span>Status: PRONTO</span>
              <span className="h-2 w-2 rounded-full bg-nina-green animate-pulse" />
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
