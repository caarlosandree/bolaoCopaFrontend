"use client"

import { useEffect, useState } from "react"
import { Goal, Trophy, Zap, Calendar, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { getCopaOverview } from "@/lib/api"
import type { CopaOverview } from "@/lib/types"

function StatCard({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
  sub?: string
  accent?: string
}) {
  return (
    <Card className={`border-slate-800/80 bg-slate-900/60 backdrop-blur-md ${accent ?? ""}`}>
      <CardContent className="flex items-start gap-4 p-5">
        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-700/60 bg-slate-800/80">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">{label}</p>
          <p className="mt-1 truncate text-xl font-black text-white">{value}</p>
          {sub && <p className="mt-0.5 truncate text-xs text-slate-400">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  )
}

function formatDate(ts: string) {
  if (!ts) return "—"
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Sao_Paulo",
    }).format(new Date(ts))
  } catch {
    return ts
  }
}

export function CopaOverviewSection() {
  const [data, setData] = useState<CopaOverview | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCopaOverview()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    )
  }

  if (!data) return null

  const nextMatch = data.next_matches?.[0]

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        icon={<Goal className="h-5 w-5 text-nina-green" />}
        label="Gols na Copa"
        value={data.total_goals}
        sub="total em jogos finalizados"
      />

      <StatCard
        icon={<Trophy className="h-5 w-5 text-amber-400" />}
        label="Artilheiro atual"
        value={data.top_scorer?.player ?? "—"}
        sub={
          data.top_scorer
            ? `${data.top_scorer.goals} gol${data.top_scorer.goals !== 1 ? "s" : ""} · ${data.top_scorer.team}`
            : "nenhum jogo em andamento"
        }
      />

      <StatCard
        icon={<Zap className="h-5 w-5 text-nina-orange" />}
        label="Maior goleada"
        value={
          data.biggest_win
            ? `${data.biggest_win.home_team} ${data.biggest_win.home_score}×${data.biggest_win.away_score} ${data.biggest_win.away_team}`
            : "—"
        }
        sub={data.biggest_win ? formatDate(data.biggest_win.match_time) : undefined}
      />

      <StatCard
        icon={<Calendar className="h-5 w-5 text-slate-300" />}
        label="Próxima partida"
        value={
          nextMatch
            ? `${nextMatch.home_team} × ${nextMatch.away_team}`
            : "Sem jogos agendados"
        }
        sub={nextMatch ? formatDate(nextMatch.match_time) : undefined}
      />
    </div>
  )
}
