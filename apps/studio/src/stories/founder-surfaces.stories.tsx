// Baseline visuale delle superfici Founder ratificate.
//
// Cosa E': un produttore deterministico di stati per la regressione visuale.
// Nessuna rete, nessun IndexedDB, nessuna fixture di dominio: solo props.
//
// Cosa NON E': una prova che una superficie funzioni. Uno stato prodotto da
// props invece che dal log reale non dimostra il comportamento del prodotto —
// dimostra soltanto che il disegno non e' cambiato senza che nessuno lo sapesse.

import type { Meta, StoryObj } from "@storybook/react-vite"

import ViewNav from "../design/ViewNav"
import EmptyState from "../design/EmptyState"

const meta: Meta = {
  title: "Founder/Baseline visuale",
}

export default meta

type Story = StoryObj

// --- Nav: l'invariante "esattamente tre superfici" -------------------------
// Le tavole UI/UX allegate mostrano tutte una nav a cinque voci (conflitto C-05
// del contratto di provenienza). D-SUPERFICI dice tre. Questo snapshot rende la
// violazione VISIBILE come diff: se qualcuno aggiunge Studenti o Marketplace
// alla nav, la baseline cambia e qualcuno deve rispondere del perche'.

export const NavLezione: Story = {
  render: () => <ViewNav current="lezione" />,
}

export const NavContinuita: Story = {
  render: () => <ViewNav current="continuita" />,
}

export const NavMateriali: Story = {
  render: () => <ViewNav current="materiali" />,
}

// --- Stati vuoti e di errore ----------------------------------------------
// I mockup mostrano sempre schermate piene. Questi sono gli stati che il
// prodotto raggiunge davvero e che nessuna tavola documenta.

export const StatoVuoto: Story = {
  render: () => (
    <EmptyState
      title="Nessuna lezione salvata"
      detail="Le lezioni compaiono qui dopo la chiusura, con le loro evidenze."
      hint="Chiudi una lezione dalla vista Continuità per vederla comparire."
    />
  ),
}

export const StatoErrore: Story = {
  render: () => (
    <EmptyState
      tone="error"
      title="Lezioni salvate non disponibili"
      detail="Impossibile raggiungere il servizio delle lezioni salvate."
      hint="Il lavoro locale resta al sicuro: riprova quando torni in rete."
    />
  ),
}

export const StatoVuotoCompatto: Story = {
  render: () => (
    <EmptyState
      compact
      title="Nessun materiale"
      detail="Questa lezione non ha ancora prodotto materiali."
    />
  ),
}
