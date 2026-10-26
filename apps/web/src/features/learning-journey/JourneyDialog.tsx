import * as Dialog from "@radix-ui/react-dialog";
import { createContext, useContext, useEffect, useRef, type ReactNode } from "react";

export const JourneyDialogActivity = createContext<(open: boolean) => void>(() => {});

/** Existing Radix Dialog owns focus trapping, inert background and restoration. */
export function JourneyDialog({ label, title, description, children, onOpen, disabled = false }: {
  label: string; title: string; description: string; children: ReactNode; onOpen?: () => void; disabled?: boolean;
}) {
  const report = useContext(JourneyDialogActivity), opened = useRef(false);
  useEffect(() => () => { if (opened.current) report(false); }, [report]);
  return <Dialog.Root onOpenChange={open => {
    if (opened.current !== open) { opened.current = open; report(open); }
    if (open) onOpen?.();
  }}>
    <Dialog.Trigger asChild><button type="button" disabled={disabled} className="lj-secondary">{label}</button></Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Overlay className="lj-overlay" />
      <Dialog.Content className="lj-dialog lj-root" onEscapeKeyDown={event => event.stopPropagation()}>
        <div className="lj-dialog-heading"><Dialog.Title>{title}</Dialog.Title><Dialog.Close className="lj-secondary">Chiudi</Dialog.Close></div>
        <Dialog.Description>{description}</Dialog.Description>
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}
