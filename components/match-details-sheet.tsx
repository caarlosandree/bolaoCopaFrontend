"use client"

import { useMemo, useState, type ComponentType, type ReactNode } from "react"
import {
  Activity,
  BarChart3,
  CalendarClock,
  CircleHelp,
  Info,
  LineChart,
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

const SECTION_CLASS =
  "rounded-xl border border-slate-800/70 bg-slate-950/40 p-3"

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

  const mediaEvent = useMemo(() => firstEvent(details?.media), [details?.media])
  const sourceStatus = details?.source_status ?? []

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
        className="w-full overflow-y-auto border-slate-800 bg-slate-950 p-0 text-slate-100 sm:max-w-xl"
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
              <OddsSection details={details} />
              <FormSection details={details} match={match} />
              <LineupsSection details={details} match={match} />
              <StatsSection details={details} />
              <EventsSection details={details} />
              <SourceStatusSection statuses={sourceStatus} details={details} />
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

  return (
    <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4">
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

function OddsSection({ details }: { details: MatchDetails }) {
  const odds = asRecord(details.odds)
  const bookmakers = asRecord(odds?.bookmakers)
  const bookmakerNames = bookmakers ? Object.keys(bookmakers).slice(0, 4) : []

  return (
    <Section
      icon={LineChart}
      title="Odds de mercado"
      available={details.availability.odds}
    >
      {bookmakerNames.length > 0 ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {bookmakerNames.map((name) => (
            <div
              key={name}
              className="rounded-lg border border-slate-800/70 bg-slate-900/60 p-2"
            >
              <p className="text-xs font-black text-white">{name}</p>
              <pre className="mt-1 max-h-20 overflow-hidden text-[10px] whitespace-pre-wrap text-slate-500">
                {JSON.stringify(bookmakers?.[name], null, 2)}
              </pre>
            </div>
          ))}
        </div>
      ) : (
        <RawPreview value={details.odds} />
      )}
    </Section>
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

  return (
    <Section
      icon={Activity}
      title="Últimos jogos"
      available={details.availability.form}
    >
      {form ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <RecentTeamForm label={match.home_team} value={form.home} />
          <RecentTeamForm label={match.away_team} value={form.away} />
        </div>
      ) : (
        <Unavailable />
      )}
    </Section>
  )
}

function RecentTeamForm({ label, value }: { label: string; value: unknown }) {
  const events = extractArray(value, ["schedule", "events"]).slice(0, 5)
  return (
    <div className="rounded-lg border border-slate-800/70 bg-slate-900/60 p-2">
      <p className="mb-2 text-xs font-black text-white">{label}</p>
      {events.length > 0 ? (
        <div className="space-y-1.5">
          {events.map((event, index) => (
            <div
              key={`${label}-${index}`}
              className="flex items-center justify-between gap-2 text-[11px]"
            >
              <span className="truncate text-slate-400">
                {text(event, "strEvent") ?? "Partida"}
              </span>
              <span className="font-bold text-slate-500">
                {scoreText(event)}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-600">Ainda indisponível</p>
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
  const lineups = extractArray(details.lineups, ["lineup", "lineups"])

  return (
    <Section
      icon={Shirt}
      title="Escalações e formação"
      available={details.availability.lineups}
    >
      {lineups.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-green-900/40 bg-green-950/30">
          <div className="grid min-h-80 grid-cols-2 gap-px bg-green-900/30 p-px">
            <PitchColumn team={match.home_team} items={lineups.slice(0, 11)} />
            <PitchColumn team={match.away_team} items={lineups.slice(11, 22)} />
          </div>
        </div>
      ) : (
        <Unavailable />
      )}
    </Section>
  )
}

function PitchColumn({ team, items }: { team: string; items: LooseRecord[] }) {
  const fallback = items.length === 0
  return (
    <div className="flex min-h-80 flex-col justify-around bg-[linear-gradient(0deg,rgba(22,101,52,.35)_1px,transparent_1px),linear-gradient(90deg,rgba(22,101,52,.35)_1px,transparent_1px)] bg-size-[24px_24px] p-3">
      <p className="text-center text-[10px] font-black tracking-wider text-green-200 uppercase">
        {team}
      </p>
      {fallback ? (
        <p className="text-center text-xs font-bold text-green-200/60">
          Escalação indisponível
        </p>
      ) : (
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
      )}
    </div>
  )
}

function StatsSection({ details }: { details: MatchDetails }) {
  return (
    <Section
      icon={BarChart3}
      title="Estatísticas"
      available={details.availability.statistics}
    >
      {details.availability.statistics ? (
        <RawPreview value={details.statistics} />
      ) : (
        <Unavailable />
      )}
    </Section>
  )
}

function EventsSection({ details }: { details: MatchDetails }) {
  const events = extractArray(details.events, ["timeline", "events"])
  return (
    <Section
      icon={Users}
      title="Timeline"
      available={details.availability.events}
    >
      {events.length > 0 ? (
        <div className="space-y-2">
          {events.slice(0, 12).map((event, index) => (
            <div
              key={index}
              className="flex items-center gap-2 rounded-lg border border-slate-800/60 bg-slate-900/50 px-2 py-1.5 text-xs"
            >
              <span className="w-10 flex-shrink-0 font-black text-slate-500">
                {text(event, "intTime") ?? text(event, "minute") ?? "-"} min
              </span>
              <span className="min-w-0 flex-1 truncate text-slate-300">
                {text(event, "strTimeline") ??
                  text(event, "strPlayer") ??
                  text(event, "event") ??
                  "Evento"}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <Unavailable />
      )}
    </Section>
  )
}

function SourceStatusSection({
  statuses,
  details,
}: {
  statuses: MatchDetails["source_status"]
  details: MatchDetails
}) {
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
            >
              {status.section}: {status.status}
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

function RawPreview({ value }: { value: unknown }) {
  if (!value) return <Unavailable />
  return (
    <pre className="max-h-48 overflow-auto rounded-lg border border-slate-800/60 bg-slate-900/60 p-2 text-[10px] leading-relaxed whitespace-pre-wrap text-slate-400">
      {JSON.stringify(value, null, 2)}
    </pre>
  )
}

function Unavailable() {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-slate-800/60 bg-slate-900/50 px-3 py-2 text-xs font-bold text-slate-500">
      <CircleHelp className="h-3.5 w-3.5" />
      Ainda indisponível
    </div>
  )
}

function firstEvent(value: unknown): LooseRecord | null {
  const events = extractArray(value, ["event", "events", "schedule"])
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
