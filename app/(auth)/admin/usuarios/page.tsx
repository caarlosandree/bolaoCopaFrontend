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
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
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
      u.email.toLowerCase().includes(search.toLowerCase())
  )

  async function handleDelete(userId: number) {
    if (!confirm("Tem certeza que deseja remover este usuário?")) return
    // TODO: implementar endpoint DELETE /admin/users/:id se necessário no futuro
    setUsers((prev) => prev.filter((u) => u.id !== userId))
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-nina-red border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl animate-in space-y-6 duration-300 fade-in">
      {/* Page header */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-800/60 pb-6 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/20 to-indigo-600/5 shadow-lg shadow-indigo-500/5">
            <Users className="h-6 w-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Gerenciar Usuários
            </h1>
            <p className="text-xs font-medium text-slate-400">
              {users.length} participante{users.length !== 1 ? "s" : ""}{" "}
              cadastrado{users.length !== 1 ? "s" : ""} no bolão
            </p>
          </div>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Buscar usuário por nome ou e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 w-full rounded-xl border-slate-800/80 bg-slate-900/80 pr-4 pl-10 text-xs text-white placeholder-slate-500 transition-all hover:border-slate-700/60 focus:border-indigo-500"
          />
        </div>
      </div>

      <Card className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 shadow-xl backdrop-blur-md">
        <CardHeader className="border-b border-slate-800/60 bg-slate-950/30 px-6 py-5">
          <CardTitle className="text-sm font-black tracking-wider text-slate-200 uppercase">
            Lista de Participantes
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Acompanhe a atividade e gerencie as permissões dos jogadores do
            bolão
          </CardDescription>
        </CardHeader>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-950/40">
              <TableRow className="border-slate-800/60 hover:bg-transparent">
                <TableHead className="w-[60px]" />
                <TableHead className="text-xs font-bold text-slate-300">
                  Participante
                </TableHead>
                <TableHead className="text-xs font-bold text-slate-300">
                  Permissão / Cargo
                </TableHead>
                <TableHead className="text-right text-xs font-bold text-slate-300">
                  Pontos Acumulados
                </TableHead>
                <TableHead className="w-[80px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-12 text-center text-sm font-medium text-slate-400"
                  >
                    {users.length === 0
                      ? "Nenhum usuário cadastrado no sistema ainda."
                      : "Nenhum participante encontrado com os critérios de busca."}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((user) => (
                  <TableRow
                    key={user.id}
                    className="group border-slate-800/60 transition-colors hover:bg-slate-900/30"
                  >
                    <TableCell className="p-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-800 bg-slate-950/60 text-xs font-black text-slate-200 shadow-inner transition-all group-hover:border-indigo-500/30">
                        {initials(user.name)}
                      </div>
                    </TableCell>

                    <TableCell className="py-3.5">
                      <span className="block text-sm font-bold text-slate-100 transition-colors group-hover:text-white">
                        {user.name}
                      </span>
                      <span className="text-xs font-medium text-slate-400">
                        {user.email}
                      </span>
                    </TableCell>

                    <TableCell>
                      {user.role === "admin" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-1 text-[10px] font-black tracking-wider text-indigo-400 uppercase">
                          <ShieldCheck className="h-3.5 w-3.5 animate-pulse" />
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700/50 bg-slate-800/60 px-2.5 py-1 text-[10px] font-black tracking-wider text-slate-400 uppercase">
                          <User className="h-3.5 w-3.5" />
                          Jogador
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="text-right text-sm font-black text-slate-100">
                      <span className="rounded-lg border border-slate-800/40 bg-slate-950/40 px-3 py-1.5 text-white shadow-inner group-hover:bg-slate-950/70">
                        {user.total_points}{" "}
                        <span className="ml-0.5 text-[10px] font-bold text-slate-500 uppercase">
                          pts
                        </span>
                      </span>
                    </TableCell>

                    <TableCell className="pr-4 text-right">
                      {user.role !== "admin" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(user.id)}
                          className="h-9 w-9 cursor-pointer rounded-xl border border-transparent text-slate-400 transition-all hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-400"
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
