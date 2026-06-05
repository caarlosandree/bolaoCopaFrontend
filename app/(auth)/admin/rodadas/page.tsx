"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Layers, Plus, PlayCircle, CheckCircle2, Clock } from "lucide-react"
import type { Round } from "@/lib/types"

type RoundForm = { name: string; number: string }
const EMPTY_FORM: RoundForm = { name: "", number: "" }

const STATUS_CONFIG: Record<Round["status"], { label: string; color: string; icon: React.ReactNode }> = {
  upcoming: {
    label: "Aguardando",
    color: "text-slate-400 bg-slate-800/60 border-slate-700/50",
    icon: <Clock className="h-3 w-3" />,
  },
  active: {
    label: "Ativa",
    color: "text-nina-green bg-nina-green/10 border-nina-green/20",
    icon: <PlayCircle className="h-3 w-3" />,
  },
  finished: {
    label: "Finalizada",
    color: "text-slate-500 bg-slate-900/60 border-slate-800",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
}

export default function RodasPage() {
  const [rounds, setRounds] = useState<Round[]>([])
  const [form, setForm] = useState<RoundForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

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
      // TODO: implementar endpoint POST /admin/rounds
      await new Promise((r) => setTimeout(r, 600))
      setSuccess(true)
      setForm(EMPTY_FORM)
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao criar rodada.")
    } finally {
      setSaving(false)
    }
  }

  async function handleActivate(roundId: number) {
    // TODO: implementar endpoint PATCH /admin/rounds/:id/activate
    setRounds((prev) =>
      prev.map((r) =>
        r.id === roundId
          ? { ...r, status: "active" }
          : r.status === "active"
            ? { ...r, status: "upcoming" }
            : r,
      ),
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-nina-green/20 to-nina-wine/10 border border-nina-green/30 flex items-center justify-center">
          <Layers className="h-4 w-4 text-nina-green" />
        </div>
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">Rodadas</h1>
          <p className="text-xs text-slate-500">Crie e gerencie as rodadas do torneio</p>
        </div>
      </div>

      {/* Formulário */}
      <Card className="bg-slate-900/60 border border-slate-800 rounded-2xl shadow-xl">
        <CardHeader className="border-b border-slate-800/60 pb-4">
          <CardTitle className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Plus className="h-4 w-4 text-nina-green" />
            Nova Rodada
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400">Número</label>
                <Input
                  type="number"
                  value={form.number}
                  onChange={(e) => handleChange("number", e.target.value)}
                  placeholder="ex: 1"
                  className="bg-slate-950 border-slate-700 text-white placeholder-slate-600 focus:border-nina-green h-11 rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400">Nome</label>
                <Input
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="ex: Fase de Grupos — Rodada 1"
                  className="bg-slate-950 border-slate-700 text-white placeholder-slate-600 focus:border-nina-green h-11 rounded-xl"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={saving}
              className="w-full h-11 rounded-xl font-bold text-sm bg-gradient-to-r from-nina-wine to-nina-green hover:opacity-90 text-white cursor-pointer active:scale-[0.99] transition-all shadow-lg shadow-nina-wine/20"
            >
              {saving ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Rodada
                </>
              )}
            </Button>

            {success && (
              <p className="text-center text-xs font-bold text-nina-green animate-in fade-in">
                ✓ Rodada criada com sucesso!
              </p>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Lista de rodadas */}
      {rounds.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Rodadas Cadastradas</h2>
          {rounds.map((round) => {
            const cfg = STATUS_CONFIG[round.status]
            return (
              <Card
                key={round.id}
                className="bg-slate-900/40 border border-slate-800 rounded-xl hover:border-slate-700/60 transition-all"
              >
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-black text-slate-400">
                      {round.number}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-200">{round.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold border rounded-full px-2.5 py-0.5 ${cfg.color}`}>
                      {cfg.icon}
                      {cfg.label}
                    </span>
                    {round.status === "upcoming" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleActivate(round.id)}
                        className="h-8 text-xs font-bold text-nina-green hover:text-white hover:bg-nina-green/20 cursor-pointer"
                      >
                        <PlayCircle className="h-3.5 w-3.5 mr-1" />
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
    </div>
  )
}
