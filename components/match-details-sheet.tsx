"use client"

import {
  useEffect,
  useMemo,
  useState,
  type ComponentType,
  type ReactNode,
} from "react"
import {
  Activity,
  ArrowDown,
  ArrowUp,
  BarChart3,
  CalendarClock,
  CircleHelp,
  Info,
  MapPin,
  ShieldAlert,
  Shirt,
  Sparkles,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { TeamFlag } from "@/components/ui/team-flag"
import { getMatchDetails } from "@/lib/api"
import type { Match, MatchDetails } from "@/lib/types"
import { cn } from "@/lib/utils"

type MatchDetailsSheetProps = {
  match: Match
}

type LooseRecord = Record<string, unknown>
type ResultCode = "W" | "D" | "L"

type PlayerSlot = {
  name: string
  position: string
  row: number
  isSubstituted: boolean
  substituteIn: string | null
  substituteMinute: number | null
  cameOn: boolean
  replacedPlayer: string | null
  cameOnMinute: number | null
}

type TeamLineup = {
  coach: string | null
  formation: string | null
  starters: PlayerSlot[]
  bench: PlayerSlot[]
}

type SubstitutionEvent = {
  playerOut: string
  playerIn: string
  minute: number | null
  teamName: string | null
}

const ROW_Y: Record<number, number> = { 3: 15, 2: 38, 1: 62, 0: 85 }

const SECTION_CLASS =
  "rounded-xl border border-slate-800/70 bg-slate-950/40 p-3"

const RESULT_CLASS: Record<ResultCode, string> = {
  W: "border-green-900/50 bg-green-950/40 text-green-300",
  D: "border-amber-900/50 bg-amber-950/40 text-amber-300",
  L: "border-red-900/50 bg-red-950/40 text-red-300",
}

export function MatchDetailsSheet({ match }: MatchDetailsSheetProps) {
  const [open, setOpen] = useState(false)
  const [details, setDetails] = useState<MatchDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (!nextOpen || details || loading) return

    setLoading(true)
    setError(null)
    getMatchDetails(match.id)
      .then(setDetails)
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Erro ao carregar")
      })
      .finally(() => setLoading(false))
  }

  function refreshDetails() {
    if (!open) return
    getMatchDetails(match.id)
      .then(setDetails)
      .catch(() => {
        /* silencioso no polling */
      })
  }

  useEffect(() => {
    if (!open) return
    const timer = setInterval(refreshDetails, 5 * 60 * 1000)
    return () => clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, match.id])

  const mediaEvent = useMemo(() => firstEvent(details?.media), [details?.media])

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="cursor-pointer border border-slate-700/60 bg-slate-950/50 text-slate-400 hover:bg-slate-800/70 hover:text-white"
          aria-label={`Ver detalhes de ${match.home_team} contra ${match.away_team}`}
        >
          <Info className="h-3.5 w-3.5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto border-slate-800 bg-slate-950 p-0 text-slate-100 data-[side=right]:sm:max-w-[50vw] data-[side=right]:sm:min-w-[540px] data-[side=right]:2xl:max-w-[800px]"
      >
        <SheetHeader className="border-b border-slate-800/80 p-4 pr-12">
          <SheetTitle className="text-left text-base font-black text-white">
            Detalhes da partida
          </SheetTitle>
          <SheetDescription className="text-left text-xs text-slate-500">
            {formatDateTime(match.match_time)}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 p-4">
          <MatchHero match={match} mediaEvent={mediaEvent} />

          {match.stream_url && (
            <LiveStreamSection streamUrl={match.stream_url} />
          )}

          {loading && (
            <div className={cn(SECTION_CLASS, "py-8 text-center")}>
              <div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-2 border-nina-red border-t-transparent" />
              <p className="text-xs font-bold text-slate-400">
                Carregando detalhes...
              </p>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-900/40 bg-red-950/30 p-3 text-xs font-bold text-red-300">
              {error}
            </div>
          )}

          {!loading && !error && details && (
            <>
              <FormSection details={details} match={match} />
              <LineupsSection details={details} match={match} />
              <StatsSection details={details} />
              <EventsSection details={details} />
              <SourceStatusSection details={details} />
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

function MatchHero({
  match,
  mediaEvent,
}: {
  match: Match
  mediaEvent: LooseRecord | null
}) {
  const venue = text(mediaEvent, "strVenue") ?? match.venue
  const city = text(mediaEvent, "strCity")
  const group = text(mediaEvent, "strGroup") ?? match.group_name
  const image =
    text(mediaEvent, "strThumb") ??
    text(mediaEvent, "strPoster") ??
    text(mediaEvent, "strBanner")

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800/80 bg-slate-900/60">
      {image && (
        <div className="relative aspect-[16/7] overflow-hidden bg-slate-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-900 to-transparent" />
        </div>
      )}
      <div className="p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <TeamBlock name={match.home_team} align="left" />
          <div className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-center">
            <p className="text-[10px] font-black tracking-wider text-slate-500 uppercase">
              Jogo
            </p>
            <p className="text-sm font-black text-white">
              {match.home_score ?? "-"} x {match.away_score ?? "-"}
            </p>
          </div>
          <TeamBlock name={match.away_team} align="right" />
        </div>
        <div className="grid gap-2 text-xs text-slate-400 sm:grid-cols-3">
          <InfoPill
            icon={CalendarClock}
            label={formatDateTime(match.match_time)}
          />
          <InfoPill icon={MapPin} label={compactJoin([venue, city])} />
          <InfoPill icon={Sparkles} label={group ?? "Grupo indisponível"} />
        </div>
      </div>
    </div>
  )
}

function TeamBlock({ name, align }: { name: string; align: "left" | "right" }) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 items-center gap-2",
        align === "right" && "flex-row-reverse text-right"
      )}
    >
      <TeamFlag teamName={name} className="h-10 w-10 border border-white/10" />
      <span className="truncate text-sm font-black text-white">{name}</span>
    </div>
  )
}

