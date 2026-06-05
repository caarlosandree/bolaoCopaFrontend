"use client"

import { useEffect, useState } from "react"
import { Loader2, Trophy } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getBracket } from "@/lib/api"
import type { BracketMatch, BracketRounds } from "@/lib/types"

// ==========================================
// Layout constants
// ==========================================
const CARD_W = 160
const CARD_H = 52
const COL_GAP = 48
const COL_W = CARD_W + COL_GAP
const SLOT_H = 80
const CENTER_GAP = 80

const ROUND_LABELS: Record<string, string> = {
  r32: "Rodada de 32",
  r16: "Oitavas",
  qf: "Quartas",
  sf: "Semifinal",
  final: "Final",
  third: "3º Lugar",
}

const LEFT_ROUNDS = ["r32", "r16", "qf", "sf"] as const
const RIGHT_ROUNDS = ["sf", "qf", "r16", "r32"] as const

const ROUND_DEPTH: Record<string, number> = {
  r32: 0,
  r16: 1,
  qf: 2,
  sf: 3,
  final: 3,
  third: 3,
}

type RoundKey = keyof BracketRounds

// ==========================================
// Geometry helpers
// ==========================================
function slotH(depth: number) {
  return SLOT_H * Math.pow(2, depth)
}

function cardY(depth: number, slot: number) {
  const sh = slotH(depth)
  return slot * sh + (sh - CARD_H) / 2
}

function leftColX(colIndex: number) {
  return colIndex * COL_W
}

function totalHeight() {
  return 10 * SLOT_H
}

function totalWidth() {
  const halfWidth = LEFT_ROUNDS.length * COL_W
  const centerWidth = CARD_W + CENTER_GAP
  return halfWidth * 2 + centerWidth
}

function centerX() {
  return LEFT_ROUNDS.length * COL_W + CENTER_GAP / 2
}

function rightColX(colIndex: number) {
  return centerX() + CARD_W / 2 + CENTER_GAP / 2 + colIndex * COL_W
}

// ==========================================
// Match card SVG
// ==========================================
function MatchCardSVG({
  x,
  y,
  match,
}: {
  x: number
  y: number
  match: BracketMatch | null
}) {
  const isFinished = match?.status === "finished"
  const isOngoing = match?.status === "ongoing"

  const homeName = match?.home.name ?? "A definir"
  const awayName = match?.away.name ?? "A definir"
  const homeScore = match?.home.score
  const awayScore = match?.away.score

  const homeWon =
    isFinished &&
    homeScore !== null &&
    homeScore !== undefined &&
    awayScore !== null &&
    awayScore !== undefined &&
    homeScore > awayScore

  const awayWon =
    isFinished &&
    homeScore !== null &&
    homeScore !== undefined &&
    awayScore !== null &&
    awayScore !== undefined &&
    awayScore > homeScore

  const borderColor = isOngoing
    ? "#D91E4E"
    : isFinished
      ? "#475569"
      : "#334155"

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={CARD_W}
        height={CARD_H}
        rx={8}
        fill="#0f172a"
        stroke={borderColor}
        strokeWidth={isOngoing ? 1.5 : 1}
      />

      {isOngoing && (
        <rect
          x={x}
          y={y}
          width={CARD_W}
          height={CARD_H}
          rx={8}
          fill="none"
          stroke="#D91E4E"
          strokeWidth={2.5}
          opacity={0.3}
        />
      )}

      <line
        x1={x + 1}
        y1={y + CARD_H / 2}
        x2={x + CARD_W - 1}
        y2={y + CARD_H / 2}
        stroke="#1e293b"
        strokeWidth={1}
      />

      <text
        x={x + 10}
        y={y + CARD_H / 4 + 4}
        fontSize={10}
        fontWeight={homeWon ? "800" : "500"}
        fill={homeWon ? "#ffffff" : "#94a3b8"}
        dominantBaseline="middle"
      >
        {homeName.length > 14 ? homeName.slice(0, 13) + "…" : homeName}
      </text>
      {homeScore !== undefined && homeScore !== null && (
        <text
          x={x + CARD_W - 10}
          y={y + CARD_H / 4 + 4}
          fontSize={11}
          fontWeight="800"
          fill={homeWon ? "#ffffff" : "#64748b"}
          textAnchor="end"
          dominantBaseline="middle"
        >
          {homeScore}
        </text>
      )}

      <text
        x={x + 10}
        y={y + (3 * CARD_H) / 4 + 4}
        fontSize={10}
        fontWeight={awayWon ? "800" : "500"}
        fill={awayWon ? "#ffffff" : "#94a3b8"}
        dominantBaseline="middle"
      >
        {awayName.length > 14 ? awayName.slice(0, 13) + "…" : awayName}
      </text>
      {awayScore !== undefined && awayScore !== null && (
        <text
          x={x + CARD_W - 10}
          y={y + (3 * CARD_H) / 4 + 4}
          fontSize={11}
          fontWeight="800"
          fill={awayWon ? "#ffffff" : "#64748b"}
          textAnchor="end"
          dominantBaseline="middle"
        >
          {awayScore}
        </text>
      )}
    </g>
  )
}

