import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { studyRequest, type StudyMe } from "../api";
import { ErrorNotice } from "./Feedback";
export function Login({
  onClose,
  onSuccess,
  restoreFocus,
}: {
  onClose: () => void;
  onSuccess: (me: StudyMe) => void;
  restoreFocus: HTMLElement | null;
}) {
  const [token, setToken] = useState(""),
    [invitation, setInvitation] = useState(false),
    [invitationMode, setInvitationMode] = useState<
      "checking" | "available" | "unavailable" | "unknown"
    >("checking"),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    void studyRequest<{ capabilities?: { invitationCodes?: boolean } }>(
      "/health",
    )
      .then((health) => {
        if (active)
          setInvitationMode(
            health.capabilities?.invitationCodes === true
              ? "available"
              : health.capabilities?.invitationCodes === false
                ? "unavailable"
                : "unknown",
          );
      })
      .catch(() => {
        if (active) setInvitationMode("unknown");
      });
    return () => {
      active = false;
    };
  }, []);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      onSuccess(
        await studyRequest<StudyMe>(
          invitation && invitationMode === "available"
            ? "/invitations/accept"
            : "/session",
          { token },
        ),
      );
    } catch {
      setError(
        "Il codice non è valido, è scaduto o è già stato usato. Controllalo e riprova.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content
          className="login-dialog"
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            restoreFocus?.focus();
          }}
        >
          <Dialog.Close className="dialog-close" aria-label="Chiudi accesso">
            ×
          </Dialog.Close>
          <span className="wordmark">ardesia.</span>
          <Dialog.Title asChild>
            <h2>Ritrova il tuo spazio.</h2>
          </Dialog.Title>
          <Dialog.Description>
            Accedi con il codice personale del tuo account di prova. Sono
            disponibili soltanto account sintetici.
          </Dialog.Description>
          <form onSubmit={(e) => void submit(e)}>
            <label>
              {invitation ? "Invito monouso" : "Codice di accesso sintetico"}
              <input
                autoFocus
                type="password"
                autoComplete="off"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
            </label>
            {invitationMode === "available" && (
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={invitation}
                  onChange={(e) => setInvitation(e.target.checked)}
                />
                Sto usando un invito monouso
              </label>
            )}
            {invitationMode === "checking" && (
              <p className="fine-print" role="status">
                Verifica delle modalità di accesso…
              </p>
            )}
            {invitationMode === "unavailable" && (
              <p className="fine-print">
                Gli inviti monouso non sono attivi in questo ambiente. Usa il
                codice del tuo account di prova.
              </p>
            )}
            {invitationMode === "unknown" && (
              <p className="fine-print">
                Le modalità di invito non sono verificate. Puoi usare il codice
                del tuo account di prova.
              </p>
            )}
            <button className="button-primary" disabled={busy}>
              {busy ? "Accesso in corso…" : "Accedi"}
            </button>
            {error && <ErrorNotice message={error} />}
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