function FormSection({
  details,
  match,
}: {
  details: MatchDetails
  match: Match
}) {
  const form = asRecord(details.recent_form)
  const available = dataAvailable(details.recent_form)

  const probability = useMemo(() => {
    if (!available || !form) return null
    const homeEvents = extractArray(form.home, ["schedule", "events"])
    const awayEvents = extractArray(form.away, ["schedule", "events"])
    return computeFormProbability(
      match.home_team,
      homeEvents,
      match.away_team,
      awayEvents
    )
  }, [available, form, match.home_team, match.away_team])

  return (
    <Section icon={Activity} title="Últimos jogos" available={available}>
      {available && form ? (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <RecentTeamForm label={match.home_team} value={form.home} />
            <RecentTeamForm label={match.away_team} value={form.away} />
          </div>
          {probability && (
            <FormProbabilityBar
              homeTeam={match.home_team}
              awayTeam={match.away_team}
              probability={probability}
            />
          )}
        </div>
      ) : (
        <Unavailable detail={sourceMessage(details.recent_form)} />
      )}
    </Section>
  )
}

type FormProbability = {
  homeWin: number
  draw: number
  awayWin: number
  matchCount: number
}

function FormProbabilityBar({
  homeTeam,
  awayTeam,
  probability,
}: {
  homeTeam: string
  awayTeam: string
  probability: FormProbability
}) {
  const { homeWin, draw, awayWin, matchCount } = probability
  return (
    <div className="rounded-lg border border-slate-800/70 bg-slate-900/60 p-3">
      <div className="mb-2 flex items-center justify-between text-[11px] font-black text-slate-300">
        <span className="max-w-[35%] truncate">{homeTeam}</span>
        <span className="text-slate-500">Probabilidade</span>
        <span className="max-w-[35%] truncate text-right">{awayTeam}</span>
      </div>
      <div className="flex h-5 overflow-hidden rounded-full">
        <div
          className="flex items-center justify-center bg-green-600 text-[10px] font-black text-white transition-all"
          style={{ width: `${homeWin}%` }}
        >
          {homeWin >= 12 ? `${homeWin}%` : ""}
        </div>
        <div
          className="flex items-center justify-center bg-slate-500 text-[10px] font-black text-white transition-all"
          style={{ width: `${draw}%` }}
        >
          {draw >= 12 ? `${draw}%` : ""}
        </div>
        <div
          className="flex items-center justify-center bg-red-600 text-[10px] font-black text-white transition-all"
          style={{ width: `${awayWin}%` }}
        >
          {awayWin >= 12 ? `${awayWin}%` : ""}
        </div>
      </div>
      <div className="mt-1.5 flex justify-between text-[10px] text-slate-500">
        <span>{homeWin}% vitória</span>
        <span>{draw}% empate</span>
        <span>{awayWin}% vitória</span>
      </div>
      <p className="mt-1 text-center text-[10px] text-slate-600">
        Baseado nos últimos {matchCount} jogos de cada seleção
      </p>
    </div>
  )
}

