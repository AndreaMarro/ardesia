// Adapter di consegna email per i token di accesso Ardesia.
//
// Il provider email REALE è gate-Andrea (nessuna email vera senza decisione
// esplicita e isolamento). Il core consegna il token SOLO attraverso questa
// interfaccia: il chiamante di produzione riceverà un adapter vero, i test e
// lo sviluppo locale usano LocalMailSink.
//
// Regola: il token in chiaro non deve MAI finire in log, console o store.
// L'adapter è l'unico confine autorizzato a vederlo insieme al destinatario.

export interface EmailTokenDelivery {
  to: string
  token: string
}

export interface EmailAdapter {
  deliverToken(delivery: EmailTokenDelivery): Promise<void>
}

/**
 * Mail-sink locale per test/sviluppo: cattura le consegne in memoria.
 * Non logga, non persiste, non inoltra.
 */
export class LocalMailSink implements EmailAdapter {
  readonly deliveries: EmailTokenDelivery[] = []

  async deliverToken(delivery: EmailTokenDelivery): Promise<void> {
    this.deliveries.push({ ...delivery })
  }
}
