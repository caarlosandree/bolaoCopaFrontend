"use client"

import React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { UserAvatar } from "@/components/ui/user-avatar"
import { TeamFlag } from "@/components/ui/team-flag"
import { Target, Zap, X, Users, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"
import type { MatchGuessesResponse } from "@/lib/types"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: MatchGuessesResponse | null
  currentUserId: number | undefined
}

function PointsBadge({ points }: { points: number | null }) {
  if (points === null || points === 0)
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-slate-700/50 bg-slate-800/50 px-2.5 py-0.5 text-[11px] font-black text-slate-500">
        <X className="h-3 w-3" />0 pts
      </span>
    )
  if (points === 5)
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-black text-emerald-400">
        <Target className="h-3 w-3" />5 pts
      </span>
    )
  if (points >= 6 && points <= 8)
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-black text-emerald-300">
        <Target className="h-3 w-3" />
        {points} pts
        <Trophy className="h-2.5 w-2.5" />
      </span>
    )
  if (points === 3)
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-black text-amber-400">
        <Zap className="h-3 w-3" />3 pts
      </span>
    )
  if (points === 2)
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-orange-500/30 bg-orange-500/15 px-2.5 py-0.5 text-[11px] font-black text-orange-400">
        <Zap className="h-3 w-3" />2 pts
      </span>
    )
  if (points >= 1 && points <= 4)
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-teal-500/30 bg-teal-500/15 px-2.5 py-0.5 text-[11px] font-black text-teal-300">
        <Zap className="h-3 w-3" />
        {points} pts
        {points > 1 && <Trophy className="h-2.5 w-2.5" />}
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-slate-700/50 bg-slate-800/50 px-2.5 py-0.5 text-[11px] font-black text-slate-500">
      <X className="h-3 w-3" />
      {points} pts
    </span>
  )
}

