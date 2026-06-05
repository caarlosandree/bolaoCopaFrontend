"use client"

import { Target, CheckCircle2, TrendingUp, Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { BolaoOverview } from "@/lib/types"

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
  sub?: string
}) {
  return (
    <Card className="border-slate-800/80 bg-slate-900/60 backdrop-blur-md">
      <CardContent className="flex items-start gap-4 p-5">
        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-700/60 bg-slate-800/80">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            {label}
          </p>
          <p className="mt-1 text-xl font-black text-white">{value}</p>
          {sub && (
            <p className="mt-0.5 truncate text-xs text-slate-400">{sub}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function BolaoOverviewSection({ data }: { data: BolaoOverview }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        icon={<Target className="h-5 w-5 text-slate-300" />}
        label="Total de palpites"
        value={data.total_guesses.toLocaleString("pt-BR")}
        sub="registrados no torneio"
      />
      <StatCard
        icon={<CheckCircle2 className="h-5 w-5 text-nina-green" />}
        label="Acertos exatos"
        value={data.exact_hits}
        sub="placar exato (5 pts cada)"
      />
      <StatCard
        icon={<TrendingUp className="h-5 w-5 text-nina-orange" />}
        label="Taxa de acerto"
        value={`${(data.hit_rate * 100).toFixed(1)}%`}
        sub="palpites com pelo menos 2 pts"
      />
      <StatCard
        icon={<Star className="h-5 w-5 text-amber-400" />}
        label="Rodada mais pontuada"
        value={data.best_round?.name ?? "—"}
        sub={
          data.best_round
            ? `${data.best_round.total_points} pontos distribuídos`
            : "nenhuma rodada finalizada"
        }
      />
    </div>
  )
}
