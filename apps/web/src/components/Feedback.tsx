import type { ReactNode } from "react";
export function ErrorNotice({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="error-notice" role="alert">
      <p>{message}</p>
      {onRetry && <button onClick={onRetry}>Riprova</button>}
    </div>
  );
}
export function Loading({
  children = "Sto aprendo il tuo spazio…",
}: {
  children?: ReactNode;
}) {
  return (
    <p className="loading-state" role="status">
      <span aria-hidden="true" />
      {children}
    </p>
  );
}
export function EmptyState({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="empty-state">
      <h2>{title}</h2>
      <p>{children}</p>
    </section>
  );
}
