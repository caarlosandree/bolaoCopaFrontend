"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { BarChart3, Globe, Loader2 } from "lucide-react"
import { getBolaoStats } from "@/lib/api"
import type { BolaoStats } from "@/lib/types"

import { CopaOverviewSection } from "@/components/statistics/copa/copa-overview"
import { GroupStandingsSection } from "@/components/statistics/copa/group-standings"
import { KnockoutBracketSection } from "@/components/statistics/copa/knockout-bracket"
import { BolaoOverviewSection } from "@/components/statistics/bolao/bolao-overview"
import { PointsEvolutionChart } from "@/components/statistics/bolao/points-evolution-chart"
import { GuessDistributionChart } from "@/components/statistics/bolao/guess-distribution-chart"
import { AccuracyRankingTable } from "@/components/statistics/bolao/accuracy-ranking"

type Tab = "copa" | "bolao"

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all duration-200 ${
        active
          ? "bg-nina-wine text-white shadow-lg shadow-nina-wine/20"
          : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
      }`}
    >
      {icon}
      {label}
    </button>
  )
}

function BolaoTab() {
  const [data, setData] = useState<BolaoStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getBolaoStats()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6">
      <BolaoOverviewSection data={data.overview} />

      <div className="grid gap-6 xl:grid-cols-2">
        <PointsEvolutionChart data={data.points_evolution} />
        <GuessDistributionChart data={data.guess_distribution} />
      </div>

      <AccuracyRankingTable data={data.accuracy_ranking} />
    </div>
  )
}

function CopaTab() {
  return (
    <div className="space-y-6">
      <CopaOverviewSection />
      <GroupStandingsSection />
      <KnockoutBracketSection />
    </div>
  )
}

function EstatisticasContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialTab = (searchParams.get("tab") as Tab) ?? "copa"
  const [activeTab, setActiveTab] = useState<Tab>(initialTab)

  function switchTab(tab: Tab) {
    setActiveTab(tab)
    router.replace(`?tab=${tab}`, { scroll: false })
  }

  return (
    <div className="mx-auto max-w-6xl animate-in space-y-6 duration-300 fade-in">
      {/* Page header */}
      <div className="flex flex-col gap-4 border-b border-slate-800/60 pb-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-nina-wine/30 bg-gradient-to-br from-nina-wine/20 to-nina-wine-dark/5 shadow-lg shadow-nina-wine/5">
            <BarChart3 className="h-6 w-6 text-nina-red" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">Estatísticas</h1>
            <p className="text-xs font-medium text-slate-400">
              Copa do Mundo 2026 · dados em tempo real
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2 rounded-2xl border border-slate-800/60 bg-slate-900/60 p-1.5 backdrop-blur-sm">
          <TabButton
            active={activeTab === "copa"}
            onClick={() => switchTab("copa")}
            icon={<Globe className="h-4 w-4" />}
            label="Copa"
          />
          <TabButton
            active={activeTab === "bolao"}
            onClick={() => switchTab("bolao")}
            icon={<BarChart3 className="h-4 w-4" />}
            label="Bolão"
          />
        </div>
      </div>

      {/* Tab content */}
      {activeTab === "copa" ? <CopaTab /> : <BolaoTab />}
    </div>
  )
}

export default function EstatisticasPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      }
    >
      <EstatisticasContent />
    </Suspense>
  )
}