// ==========================================
// Connector lines SVG
// ==========================================
function Connectors({
  side,
  rounds,
  roundKeys,
  getX,
}: {
  side: "left" | "right"
  rounds: BracketRounds
  roundKeys: readonly string[]
  getX: (colIndex: number) => number
}) {
  const paths: string[] = []

  for (let colIdx = 0; colIdx < roundKeys.length - 1; colIdx++) {
    const fromKey = roundKeys[colIdx] as RoundKey
    const toKey = roundKeys[colIdx + 1] as RoundKey
    const fromMatches = rounds[fromKey] ?? []
    const toMatches = rounds[toKey] ?? []
    const fromDepth = ROUND_DEPTH[fromKey] ?? 0
    const toDepth = ROUND_DEPTH[toKey] ?? 0

    const fromX = getX(colIdx)
    const toX = getX(colIdx + 1)

    for (let i = 0; i < toMatches.length; i++) {
      const topSlot = i * 2
      const botSlot = i * 2 + 1

      const topMatch = fromMatches.find((m) => m.slot === topSlot)
      const botMatch = fromMatches.find((m) => m.slot === botSlot)
      const parentMatch = toMatches[i]
      if (!parentMatch) continue

      const parentY = cardY(toDepth, i) + CARD_H / 2

      if (topMatch) {
        const topY = cardY(fromDepth, topSlot) + CARD_H / 2
        const fromRight = side === "left" ? fromX + CARD_W : fromX
        const dir = side === "left" ? 1 : -1

        paths.push(
          `M ${fromRight} ${topY} H ${fromRight + dir * (COL_GAP / 2)} V ${parentY}`
        )
      }

      if (botMatch) {
        const botY = cardY(fromDepth, botSlot) + CARD_H / 2
        const fromRight = side === "left" ? fromX + CARD_W : fromX
        const dir = side === "left" ? 1 : -1

        paths.push(
          `M ${fromRight} ${botY} H ${fromRight + dir * (COL_GAP / 2)}`
        )
      }

      const junctionX =
        side === "left"
          ? getX(colIdx) + CARD_W + COL_GAP / 2
          : getX(colIdx) - COL_GAP / 2
      const toLeft = side === "left" ? toX : toX + CARD_W

      paths.push(`M ${junctionX} ${parentY} H ${toLeft}`)
    }
  }

  return (
    <>
      {paths.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="#334155" strokeWidth={1.5} />
      ))}
    </>
  )
}

// ==========================================
// Round label
// ==========================================
function RoundLabel({
  x,
  label,
  width,
}: {
  x: number
  label: string
  width: number
}) {
  return (
    <text
      x={x + width / 2}
      y={12}
      fontSize={9}
      fontWeight="700"
      fill="#475569"
      textAnchor="middle"
      letterSpacing="0.05em"
      style={{ textTransform: "uppercase" }}
    >
      {label.toUpperCase()}
    </text>
  )
}

