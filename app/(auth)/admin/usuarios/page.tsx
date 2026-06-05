"use client"

import React, { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Users, Search, Trash2, User, ShieldCheck } from "lucide-react"
import type { User as UserType } from "@/lib/types"

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

export default function UsuariosPage() {
  const [users, setUsers] = useState<UserType[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch("/api/admin/users")
        if (response.ok) {
          const data = await response.json()
          setUsers(data)
        }
      } catch (error) {
        console.error("Erro ao buscar usuários:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  )

  async function handleDelete(userId: number) {
    if (!confirm("Tem certeza que deseja remover este usuário?")) return
    // TODO: implementar endpoint DELETE /admin/users/:id se necessário no futuro
    setUsers((prev) => prev.filter((u) => u.id !== userId))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-2 border-nina-red border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/60 pb-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-indigo-600/5 border border-indigo-500/30 flex items-center justify-center shadow-lg shadow-indigo-500/5">
            <Users className="h-6 w-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Gerenciar Usuários</h1>
            <p className="text-xs text-slate-400 font-medium">
              {users.length} participante{users.length !== 1 ? "s" : ""} cadastrado{users.length !== 1 ? "s" : ""} no bolão
            </p>
          </div>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar usuário por nome ou e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 h-11 rounded-xl bg-slate-900/80 border-slate-800/80 hover:border-slate-700/60 focus:border-indigo-500 text-white placeholder-slate-500 text-xs w-full transition-all"
          />
        </div>
      </div>

      <Card className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <CardHeader className="border-b border-slate-800/60 py-5 px-6 bg-slate-950/30">
          <CardTitle className="text-sm font-black text-slate-200 uppercase tracking-wider">Lista de Participantes</CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Acompanhe a atividade e gerencie as permissões dos jogadores do bolão
          </CardDescription>
        </CardHeader>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-950/40">
              <TableRow className="border-slate-800/60 hover:bg-transparent">
                <TableHead className="w-[60px]" />
                <TableHead className="font-bold text-slate-300 text-xs">Participante</TableHead>
                <TableHead className="font-bold text-slate-300 text-xs">Permissão / Cargo</TableHead>
                <TableHead className="text-right font-bold text-slate-300 text-xs">Pontos Acumulados</TableHead>
                <TableHead className="w-[80px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-slate-400 text-sm py-12 font-medium">
                    {users.length === 0
                      ? "Nenhum usuário cadastrado no sistema ainda."
                      : "Nenhum participante encontrado com os critérios de busca."}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((user) => (
                  <TableRow
                    key={user.id}
                    className="border-slate-800/60 hover:bg-slate-900/30 transition-colors group"
                  >
                    <TableCell className="p-3">
                      <div className="h-9 w-9 rounded-full bg-slate-950/60 border border-slate-800 group-hover:border-indigo-500/30 flex items-center justify-center text-xs font-black text-slate-200 shadow-inner transition-all">
                        {initials(user.name)}
                      </div>
                    </TableCell>
                    
                    <TableCell className="py-3.5">
                      <span className="font-bold text-slate-100 block text-sm group-hover:text-white transition-colors">{user.name}</span>
                      <span className="text-xs text-slate-400 font-medium">{user.email}</span>
                    </TableCell>
                    
                    <TableCell>
                      {user.role === "admin" ? (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-2.5 py-1">
                          <ShieldCheck className="h-3.5 w-3.5 animate-pulse" />
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-800/60 border border-slate-700/50 rounded-full px-2.5 py-1">
                          <User className="h-3.5 w-3.5" />
                          Jogador
                        </span>
                      )}
                    </TableCell>
                    
                    <TableCell className="text-right font-black text-slate-100 text-sm">
                      <span className="bg-slate-950/40 group-hover:bg-slate-950/70 border border-slate-800/40 px-3 py-1.5 rounded-lg shadow-inner text-white">
                        {user.total_points} <span className="text-[10px] font-bold text-slate-500 uppercase ml-0.5">pts</span>
                      </span>
                    </TableCell>
                    
                    <TableCell className="text-right pr-4">
                      {user.role !== "admin" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(user.id)}
                          className="h-9 w-9 text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-xl cursor-pointer transition-all"
                          title="Remover usuário"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
