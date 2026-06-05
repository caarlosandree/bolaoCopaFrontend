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
import { Trophy, Search, Star, Award, Medal as MedalIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { getRanking } from "@/lib/api"
import { getUser } from "@/lib/auth"
import type { RankingEntry } from "@/lib/types"

const MEDAL_CONFIG = [
  {
    border: "border-amber-400/40 hover:border-amber-400/80 shadow-amber-500/5 hover:shadow-amber-500/15",
    text: "text-amber-400",
    bg: "bg-amber-400/10",
    pos: "1º",
    glow: "shadow-amber-500/5",
    cardClass: "order-1 md:order-2 md:scale-105 z-10 md:-translate-y-1 bg-gradient-to-b from-amber-950/20 via-slate-900/90 to-slate-950/95",
  },
  {
    border: "border-slate-300/30 hover:border-slate-300/70 shadow-slate-300/5 hover:shadow-slate-300/10",
    text: "text-slate-300",
    bg: "bg-slate-300/10",
    pos: "2º",
    glow: "",
    cardClass: "order-2 md:order-1 md:translate-y-2 bg-gradient-to-b from-slate-800/10 via-slate-900/90 to-slate-950/95",
  },
  {
    border: "border-amber-700/30 hover:border-amber-700/70 shadow-amber-700/5 hover:shadow-amber-700/10",
    text: "text-amber-600",
    bg: "bg-amber-600/10",
    pos: "3º",
    glow: "",
    cardClass: "order-3 md:order-3 md:translate-y-3 bg-gradient-to-b from-amber-900/10 via-slate-900/90 to-slate-950/95",
  },
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
      .catch((err) => console.error("Erro ao carregar ranking:", err))
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
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/60 pb-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/5 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/5">
            <Trophy className="h-6 w-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Ranking Geral</h1>
            <p className="text-xs text-slate-400 font-medium">Acompanhe a liderança em tempo real do nosso bolão</p>
          </div>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar participante pelo nome ou e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 h-11 rounded-xl bg-slate-900/80 border-slate-800/80 hover:border-slate-700/60 focus:border-nina-wine text-white placeholder-slate-500 text-xs w-full transition-all"
          />
        </div>
      </div>

      {/* Pódio visual */}
      {podium.length > 0 && !search && (
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Pódio do Torneio</h2>
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4 pb-4 md:pb-8">
            {podium.map((user, idx) => {
              const cfg = MEDAL_CONFIG[idx]
              const isFirst = idx === 0
              return (
                <Card
                  key={user.user_id}
                  className={`relative border backdrop-blur-md transition-all duration-300 group hover:scale-[1.02] cursor-pointer ${cfg.cardClass} ${cfg.border} shadow-xl ${cfg.glow}`}
                >
                  {/* Medalha / Posição superior */}
                  <div
                    className={`absolute top-4 right-4 text-xs font-black ${cfg.bg} ${cfg.text} px-3 py-1 rounded-full border border-current/20 flex items-center gap-1 shadow-sm`}
                  >
                    {isFirst ? <Star className="h-3 w-3 fill-amber-400 text-amber-400 animate-pulse" /> : <Award className="h-3 w-3" />}
                    {cfg.pos} Lugar
                  </div>

                  <CardContent className="p-6 flex flex-col items-center text-center gap-4 mt-4">
                    {/* Avatar de usuário com borda iluminada */}
                    <div className="relative">
                      <div
                        className={`h-20 w-20 rounded-full flex items-center justify-center text-2xl font-black bg-slate-950 border-2 ${cfg.border} relative shadow-xl text-slate-100 group-hover:scale-105 transition-all duration-300`}
                      >
                        {initials(user.name)}
                        
                        {/* Selo no avatar */}
                        <div className="absolute -bottom-1 -right-1 p-1.5 bg-slate-900 rounded-full border border-slate-800 shadow-md">
                          <Trophy className={`h-4.5 w-4.5 ${cfg.text}`} />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-black text-white text-base tracking-tight truncate max-w-[200px] flex items-center justify-center gap-1">
                        {user.name}
                      </h3>
                      <p className="text-xs text-slate-400/90 font-medium truncate max-w-[210px]">{user.email}</p>
                    </div>

                    <div className="w-full py-2.5 px-4 rounded-xl bg-slate-950/60 border border-slate-900/60 flex items-center justify-between shadow-inner mt-2">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Pontuação</span>
                      <div className="flex items-baseline gap-1">
                        <span className={`text-2xl font-black ${cfg.text}`}>{user.total_points}</span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">pts</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </section>
        </div>
      )}

      {/* Tabela completa */}
      <section className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <CardHeader className="border-b border-slate-800/60 py-5 px-6 bg-slate-950/30">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-black text-slate-200 uppercase tracking-wider">Classificação Completa</CardTitle>
              <CardDescription className="text-xs text-slate-400 font-medium mt-1">
                Atualizado automaticamente após o apito final de cada jogo
              </CardDescription>
            </div>
            <MedalIcon className="h-5 w-5 text-slate-500" />
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-950/40">
              <TableRow className="border-slate-800/60 hover:bg-transparent">
                <TableHead className="w-[80px] text-center font-bold text-slate-300 text-xs">Posição</TableHead>
                <TableHead className="w-[60px]" />
                <TableHead className="font-bold text-slate-300 text-xs">Participante</TableHead>
                <TableHead className="w-[140px] text-right font-bold text-slate-300 text-xs pr-8">Pontuação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((user) => {
                const isTop3 = user.position <= 3
                const isMe = user.user_id === currentUser?.id
                return (
                  <TableRow
                    key={user.user_id}
                    className={`border-slate-800/60 transition-colors duration-200 group hover:bg-slate-900/30 ${
                      isMe 
                        ? "bg-nina-wine/15 hover:bg-nina-wine/25 border-l-4 border-l-nina-red" 
                        : "border-l-4 border-l-transparent"
                    }`}
                  >
                    <TableCell className="text-center font-black text-sm">
                      {isTop3 ? (
                        <span
                          className={`inline-flex items-center justify-center h-8 w-8 rounded-full text-xs font-black shadow-sm ${
                            user.position === 1
                              ? "bg-amber-400/20 text-amber-400 border border-amber-400/30 shadow-amber-500/5"
                              : user.position === 2
                                ? "bg-slate-300/20 text-slate-300 border border-slate-300/30"
                                : "bg-amber-600/20 text-amber-600 border border-amber-600/30"
                          }`}
                        >
                          {user.position}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs font-bold">{user.position}º</span>
                      )}
                    </TableCell>
                    
                    <TableCell className="p-2">
                      <div className="h-9 w-9 rounded-full bg-nina-wine/20 border border-nina-wine/30 group-hover:border-nina-red/30 flex items-center justify-center text-xs font-black text-slate-200 shadow-sm transition-all">
                        {initials(user.name)}
                      </div>
                    </TableCell>
                    
                    <TableCell className="py-3.5">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-slate-100 block text-sm group-hover:text-white transition-colors">
                          {user.name}
                          {isMe && (
                            <span className="ml-2 text-[9px] font-black text-white bg-nina-red px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                              Você
                            </span>
                          )}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">{user.email}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-right font-black pr-8 text-slate-100 text-sm">
                      <span className="bg-slate-950/40 group-hover:bg-slate-950/70 border border-slate-800/40 px-3 py-1.5 rounded-lg shadow-inner text-white">
                        {user.total_points} <span className="text-[10px] font-bold text-slate-500 uppercase ml-0.5">pts</span>
                      </span>
                    </TableCell>
                  </TableRow>
                )
              })}

              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-slate-400 text-sm py-12 font-medium">
                    Nenhum participante encontrado com os termos pesquisados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  )
}

