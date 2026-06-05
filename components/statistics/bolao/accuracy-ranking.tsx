"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserAvatar } from "@/components/ui/user-avatar"
import type { AccuracyRow } from "@/lib/types"

export function AccuracyRankingTable({ data }: { data: AccuracyRow[] }) {
  if (!data.length) {
    return (
      <Card className="border-slate-800/80 bg-slate-900/60">
        <CardContent className="flex h-32 items-center justify-center text-sm text-slate-400">
          Nenhum palpite finalizado ainda.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-slate-800/80 bg-slate-900/60 backdrop-blur-md">
      <CardHeader className="border-b border-slate-800/60 pb-4">
        <CardTitle className="text-sm font-black text-white">
          Ranking de Acertos
        </CardTitle>
        <p className="text-[10px] font-medium text-slate-400">
          Classificação por acertos exatos e parciais
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-800/60 bg-slate-950/30">
                <th className="px-4 py-3 text-left font-bold text-slate-400">
                  #
                </th>
                <th className="px-2 py-3 text-left font-bold text-slate-400">
                  Participante
                </th>
                <th
                  className="px-3 py-3 text-center font-bold text-nina-green"
                  title="Acertos exatos (5pts)"
                >
                  Exatos
                </th>
                <th
                  className="px-3 py-3 text-center font-bold text-nina-orange"
                  title="Acertos parciais (2-3pts)"
                >
                  Parciais
                </th>
                <th className="px-3 py-3 text-center font-bold text-slate-400">
                  Erros
                </th>
                <th className="px-3 py-3 text-center font-bold text-slate-300">
                  Total
                </th>
                <th className="px-4 py-3 text-right font-bold text-slate-200">
                  Taxa
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr
                  key={row.name}
                  className="group border-b border-slate-800/40 transition-colors hover:bg-slate-800/20"
                >
                  <td className="px-4 py-3 font-black text-slate-400">
                    {i + 1}
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-2">
                      <UserAvatar
                        avatarUrl={row.avatar_url}
                        name={row.name}
                        size={28}
                        className="border border-slate-700/60"
                      />
                      <span className="font-semibold text-slate-200">
                        {row.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-center font-black text-nina-green">
                    {row.exact}
                  </td>
                  <td className="px-3 py-3 text-center font-bold text-nina-orange">
                    {row.partial}
                  </td>
                  <td className="px-3 py-3 text-center text-slate-400">
                    {row.wrong}
                  </td>
                  <td className="px-3 py-3 text-center font-semibold text-slate-300">
                    {row.total}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="rounded-full bg-slate-800/60 px-2 py-0.5 font-black text-white">
                      {(row.rate * 100).toFixed(0)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
