"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Layers, Plus, PlayCircle, CheckCircle2, Clock, Check } from "lucide-react"
import type { Round } from "@/lib/types"

type RoundForm = { name: string; number: string }
const EMPTY_FORM: RoundForm = { name: "", number: "" }

const STATUS_CONFIG: Record<Round["status"], { label: string; color: string; icon: React.ReactNode }> = {
  upcoming: {
    label: "Aguardando",
    color: "text-slate-400 bg-slate-800/50 border-slate-700/50",
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  active: {
    label: "Ativa",
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-sm shadow-emerald-500/5",
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
        created_at: new Date().toISOString()
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
            : r,
      ),
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Page header */}
      <div className="flex items-center gap-4 border-b border-slate-800/60 pb-6">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/5">
          <Layers className="h-6 w-6 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Gerenciar Rodadas</h1>
          <p className="text-xs text-slate-400 font-medium">Crie e configure as fases do nosso bolão</p>
        </div>
      </div>

      {/* Formulário */}
      <Card className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl shadow-xl overflow-hidden">
        <CardHeader className="border-b border-slate-800/60 pb-4 px-6 bg-slate-950/20">
          <CardTitle className="text-sm font-black text-slate-200 flex items-center gap-2 uppercase tracking-wider">
            <Plus className="h-4 w-4 text-emerald-400" />
            Nova Rodada
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Adicione uma nova rodada de palpites para os usuários do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleCreate} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5 md:col-span-1">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider pl-1">Número</label>
                <Input
                  type="number"
                  min="1"
                  value={form.number}
                  onChange={(e) => handleChange("number", e.target.value)}
                  placeholder="ex: 4"
                  className="bg-slate-950/80 border-slate-800 hover:border-slate-700/60 focus:border-emerald-500 text-white placeholder-slate-600 h-11 rounded-xl transition-all font-bold"
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider pl-1">Nome da Rodada</label>
                <Input
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="ex: Oitavas de Final — Rodada Única"
                  className="bg-slate-950/80 border-slate-800 hover:border-slate-700/60 focus:border-emerald-500 text-white placeholder-slate-600 h-11 rounded-xl transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                type="submit"
                disabled={saving}
                className="w-full h-11 rounded-xl font-bold text-sm bg-gradient-to-r from-nina-wine to-emerald-600 hover:opacity-95 text-white cursor-pointer active:scale-[0.99] transition-all shadow-lg shadow-emerald-950/20 border border-emerald-500/20"
              >
                {saving ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Rodada
                  </>
                )}
              </Button>

              {success && (
                <div className="flex items-center justify-center gap-1.5 text-xs font-black text-emerald-400 animate-in fade-in slide-in-from-top-1">
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
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Rodadas Cadastradas</h2>
        {loading ? (
          <div className="flex items-center justify-center h-48 bg-slate-900/20 border border-slate-800/40 rounded-2xl">
            <div className="h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
          {rounds.map((round) => {
            const cfg = STATUS_CONFIG[round.status]
            return (
              <Card
                key={round.id}
                className={`bg-slate-900/40 backdrop-blur-md border rounded-xl hover:bg-slate-900/60 transition-all duration-200 ${
                  round.status === "active" ? "border-emerald-500/20 shadow-md shadow-emerald-500/2" : "border-slate-800/80"
                }`}
              >
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center text-xs font-black transition-all ${
                      round.status === "active" 
                        ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-inner" 
                        : "bg-slate-950/60 border border-slate-800 text-slate-400"
                    }`}>
                      #{round.number}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-100 group-hover:text-white">{round.name}</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase mt-0.5 tracking-wider">ID: {round.id}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t border-slate-800/40 sm:border-0 pt-3 sm:pt-0">
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider border rounded-full px-3 py-1 ${cfg.color}`}>
                      {cfg.icon}
                      {cfg.label}
                    </span>
                    
                    {round.status === "upcoming" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleActivate(round.id)}
                        className="h-9 px-3 text-xs font-black text-emerald-400 hover:text-white hover:bg-emerald-500/15 border border-emerald-500/10 hover:border-emerald-500/30 rounded-xl cursor-pointer transition-all"
                      >
                        <PlayCircle className="h-4 w-4 mr-1.5" />
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
          <div className="bg-slate-900/40 border border-slate-800/60 p-10 text-center rounded-2xl shadow-inner">
            <p className="text-slate-400 text-sm">Nenhuma rodada cadastrada ainda.</p>
          </div>
        )}
      </div>
    </div>
  )
}
