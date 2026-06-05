"use client"

import React, { useState, useEffect } from "react"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Trophy, Search, Star } from "lucide-react"
import { Input } from "@/components/ui/input"
import { getRanking } from "@/lib/api"
import { getUser } from "@/lib/auth"
import type { RankingEntry } from "@/lib/types"

const MEDAL = [
  { border: "border-amber-400/80", text: "text-amber-400", bg: "bg-amber-400/10", pos: "1º" },
  { border: "border-slate-300/80", text: "text-slate-300", bg: "bg-slate-300/10", pos: "2º" },
  { border: "border-amber-600/80", text: "text-amber-600", bg: "bg-amber-600/10", pos: "3º" },
]

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

export default function RankingPage() {
  const currentUser = getUser()
  const [ranking, setRanking] = useState<RankingEntry[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getRanking()
      .then(setRanking)
      .finally(() => setLoading(false))
  }, [])

  const filtered = ranking.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  )

  const podium = ranking.slice(0, 3)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-2 border-nina-red border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center">
            <Trophy className="h-4 w-4 text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">Ranking</h1>
            <p className="text-xs text-slate-500">Veja quem está liderando o bolão</p>
          </div>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Buscar participante..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 rounded-full bg-slate-900 border-slate-800 text-white placeholder-slate-500 text-xs w-full"
          />
        </div>
      </div>

      {/* Pódio */}
      {podium.length > 0 && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {podium.map((user, idx) => {
            const cfg = MEDAL[idx]
            return (
              <Card
                key={user.user_id}
                className={`relative bg-gradient-to-br from-slate-900/95 via-slate-900/80 to-slate-950 border-2 ${cfg.border} shadow-lg rounded-2xl hover:scale-[1.02] transition-all duration-300 overflow-hidden`}
              >
                <div
                  className={`absolute top-3 right-3 text-xs font-black ${cfg.bg} ${cfg.text} px-2.5 py-0.5 rounded-full border border-current/20`}
                >
                  {cfg.pos} Lugar
                </div>
                <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                  <div
                    className={`h-16 w-16 rounded-full flex items-center justify-center text-xl font-black bg-slate-950 border-2 ${cfg.border} relative shadow-md`}
                  >
                    {initials(user.name)}
                    <div className="absolute -bottom-1 -right-1 p-1 bg-slate-900 rounded-full border border-slate-800">
                      <Trophy className={`h-4 w-4 ${cfg.text}`} />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-100 flex items-center justify-center gap-1">
                      {user.name}
                      {idx === 0 && <Star className="h-4 w-4 text-amber-400 fill-amber-400" />}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
                  </div>
                  <div className="w-full py-2 rounded-xl bg-slate-950/40 border border-slate-900 flex items-center justify-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Pontos:</span>
                    <span className={`text-xl font-black ${cfg.text}`}>{user.total_points}</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </section>
      )}

      {/* Tabela completa */}
      <section className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <CardHeader className="border-b border-slate-800/60 py-4 px-6">
          <CardTitle className="text-sm font-bold text-slate-200">Classificação Completa</CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Atualizado automaticamente após a finalização de cada jogo
          </CardDescription>
        </CardHeader>

        <Table>
          <TableHeader className="bg-slate-950/30">
            <TableRow className="border-slate-800">
              <TableHead className="w-[80px] text-center font-bold">Posição</TableHead>
              <TableHead className="w-[50px]" />
              <TableHead className="font-bold">Participante</TableHead>
              <TableHead className="w-[120px] text-right font-bold pr-6">Pontuação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((user) => {
              const isTop3 = user.position <= 3
              const isMe = user.user_id === currentUser?.id
              return (
                <TableRow
                  key={user.user_id}
                  className={`border-slate-800 hover:bg-slate-900/30 transition-colors ${isMe ? "bg-nina-wine/10" : ""}`}
                >
                  <TableCell className="text-center font-black text-sm">
                    {isTop3 ? (
                      <span
                        className={`inline-flex items-center justify-center h-7 w-7 rounded-full text-xs font-black ${
                          user.position === 1
                            ? "bg-amber-400/20 text-amber-400 border border-amber-400/30"
                            : user.position === 2
                              ? "bg-slate-300/20 text-slate-300 border border-slate-300/30"
                              : "bg-amber-600/20 text-amber-600 border border-amber-600/30"
                        }`}
                      >
                        {user.position}
                      </span>
                    ) : (
                      <span className="text-slate-400">{user.position}</span>
                    )}
                  </TableCell>
                  <TableCell className="p-0">
                    <div className="h-8 w-8 rounded-full bg-nina-wine/20 border border-nina-wine/30 flex items-center justify-center text-xs font-bold text-slate-300">
                      {initials(user.name)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <span className="font-bold text-slate-100 block text-sm">
                        {user.name}
                        {isMe && (
                          <span className="ml-2 text-[10px] text-nina-red font-bold bg-nina-wine/30 border border-nina-wine/40 px-1.5 py-0.5 rounded-full">
                            Você
                          </span>
                        )}
                      </span>
                      <span className="text-xs text-slate-500 block">{user.email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-black pr-6 text-slate-200">
                    {user.total_points} pts
                  </TableCell>
                </TableRow>
              )
            })}

            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-slate-400 text-sm py-8">
                  Nenhum participante encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </section>
    </div>
  )
}
