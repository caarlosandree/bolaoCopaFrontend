"use client"

import React, { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Camera, Loader2 } from "lucide-react"
import { uploadAvatar } from "@/lib/api"
import { getUser, setAuth, getToken } from "@/lib/auth"
import { cn } from "@/lib/utils"

const DEFAULT_AVATAR = "/nina-avatar.jpg"
const ACCEPTED = "image/jpeg,image/png,image/webp"

type AvatarUploadProps = {
  onSuccess?: (avatarUrl: string) => void
  className?: string
}

export function AvatarUpload({ onSuccess, className }: AvatarUploadProps) {
  const user = getUser()
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(
    user?.avatar_url ?? null
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Rastreia o blob URL atual para revogá-lo apenas depois do próximo render
  const [blobUrl, setBlobUrl] = useState<string | null>(null)

  // Quando blobUrl é limpo (null), o cleanup do efeito anterior revoga o URL antigo —
  // isso garante que a revogação só acontece APÓS o React commitar o novo preview
  useEffect(() => {
    if (!blobUrl) return
    return () => URL.revokeObjectURL(blobUrl)
  }, [blobUrl])

  const currentAvatar = preview ?? DEFAULT_AVATAR

  function handleClick() {
    inputRef.current?.click()
  }

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError("Arquivo muito grande. Máximo 5 MB.")
      return
    }

    setError(null)
    setLoading(true)

    // Preview local imediato
    const objectUrl = URL.createObjectURL(file)
    setBlobUrl(objectUrl)
    setPreview(objectUrl)

    try {
      const { avatar_url } = await uploadAvatar(file)

      // Cache-busting: força o Next.js Image a buscar a versão recém-enviada
      // (sem isso, o optimizer pode servir a versão cacheada da mesma URL)
      setPreview(`${avatar_url}?t=${Date.now()}`)
      setBlobUrl(null) // dispara a revogação do objectUrl via useEffect

      const token = getToken()
      if (user && token) {
        setAuth(token, { ...user, avatar_url })
      }

      onSuccess?.(avatar_url)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar imagem")
      setPreview(user?.avatar_url ?? null)
      setBlobUrl(null)
    } finally {
      setLoading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="group relative h-24 w-24 cursor-pointer overflow-hidden rounded-full border-2 border-white/20 bg-slate-900 transition-all hover:border-nina-red/60 focus-visible:ring-2 focus-visible:ring-nina-red focus-visible:outline-none disabled:cursor-not-allowed"
        title="Alterar foto de perfil"
        aria-label="Alterar foto de perfil"
      >
        <Image
          src={currentAvatar}
          alt="Sua foto de perfil"
          fill
          sizes="96px"
          className="object-cover"
          onError={() => setPreview(DEFAULT_AVATAR)}
        />

        {/* Overlay ao hover */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/0 transition-all group-hover:bg-black/60">
          {loading ? (
            <Loader2 className="h-6 w-6 animate-spin text-white opacity-0 transition-opacity group-hover:opacity-100" />
          ) : (
            <>
              <Camera className="h-5 w-5 text-white opacity-0 transition-opacity group-hover:opacity-100" />
              <span className="text-[10px] font-bold text-white opacity-0 transition-opacity group-hover:opacity-100">
                Alterar
              </span>
            </>
          )}
        </div>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        className="sr-only"
        onChange={handleChange}
        aria-label="Selecionar foto de perfil"
      />

      {error && (
        <p
          role="alert"
          className="text-center text-xs font-medium text-red-400"
        >
          {error}
        </p>
      )}

      <p className="text-center text-[11px] text-white/40">
        JPG, PNG ou WebP · máx. 5 MB
      </p>
    </div>
  )
}
