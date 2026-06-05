"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"

const DEFAULT_AVATAR = "/nina-avatar.jpg"

type UserAvatarProps = {
  avatarUrl?: string | null
  name: string
  size?: number
  className?: string
}

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

export function UserAvatar({
  avatarUrl,
  name,
  size = 36,
  className,
}: UserAvatarProps) {
  const src = avatarUrl ?? DEFAULT_AVATAR

  return (
    <div
      className={cn(
        "relative flex-shrink-0 overflow-hidden rounded-full border border-white/20 bg-slate-900",
        className
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src={src}
        alt={`Avatar de ${name}`}
        fill
        sizes={`${size}px`}
        className="object-cover"
        onError={(e) => {
          // Se a imagem falhar, mostra as iniciais via CSS
          const target = e.currentTarget as HTMLImageElement
          target.style.display = "none"
          const parent = target.parentElement
          if (parent) {
            parent.dataset.initials = initials(name)
          }
        }}
      />
      {/* Fallback de iniciais visível antes/durante carregamento */}
      <span
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center text-xs font-black text-white/80 [img+&]:hidden"
        style={{ fontSize: size * 0.35 }}
      >
        {initials(name)}
      </span>
    </div>
  )
}
