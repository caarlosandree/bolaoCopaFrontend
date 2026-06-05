"use client"

import React, { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Layers,
  Plus,
  PlayCircle,
  CheckCircle2,
  Clock,
  Check,
} from "lucide-react"
import type { Round } from "@/lib/types"

type RoundForm = { name: string; number: string }
const EMPTY_FORM: RoundForm = { name: "", number: "" }

const STATUS_CONFIG: Record<
  Round["status"],
  { label: string; color: string; icon: React.ReactNode }
> = {
  upcoming: {
    label: "Aguardando",
    color: "text-slate-400 bg-slate-800/50 border-slate-700/50",
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  active: {
    label: "Ativa",
    color:
      "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-sm shadow-emerald-500/5",
    icon: <PlayCircle className="h-3.5 w-3.5 animate-pulse" />,
  },
  finished: {
    label: "Finalizada",
    color: "text-slate-500 bg-slate-900/80 border-slate-800",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
}

export default function RodasPage() {
  const [rounds, setRounds] = useState<Round[]>([])
  const [form, setForm] = useState<RoundForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRounds() {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch("/api/admin/rounds", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (response.ok) {
          const data = await response.json()
          setRounds(data)
        }
      } catch (error) {
        console.error("Erro ao buscar rodadas:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRounds()
  }, [])

  function handleChange(field: keyof RoundForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setSuccess(false)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.number) {
      alert("Preencha todos os campos.")
      return
    }
    setSaving(true)
    try {
      // TODO: implementar endpoint POST /admin/rounds se necessário no futuro
      await new Promise((r) => setTimeout(r, 600))

      const newRound: Round = {
        id: Date.now(),
        tournament_id: 1,
        number: Number(form.number),
        name: form.name,
        status: "upcoming",
        created_at: new Date().toISOString(),
      }

      setRounds((prev) => {
        const updated = [...prev, newRound]
        // Ordena por número da rodada
        return updated.sort((a, b) => a.number - b.number)
      })

      setSuccess(true)
      setForm(EMPTY_FORM)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao criar rodada.")
    } finally {
      setSaving(false)
    }
  }

  async function handleActivate(roundId: number) {
    // TODO: implementar endpoint PATCH /admin/rounds/:id/activate se necessário no futuro
    setRounds((prev) =>
      prev.map((r) =>
        r.id === roundId
          ? { ...r, status: "active" }
          : r.status === "active"
            ? { ...r, status: "finished" } // As anteriores passam para finalizadas para simulação realista
            : r
      )
    )
  }

  return (
    <div className="mx-auto max-w-3xl animate-in space-y-8 duration-300 fade-in">
      {/* Page header */}
      <div className="flex items-center gap-4 border-b border-slate-800/60 pb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 shadow-lg shadow-emerald-500/5">
          <Layers className="h-6 w-6 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Gerenciar Rodadas
          </h1>
          <p className="text-xs font-medium text-slate-400">
            Crie e configure as fases do nosso bolão
          </p>
        </div>
      </div>

      {/* Formulário */}
      <Card className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 shadow-xl backdrop-blur-md">
        <CardHeader className="border-b border-slate-800/60 bg-slate-950/20 px-6 pb-4">
          <CardTitle className="flex items-center gap-2 text-sm font-black tracking-wider text-slate-200 uppercase">
            <Plus className="h-4 w-4 text-emerald-400" />
            Nova Rodada
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Adicione uma nova rodada de palpites para os usuários do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleCreate} className="space-y-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-1.5 md:col-span-1">
                <label className="pl-1 text-xs font-bold tracking-wider text-slate-300 uppercase">
                  Número
                </label>
                <Input
                  type="number"
                  min="1"
                  value={form.number}
                  onChange={(e) => handleChange("number", e.target.value)}
                  placeholder="ex: 4"
                  className="h-11 rounded-xl border-slate-800 bg-slate-950/80 font-bold text-white placeholder-slate-600 transition-all hover:border-slate-700/60 focus:border-emerald-500"
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="pl-1 text-xs font-bold tracking-wider text-slate-300 uppercase">
                  Nome da Rodada
                </label>
                <Input
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="ex: Oitavas de Final — Rodada Única"
                  className="h-11 rounded-xl border-slate-800 bg-slate-950/80 text-white placeholder-slate-600 transition-all hover:border-slate-700/60 focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                type="submit"
                disabled={saving}
                className="h-11 w-full cursor-pointer rounded-xl border border-emerald-500/20 bg-gradient-to-r from-nina-wine to-emerald-600 text-sm font-bold text-white shadow-lg shadow-emerald-950/20 transition-all hover:opacity-95 active:scale-[0.99]"
              >
                {saving ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Rodada
                  </>
                )}
              </Button>

              {success && (
                <div className="flex animate-in items-center justify-center gap-1.5 text-xs font-black text-emerald-400 fade-in slide-in-from-top-1">
                  <Check className="h-4 w-4" />
                  <span>Rodada criada com sucesso e adicionada à lista!</span>
                </div>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Lista de rodadas */}
      <div className="space-y-4">
        <h2 className="px-1 text-xs font-bold tracking-wider text-slate-400 uppercase">
          Rodadas Cadastradas
        </h2>
        {loading ? (
          <div className="flex h-48 items-center justify-center rounded-2xl border border-slate-800/40 bg-slate-900/20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {rounds.map((round) => {
              const cfg = STATUS_CONFIG[round.status]
              return (
                <Card
                  key={round.id}
                  className={`rounded-xl border bg-slate-900/40 backdrop-blur-md transition-all duration-200 hover:bg-slate-900/60 ${
                    round.status === "active"
                      ? "border-emerald-500/20 shadow-md shadow-emerald-500/2"
                      : "border-slate-800/80"
                  }`}
                >
                  <CardContent className="flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg text-xs font-black transition-all ${
                          round.status === "active"
                            ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-inner"
                            : "border border-slate-800 bg-slate-950/60 text-slate-400"
                        }`}
                      >
                        #{round.number}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-100 group-hover:text-white">
                          {round.name}
                        </p>
                        <p className="mt-0.5 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                          ID: {round.id}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 border-t border-slate-800/40 pt-3 sm:justify-end sm:border-0 sm:pt-0">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-black tracking-wider uppercase ${cfg.color}`}
                      >
                        {cfg.icon}
                        {cfg.label}
                      </span>

                      {round.status === "upcoming" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleActivate(round.id)}
                          className="h-9 cursor-pointer rounded-xl border border-emerald-500/10 px-3 text-xs font-black text-emerald-400 transition-all hover:border-emerald-500/30 hover:bg-emerald-500/15 hover:text-white"
                        >
                          <PlayCircle className="mr-1.5 h-4 w-4" />
                          Ativar
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {!loading && rounds.length === 0 && (
          <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-10 text-center shadow-inner">
            <p className="text-sm text-slate-400">
              Nenhuma rodada cadastrada ainda.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
