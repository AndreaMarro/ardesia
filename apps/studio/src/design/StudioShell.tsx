import type { ReactNode } from "react"
import ViewNav, { type ArdesiaViewId } from "./ViewNav"

export type StudioShellProps = {
  current: ArdesiaViewId
  searchLabel: string
  launcher?: ReactNode
  actions?: ReactNode
  children: ReactNode
}

export default function StudioShell(props: StudioShellProps) {
  return (
    <div className="st-studio-shell" data-studio-shell data-current-view={props.current}>
      <header className="st-shell-topbar">
        <div className="st-brand" title="Ardesia Studio — la lavagna che ricorda">
          <span className="st-word">Ardesia</span>
          <span className="st-bdot" aria-hidden />
          <span className="st-sub">studio</span>
        </div>
        <div className="st-shell-search">
          <span>{props.searchLabel}</span>
          {props.launcher}
        </div>
        <div className="st-shell-actions">{props.actions}</div>
      </header>
      <ViewNav current={props.current} />
      <main className="st-shell-stage">{props.children}</main>
    </div>
  )
}
