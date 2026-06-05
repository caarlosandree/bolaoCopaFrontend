"use client"

import { useEffect, useState, useRef } from "react"
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
const CENTER_GAP = 80 // espaço extra entre os dois lados do bracket

const ROUND_LABELS: Record<string, string> = {
  r32: "Rodada de 32",
  r16: "Oitavas",
  qf: "Quartas",
  sf: "Semifinal",
  final: "Final",
  third: "3º Lugar",
}

// Rounds do lado esquerdo (índice 0 = mais à esquerda)
const LEFT_ROUNDS = ["r32", "r16", "qf", "sf"] as const
// Rounds do lado direito (espelho)
const RIGHT_ROUNDS = ["sf", "qf", "r16", "r32"] as const

type RoundKey = keyof BracketRounds

// ==========================================
// Geometry helpers
// ==========================================
function slotH(roundIndex: number) {
  return SLOT_H * Math.pow(2, roundIndex)
}

function cardY(roundIndex: number, slot: number) {
  const sh = slotH(roundIndex)
  return slot * sh + (sh - CARD_H) / 2
}

function leftColX(colIndex: number) {
  return colIndex * COL_W
}

function totalHeight() {
  // R32 com até 8 matches por lado = 8 slots de SLOT_H
  return 8 * SLOT_H
}

function totalWidth() {
  // 4 colunas esquerda + center (CARD_W + CENTER_GAP) + 4 colunas direita
  const halfWidth = LEFT_ROUNDS.length * COL_W
  const centerWidth = CARD_W + CENTER_GAP
  return halfWidth * 2 + centerWidth
}

function centerX() {
  return LEFT_ROUNDS.length * COL_W + CENTER_GAP / 2
}

