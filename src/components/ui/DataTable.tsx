import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface Column<T> {
  key: string;
  header: ReactNode;
  /** Cell renderer for the desktop table and mobile card value. */
  cell: (row: T) => ReactNode;
  /** When present the header becomes a sortable toggle. */
  sortValue?: (row: T) => string | number;
  /** Hide this column's value inside the mobile card (e.g. duplicated title). */
  hideOnMobile?: boolean;
  className?: string;
  headerClassName?: string;
  /** Text alignment for the column. */
  align?: 'left' | 'right' | 'center';
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  /** Stable key extractor for each row. */
  rowKey: (row: T) => string;
  /** Makes the whole row clickable (opens detail views). */
  onRowClick?: (row: T) => void;
  /** Optional React node rendered when there are zero rows. */
  emptyState?: ReactNode;
  className?: string;
  /** Default sort column key + direction applied on first render. */
  initialSort?: { key: string; dir: 'asc' | 'desc' };
  /**
   * Rows per page for longer lists. Pagination appears automatically once the
   * row count exceeds this value. Pass 0 to disable paging entirely.
   */
  pageSize?: number;
}

const alignClass = {
  left: 'text-left',
  right: 'text-right',
  center: 'text-center',
} as const;

/**
 * Reusable responsive data grid: a real table on >= md screens, and a stacked
 * card list on smaller viewports. Includes optional client-side sorting driven
 * by any column that exposes a `sortValue` accessor.
 */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  emptyState,
  className,
  initialSort,
  pageSize = 10,
}: DataTableProps<T>) {
  const sortableColumns = columns.some((column) => column.sortValue);
  const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(
    initialSort ?? null,
  );
  const [page, setPage] = useState(1);

  const sortedRows = useMemo(() => {
    if (!sort) return rows;
    const column = columns.find((item) => item.key === sort.key);
    if (!column?.sortValue) return rows;
    const factor = sort.dir === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      const left = column.sortValue!(a);
      const right = column.sortValue!(b);
      if (typeof left === 'number' && typeof right === 'number') return (left - right) * factor;
      return String(left).localeCompare(String(right)) * factor;
    });
  }, [rows, sort, columns]);

  const toggleSort = (key: string) => {
    setPage(1);
    setSort((current) => {
      if (current?.key !== key) return { key, dir: 'asc' };
      if (current.dir === 'asc') return { key, dir: 'desc' };
      return null;
    });
  };

  const pagingEnabled = pageSize > 0 && sortedRows.length > pageSize;
  const pageCount = pagingEnabled ? Math.ceil(sortedRows.length / pageSize) : 1;
  // Keep the page valid when filters shrink the result set.
  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);
  const safePage = Math.min(page, pageCount);
  const visibleRows = pagingEnabled
    ? sortedRows.slice((safePage - 1) * pageSize, safePage * pageSize)
    : sortedRows;

  if (rows.length === 0 && emptyState) {
    return <div className={cn('rounded-card border border-line bg-surface', className)}>{emptyState}</div>;
  }

  return (
    <div className={cn('overflow-hidden rounded-card border border-line bg-surface', className)}>
      {/* Desktop / tablet table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-line bg-surface-muted/60 text-left">
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={cn(
                    'px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-muted',
                    alignClass[column.align ?? 'left'],
                    column.headerClassName,
                  )}
                >
                  {column.sortValue && sortableColumns ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(column.key)}
                      className={cn(
                        'inline-flex items-center gap-1.5 hover:text-ink',
                        column.align === 'right' && 'flex-row-reverse',
                      )}
                    >
                      {column.header}
                      <ArrowUpDown
                        className={cn(
                          'h-3.5 w-3.5',
                          sort?.key === column.key ? 'text-primary' : 'text-ink-subtle',
                        )}
                        aria-hidden="true"
                      />
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                onKeyDown={
                  onRowClick
                    ? (event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          onRowClick(row);
                        }
                      }
                    : undefined
                }
                className={cn(
                  'border-b border-line last:border-0 transition',
                  onRowClick && 'cursor-pointer hover:bg-primary-light/40 focus:outline-none focus-visible:bg-primary-light/40',
                )}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn('px-4 py-3 align-middle text-ink', alignClass[column.align ?? 'left'], column.className)}
                  >
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile stacked cards */}
      <ul className="divide-y divide-line md:hidden">
        {visibleRows.map((row) => (
          <li
            key={rowKey(row)}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            className={cn('space-y-1.5 p-4', onRowClick && 'cursor-pointer active:bg-primary-light/40')}
          >
            {columns
              .filter((column) => !column.hideOnMobile)
              .map((column, index) => (
                <div
                  key={column.key}
                  className={cn(
                    'flex items-center justify-between gap-3',
                    index === 0 && 'items-start',
                  )}
                >
                  <span className="text-xs font-medium uppercase tracking-wide text-ink-subtle">
                    {column.header}
                  </span>
                  <span className="text-right text-sm text-ink">{column.cell(row)}</span>
                </div>
              ))}
          </li>
        ))}
      </ul>

      {/* Pagination footer */}
      {pagingEnabled && (
        <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-3">
          <p className="text-xs text-ink-muted">
            Showing {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, sortedRows.length)} of{' '}
            {sortedRows.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={safePage <= 1}
              aria-label="Previous page"
              className="inline-flex h-8 w-8 items-center justify-center rounded-field border border-line text-ink-muted transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <span className="text-xs tabular-nums text-ink-muted">
              Page {safePage} / {pageCount}
            </span>
            <button
              type="button"
              onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
              disabled={safePage >= pageCount}
              aria-label="Next page"
              className="inline-flex h-8 w-8 items-center justify-center rounded-field border border-line text-ink-muted transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
