import { useEffect, useState } from "react";
import { studyRequest } from "./apiClient";
type Invitation = {
  id: string;
  actor_id: string;
  state: string;
  expires_at: number;
};
type Access = {
  members: string[];
  waitlist?: string[];
  invitations: Invitation[];
  capabilities?: { invitationCodes?: boolean };
};
export function AccessPanel() {
  const [data, setData] = useState<Access | null>(null);
  const [actor, setActor] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  async function refresh() {
    setLoading(true);
    setError("");
    try {
      const value = await studyRequest<Access>("/editions/fluidi/access");
      setData(value);
      setActor((previous) =>
        value.members.includes(previous) ? previous : (value.members[0] ?? ""),
      );
    } catch {
      setError("Accessi non disponibili. Puoi riprovare.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void refresh();
  }, []);
  async function create() {
    if (busy || data?.capabilities?.invitationCodes !== true) return;
    setBusy(true);
    setError("");
    setToken("");
    try {
      const value = await studyRequest<{ token: string }>(
        "/editions/fluidi/invitations",
        { actorId: actor },
      );
      setToken(value.token);
      await refresh();
    } catch {
      setError("Invito non creato. Puoi riprovare.");
    } finally {
      setBusy(false);
    }
  }
  async function revoke(id: string) {
    if (busy || data?.capabilities?.invitationCodes !== true) return;
    setBusy(true);
    setError("");
    setToken("");
    try {
      await studyRequest(`/invitations/${id}`, undefined, { method: "DELETE" });
      await refresh();
    } catch {
      setError("Revoca non riuscita. Puoi riprovare.");
    } finally {
      setBusy(false);
    }
  }
  const invitationsAvailable = data?.capabilities?.invitationCodes === true;
  return (
    <section className="study-lab">
      <h2>Persone e accessi</h2>
      <p>Iscrizioni confermate e lista d’attesa dell’edizione corrente.</p>
      {loading && <p role="status">Apertura degli accessi…</p>}
      {error && (
        <div role="alert">
          <p>{error}</p>
          <button disabled={loading || busy} onClick={() => void refresh()}>
            Riprova
          </button>
        </div>
      )}
      {data && (
        <>
          <h3>Iscritti confermati · {data.members.length}</h3>
          {data.members.length ? (
            <table aria-label="Iscritti confermati">
              <thead>
                <tr>
                  <th scope="col">Account</th>
                  <th scope="col">Partecipazione</th>
                </tr>
              </thead>
              <tbody>
                {data.members.map((id) => (
                  <tr key={id}>
                    <td>{id}</td>
                    <td>Confermata</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Nessun iscritto confermato.</p>
          )}
          <h3>
            Lista d’attesa{data.waitlist ? ` · ${data.waitlist.length}` : ""}
          </h3>
          {data.waitlist ? (
            data.waitlist.length ? (
              <table aria-label="Lista d’attesa">
                <thead>
                  <tr>
                    <th scope="col">Account</th>
                    <th scope="col">Partecipazione</th>
                  </tr>
                </thead>
                <tbody>
                  {data.waitlist.map((id) => (
                    <tr key={id}>
                      <td>{id}</td>
                      <td>In attesa</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>Nessuna persona in lista d’attesa.</p>
            )
          ) : (
            <p>La lista d’attesa non è disponibile in questa connessione.</p>
          )}
          {invitationsAvailable ? (
            <>
              <h3>Inviti monouso sintetici</h3>
              <p>
                Scadenza 15 minuti; ogni invito apre una sola sessione di
                un’ora. Il codice compare soltanto dopo la creazione. Nessun
                invio automatico a persone reali.
              </p>
              <label>
                Studente da invitare
                <select
                  disabled={busy}
                  value={actor}
                  onChange={(event) => {
                    setActor(event.target.value);
                    setToken("");
                  }}
                >
                  {data.members.map((id) => (
                    <option key={id}>{id}</option>
                  ))}
                </select>
              </label>
              <button disabled={!actor || busy} onClick={() => void create()}>
                {busy ? "Operazione in corso…" : "Crea invito monouso"}
              </button>
              {token && (
                <label>
                  Codice invito appena creato
                  <input
                    aria-label="Codice invito appena creato"
                    readOnly
                    type="password"
                    value={token}
                    onFocus={(event) => event.target.select()}
                  />
                </label>
              )}
              <p>
                Per provarlo, scegli un invito monouso nell’accesso di un
                browser pulito. Il codice non va aggiunto a link o screenshot.
              </p>
              <ul>
                {data.invitations.map((invite) => (
                  <li key={invite.id}>
                    {invite.actor_id} · {invite.state} · scade{" "}
                    {new Date(invite.expires_at * 1000).toLocaleString("it-IT")}
                    {invite.state === "pending" && (
                      <button
                        disabled={busy}
                        onClick={() => void revoke(invite.id)}
                      >
                        Revoca invito {invite.id.slice(0, 6)}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p>
              {data.capabilities?.invitationCodes === false
                ? "Gli inviti monouso non sono attivi in questo ambiente. Gli account di prova usano l’accesso già predisposto."
                : "Le modalità di invito non sono verificate per questa connessione."}
            </p>
          )}
        </>
      )}
    </section>
  );
}
