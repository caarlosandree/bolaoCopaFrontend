"use client"

import { useEffect, useState } from "react"
import { Trophy, Target, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getRanking } from "@/lib/api"
import { getUser } from "@/lib/auth"
import type { Match, RankingEntry } from "@/lib/types"
import { cn } from "@/lib/utils"

type GuessEntry = {
  homeGuess: string
  awayGuess: string
  saved: boolean
  loading: boolean
}

type RoundPanelProps = {
  roundName: string
  matches: Match[]
  palpitedCount: number
  guesses: Record<number, GuessEntry>
  onConfirmAll: () => Promise<void>
}

const MEDALS = ["🥇", "🥈", "🥉"]

const SCORING_RULES = [
  { icon: "🎯", label: "Placar exato", pts: 5, color: "text-green-400" },
  { icon: "✅", label: "Vencedor + saldo", pts: 3, color: "text-blue-400" },
  { icon: "👍", label: "Vencedor", pts: 2, color: "text-amber-400" },
  { icon: "❌", label: "Resultado errado", pts: 0, color: "text-slate-500" },
] as const

export function RoundPanel({
  roundName,
  matches,
  palpitedCount,
  guesses,
  onConfirmAll,
}: RoundPanelProps) {
  const [ranking, setRanking] = useState<RankingEntry[]>([])
  const [confirmLoading, setConfirmLoading] = useState(false)
  const currentUser = getUser()

  useEffect(() => {
    getRanking()
      .then(setRanking)
      .catch(() => {})
  }, [])

  const finishedMatches = matches.filter((m) => m.status === "finished")
  const roundPoints = finishedMatches.reduce(
    (acc, m) => acc + (m.user_guess?.points_earned ?? 0),
    0
  )

  const hasPending = matches.some((m) => {
    const g = guesses[m.id]
    return g && !g.saved && g.homeGuess !== "" && g.awayGuess !== ""
  })

  const top3 = ranking.slice(0, 3)
  const userEntry = ranking.find((r) => r.user_id === currentUser?.id)
  const userInTop3 = userEntry ? userEntry.position <= 3 : false

  async function handleConfirmAll() {
    setConfirmLoading(true)
    try {
      await onConfirmAll()
    } finally {
      setConfirmLoading(false)
    }
  }

  return (
    <div className="space-y-5 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4">
      {/* Título */}
      <div className="flex items-center gap-2">
        <Trophy className="h-4 w-4 text-amber-400" />
        <p className="text-xs font-black tracking-wider text-white uppercase">
          {roundName}
        </p>
      </div>

      {/* Subtotal de pontos */}
      <div className="rounded-xl border border-slate-800/60 bg-slate-950/60 p-3">
        <p className="mb-1 text-[10px] font-black tracking-wider text-slate-500 uppercase">
          Meus pontos na rodada
        </p>
        {finishedMatches.length > 0 ? (
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-white">
              +{roundPoints}
            </span>
            <span className="text-xs font-bold text-slate-400">
              pts de {finishedMatches.length} jogo
              {finishedMatches.length !== 1 ? "s" : ""}
            </span>
          </div>
        ) : (
          <p className="text-xs font-bold text-slate-500">
            Rodada em andamento
          </p>
        )}
      </div>

      {/* Barra de progresso */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <p className="text-[10px] font-black tracking-wider text-slate-500 uppercase">
            Progresso
          </p>
          <span className="text-[10px] font-bold text-slate-400 tabular-nums">
            {palpitedCount}/{matches.length}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-800">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              palpitedCount === matches.length && matches.length > 0
                ? "bg-gradient-to-r from-green-600 to-green-400"
                : "bg-gradient-to-r from-green-700 to-green-500"
            )}
            style={{
              width:
                matches.length > 0
                  ? `${(palpitedCount / matches.length) * 100}%`
                  : "0%",
            }}
          />
        </div>
        {palpitedCount === matches.length && matches.length > 0 && (
          <p className="mt-1 text-[10px] font-bold text-green-400">
            🏆 Tudo palpitado!
          </p>
        )}
      </div>

      {/* Mini ranking */}
      {ranking.length > 0 && (
        <div>
          <p className="mb-2 text-[10px] font-black tracking-wider text-slate-500 uppercase">
            Ranking
          </p>
          <div className="space-y-1.5">
            {top3.map((entry, i) => {
              const isMe = entry.user_id === currentUser?.id
              return (
                <div
                  key={entry.user_id}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs",
                    isMe
                      ? "border border-nina-wine/30 bg-nina-wine/20"
                      : "border border-slate-800/40 bg-slate-950/40"
                  )}
                >
                  <span className="flex-shrink-0 text-sm">{MEDALS[i]}</span>
                  <span
                    className={cn(
                      "flex-1 truncate font-bold",
                      isMe ? "text-white" : "text-slate-300"
                    )}
                  >
                    {isMe ? "Você" : entry.name}
                  </span>
                  <span
                    className={cn(
                      "flex-shrink-0 font-black",
                      isMe ? "text-nina-orange" : "text-slate-400"
                    )}
                  >
                    {entry.total_points} pts
                  </span>
                </div>
              )
            })}

            {!userInTop3 && userEntry && (
              <>
                <div className="flex items-center gap-1 py-0.5">
                  <div className="h-px flex-1 bg-slate-800/60" />
                  <span className="text-[10px] text-slate-600">•••</span>
                  <div className="h-px flex-1 bg-slate-800/60" />
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-nina-wine/30 bg-nina-wine/20 px-2.5 py-1.5 text-xs">
                  <span className="flex-shrink-0 font-black text-slate-400">
                    #{userEntry.position}
                  </span>
                  <span className="flex-1 truncate font-bold text-white">
                    Você
                  </span>
                  <span className="flex-shrink-0 font-black text-nina-orange">
                    {userEntry.total_points} pts
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Como pontuar */}
      <div>
        <p className="mb-2 text-[10px] font-black tracking-wider text-slate-500 uppercase">
          Como pontuar
        </p>
        <div className="space-y-1">
          {SCORING_RULES.map(({ icon, label, pts, color }) => (
            <div key={label} className="flex items-center gap-2 px-1 text-xs">
              <span className="flex-shrink-0 text-sm">{icon}</span>
              <span className="flex-1 text-slate-400">{label}</span>
              <span className={cn("flex-shrink-0 font-black", color)}>
                {pts > 0 ? `+${pts}` : "0"} pts
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Confirmar Todos */}
      <Button
        onClick={handleConfirmAll}
        disabled={!hasPending || confirmLoading}
        className={cn(
          "flex h-10 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all",
          hasPending && !confirmLoading
            ? "cursor-pointer bg-gradient-to-r from-nina-red to-nina-orange text-white shadow-lg shadow-nina-red/10 hover:opacity-90 active:scale-95"
            : "cursor-not-allowed border border-slate-700/40 bg-slate-800/60 text-slate-500"
        )}
      >
        {confirmLoading ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : hasPending ? (
          <>
            <Target className="h-4 w-4" />
            Confirmar Todos
          </>
        ) : (
          <>
            <CheckCircle2 className="h-4 w-4 text-green-400" />
            Todos confirmados
          </>
        )}
      </Button>
    </div>
  )
}
