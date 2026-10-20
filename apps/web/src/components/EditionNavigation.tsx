export type EditionPagination = {
  page: number;
  hasNext: boolean;
  hasPrevious: boolean;
  loading: boolean;
  next: () => void;
  previous: () => void;
};

export function EditionNavigation({
  pagination,
}: {
  pagination: EditionPagination;
}) {
  if (!pagination.hasNext && !pagination.hasPrevious) return null;
  return (
    <nav className="edition-pagination" aria-label="Pagine delle edizioni">
      <p>Edizioni · pagina {pagination.page}</p>
      <div>
        <button
          disabled={pagination.loading || !pagination.hasPrevious}
          onClick={pagination.previous}
        >
          Precedenti
        </button>
        <button
          disabled={pagination.loading || !pagination.hasNext}
          onClick={pagination.next}
        >
          Successive
        </button>
      </div>
    </nav>
  );
}
