"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { GuessDistribution } from "@/lib/types"

export function GuessDistributionChart({ data }: { data: GuessDistribution[] }) {
  if (!data.length) {
    return (
      <Card className="border-slate-800/80 bg-slate-900/60">
        <CardContent className="flex h-48 items-center justify-center text-sm text-slate-400">
          Nenhum palpite registrado ainda.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-slate-800/80 bg-slate-900/60 backdrop-blur-md">
      <CardHeader className="border-b border-slate-800/60 pb-4">
        <CardTitle className="text-sm font-black text-white">
          Placares mais apostados
        </CardTitle>
        <p className="text-[10px] font-medium text-slate-400">
          Top 8 resultados mais escolhidos pelos participantes
        </p>
      </CardHeader>
      <CardContent className="p-4">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart
            data={data}
            margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
            barSize={28}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="score"
              tick={{ fill: "#64748b", fontSize: 11 }}
              axisLine={{ stroke: "#1e293b" }}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
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
              cursor={{ fill: "#1e293b" }}
              formatter={(value) => [`${value} palpites`, "Quantidade"]}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.map((_, i) => (
                <Cell
                  key={i}
                  fill={i === 0 ? "#D91E4E" : i === 1 ? "#FF6B00" : "#475569"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