// ==========================================
// Bracket template generator
// ==========================================
function generateKnockoutTemplate(): BracketRounds {
  const r32Matches: BracketMatch[] = [
    // Lado superior do bracket (slots 0-7)
    { id: "r32-0", home: { name: "1º Grupo A", badge: "", score: null }, away: { name: "2º Grupo B", badge: "", score: null }, status: "scheduled", match_time: "", slot: 0 },
    { id: "r32-1", home: { name: "1º Grupo C", badge: "", score: null }, away: { name: "2º Grupo D", badge: "", score: null }, status: "scheduled", match_time: "", slot: 1 },
    { id: "r32-2", home: { name: "1º Grupo E", badge: "", score: null }, away: { name: "2º Grupo F", badge: "", score: null }, status: "scheduled", match_time: "", slot: 2 },
    { id: "r32-3", home: { name: "1º Grupo G", badge: "", score: null }, away: { name: "2º Grupo H", badge: "", score: null }, status: "scheduled", match_time: "", slot: 3 },
    { id: "r32-4", home: { name: "1º Grupo I", badge: "", score: null }, away: { name: "2º Grupo J", badge: "", score: null }, status: "scheduled", match_time: "", slot: 4 },
    { id: "r32-5", home: { name: "1º Grupo K", badge: "", score: null }, away: { name: "2º Grupo L", badge: "", score: null }, status: "scheduled", match_time: "", slot: 5 },
    { id: "r32-6", home: { name: "3º Melhor 1", badge: "", score: null }, away: { name: "3º Melhor 2", badge: "", score: null }, status: "scheduled", match_time: "", slot: 6 },
    { id: "r32-7", home: { name: "3º Melhor 3", badge: "", score: null }, away: { name: "3º Melhor 4", badge: "", score: null }, status: "scheduled", match_time: "", slot: 7 },
    // Lado inferior do bracket (slots 8-15)
    { id: "r32-8", home: { name: "1º Grupo B", badge: "", score: null }, away: { name: "2º Grupo A", badge: "", score: null }, status: "scheduled", match_time: "", slot: 8 },
    { id: "r32-9", home: { name: "1º Grupo D", badge: "", score: null }, away: { name: "2º Grupo C", badge: "", score: null }, status: "scheduled", match_time: "", slot: 9 },
    { id: "r32-10", home: { name: "1º Grupo F", badge: "", score: null }, away: { name: "2º Grupo E", badge: "", score: null }, status: "scheduled", match_time: "", slot: 10 },
    { id: "r32-11", home: { name: "1º Grupo H", badge: "", score: null }, away: { name: "2º Grupo G", badge: "", score: null }, status: "scheduled", match_time: "", slot: 11 },
    { id: "r32-12", home: { name: "1º Grupo J", badge: "", score: null }, away: { name: "2º Grupo I", badge: "", score: null }, status: "scheduled", match_time: "", slot: 12 },
    { id: "r32-13", home: { name: "1º Grupo L", badge: "", score: null }, away: { name: "2º Grupo K", badge: "", score: null }, status: "scheduled", match_time: "", slot: 13 },
    { id: "r32-14", home: { name: "3º Melhor 5", badge: "", score: null }, away: { name: "3º Melhor 6", badge: "", score: null }, status: "scheduled", match_time: "", slot: 14 },
    { id: "r32-15", home: { name: "3º Melhor 7", badge: "", score: null }, away: { name: "3º Melhor 8", badge: "", score: null }, status: "scheduled", match_time: "", slot: 15 },
  ]

  const r16Matches: BracketMatch[] = [
    { id: "r16-0", home: { name: "Vencedor R32-0", badge: "", score: null }, away: { name: "Vencedor R32-1", badge: "", score: null }, status: "scheduled", match_time: "", slot: 0 },
    { id: "r16-1", home: { name: "Vencedor R32-2", badge: "", score: null }, away: { name: "Vencedor R32-3", badge: "", score: null }, status: "scheduled", match_time: "", slot: 1 },
    { id: "r16-2", home: { name: "Vencedor R32-4", badge: "", score: null }, away: { name: "Vencedor R32-5", badge: "", score: null }, status: "scheduled", match_time: "", slot: 2 },
    { id: "r16-3", home: { name: "Vencedor R32-6", badge: "", score: null }, away: { name: "Vencedor R32-7", badge: "", score: null }, status: "scheduled", match_time: "", slot: 3 },
    { id: "r16-4", home: { name: "Vencedor R32-8", badge: "", score: null }, away: { name: "Vencedor R32-9", badge: "", score: null }, status: "scheduled", match_time: "", slot: 4 },
    { id: "r16-5", home: { name: "Vencedor R32-10", badge: "", score: null }, away: { name: "Vencedor R32-11", badge: "", score: null }, status: "scheduled", match_time: "", slot: 5 },
    { id: "r16-6", home: { name: "Vencedor R32-12", badge: "", score: null }, away: { name: "Vencedor R32-13", badge: "", score: null }, status: "scheduled", match_time: "", slot: 6 },
    { id: "r16-7", home: { name: "Vencedor R32-14", badge: "", score: null }, away: { name: "Vencedor R32-15", badge: "", score: null }, status: "scheduled", match_time: "", slot: 7 },
  ]

  const qfMatches: BracketMatch[] = [
    { id: "qf-0", home: { name: "Vencedor R16-0", badge: "", score: null }, away: { name: "Vencedor R16-1", badge: "", score: null }, status: "scheduled", match_time: "", slot: 0 },
    { id: "qf-1", home: { name: "Vencedor R16-2", badge: "", score: null }, away: { name: "Vencedor R16-3", badge: "", score: null }, status: "scheduled", match_time: "", slot: 1 },
    { id: "qf-2", home: { name: "Vencedor R16-4", badge: "", score: null }, away: { name: "Vencedor R16-5", badge: "", score: null }, status: "scheduled", match_time: "", slot: 2 },
    { id: "qf-3", home: { name: "Vencedor R16-6", badge: "", score: null }, away: { name: "Vencedor R16-7", badge: "", score: null }, status: "scheduled", match_time: "", slot: 3 },
  ]

  const sfMatches: BracketMatch[] = [
    { id: "sf-0", home: { name: "Vencedor QF-0", badge: "", score: null }, away: { name: "Vencedor QF-1", badge: "", score: null }, status: "scheduled", match_time: "", slot: 0 },
    { id: "sf-1", home: { name: "Vencedor QF-2", badge: "", score: null }, away: { name: "Vencedor QF-3", badge: "", score: null }, status: "scheduled", match_time: "", slot: 1 },
  ]

  const finalMatch: BracketMatch[] = [
    { id: "final", home: { name: "Vencedor SF-0", badge: "", score: null }, away: { name: "Vencedor SF-1", badge: "", score: null }, status: "scheduled", match_time: "", slot: 0 },
  ]

  const thirdMatch: BracketMatch[] = [
    { id: "third", home: { name: "Perdedor SF-0", badge: "", score: null }, away: { name: "Perdedor SF-1", badge: "", score: null }, status: "scheduled", match_time: "", slot: 0 },
  ]

  return {
    r32: r32Matches,
    r16: r16Matches,
    qf: qfMatches,
    sf: sfMatches,
    final: finalMatch,
    third: thirdMatch,
  }
}

