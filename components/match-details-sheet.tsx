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

          {match.status === "ongoing" && match.stream_url && (
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
  const lineups = extractArray(details.lineups, ["lookup", "lineup", "lineups"])
  const available = dataAvailable(details.lineups) && lineups.length > 0

  const hasHomeFlag = lineups.some((p) => text(p, "strHome") !== null)
  const homeItems = hasHomeFlag
    ? lineups.filter((p) => text(p, "strHome") === "Yes")
    : lineups.slice(0, 11)
  const awayItems = hasHomeFlag
    ? lineups.filter((p) => text(p, "strHome") === "No")
    : lineups.slice(11, 22)

  return (
    <Section icon={Shirt} title="Escalações e formação" available={available}>
      {available ? (
        <div className="overflow-hidden rounded-xl border border-green-900/40 bg-green-950/30">
          <div className="grid min-h-80 grid-cols-1 gap-px bg-green-900/30 p-px sm:grid-cols-2">
            <PitchColumn team={match.home_team} items={homeItems} />
            <PitchColumn team={match.away_team} items={awayItems} />
          </div>
        </div>
      ) : (
        <Unavailable detail={sourceMessage(details.lineups)} />
      )}
    </Section>
  )
}

function PitchColumn({ team, items }: { team: string; items: LooseRecord[] }) {
  return (
    <div className="flex min-h-80 flex-col justify-around bg-[linear-gradient(0deg,rgba(22,101,52,.35)_1px,transparent_1px),linear-gradient(90deg,rgba(22,101,52,.35)_1px,transparent_1px)] bg-size-[24px_24px] p-3">
      <p className="text-center text-[10px] font-black tracking-wider text-green-200 uppercase">
        {team}
      </p>
      <div className="grid grid-cols-2 gap-2">
        {items.map((item, index) => (
          <div
            key={`${team}-${index}`}
            className="rounded-lg border border-green-800/50 bg-slate-950/70 px-2 py-1 text-center"
          >
            <p className="truncate text-[10px] font-bold text-white">
              {text(item, "strPlayer") ??
                text(item, "strPlayerName") ??
                text(item, "player") ??
                "Jogador"}
            </p>
            <p className="text-[9px] text-green-300/70">
              {text(item, "strPosition") ?? text(item, "position") ?? "-"}
            </p>
          </div>
        ))}
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
