"use client"

import React from "react"
import { cn } from "@/lib/utils"

const flagMapping: Record<string, string> = {
  brasil: "br",
  brazil: "br",
  argentina: "ar",
  alemanha: "de",
  germany: "de",
  franca: "fr",
  france: "fr",
  espanha: "es",
  spain: "es",
  italia: "it",
  italy: "it",
  portugal: "pt",
  inglaterra: "gb-eng",
  england: "gb-eng",
  belgica: "be",
  belgium: "be",
  holanda: "nl",
  "paises baixos": "nl",
  netherlands: "nl",
  croacia: "hr",
  croatia: "hr",
  marrocos: "ma",
  morocco: "ma",
  japao: "jp",
  japan: "jp",
  eua: "us",
  "estados unidos": "us",
  usa: "us",
  "united states": "us",
  canada: "ca",
  mexico: "mx",
  senegal: "sn",
  suica: "ch",
  switzerland: "ch",
  camaroes: "cm",
  cameroon: "cm",
  gana: "gh",
  ghana: "gh",
  "coreia do sul": "kr",
  "south korea": "kr",
  equador: "ec",
  ecuador: "ec",
  catar: "qa",
  qatar: "qa",
  polonia: "pl",
  poland: "pl",
  "arabia saudita": "sa",
  "saudi arabia": "sa",
  tunisia: "tn",
  australia: "au",
  dinamarca: "dk",
  denmark: "dk",
  "costa rica": "cr",
  ira: "ir",
  iran: "ir",
  gales: "gb-wls",
  wales: "gb-wls",
  servia: "rs",
  serbia: "rs",
  escocia: "gb-sct",
  scotland: "gb-sct",
  uruguai: "uy",
  uruguay: "uy",
  bolivia: "bo",
  chile: "cl",
  colombia: "co",
  paraguai: "py",
  paraguay: "py",
  venezuela: "ve",
  peru: "pe",
  china: "cn",
  suecia: "se",
  sweden: "se",
  noruega: "no",
  norway: "no",
  austria: "at",
  ucrania: "ua",
  ukraine: "ua",
  turquia: "tr",
  turkey: "tr",
  egito: "eg",
  egypt: "eg",
  nigeria: "ng",
  "sul-africano": "za",
  "south africa": "za",
}

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
}

interface TeamFlagProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  teamName: string
  fallbackSize?: string
}

export function TeamFlag({
  teamName,
  fallbackSize = "text-[10px]",
  className,
  ...props
}: TeamFlagProps) {
  const normalized = normalizeName(teamName)
  const code = flagMapping[normalized]

  if (code) {
    return (
      <div
        className={cn(
          "relative flex flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-slate-900 shadow-inner",
          className
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://flagcdn.com/w80/${code}.png`}
          alt={`Bandeira de ${teamName}`}
          className="h-full w-full rounded-full object-cover"
          loading="lazy"
          onError={(e) => {
            // Se falhar, substitui por um placeholder bonito
            const target = e.target as HTMLImageElement
            target.style.display = "none"
            const parent = target.parentElement
            if (parent) {
              const span = document.createElement("span")
              span.className = cn("font-black text-white", fallbackSize)
              span.innerText = teamName.substring(0, 2).toUpperCase()
              parent.appendChild(span)
            }
          }}
          {...props}
        />
      </div>
    )
  }

  // Fallback se não encontrar mapeamento
  return (
    <div
      className={cn(
        "flex-shrink-0 rounded-full border border-nina-wine/50 bg-gradient-to-br from-nina-wine/40 to-nina-red/30",
        "flex items-center justify-center font-black text-slate-200 shadow-md select-none",
        className
      )}
    >
      <span className={fallbackSize}>
        {teamName.substring(0, 2).toUpperCase()}
      </span>
    </div>
  )
}
