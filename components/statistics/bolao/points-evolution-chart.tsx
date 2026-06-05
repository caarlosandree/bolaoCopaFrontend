"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { UserEvolution } from "@/lib/types"

const LINE_COLORS = [
  "#D91E4E",
  "#FF6B00",
  "#25D366",
  "#9C27B0",
  "#3B82F6",
]

type ChartRow = Record<string, number | string>

export function PointsEvolutionChart({ data }: { data: UserEvolution[] }) {
  if (!data.length) {
    return (
      <Card className="border-slate-800/80 bg-slate-900/60">
        <CardContent className="flex h-48 items-center justify-center text-sm text-slate-400">
          Nenhum dado de evolução disponível ainda.
        </CardContent>
      </Card>
    )
  }

  // Transforma para formato Recharts: [{ round: 1, "Carlos": 10, "Ana": 8 }, ...]
  const allRounds = Array.from(
    new Set(data.flatMap((u) => u.points.map((p) => p.round)))
  ).sort((a, b) => a - b)

  const chartData: ChartRow[] = allRounds.map((round) => {
    const row: ChartRow = { round: `R${round}` }
    data.forEach((user) => {
      const pt = user.points.find((p) => p.round === round)
      row[user.user] = pt?.cumulative_points ?? 0
    })
    return row
  })

  return (
    <Card className="border-slate-800/80 bg-slate-900/60 backdrop-blur-md">
      <CardHeader className="border-b border-slate-800/60 pb-4">
        <CardTitle className="text-sm font-black text-white">
          Evolução de Pontos
        </CardTitle>
        <p className="text-[10px] font-medium text-slate-400">
          Top 5 participantes · pontos acumulados por rodada
        </p>
      </CardHeader>
      <CardContent className="p-4">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="round"
              tick={{ fill: "#64748b", fontSize: 10 }}
              axisLine={{ stroke: "#1e293b" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#64748b", fontSize: 10 }}
              axisLine={{ stroke: "#1e293b" }}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                border: "1px solid #1e293b",
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: "#94a3b8", fontWeight: 700 }}
              itemStyle={{ color: "#e2e8f0" }}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, paddingTop: 12, color: "#94a3b8" }}
            />
            {data.map((user, i) => (
              <Line
                key={user.user}
                type="monotone"
                dataKey={user.user}
                stroke={LINE_COLORS[i % LINE_COLORS.length]}
                strokeWidth={2}
                dot={{ r: 3, fill: LINE_COLORS[i % LINE_COLORS.length] }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
