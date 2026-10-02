import { Button } from "@/components/ui/button";

type AdminPaginationProps = {
  count: number;
  hasNext: boolean;
  hasPrevious: boolean;
  onPageChange: (page: number) => void;
  page: number;
};

export function AdminPagination({
  count,
  hasNext,
  hasPrevious,
  onPageChange,
  page,
}: AdminPaginationProps) {
  if (!hasNext && !hasPrevious) return null;

  return (
    <nav
      aria-label="Collection pagination"
      className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-reality-border-secondary bg-white p-3"
    >
      <p aria-live="polite" className="text-sm text-reality-text-secondary">
        Page {page} · {count.toLocaleString()} total records
      </p>
      <div className="flex gap-2">
        <Button
          aria-label="Go to previous page"
          disabled={!hasPrevious}
          onClick={() => onPageChange(page - 1)}
          variant="realitySecondary"
        >
          Previous
        </Button>
        <Button
          aria-label="Go to next page"
          disabled={!hasNext}
          onClick={() => onPageChange(page + 1)}
          variant="realitySecondary"
        >
          Next
        </Button>
      </div>
    </nav>
  );
}