// ==========================================
// Split rounds into left / right halves
// ==========================================
function splitRounds(rounds: BracketRounds): {
  left: BracketRounds
  right: BracketRounds
} {
  const left: Partial<BracketRounds> = {}
  const right: Partial<BracketRounds> = {}

  const keys: RoundKey[] = ["r32", "r16", "qf", "sf", "final", "third"]

  for (const key of keys) {
    const matches = [...(rounds[key] ?? [])].sort((a, b) => a.slot - b.slot)

    if (key === "final" || key === "third") {
      left[key] = matches
      right[key] = matches
      continue
    }

    const half = Math.ceil(matches.length / 2)
    left[key] = matches.slice(0, half).map((m, i) => ({ ...m, slot: i }))
    right[key] = matches.slice(half).map((m, i) => ({ ...m, slot: i }))
  }

  return { left: left as BracketRounds, right: right as BracketRounds }
}

// ==========================================
// Main bracket component
// ==========================================
export function KnockoutBracketSection() {
  const [data, setData] = useState<BracketRounds | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getBracket()
      .then((d) => setData(d.rounds))
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

  const template = generateKnockoutTemplate()
  const rounds = data ? { ...template, ...data } : template

  const hasRealData = data && (data.r32.length > 0 || data.r16.length > 0)

  const { left: leftRounds, right: rightRounds } = splitRounds(rounds)

  const W = totalWidth()
  const H = totalHeight() + 40
  const Y_OFFSET = 28

  const cx = centerX() - CARD_W / 2
  const cy = (totalHeight() - CARD_H) / 2
  const finalCenterY = cy + CARD_H / 2

  const sfLeftConnX = leftColX(3) + CARD_W
  const sfRightConnX = rightColX(0)
  const midLeft = sfLeftConnX + COL_GAP / 2
  const midRight = sfRightConnX - COL_GAP / 2

  const sfLeftY = cardY(ROUND_DEPTH.sf, 0) + CARD_H / 2
  const sfRightY = cardY(ROUND_DEPTH.sf, 0) + CARD_H / 2

  return (
    <Card className="border-slate-800/80 bg-slate-900/60 backdrop-blur-md">
      <CardHeader className="border-b border-slate-800/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700/60 bg-slate-800/80">
            <Trophy className="h-4 w-4 text-amber-400" />
          </div>
          <div>
            <CardTitle className="text-sm font-black text-white">
              Chaveamento
            </CardTitle>
            <p className="text-[10px] font-medium text-slate-400">
              Copa do Mundo 2026 · Fase Eliminatória{" "}
              {!hasRealData && "(Previsão)"}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div className="overflow-x-auto">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            width={W}
            height={H}
            className="min-w-full"
            style={{ fontFamily: "inherit" }}
          >
            {/* ---- Labels ---- */}
            {LEFT_ROUNDS.map((rk, i) => (
              <RoundLabel
                key={rk}
                x={leftColX(i)}
                label={ROUND_LABELS[rk]}
                width={CARD_W}
              />
            ))}
            <RoundLabel
              x={centerX() - CARD_W / 2}
              label={ROUND_LABELS.final}
              width={CARD_W}
            />
            {RIGHT_ROUNDS.map((rk, i) => (
              <RoundLabel
                key={`right-${rk}-${i}`}
                x={rightColX(i)}
                label={ROUND_LABELS[rk]}
                width={CARD_W}
              />
            ))}

            <g transform={`translate(0, ${Y_OFFSET})`}>
              {/* ---- Left side connectors ---- */}
              <Connectors
                side="left"
                rounds={leftRounds}
                roundKeys={LEFT_ROUNDS}
                getX={leftColX}
              />

              {/* ---- Left side match cards ---- */}
              {LEFT_ROUNDS.map((rk, colIdx) => {
                const matches = leftRounds[rk] ?? []
                const depth = ROUND_DEPTH[rk] ?? 0
                return matches.map((match) => (
                  <MatchCardSVG
                    key={match.id}
                    x={leftColX(colIdx)}
                    y={cardY(depth, match.slot)}
                    match={match}
                  />
                ))
              })}

              {/* ---- Right side connectors ---- */}
              <Connectors
                side="right"
                rounds={rightRounds}
                roundKeys={RIGHT_ROUNDS}
                getX={rightColX}
              />

              {/* ---- Right side match cards ---- */}
              {RIGHT_ROUNDS.map((rk, colIdx) => {
                const matches = rightRounds[rk] ?? []
                const depth = ROUND_DEPTH[rk] ?? 0
                return matches.map((match) => (
                  <MatchCardSVG
                    key={`right-${match.id}`}
                    x={rightColX(colIdx)}
                    y={cardY(depth, match.slot)}
                    match={match}
                  />
                ))
              })}

              {/* ---- Final connectors ---- */}
              <path
                d={`M ${sfLeftConnX} ${sfLeftY} H ${midLeft} V ${finalCenterY} H ${cx}`}
                fill="none"
                stroke="#334155"
                strokeWidth={1.5}
              />
              <path
                d={`M ${sfRightConnX} ${sfRightY} H ${midRight} V ${finalCenterY} H ${cx + CARD_W}`}
                fill="none"
                stroke="#334155"
                strokeWidth={1.5}
              />

              {/* ---- Final card ---- */}
              <MatchCardSVG
                x={cx}
                y={cy}
                match={rounds.final?.[0] ?? null}
              />

              {/* ---- 3º lugar ---- */}
              {rounds.third?.[0] && (
                <>
                  <text
                    x={cx + CARD_W / 2}
                    y={cy + CARD_H + 18}
                    fontSize={9}
                    fontWeight="700"
                    fill="#475569"
                    textAnchor="middle"
                    letterSpacing="0.05em"
                  >
                    3º LUGAR
                  </text>
                  <MatchCardSVG
                    x={cx}
                    y={cy + CARD_H + 26}
                    match={rounds.third[0]}
                  />
                </>
              )}
            </g>
          </svg>
        </div>
      </CardContent>
    </Card>
  )
}
