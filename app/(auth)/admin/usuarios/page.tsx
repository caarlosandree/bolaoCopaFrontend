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
import { Users, Search, Trash2, ShieldAlert, User } from "lucide-react"
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
    // TODO: implementar endpoint GET /admin/users
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(false)
  }, [])

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  )

  async function handleDelete(userId: number) {
    if (!confirm("Tem certeza que deseja remover este usuário?")) return
    // TODO: implementar endpoint DELETE /admin/users/:id
    setUsers((prev) => prev.filter((u) => u.id !== userId))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-2 border-nina-purple border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-nina-purple/20 to-nina-pink/10 border border-nina-purple/30 flex items-center justify-center">
            <Users className="h-4 w-4 text-nina-purple" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">Usuários</h1>
            <p className="text-xs text-slate-500">{users.length} participante{users.length !== 1 ? "s" : ""} cadastrado{users.length !== 1 ? "s" : ""}</p>
          </div>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Buscar usuário..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 rounded-full bg-slate-900 border-slate-800 text-white placeholder-slate-500 text-xs w-full"
          />
        </div>
      </div>

      <Card className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <CardHeader className="border-b border-slate-800/60 py-4 px-6">
          <CardTitle className="text-sm font-bold text-slate-200">Lista de Participantes</CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Gerencie os usuários cadastrados no bolão
          </CardDescription>
        </CardHeader>

        <Table>
          <TableHeader className="bg-slate-950/30">
            <TableRow className="border-slate-800">
              <TableHead className="w-[50px]" />
              <TableHead className="font-bold">Participante</TableHead>
              <TableHead className="font-bold">Papel</TableHead>
              <TableHead className="text-right font-bold">Pontos</TableHead>
              <TableHead className="w-[80px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-slate-400 text-sm py-12">
                  {users.length === 0
                    ? "Nenhum usuário cadastrado ainda."
                    : "Nenhum usuário encontrado."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((user) => (
                <TableRow
                  key={user.id}
                  className="border-slate-800 hover:bg-slate-900/30 transition-colors"
                >
                  <TableCell className="p-3">
                    <div className="h-8 w-8 rounded-full bg-nina-wine/20 border border-nina-wine/30 flex items-center justify-center text-xs font-bold text-slate-300">
                      {initials(user.name)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-slate-100 block text-sm">{user.name}</span>
                    <span className="text-xs text-slate-500">{user.email}</span>
                  </TableCell>
                  <TableCell>
                    {user.role === "admin" ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-nina-purple bg-nina-purple/10 border border-nina-purple/20 rounded-full px-2.5 py-0.5">
                        <ShieldAlert className="h-3 w-3" />
                        Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 bg-slate-800/60 border border-slate-700/50 rounded-full px-2.5 py-0.5">
                        <User className="h-3 w-3" />
                        Jogador
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-black text-slate-200">
                    {user.total_points} pts
                  </TableCell>
                  <TableCell className="text-right pr-4">
                    {user.role !== "admin" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(user.id)}
                        className="h-8 w-8 text-slate-500 hover:text-red-400 hover:bg-red-950/30 cursor-pointer"
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
      </Card>
    </div>
  )
}
