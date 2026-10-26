import { Component, type ReactNode } from "react";

export class CalendarBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    return this.state.failed ? <p role="alert">Il calendario non è disponibile. Agenda e registri restano consultabili. <button type="button" onClick={() => window.location.reload()}>Ricarica pagina</button></p> : this.props.children;
  }
}