export function MatchGuessesDialog({
  open,
  onOpenChange,
  data,
  currentUserId,
}: Props) {
  if (!data) return null

  const { match, stats, guesses } = data
  const hasResult = match.home_score !== null && match.away_score !== null

  const exactPct = stats.total > 0 ? (stats.exact / stats.total) * 100 : 0
  const partialPct = stats.total > 0 ? (stats.partial / stats.total) * 100 : 0
  const wrongPct = stats.total > 0 ? (stats.wrong / stats.total) * 100 : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-hidden border-slate-800/80 bg-slate-950 p-0 shadow-2xl">
        {/* Header com resultado */}
        <div className="border-b border-slate-800/60 bg-slate-900/60 p-5">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-center text-xs font-bold tracking-wider text-slate-400 uppercase">
              Palpites dos participantes
            </DialogTitle>
          </DialogHeader>

          <div className="flex items-center justify-between gap-3">
            {/* Time da casa */}
            <div className="flex flex-1 flex-col items-center gap-2">
              <TeamFlag
                teamName={match.home_team}
                className="h-12 w-12"
                fallbackSize="text-sm"
              />
              <span className="text-center text-xs font-bold text-slate-200">
                {match.home_team}
              </span>
            </div>

            {/* Placar / VS */}
            <div className="flex flex-col items-center gap-1">
              {hasResult ? (
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-black text-white tabular-nums">
                    {match.home_score}
                  </span>
                  <span className="text-lg font-bold text-slate-600">×</span>
                  <span className="text-3xl font-black text-white tabular-nums">
                    {match.away_score}
                  </span>
                </div>
              ) : (
                <span className="text-xl font-black text-slate-600">VS</span>
              )}
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[9px] font-black tracking-wider uppercase",
                  match.status === "finished"
                    ? "bg-slate-800 text-slate-400"
                    : match.status === "ongoing"
                      ? "bg-emerald-900/50 text-emerald-400"
                      : "bg-nina-wine/20 text-nina-red"
                )}
              >
                {match.status === "finished"
                  ? "Encerrado"
                  : match.status === "ongoing"
                    ? "Ao vivo"
                    : "Bloqueado"}
              </span>
              {match.is_knockout && (
                <span className="rounded-full border border-nina-purple/30 bg-nina-purple/10 px-2 py-0.5 text-[9px] font-black tracking-wider text-nina-purple uppercase">
                  Mata-mata
                </span>
              )}
              {match.is_knockout &&
                match.winner_team &&
                match.advance_method && (
                  <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[9px] font-black tracking-wider text-amber-400 uppercase">
                    {match.winner_team === "home"
                      ? match.home_team
                      : match.away_team}{" "}
                    · {match.advance_method === "et" ? "Prorr." : "Pênaltis"}
                  </span>
                )}
            </div>

            {/* Time visitante */}
            <div className="flex flex-1 flex-col items-center gap-2">
              <TeamFlag
                teamName={match.away_team}
                className="h-12 w-12"
                fallbackSize="text-sm"
              />
              <span className="text-center text-xs font-bold text-slate-200">
                {match.away_team}
              </span>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="border-b border-slate-800/40 px-5 py-4">
          <div className="mb-3 flex items-center gap-2">
            <Users className="h-3.5 w-3.5 text-slate-500" />
            <span className="text-xs font-bold text-slate-400">
              {stats.total} palpites
            </span>
          </div>

          {stats.total > 0 && (
            <>
              {/* Barra de distribuição */}
              <div className="mb-3 flex h-2 overflow-hidden rounded-full">
                {exactPct > 0 && (
                  <div
                    className="bg-emerald-500 transition-all"
                    style={{ width: `${exactPct}%` }}
                  />
                )}
                {partialPct > 0 && (
                  <div
                    className="bg-amber-500 transition-all"
                    style={{ width: `${partialPct}%` }}
                  />
                )}
                {wrongPct > 0 && (
                  <div
                    className="bg-slate-700 transition-all"
                    style={{ width: `${wrongPct}%` }}
                  />
                )}
              </div>

              <div className="flex justify-between text-[11px] font-bold">
                <span className="text-emerald-400">
                  {stats.exact} exatos ({Math.round(exactPct)}%)
                </span>
                <span className="text-amber-400">{stats.partial} parciais</span>
                <span className="text-slate-500">{stats.wrong} erros</span>
              </div>
            </>
          )}
        </div>

        {/* Lista de palpites */}
        <div
          className="overflow-y-auto"
          style={{ maxHeight: "calc(90vh - 280px)" }}
        >
          {guesses.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-500">
              Nenhum palpite registrado para este jogo.
            </div>
          ) : (
            <ul className="divide-y divide-slate-800/40">
              {guesses.map((g) => {
                const isMe = g.user_id === currentUserId
                return (
                  <li
                    key={g.user_id}
                    className={cn(
                      "flex items-center gap-3 px-5 py-3 transition-colors",
                      isMe
                        ? "border-l-2 border-nina-red bg-nina-wine/10"
                        : "border-l-2 border-transparent hover:bg-slate-900/40"
                    )}
                  >
                    <UserAvatar
                      avatarUrl={g.avatar_url}
                      name={g.name}
                      size={34}
                      className="flex-shrink-0 border border-slate-800"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-sm font-bold text-slate-200">
                          {g.name}
                        </span>
                        {isMe && (
                          <span className="rounded-full bg-nina-red px-1.5 py-px text-[9px] font-black tracking-wider text-white uppercase">
                            Você
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Palpite */}
                    <div className="flex flex-col items-end gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-black text-slate-100">
                          {g.home_guess} × {g.away_guess}
                        </span>
                        <PointsBadge points={g.points_earned} />
                      </div>
                      {g.advancing_team && g.advance_method && (
                        <span className="text-[9px] font-bold tracking-wide text-nina-purple">
                          {g.advancing_team === "home"
                            ? match.home_team
                            : match.away_team}{" "}
                          · {g.advance_method === "et" ? "Prorr." : "Pênaltis"}
                        </span>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
