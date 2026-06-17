/* DESIGN-MAESTRO-v1 §3.B — 10 icone SVG inline (Lucide, ISC).
   viewBox=24, stroke=currentColor strokeWidth=1.75, render=14px.
   REGOLA: icona SEMPRE con etichetta (mai icona-senza-parola).
   Set cappato a 10 — ogni aggiunta passa review. */
import type { SVGProps } from "react"

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

function base(path: string, props: IconProps = {}) {
  const s = props.size ?? 14
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={s} height={s} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth={1.75}
      strokeLinecap="round" strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      {props.children ?? <path d={path} />}
    </svg>
  )
}

/* Link — link esterno, copia link */
export function IconLink(props: IconProps) {
  return base("M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71", props)
}

/* Sigma — formula */
export function IconFunction(props: IconProps) {
  return base(
    "M4 4h16v4M4 20h16v-4M8 4l8 16",
    props,
  )
}

/* Image — media/carica */
export function IconImage(props: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth={1.75}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-5-5L5 21" />
    </svg>
  )
}

/* Mic — audio */
export function IconMic(props: IconProps) {
  return base("M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z M19 10v2a7 7 0 0 1-14 0v-2M12 19v3", props)
}

/* MicOff — audio muto */
export function IconMicOff(props: IconProps) {
  return base("M2 2l20 20M12 19v3M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V5a3 3 0 0 0-5.94-.6M19 10v2a7 7 0 0 1-4.5 6.48", props)
}

/* Dot — rec indicator (riempito) */
export function IconDot(props: IconProps) {
  const s = props.size ?? 14
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={s} height={s} viewBox="0 0 24 24"
      fill="currentColor" stroke="none" aria-hidden {...props}
    >
      <circle cx="12" cy="12" r="6" />
    </svg>
  )
}

/* Download — export .lesson */
export function IconDownload(props: IconProps) {
  return base("M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3", props)
}

/* ArrowUpRight — link esterno/Meet */
export function IconArrowUpRight(props: IconProps) {
  return base("M7 7h10v10M17 7L7 17", props)
}

/* Check — copiato/verde verificato */
export function IconCheck(props: IconProps) {
  return base("M20 6L9 17l-5-5", props)
}

/* Alert (triangolo) — errori/warning */
export function IconAlert(props: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth={1.75}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}