function rightColX(colIndex: number) {
  // col 0 = SF (mais próximo do centro), col 3 = R32 (mais à direita)
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
      {/* Card background */}
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

      {/* Ongoing pulse border */}
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

      {/* Divider between teams */}
      <line
        x1={x + 1}
        y1={y + CARD_H / 2}
        x2={x + CARD_W - 1}
        y2={y + CARD_H / 2}
        stroke="#1e293b"
        strokeWidth={1}
      />

      {/* Home team row */}
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

      {/* Away team row */}
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

    const fromX = getX(colIdx)
    const toX = getX(colIdx + 1)
    const midX = fromX + CARD_W + COL_GAP / 2

    for (let i = 0; i < toMatches.length; i++) {
      const topSlot = i * 2
      const botSlot = i * 2 + 1

      const topMatch = fromMatches[topSlot]
      const botMatch = fromMatches[botSlot]
      const parentMatch = toMatches[i]
      if (!parentMatch) continue

      const parentY = cardY(colIdx + 1, i) + CARD_H / 2

      if (topMatch !== undefined) {
        const topY = cardY(colIdx, topSlot) + CARD_H / 2
        const fromRight = side === "left" ? fromX + CARD_W : fromX
        const dir = side === "left" ? 1 : -1

        paths.push(
          `M ${fromRight} ${topY} H ${fromRight + dir * (COL_GAP / 2)} V ${parentY}`
        )
      }

      if (botMatch !== undefined) {
        const botY = cardY(colIdx, botSlot) + CARD_H / 2
        const fromRight = side === "left" ? fromX + CARD_W : fromX
        const dir = side === "left" ? 1 : -1

        paths.push(
          `M ${fromRight} ${botY} H ${fromRight + dir * (COL_GAP / 2)}`
        )
      }

      // Linha para o card pai
      const toLeft = side === "left" ? toX : toX + CARD_W
      const dir = side === "left" ? 1 : -1
      const junctionX = side === "left"
        ? (getX(colIdx) + CARD_W + COL_GAP / 2)
        : (getX(colIdx) - COL_GAP / 2)

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
// Main bracket component
// ==========================================
export function KnockoutBracketSection() {
  const [data, setData] = useState<BracketRounds | null>(null)
  const [loading, setLoading] = useState(true)
  const svgRef = useRef<SVGSVGElement>(null)

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

  const rounds = data ?? {
    r32: [],
    r16: [],
    qf: [],
    sf: [],
    final: [],
    third: [],
  }

  const hasKnockout = rounds.r32.length > 0 || rounds.r16.length > 0

  const W = totalWidth()
  const H = totalHeight() + 40 // espaço para labels no topo

  // Offset vertical para labels
  const Y_OFFSET = 28

  return (
    <Card className="border-slate-800/80 bg-slate-900/60 backdrop-blur-md">
      <CardHeader className="border-b border-slate-800/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700/60 bg-slate-800/80">
            <Trophy className="h-4 w-4 text-amber-400" />
          </div>
          <div>
            <CardTitle className="text-sm font-black text-white">Chaveamento</CardTitle>
            <p className="text-[10px] font-medium text-slate-400">
              Copa do Mundo 2026 · Fase Eliminatória
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {!hasKnockout ? (
          <div className="flex h-32 items-center justify-center text-sm text-slate-400">
            Fase eliminatória ainda não iniciada.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <svg
              ref={svgRef}
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
                  rounds={rounds}
                  roundKeys={LEFT_ROUNDS}
                  getX={leftColX}
                />

                {/* ---- Left side match cards ---- */}
                {LEFT_ROUNDS.map((rk, colIdx) => {
                  const matches = rounds[rk as RoundKey] ?? []
                  const halfMatches = matches.slice(0, 8)
                  return halfMatches.map((match, slot) => (
                    <MatchCardSVG
                      key={match.id}
                      x={leftColX(colIdx)}
                      y={cardY(colIdx, slot)}
                      match={match}
                    />
                  ))
                })}

                {/* ---- Right side connectors ---- */}
                <Connectors
                  side="right"
                  rounds={rounds}
                  roundKeys={RIGHT_ROUNDS}
                  getX={rightColX}
                />

                {/* ---- Right side match cards ---- */}
                {RIGHT_ROUNDS.map((rk, colIdx) => {
                  const allMatches = rounds[rk as RoundKey] ?? []
                  // Lado direito usa a segunda metade dos matches
                  const startSlot = allMatches.length > 8 ? 8 : 0
                  const halfMatches = allMatches.slice(startSlot)
                  return halfMatches.map((match, slot) => (
                    <MatchCardSVG
                      key={`right-${match.id}`}
                      x={rightColX(colIdx)}
                      y={cardY(colIdx, slot)}
                      match={match}
                    />
                  ))
                })}

                {/* ---- Final (centro) ---- */}
                {(() => {
                  const finalMatch = rounds.final?.[0] ?? null
                  const cx = centerX() - CARD_W / 2
                  const cy = (totalHeight() - CARD_H) / 2
                  const sfH = slotH(3)
                  const connX_left = leftColX(3) + CARD_W
                  const connX_right = rightColX(0)
                  const midLeft = connX_left + COL_GAP / 2
                  const midRight = connX_right - COL_GAP / 2
                  const finalCenterY = cy + CARD_H / 2

                  // SF esquerdo: 2 matches, slots 0 e 1 de colIdx=3
                  const sfLeftTop = cardY(3, 0) + CARD_H / 2
                  const sfLeftBot = cardY(3, 1) + CARD_H / 2
                  const sfRightTop = cardY(3, 0) + CARD_H / 2
                  const sfRightBot = cardY(3, 1) + CARD_H / 2

                  return (
                    <>
                      {/* Connector SF esquerdo → Final */}
                      <path
                        d={`M ${connX_left} ${sfLeftTop} H ${midLeft} V ${finalCenterY} H ${cx}`}
                        fill="none"
                        stroke="#334155"
                        strokeWidth={1.5}
                      />
                      <path
                        d={`M ${connX_left} ${sfLeftBot} H ${midLeft}`}
                        fill="none"
                        stroke="#334155"
                        strokeWidth={1.5}
                      />
                      {/* Connector SF direito → Final */}
                      <path
                        d={`M ${connX_right} ${sfRightTop} H ${midRight} V ${finalCenterY} H ${cx + CARD_W}`}
                        fill="none"
                        stroke="#334155"
                        strokeWidth={1.5}
                      />
                      <path
                        d={`M ${connX_right} ${sfRightBot} H ${midRight}`}
                        fill="none"
                        stroke="#334155"
                        strokeWidth={1.5}
                      />

                      {/* Final card */}
                      <MatchCardSVG x={cx} y={cy} match={finalMatch} />

                      {/* 3º lugar */}
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
                    </>
                  )
                })()}
              </g>
            </svg>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
