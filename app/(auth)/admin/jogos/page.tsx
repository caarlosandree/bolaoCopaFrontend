"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CalendarPlus, Plus, Clock, Flag } from "lucide-react"

type MatchForm = {
  homeTeam: string
  awayTeam: string
  matchTime: string
  roundId: string
}

const EMPTY_FORM: MatchForm = { homeTeam: "", awayTeam: "", matchTime: "", roundId: "" }

export default function JogosPage() {
  const [form, setForm] = useState<MatchForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  function handleChange(field: keyof MatchForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setSuccess(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.homeTeam || !form.awayTeam || !form.matchTime || !form.roundId) {
      alert("Preencha todos os campos.")
      return
    }
    setSaving(true)
    try {
      // TODO: implementar endpoint POST /admin/matches
      await new Promise((r) => setTimeout(r, 600))
      setSuccess(true)
      setForm(EMPTY_FORM)
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao cadastrar jogo.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-nina-orange/20 to-nina-red/10 border border-nina-orange/30 flex items-center justify-center">
          <CalendarPlus className="h-4 w-4 text-nina-orange" />
        </div>
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">Cadastrar Jogo</h1>
          <p className="text-xs text-slate-500">Adicione partidas à rodada ativa</p>
        </div>
      </div>

      <Card className="bg-slate-900/60 border border-slate-800 rounded-2xl shadow-xl">
        <CardHeader className="border-b border-slate-800/60 pb-4">
          <CardTitle className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Plus className="h-4 w-4 text-nina-orange" />
            Nova Partida
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Times */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                  <Flag className="h-3.5 w-3.5 text-nina-red" />
                  Time da Casa
                </label>
                <Input
                  value={form.homeTeam}
                  onChange={(e) => handleChange("homeTeam", e.target.value)}
                  placeholder="ex: Brasil"
                  className="bg-slate-950 border-slate-700 text-white placeholder-slate-600 focus:border-nina-orange h-11 rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                  <Flag className="h-3.5 w-3.5 text-nina-purple" />
                  Time Visitante
                </label>
                <Input
                  value={form.awayTeam}
                  onChange={(e) => handleChange("awayTeam", e.target.value)}
                  placeholder="ex: Argentina"
                  className="bg-slate-950 border-slate-700 text-white placeholder-slate-600 focus:border-nina-orange h-11 rounded-xl"
                />
              </div>
            </div>

            {/* Rodada e horário */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                  <CalendarPlus className="h-3.5 w-3.5 text-nina-orange" />
                  ID da Rodada
                </label>
                <Input
                  type="number"
                  value={form.roundId}
                  onChange={(e) => handleChange("roundId", e.target.value)}
                  placeholder="ex: 1"
                  className="bg-slate-950 border-slate-700 text-white placeholder-slate-600 focus:border-nina-orange h-11 rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-nina-orange" />
                  Data e Hora
                </label>
                <Input
                  type="datetime-local"
                  value={form.matchTime}
                  onChange={(e) => handleChange("matchTime", e.target.value)}
                  className="bg-slate-950 border-slate-700 text-white focus:border-nina-orange h-11 rounded-xl"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={saving}
              className="w-full h-11 rounded-xl font-bold text-sm bg-gradient-to-r from-nina-wine to-nina-orange hover:opacity-90 text-white cursor-pointer active:scale-[0.99] transition-all shadow-lg shadow-nina-wine/20"
            >
              {saving ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar Partida
                </>
              )}
            </Button>

            {success && (
              <p className="text-center text-xs font-bold text-nina-green animate-in fade-in">
                ✓ Partida cadastrada com sucesso!
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
