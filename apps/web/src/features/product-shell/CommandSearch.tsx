import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useRef, useState } from "react";
import type { Edition } from "../../api";
import { matches, type Destination, type View } from "./navigation";

export function CommandSearch({ items, editions, onView, onEdition, loading = false }: {
  items: Destination[]; editions: Edition[]; onView: (view: View) => void;
  onEdition?: (id: string) => void; loading?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const trigger = useRef<HTMLButtonElement>(null), input = useRef<HTMLInputElement>(null), list = useRef<HTMLDivElement>(null);
  const navigated = useRef(false);
  const composing = useRef(false), suppressSubmit = useRef(false);
  function changeOpen(value: boolean) {
    if (value) { setQuery(""); navigated.current = false; composing.current = false; suppressSubmit.current = false; }
    setOpen(value);
  }
  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && !event.altKey && !event.isComposing && !event.repeat && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(value => {
          if (!value) { setQuery(""); navigated.current = false; composing.current = false; suppressSubmit.current = false; }
          return !value;
        });
      }
    };
    document.addEventListener("keydown", shortcut);
    return () => document.removeEventListener("keydown", shortcut);
  }, []);
  const pages = items.filter(item => matches(query, `${item.label} ${item.description} ${item.keywords}`));
  const courses = onEdition ? editions.filter(edition => matches(query, `${edition.title ?? "Edizione"} ${edition.id}`)) : [];
  function go(action: () => void) { navigated.current = true; setOpen(false); action(); }
  return <Dialog.Root open={open} onOpenChange={changeOpen}>
    <Dialog.Trigger asChild><button ref={trigger} className="ps-search-trigger" aria-label="Cerca nello spazio · Ctrl o ⌘ K">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></svg>
      <span>Cerca nello spazio</span><kbd aria-hidden="true">⌘ / Ctrl K</kbd>
    </button></Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Overlay className="ps-command-overlay" />
      <Dialog.Content className="ps-command" onOpenAutoFocus={event => { event.preventDefault(); input.current?.focus(); }} onCloseAutoFocus={event => {
        event.preventDefault();
        if (navigated.current) document.getElementById("content")?.focus({ preventScroll: true });
        else trigger.current?.focus({ preventScroll: true });
      }}>
        <div className="ps-command-heading"><Dialog.Title>Dove vuoi andare?</Dialog.Title><Dialog.Close aria-label="Chiudi ricerca">×</Dialog.Close></div>
        <Dialog.Description>Cerca una sezione o un’edizione di questa pagina. Le autorizzazioni restano quelle del tuo account.</Dialog.Description>
        <form role="search" onSubmit={event => {
          event.preventDefault();
          if (composing.current || suppressSubmit.current) return;
          list.current?.querySelector<HTMLButtonElement>("button:not(:disabled)")?.click();
        }}>
          <label className="ps-search-label">Cerca una destinazione<input ref={input} type="search" value={query} autoComplete="off" maxLength={160} onChange={event => setQuery(event.target.value)} onCompositionStart={() => {composing.current = true;}} onCompositionEnd={() => {composing.current = false;}} onKeyDown={event => {
            if (composing.current || event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229) {
              // Some browsers end composition before the resulting submit event.
              if (event.key === "Enter" || event.nativeEvent.keyCode === 229) suppressSubmit.current = true;
              return;
            }
            suppressSubmit.current = false;
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              const buttons = list.current?.querySelectorAll<HTMLButtonElement>("button:not(:disabled)");
              if (buttons?.length) { event.preventDefault(); buttons[event.key === "ArrowDown" ? 0 : buttons.length - 1].focus(); }
            }
          }} /></label>
        </form>
        <div className="ps-command-results" ref={list} onKeyDown={event => {
          if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
          const buttons = Array.from(list.current?.querySelectorAll<HTMLButtonElement>("button:not(:disabled)") ?? []);
          const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
          if (index < 0) return;
          event.preventDefault();
          if (event.key === "ArrowUp" && index === 0) { input.current?.focus(); return; }
          const next = event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1 : (index + (event.key === "ArrowDown" ? 1 : -1) + buttons.length) % buttons.length;
          buttons[next]?.focus();
        }}>
          {pages.length > 0 && <section aria-label="Sezioni"><h3>Nel tuo spazio</h3><ul>{pages.map(item => <li key={item.id}><button onClick={() => go(() => onView(item.id))}><span><strong>{item.label}</strong><small>{item.description}</small></span><span aria-hidden="true">↗</span></button></li>)}</ul></section>}
          {courses.length > 0 && <section aria-label="Edizioni"><h3>Edizioni · questa pagina</h3><ul>{courses.map(edition => <li key={edition.id}><button disabled={loading} onClick={() => go(() => onEdition?.(edition.id))}><span><strong>{edition.title ?? "Edizione"}</strong><small>{edition.id}</small></span><span aria-hidden="true">↗</span></button></li>)}</ul></section>}
          {pages.length === 0 && courses.length === 0 && <div className="ps-command-empty"><p role="status">Nessuna destinazione per “{query}”.</p><button onClick={() => { setQuery(""); input.current?.focus(); }}>Mostra tutte le destinazioni</button></div>}
        </div>
        <p className="ps-command-help">↑ ↓ per spostarti · Invio per aprire · Esc per chiudere</p>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}
