"use client"

import { useEffect, useState } from "react"
import { Loader2, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { getGroupStandings } from "@/lib/api"
import { TeamFlag } from "@/components/ui/team-flag"
import type { Group } from "@/lib/types"

function GroupTable({ group }: { group: Group }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-slate-800/60">
            <th className="py-2 pr-2 text-left font-bold text-slate-400">
              Seleção
            </th>
            <th className="w-8 py-2 text-center font-bold text-slate-400">J</th>
            <th className="w-8 py-2 text-center font-bold text-slate-400">V</th>
            <th className="w-8 py-2 text-center font-bold text-slate-400">E</th>
            <th className="w-8 py-2 text-center font-bold text-slate-400">D</th>
            <th className="w-8 py-2 text-center font-bold text-slate-400">
              GM
            </th>
            <th className="w-8 py-2 text-center font-bold text-slate-400">
              GS
            </th>
            <th className="w-8 py-2 text-center font-bold text-slate-400">
              SG
            </th>
            <th className="w-10 py-2 text-center font-black text-slate-200">
              PTS
            </th>
          </tr>
        </thead>
        <tbody>
          {group.teams.map((team, i) => (
            <tr
              key={team.name}
              className={`border-b border-slate-800/40 transition-colors hover:bg-slate-800/30 ${
                i < 2 ? "bg-nina-wine/5" : ""
              }`}
            >
              <td className="py-2.5 pr-2">
                <div className="flex items-center gap-2">
                  <TeamFlag
                    teamName={team.name}
                    className="h-5 w-5 text-[8px]"
                  />
                  <span
                    className={`font-semibold ${i < 2 ? "text-white" : "text-slate-300"}`}
                  >
                    {team.name}
                  </span>
                  {i < 2 && (
                    <span className="ml-1 rounded-full bg-nina-wine/40 px-1.5 py-0.5 text-[8px] font-black text-nina-red uppercase">
                      Classif.
                    </span>
                  )}
                </div>
              </td>
              <td className="py-2.5 text-center text-slate-300">
                {team.played}
              </td>
              <td className="py-2.5 text-center text-slate-300">{team.won}</td>
              <td className="py-2.5 text-center text-slate-300">
                {team.drawn}
              </td>
              <td className="py-2.5 text-center text-slate-300">{team.lost}</td>
              <td className="py-2.5 text-center text-slate-300">{team.gf}</td>
              <td className="py-2.5 text-center text-slate-300">{team.ga}</td>
              <td
                className={`py-2.5 text-center font-semibold ${team.gd > 0 ? "text-nina-green" : team.gd < 0 ? "text-nina-red" : "text-slate-300"}`}
              >
                {team.gd > 0 ? `+${team.gd}` : team.gd}
              </td>
              <td className="py-2.5 text-center font-black text-white">
                {team.points}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function GroupStandingsSection() {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    getGroupStandings()
      .then((d) => setGroups(d.groups))
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

  if (!groups.length) {
    return (
      <Card className="border-slate-800/80 bg-slate-900/60">
        <CardContent className="flex h-32 items-center justify-center text-sm text-slate-400">
          Classificação de grupos ainda não disponível.
        </CardContent>
      </Card>
    )
  }

  const group = groups[current]

  return (
    <Card className="border-slate-800/80 bg-slate-900/60 backdrop-blur-md">
      <CardHeader className="border-b border-slate-800/60 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700/60 bg-slate-800/80">
              <Users className="h-4 w-4 text-slate-300" />
            </div>
            <div>
              <CardTitle className="text-sm font-black text-white">
                {group.name}
              </CardTitle>
              <p className="text-[10px] font-medium text-slate-400">
                Fase de Grupos · {current + 1} de {groups.length}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {groups.map((g, i) => {
              const letter =
                g.name.replace(/Grupo\s*/i, "").replace(/Group\s*/i, "") ||
                String.fromCharCode(65 + i)
              return (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-bold transition-all ${
                    i === current
                      ? "bg-nina-red text-white shadow-md shadow-nina-red/20"
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                  }`}
                >
                  {letter}
                </button>
              )
            })}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <GroupTable group={group} />
        <p className="mt-3 text-[10px] text-slate-500">
          As 2 primeiras seleções de cada grupo avançam ao mata-mata. Os 8
          melhores terceiros colocados também se classificam.
        </p>
      </CardContent>
    </Card>
  )
}
