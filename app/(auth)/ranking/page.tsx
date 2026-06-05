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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Trophy, Search, Star, Award, Medal as MedalIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { UserAvatar } from "@/components/ui/user-avatar"
import { getRanking } from "@/lib/api"
import { getUser } from "@/lib/auth"
import type { RankingEntry } from "@/lib/types"

const MEDAL_CONFIG = [
  {
    border:
      "border-amber-400/40 hover:border-amber-400/80 shadow-amber-500/5 hover:shadow-amber-500/15",
    text: "text-amber-400",
    bg: "bg-amber-400/10",
    pos: "1º",
    glow: "shadow-amber-500/5",
    cardClass:
      "order-1 md:order-2 md:scale-105 z-10 md:-translate-y-1 bg-gradient-to-b from-amber-950/20 via-slate-900/90 to-slate-950/95",
  },
  {
    border:
      "border-slate-300/30 hover:border-slate-300/70 shadow-slate-300/5 hover:shadow-slate-300/10",
    text: "text-slate-300",
    bg: "bg-slate-300/10",
    pos: "2º",
    glow: "",
    cardClass:
      "order-2 md:order-1 md:translate-y-2 bg-gradient-to-b from-slate-800/10 via-slate-900/90 to-slate-950/95",
  },
  {
    border:
      "border-amber-700/30 hover:border-amber-700/70 shadow-amber-700/5 hover:shadow-amber-700/10",
    text: "text-amber-600",
    bg: "bg-amber-600/10",
    pos: "3º",
    glow: "",
    cardClass:
      "order-3 md:order-3 md:translate-y-3 bg-gradient-to-b from-amber-900/10 via-slate-900/90 to-slate-950/95",
  },
]

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
      u.email.toLowerCase().includes(search.toLowerCase())
  )

  const podium = ranking.slice(0, 3)

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-nina-red border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl animate-in space-y-8 duration-300 fade-in">
      {/* Page header */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-800/60 pb-6 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/20 to-amber-600/5 shadow-lg shadow-amber-500/5">
            <Trophy className="h-6 w-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Ranking Geral
            </h1>
            <p className="text-xs font-medium text-slate-400">
              Acompanhe a liderança em tempo real do nosso bolão
            </p>
          </div>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Buscar participante pelo nome ou e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 w-full rounded-xl border-slate-800/80 bg-slate-900/80 pr-4 pl-10 text-xs text-white placeholder-slate-500 transition-all hover:border-slate-700/60 focus:border-nina-wine"
          />
        </div>
      </div>

      {/* Pódio visual */}
      {podium.length > 0 && !search && (
        <div className="space-y-4">
          <h2 className="px-1 text-xs font-bold tracking-wider text-slate-400 uppercase">
            Pódio do Torneio
          </h2>
          <section className="grid grid-cols-1 gap-6 pb-4 md:grid-cols-3 md:gap-4 md:pb-8">
            {podium.map((user, idx) => {
              const cfg = MEDAL_CONFIG[idx]
              const isFirst = idx === 0
              return (
                <Card
                  key={user.user_id}
                  className={`group relative cursor-pointer border backdrop-blur-md transition-all duration-300 hover:scale-[1.02] ${cfg.cardClass} ${cfg.border} shadow-xl ${cfg.glow}`}
                >
                  {/* Medalha / Posição superior */}
                  <div
                    className={`absolute top-4 right-4 text-xs font-black ${cfg.bg} ${cfg.text} flex items-center gap-1 rounded-full border border-current/20 px-3 py-1 shadow-sm`}
                  >
                    {isFirst ? (
                      <Star className="h-3 w-3 animate-pulse fill-amber-400 text-amber-400" />
                    ) : (
                      <Award className="h-3 w-3" />
                    )}
                    {cfg.pos} Lugar
                  </div>

                  <CardContent className="mt-4 flex flex-col items-center gap-4 p-6 text-center">
                    {/* Avatar de usuário com borda iluminada */}
                    <div className="relative">
                      <UserAvatar
                        avatarUrl={user.avatar_url}
                        name={user.name}
                        size={80}
                        className={`border-2 shadow-xl transition-all duration-300 group-hover:scale-105 ${cfg.border}`}
                      />
                      {/* Selo no avatar */}
                      <div className="absolute -right-1 -bottom-1 rounded-full border border-slate-800 bg-slate-900 p-1.5 shadow-md">
                        <Trophy className={`h-4.5 w-4.5 ${cfg.text}`} />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h3 className="flex max-w-[200px] items-center justify-center gap-1 truncate text-base font-black tracking-tight text-white">
                        {user.name}
                      </h3>
                      <p className="max-w-[210px] truncate text-xs font-medium text-slate-400/90">
                        {user.email}
                      </p>
                    </div>

                    <div className="mt-2 flex w-full items-center justify-between rounded-xl border border-slate-900/60 bg-slate-950/60 px-4 py-2.5 shadow-inner">
                      <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                        Pontuação
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className={`text-2xl font-black ${cfg.text}`}>
                          {user.total_points}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">
                          pts
                        </span>
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
      <section className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 shadow-xl backdrop-blur-md">
        <CardHeader className="border-b border-slate-800/60 bg-slate-950/30 px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-black tracking-wider text-slate-200 uppercase">
                Classificação Completa
              </CardTitle>
              <CardDescription className="mt-1 text-xs font-medium text-slate-400">
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
                <TableHead className="w-[80px] text-center text-xs font-bold text-slate-300">
                  Posição
                </TableHead>
                <TableHead className="w-[60px]" />
                <TableHead className="text-xs font-bold text-slate-300">
                  Participante
                </TableHead>
                <TableHead className="w-[140px] pr-8 text-right text-xs font-bold text-slate-300">
                  Pontuação
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((user) => {
                const isTop3 = user.position <= 3
                const isMe = user.user_id === currentUser?.id
                return (
                  <TableRow
                    key={user.user_id}
                    className={`group border-slate-800/60 transition-colors duration-200 hover:bg-slate-900/30 ${
                      isMe
                        ? "border-l-4 border-l-nina-red bg-nina-wine/15 hover:bg-nina-wine/25"
                        : "border-l-4 border-l-transparent"
                    }`}
                  >
                    <TableCell className="text-center text-sm font-black">
                      {isTop3 ? (
                        <span
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-black shadow-sm ${
                            user.position === 1
                              ? "border border-amber-400/30 bg-amber-400/20 text-amber-400 shadow-amber-500/5"
                              : user.position === 2
                                ? "border border-slate-300/30 bg-slate-300/20 text-slate-300"
                                : "border border-amber-600/30 bg-amber-600/20 text-amber-600"
                          }`}
                        >
                          {user.position}
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-slate-400">
                          {user.position}º
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="p-2">
                      <UserAvatar
                        avatarUrl={user.avatar_url}
                        name={user.name}
                        size={36}
                        className="border border-nina-wine/30 shadow-sm transition-all group-hover:border-nina-red/30"
                      />
                    </TableCell>

                    <TableCell className="py-3.5">
                      <div className="flex flex-col gap-0.5">
                        <span className="block text-sm font-bold text-slate-100 transition-colors group-hover:text-white">
                          {user.name}
                          {isMe && (
                            <span className="ml-2 rounded-full bg-nina-red px-2 py-0.5 text-[9px] font-black tracking-wider text-white uppercase shadow-sm">
                              Você
                            </span>
                          )}
                        </span>
                        <span className="text-xs font-medium text-slate-400">
                          {user.email}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="pr-8 text-right text-sm font-black text-slate-100">
                      <span className="rounded-lg border border-slate-800/40 bg-slate-950/40 px-3 py-1.5 text-white shadow-inner group-hover:bg-slate-950/70">
                        {user.total_points}{" "}
                        <span className="ml-0.5 text-[10px] font-bold text-slate-500 uppercase">
                          pts
                        </span>
                      </span>
                    </TableCell>
                  </TableRow>
                )
              })}

              {filtered.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-12 text-center text-sm font-medium text-slate-400"
                  >
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