function RecentTeamForm({ label, value }: { label: string; value: unknown }) {
  const events = extractArray(value, ["schedule", "events"]).slice(0, 5)
  const summary = summarizeForm(label, events)

  return (
    <div className="rounded-lg border border-slate-800/70 bg-slate-900/60 p-2">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="min-w-0 truncate text-xs font-black text-white">
          {label}
        </p>
        <div className="flex flex-shrink-0 gap-1">
          {summary.map((result, index) => (
            <span
              key={`${label}-summary-${index}`}
              className={cn(
                "inline-flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-black",
                RESULT_CLASS[result]
              )}
            >
              {result}
            </span>
          ))}
        </div>
      </div>
      {events.length > 0 ? (
        <div className="space-y-2">
          {events.map((event, index) => (
            <div
              key={`${label}-${index}`}
              className="rounded-lg border border-slate-800/60 bg-slate-950/50 p-2"
            >
              <div className="mb-1 flex items-center justify-between gap-2 text-[11px]">
                <span className="truncate font-bold text-slate-300">
                  {text(event, "strEvent") ?? "Partida"}
                </span>
                <span className="flex-shrink-0 font-black text-white">
                  {scoreText(event)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 text-[10px] text-slate-500">
                <span className="truncate">
                  {text(event, "strLeague") ?? "Competição"}
                </span>
                <span className="flex-shrink-0">
                  {formatShortDate(text(event, "dateEvent"))}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Unavailable />
      )}
    </div>
  )
}

function LineupsSection({
  details,
  match,
}: {
  details: MatchDetails
  match: Match
}) {
  const lineupItems = extractArray(details.lineups, [
    "lookup",
    "lineup",
    "lineups",
  ])
  const available = dataAvailable(details.lineups) && lineupItems.length > 0

  const eventItems = extractArray(details.events, [
    "lookup",
    "timeline",
    "events",
  ])
  const subs = extractSubstitutions(eventItems)

  const hasHomeFlag = lineupItems.some((p) => text(p, "strHome") !== null)
  const homeRaw = hasHomeFlag
    ? lineupItems.filter((p) => text(p, "strHome") === "Yes")
    : lineupItems.slice(0, Math.ceil(lineupItems.length / 2))
  const awayRaw = hasHomeFlag
    ? lineupItems.filter((p) => text(p, "strHome") === "No")
    : lineupItems.slice(Math.ceil(lineupItems.length / 2))

  const homeLineup = buildTeamLineup(homeRaw, subs, match.home_team)
  const awayLineup = buildTeamLineup(awayRaw, subs, match.away_team)

  return (
    <Section icon={Shirt} title="Escalações e formação" available={available}>
      {available ? (
        <div className="grid grid-cols-2 gap-2">
          <HalfPitch lineup={homeLineup} teamName={match.home_team} />
          <HalfPitch lineup={awayLineup} teamName={match.away_team} />
        </div>
      ) : (
        <Unavailable detail={sourceMessage(details.lineups)} />
      )}
    </Section>
  )
}

function HalfPitch({
  lineup,
  teamName,
}: {
  lineup: TeamLineup
  teamName: string
}) {
  const byRow: Record<number, PlayerSlot[]> = { 0: [], 1: [], 2: [], 3: [] }
  for (const player of lineup.starters) {
    const bucket = byRow[player.row] ?? byRow[2]
    bucket.push(player)
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-1">
        <p className="min-w-0 truncate text-[10px] font-black tracking-wider text-white uppercase">
          {teamName}
        </p>
        {lineup.formation && (
          <span className="flex-shrink-0 rounded bg-green-900/60 px-1.5 py-0.5 text-[9px] font-bold text-green-300">
            {lineup.formation}
          </span>
        )}
      </div>

      <div
        className="relative overflow-hidden rounded-lg bg-green-900"
        style={{ aspectRatio: "3/4" }}
      >
        <PitchMarkings />

        {([3, 2, 1, 0] as const).flatMap((rowNum) =>
          (byRow[rowNum] ?? []).map((player, i, arr) => (
            <PlayerToken
              key={`${player.name}-${rowNum}-${i}`}
              player={player}
              x={((i + 1) / (arr.length + 1)) * 100}
              y={ROW_Y[rowNum]}
            />
          ))
        )}

        {lineup.coach && (
          <div className="absolute right-1 bottom-1 flex max-w-[55%] items-center gap-0.5 rounded bg-slate-900/80 px-1 py-0.5">
            <Shirt className="h-2 w-2 shrink-0 text-slate-400" />
            <span className="truncate text-[8px] text-slate-300">
              {lineup.coach}
            </span>
          </div>
        )}
      </div>

      {lineup.bench.length > 0 && <BenchStrip players={lineup.bench} />}
    </div>
  )
}

function PitchMarkings() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute inset-[5%] border border-white/20" />
      <div className="absolute top-[5%] right-[5%] left-[5%] h-px bg-white/20" />
      <div className="absolute top-0 left-1/2 h-[9%] w-[50%] -translate-x-1/2 rounded-b-full border-x border-t-0 border-b border-white/20" />
      <div className="absolute right-[22%] bottom-[5%] left-[22%] h-[22%] border border-white/20" />
      <div className="absolute right-[36%] bottom-[5%] left-[36%] h-[8%] border border-white/20" />
      <div className="absolute bottom-[29%] left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-white/30" />
    </div>
  )
}

function PlayerToken({
  player,
  x,
  y,
}: {
  player: PlayerSlot
  x: number
  y: number
}) {
  const parts = player.name.trim().split(/\s+/)
  const initials =
    parts.length === 1
      ? parts[0].slice(0, 2).toUpperCase()
      : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()

  const displayName = parts.length === 1 ? parts[0] : parts[parts.length - 1]

  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2 text-center"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <div
        className={cn(
          "mx-auto flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-black text-white",
          player.isSubstituted
            ? "bg-red-700 ring-1 ring-red-400/70"
            : player.cameOn
              ? "bg-green-600 ring-1 ring-green-300/70"
              : "bg-slate-800 ring-1 ring-white/25"
        )}
      >
        {initials}
      </div>

      {player.isSubstituted && (
        <div className="flex items-center justify-center gap-px">
          <ArrowDown className="h-2 w-2 text-red-400" />
          {player.substituteMinute !== null && (
            <span className="text-[7px] font-bold text-red-400">
              {player.substituteMinute}&apos;
            </span>
          )}
        </div>
      )}

      {player.cameOn && (
        <div className="flex items-center justify-center gap-px">
          <ArrowUp className="h-2 w-2 text-green-400" />
          {player.cameOnMinute !== null && (
            <span className="text-[7px] font-bold text-green-400">
              {player.cameOnMinute}&apos;
            </span>
          )}
        </div>
      )}

      <p className="w-14 truncate overflow-hidden text-center text-[8px] leading-tight font-bold text-white [text-shadow:0_1px_2px_rgba(0,0,0,.9)]">
        {displayName}
      </p>
    </div>
  )
}

function BenchStrip({ players }: { players: PlayerSlot[] }) {
  const sorted = [...players].sort(
    (a, b) => Number(b.cameOn) - Number(a.cameOn)
  )

  return (
    <div className="rounded-lg border border-slate-800/60 bg-slate-900/60 p-2">
      <p className="mb-1.5 text-[9px] font-black tracking-wider text-slate-500 uppercase">
        Reservas
      </p>
      <div className="flex flex-wrap gap-1">
        {sorted.map((player, i) => {
          const lastName = player.name.trim().split(/\s+/).pop() ?? player.name
          return (
            <div
              key={`bench-${i}`}
              className={cn(
                "flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[9px] font-bold",
                player.cameOn
                  ? "border-green-900/50 bg-green-950/40 text-green-300"
                  : "border-slate-800 bg-slate-900 text-slate-500"
              )}
            >
              {player.cameOn && (
                <ArrowUp className="h-2 w-2 shrink-0 text-green-400" />
              )}
              <span className="max-w-[72px] truncate">{lastName}</span>
              {player.cameOn && player.cameOnMinute !== null && (
                <span className="text-green-500">
                  {player.cameOnMinute}&apos;
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function StatsSection({ details }: { details: MatchDetails }) {
  const stats = extractArray(details.statistics, [
    "lookup",
    "eventstats",
    "stats",
    "statistics",
  ])
  const available = dataAvailable(details.statistics) && stats.length > 0

  return (
    <Section icon={BarChart3} title="Estatísticas" available={available}>
      {available ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {stats.slice(0, 20).map((stat, index) => (
            <StatRow key={index} stat={stat} />
          ))}
        </div>
      ) : (
        <Unavailable detail={sourceMessage(details.statistics)} />
      )}
    </Section>
  )
}

function StatRow({ stat }: { stat: LooseRecord }) {
  const label =
    text(stat, "strStat") ??
    text(stat, "stat") ??
    text(stat, "name") ??
    "Estatística"
  const home = text(stat, "intHome") ?? text(stat, "home") ?? "0"
  const away = text(stat, "intAway") ?? text(stat, "away") ?? "0"
  const homeValue = Number(home)
  const awayValue = Number(away)
  const total = homeValue + awayValue
  const homeWidth = total > 0 ? `${(homeValue / total) * 100}%` : "50%"
  const awayWidth = total > 0 ? `${(awayValue / total) * 100}%` : "50%"

  return (
    <div className="rounded-lg border border-slate-800/60 bg-slate-900/50 p-2">
      <div className="mb-1 flex items-center justify-between text-[11px]">
        <span className="font-black text-white">{home}</span>
        <span className="font-bold text-slate-400">{label}</span>
        <span className="font-black text-white">{away}</span>
      </div>
      <div className="flex h-1.5 overflow-hidden rounded-full bg-slate-800">
        <div className="bg-green-500" style={{ width: homeWidth }} />
        <div className="bg-nina-orange" style={{ width: awayWidth }} />
      </div>
    </div>
  )
}

function EventsSection({ details }: { details: MatchDetails }) {
  const events = extractArray(details.events, ["lookup", "timeline", "events"])
  const available = dataAvailable(details.events) && events.length > 0

  return (
    <Section icon={Users} title="Timeline" available={available}>
      {available ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {events.slice(0, 24).map((event, index) => (
            <div
              key={index}
              className="flex items-center gap-2 rounded-lg border border-slate-800/60 bg-slate-900/50 px-2 py-1.5 text-xs"
            >
              <span className="w-10 flex-shrink-0 font-black text-slate-500">
                {text(event, "intTime") ?? text(event, "minute") ?? "-"} min
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-slate-300">
                  {text(event, "strTimeline") ??
                    text(event, "strPlayer") ??
                    text(event, "event") ??
                    "Evento"}
                </p>
                <p className="truncate text-[10px] text-slate-500">
                  {compactJoin([
                    text(event, "strTeam"),
                    text(event, "strTimelineDetail"),
                    text(event, "strComment"),
                  ]) ?? "Detalhe indisponível"}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Unavailable detail={sourceMessage(details.events)} />
      )}
    </Section>
  )
}

function SourceStatusSection({ details }: { details: MatchDetails }) {
  const statuses = (details.source_status ?? []).filter(
    (s) => s.section !== "odds"
  )

  return (
    <div className={SECTION_CLASS}>
      <div className="mb-2 flex items-center gap-2">
        <ShieldAlert className="h-4 w-4 text-slate-500" />
        <h3 className="text-xs font-black tracking-wider text-slate-300 uppercase">
          Fontes
        </h3>
      </div>
      {details.updated_at && (
        <p className="mb-2 text-[11px] text-slate-500">
          Atualizado em {formatDateTime(details.updated_at)}
        </p>
      )}
      <div className="flex flex-wrap gap-1.5">
        {statuses.length > 0 ? (
          statuses.map((status, index) => (
            <span
              key={`${status.source}-${status.section}-${index}`}
              className={cn(
                "rounded-full border px-2 py-0.5 text-[10px] font-bold",
                status.status === "success"
                  ? "border-green-900/40 bg-green-950/30 text-green-300"
                  : status.status === "failed"
                    ? "border-red-900/40 bg-red-950/30 text-red-300"
                    : "border-slate-800 bg-slate-900 text-slate-500"
              )}
              title={status.message}
            >
              {sectionLabel(status.section)}: {statusLabel(status.status)}
            </span>
          ))
        ) : (
          <span className="text-xs text-slate-600">Sem sync registrado</span>
        )}
      </div>
    </div>
  )
}

function Section({
  icon: Icon,
  title,
  available,
  children,
}: {
  icon: ComponentType<{ className?: string }>
  title: string
  available: boolean
  children: ReactNode
}) {
  return (
    <section className={SECTION_CLASS}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-nina-orange" />
          <h3 className="text-xs font-black tracking-wider text-slate-300 uppercase">
            {title}
          </h3>
        </div>
        <span
          className={cn(
            "rounded-full border px-2 py-0.5 text-[10px] font-bold",
            available
              ? "border-green-900/40 bg-green-950/30 text-green-300"
              : "border-slate-800 bg-slate-900 text-slate-500"
          )}
        >
          {available ? "Disponível" : "Indisponível"}
        </span>
      </div>
      {children}
    </section>
  )
}

function InfoPill({
  icon: Icon,
  label,
}: {
  icon: ComponentType<{ className?: string }>
  label: string | null | undefined
}) {
  return (
    <div className="flex min-w-0 items-center gap-1.5 rounded-lg border border-slate-800/60 bg-slate-950/50 px-2 py-1.5">
      <Icon className="h-3.5 w-3.5 flex-shrink-0 text-slate-500" />
      <span className="truncate">{label || "Indisponível"}</span>
    </div>
  )
}

function Unavailable({ detail }: { detail?: string | null }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-slate-800/60 bg-slate-900/50 px-3 py-2 text-xs font-bold text-slate-500">
      <CircleHelp className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
      <div>
        <p>Ainda indisponível</p>
        {detail && (
          <p className="mt-0.5 text-[10px] text-slate-600">{detail}</p>
        )}
      </div>
    </div>
  )
}

function firstEvent(value: unknown): LooseRecord | null {
  const events = extractArray(value, ["lookup", "event", "events", "schedule"])
  return events[0] ?? null
}

function extractArray(value: unknown, keys: string[]): LooseRecord[] {
  if (Array.isArray(value)) return value.filter(isRecord)
  const record = asRecord(value)
  if (!record) return []
  for (const key of keys) {
    const child = record[key]
    if (Array.isArray(child)) return child.filter(isRecord)
  }
  return []
}

function asRecord(value: unknown): LooseRecord | null {
  return isRecord(value) ? value : null
}

function isRecord(value: unknown): value is LooseRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function dataAvailable(value: unknown): boolean {
  if (!value) return false
  if (Array.isArray(value)) return value.length > 0
  const record = asRecord(value)
  if (!record) return true
  if (sourceMessage(record)) return false
  return Object.values(record).some((item) => {
    if (Array.isArray(item)) return item.length > 0
    if (isRecord(item)) return !sourceMessage(item)
    return item !== null && item !== ""
  })
}

function sourceMessage(value: unknown): string | null {
  const message = text(value, "Message") ?? text(value, "message")
  if (!message) return null
  return message === "No data found" ? "Sem dados na fonte" : message
}

function text(value: unknown, key: string): string | null {
  const record = asRecord(value)
  const raw = record?.[key]
  if (typeof raw === "string" && raw.trim() !== "") return raw
  if (typeof raw === "number") return String(raw)
  return null
}

function scoreText(value: unknown) {
  const home = text(value, "intHomeScore")
  const away = text(value, "intAwayScore")
  if (home !== null && away !== null) return `${home} x ${away}`
  return "-"
}

function summarizeForm(teamName: string, events: LooseRecord[]): ResultCode[] {
  return events
    .map((event) => resultForTeam(teamName, event))
    .filter((result): result is ResultCode => Boolean(result))
    .slice(0, 5)
}

function resultForTeam(
  teamName: string,
  event: LooseRecord
): ResultCode | null {
  const home = text(event, "strHomeTeam")
  const away = text(event, "strAwayTeam")
  const homeScore = Number(text(event, "intHomeScore"))
  const awayScore = Number(text(event, "intAwayScore"))
  if (!home || !away || Number.isNaN(homeScore) || Number.isNaN(awayScore)) {
    return null
  }
  const isHome = normalize(home) === normalize(teamName)
  const isAway = normalize(away) === normalize(teamName)
  if (!isHome && !isAway) return null
  if (homeScore === awayScore) return "D"
  const won = isHome ? homeScore > awayScore : awayScore > homeScore
  return won ? "W" : "L"
}

function sectionLabel(value: string) {
  const labels: Record<string, string> = {
    media: "mídia",
    statistics: "stats",
    events: "eventos",
    form_home: "forma casa",
    form_away: "forma fora",
    lineups: "escalação",
  }
  return labels[value] ?? value
}

function statusLabel(value: string) {
  const labels: Record<string, string> = {
    success: "ok",
    partial: "parcial",
    failed: "falhou",
    unavailable: "indisponível",
  }
  return labels[value] ?? value
}

function compactJoin(values: Array<string | null | undefined>) {
  const parts = values.filter((value): value is string => Boolean(value))
  return parts.length > 0 ? parts.join(" · ") : null
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatShortDate(value: string | null) {
  if (!value) return "-"
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  })
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
}

function computeFormProbability(
  homeTeam: string,
  homeEvents: LooseRecord[],
  awayTeam: string,
  awayEvents: LooseRecord[]
): FormProbability | null {
  const homeResults = homeEvents
    .map((e) => resultForTeam(homeTeam, e))
    .filter((r): r is ResultCode => r !== null)
  const awayResults = awayEvents
    .map((e) => resultForTeam(awayTeam, e))
    .filter((r): r is ResultCode => r !== null)

  if (homeResults.length < 3 || awayResults.length < 3) return null

  const rate = (results: ResultCode[], code: ResultCode) =>
    results.filter((r) => r === code).length / results.length

  const homeWinRate = rate(homeResults, "W")
  const homeDrawRate = rate(homeResults, "D")
  const homeLossRate = rate(homeResults, "L")
  const awayWinRate = rate(awayResults, "W")
  const awayDrawRate = rate(awayResults, "D")
  const awayLossRate = rate(awayResults, "L")

  const rawHome = (homeWinRate + awayLossRate) / 2
  const rawDraw = (homeDrawRate + awayDrawRate) / 2
  const rawAway = (homeLossRate + awayWinRate) / 2
  const total = rawHome + rawDraw + rawAway

  if (total === 0) return null

  const homeWin = Math.round((rawHome / total) * 100)
  const draw = Math.round((rawDraw / total) * 100)
  const awayWin = 100 - homeWin - draw

  return {
    homeWin,
    draw,
    awayWin,
    matchCount: Math.min(homeResults.length, awayResults.length),
  }
}

function buildTeamLineup(
  items: LooseRecord[],
  subs: SubstitutionEvent[],
  teamName: string
): TeamLineup {
  const coach =
    items.map((item) => text(item, "strCoach")).find(Boolean) ?? null
  const formation =
    items.map((item) => text(item, "strFormation")).find(Boolean) ?? null

  const hasSubField = items.some((item) => text(item, "strSubstitute") !== null)
  const starters = (
    hasSubField
      ? items.filter((item) => text(item, "strSubstitute") !== "Yes")
      : items.slice(0, 11)
  ).slice(0, 11)
  const bench = hasSubField
    ? items.filter((item) => text(item, "strSubstitute") === "Yes")
    : items.slice(11)

  const starterSlots: PlayerSlot[] = starters.map((item) => {
    const name =
      text(item, "strPlayer") ??
      text(item, "strPlayerName") ??
      text(item, "player") ??
      "Jogador"
    const position = text(item, "strPosition") ?? text(item, "position") ?? ""
    const subEvent = subs.find(
      (s) =>
        (s.teamName === null ||
          normalize(s.teamName) === normalize(teamName)) &&
        normalize(s.playerOut) === normalize(name)
    )
    return {
      name,
      position,
      row: detectPositionRow(position),
      isSubstituted: Boolean(subEvent),
      substituteIn: subEvent?.playerIn ?? null,
      substituteMinute: subEvent?.minute ?? null,
      cameOn: false,
      replacedPlayer: null,
      cameOnMinute: null,
    }
  })

  const benchSlots: PlayerSlot[] = bench.map((item) => {
    const name =
      text(item, "strPlayer") ??
      text(item, "strPlayerName") ??
      text(item, "player") ??
      "Reserva"
    const position = text(item, "strPosition") ?? text(item, "position") ?? ""
    const subEvent = subs.find(
      (s) =>
        (s.teamName === null ||
          normalize(s.teamName) === normalize(teamName)) &&
        normalize(s.playerIn) === normalize(name)
    )
    return {
      name,
      position,
      row: detectPositionRow(position),
      isSubstituted: false,
      substituteIn: null,
      substituteMinute: null,
      cameOn: Boolean(subEvent),
      replacedPlayer: subEvent?.playerOut ?? null,
      cameOnMinute: subEvent?.minute ?? null,
    }
  })

  const missingBench = subs
    .filter(
      (s) =>
        s.teamName === null || normalize(s.teamName) === normalize(teamName)
    )
    .filter(
      (s) =>
        !benchSlots.some((b) => normalize(b.name) === normalize(s.playerIn))
    )
    .map((s) => ({
      name: s.playerIn,
      position: "",
      row: 2,
      isSubstituted: false,
      substituteIn: null,
      substituteMinute: null,
      cameOn: true,
      replacedPlayer: s.playerOut,
      cameOnMinute: s.minute,
    }))

  return {
    coach,
    formation,
    starters: starterSlots,
    bench: [...benchSlots, ...missingBench],
  }
}

function extractSubstitutions(events: LooseRecord[]): SubstitutionEvent[] {
  return events.flatMap((event) => {
    const timeline = (text(event, "strTimeline") ?? "").toLowerCase()
    const detail = (text(event, "strTimelineDetail") ?? "").toLowerCase()
    if (!timeline.includes("sub") && !detail.includes("sub")) return []
    const playerOut = text(event, "strPlayer")
    const playerIn =
      text(event, "strAssist") ??
      text(event, "strPlayer2") ??
      text(event, "substitute")
    if (!playerOut || !playerIn) return []
    const minuteRaw = text(event, "intTime") ?? text(event, "minute")
    return [
      {
        playerOut,
        playerIn,
        minute: minuteRaw ? Number(minuteRaw) || null : null,
        teamName: text(event, "strTeam"),
      },
    ]
  })
}

function detectPositionRow(position: string): number {
  const p = position.toLowerCase().trim()
  if (!p) return 2
  if (p === "gk" || p.startsWith("goal")) return 0
  if (
    p === "def" ||
    p === "cb" ||
    p === "lb" ||
    p === "rb" ||
    p === "lwb" ||
    p === "rwb" ||
    p === "sw" ||
    p === "dc" ||
    p === "dr" ||
    p === "dl" ||
    p.startsWith("defen") ||
    p.includes("back")
  )
    return 1
  if (
    p === "fw" ||
    p === "fwd" ||
    p === "st" ||
    p === "cf" ||
    p === "lw" ||
    p === "rw" ||
    p === "ss" ||
    p.startsWith("for") ||
    p.includes("ward") ||
    p.includes("attac") ||
    p.includes("strik")
  )
    return 3
  return 2
}

function LiveStreamSection({ streamUrl }: { streamUrl: string }) {
  return (
    <div className={SECTION_CLASS}>
      <div className="mb-2 flex items-center gap-2">
        <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
        <span className="text-xs font-bold tracking-wide text-red-400 uppercase">
          Ao Vivo
        </span>
      </div>
      <div className="aspect-video w-full overflow-hidden rounded-lg">
        <iframe
          src={`${streamUrl}?autoplay=0&rel=0`}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Transmissão ao vivo"
        />
      </div>
    </div>
  )
}
