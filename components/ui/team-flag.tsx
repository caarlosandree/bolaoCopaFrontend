"use client"

import React from "react"
import { cn } from "@/lib/utils"

const flagMapping: Record<string, string> = {
  // Américas do Sul (CONMEBOL)
  brasil: "br",
  brazil: "br",
  argentina: "ar",
  uruguai: "uy",
  uruguay: "uy",
  colombia: "co",
  equador: "ec",
  ecuador: "ec",
  venezuela: "ve",
  paraguai: "py",
  paraguay: "py",
  bolivia: "bo",
  chile: "cl",
  peru: "pe",

  // América do Norte e Central (CONCACAF)
  eua: "us",
  "estados unidos": "us",
  usa: "us",
  "united states": "us",
  canada: "ca",
  mexico: "mx",
  panama: "pa",
  jamaica: "jm",
  honduras: "hn",
  "el salvador": "sv",
  guatemala: "gt",
  cuba: "cu",
  "trinidad e tobago": "tt",
  "trinidad and tobago": "tt",
  "costa rica": "cr",

  // Europa (UEFA)
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
  servia: "rs",
  serbia: "rs",
  suica: "ch",
  switzerland: "ch",
  escocia: "gb-sct",
  scotland: "gb-sct",
  gales: "gb-wls",
  wales: "gb-wls",
  polonia: "pl",
  poland: "pl",
  austria: "at",
  ucrania: "ua",
  ukraine: "ua",
  turquia: "tr",
  turkey: "tr",
  suecia: "se",
  sweden: "se",
  noruega: "no",
  norway: "no",
  dinamarca: "dk",
  denmark: "dk",
  hungria: "hu",
  hungary: "hu",
  "republica tcheca": "cz",
  tchecia: "cz",
  czechia: "cz",
  "czech republic": "cz",
  eslovaquia: "sk",
  slovakia: "sk",
  romenia: "ro",
  romania: "ro",
  albania: "al",
  eslovenia: "si",
  slovenia: "si",
  georgia: "ge",
  grecia: "gr",
  greece: "gr",
  islandia: "is",
  iceland: "is",
  finlandia: "fi",
  finland: "fi",
  "bosnia e herzegovina": "ba",
  "bosnia and herzegovina": "ba",
  bosnia: "ba",
  montenegro: "me",
  "macedonia do norte": "mk",
  "north macedonia": "mk",
  luxemburgo: "lu",
  luxembourg: "lu",
  irlanda: "ie",
  ireland: "ie",
  kosovo: "xk",
  bulgária: "bg",
  bulgaria: "bg",

  // Ásia (AFC)
  japao: "jp",
  japan: "jp",
  "coreia do sul": "kr",
  "south korea": "kr",
  ira: "ir",
  iran: "ir",
  "arabia saudita": "sa",
  "saudi arabia": "sa",
  australia: "au",
  catar: "qa",
  qatar: "qa",
  iraque: "iq",
  iraq: "iq",
  jordania: "jo",
  jordan: "jo",
  uzbequistao: "uz",
  uzbekistan: "uz",
  barem: "bh",
  bahrein: "bh",
  bahrain: "bh",
  indonesia: "id",
  oma: "om",
  oman: "om",
  china: "cn",
  coreia: "kp",
  "north korea": "kp",

  // África (CAF)
  marrocos: "ma",
  morocco: "ma",
  senegal: "sn",
  nigeria: "ng",
  gana: "gh",
  ghana: "gh",
  camaroes: "cm",
  cameroon: "cm",
  egito: "eg",
  egypt: "eg",
  tunisia: "tn",
  "africa do sul": "za",
  "sul-africano": "za",
  "south africa": "za",
  "costa do marfim": "ci",
  "ivory coast": "ci",
  "cote divoire": "ci",
  mali: "ml",
  argelia: "dz",
  algeria: "dz",
  tanzania: "tz",
  "republica democratica do congo": "cd",
  "dr congo": "cd",
  "congo dr": "cd",
  "democratic republic of the congo": "cd",
  congo: "cg",
  "cabo verde": "cv",
  "cape verde": "cv",
  comores: "km",
  comoros: "km",
  mozambique: "mz",
  mocambique: "mz",
  zambia: "zm",

  // Oceania (OFC)
  "nova zelandia": "nz",
  "new zealand": "nz",
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
