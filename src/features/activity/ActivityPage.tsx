import { useEffect, useMemo, useState } from 'react';
import { History, RotateCcw } from 'lucide-react';
import { PageContainer } from '@/components/common/PageContainer';
import { LoadingState, ErrorState } from '@/components/common';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/lib/cn';
import { formatDateTime, formatRelativeTime } from '@/lib/format';
import { ACTIVITY_META, type ActivityType } from '@/features/workspace';
import { useServices } from '@/services/ServiceProvider';
import { useServiceQuery } from '@/hooks/useServiceQuery';

const TYPE_OPTIONS = (Object.keys(ACTIVITY_META) as ActivityType[]).map((type) => ({
  value: type,
  label: ACTIVITY_META[type].label,
}));

/** Entries rendered per expansion step. */
const PAGE_SIZE = 20;

export function ActivityPage() {
  const services = useServices();
  const { data, loading, error, refetch } = useServiceQuery(
    () => services.activity.listActivities(),
    [services],
  );
  const activities = useMemo(() => data ?? [], [data]);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return activities.filter((entry) => {
      if (typeFilter && entry.type !== typeFilter) return false;
      if (q && !`${entry.description} ${entry.relatedId ?? ''}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [activities, query, typeFilter]);

  // Long histories are truncated with an explicit "show more" affordance.
  const visibleRows = rows.slice(0, visibleCount);
  const hasMore = rows.length > visibleRows.length;

  // Restart the truncation whenever the filters change.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [query, typeFilter]);

  const hasFilters = Boolean(query || typeFilter);

  return (
    <PageContainer
      eyebrow="Audit"
      title="Activity History"
      description="A chronological record of the actions taken in this prototype session."
    >
      <div className="space-y-4">
        <Card className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchInput
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onClear={() => setQuery('')}
              placeholder="Search activity or reference ID…"
              aria-label="Search activity"
              className="sm:max-w-xs"
            />
            <Select
              value={typeFilter}
              placeholder="All activity types"
              options={TYPE_OPTIONS}
              onChange={(e) => setTypeFilter(e.target.value)}
              aria-label="Filter by activity type"
              className="sm:max-w-[14rem]"
            />
            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setQuery('');
                  setTypeFilter('');
                }}
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Clear
              </Button>
            )}
          </div>
        </Card>

        {loading ? (
          <LoadingState label="Loading activity history…" />
        ) : error ? (
          <ErrorState message={error.message} onRetry={refetch} />
        ) : (
        <Card className="p-0">
          {rows.length === 0 ? (
            <EmptyState
              icon={History}
              title="No activity recorded"
              description="Actions you take in the workspace — adding equipment, submitting or approving requests, updating transfers — appear here."
            />
          ) : (
            <ol className="divide-y divide-line">
              {visibleRows.map((entry) => {
                const meta = ACTIVITY_META[entry.type];
                const Icon = meta.icon;
                return (
                  <li key={entry.id} className="flex items-start gap-4 p-4 sm:p-5">
                    <span
                      className={cn(
                        'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-field bg-surface-muted',
                        meta.tone,
                      )}
                    >
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-ink">{meta.label}</p>
                        {entry.status && <StatusBadge status={entry.status} />}
                      </div>
                      <p className="mt-0.5 text-sm text-ink-muted">{entry.description}</p>
                      <p className="mt-1 text-xs text-ink-subtle">
                        {entry.id}
                        {entry.relatedId ? ` · Ref ${entry.relatedId}` : ''} · {formatDateTime(entry.at)}
                      </p>
                    </div>
                    <span className="hidden shrink-0 text-xs text-ink-subtle sm:block">
                      {formatRelativeTime(entry.at)}
                    </span>
                  </li>
                );
              })}
            </ol>
          )}
          {rows.length > 0 && (
            <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-3">
              <p className="text-xs text-ink-muted">
                Showing {visibleRows.length} of {rows.length} entr{rows.length === 1 ? 'y' : 'ies'}
              </p>
              {hasMore && (
                <Button variant="outline" size="sm" onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}>
                  Show more
                </Button>
              )}
            </div>
          )}
        </Card>
        )}

        <p className="text-xs text-ink-subtle">
          This history reflects only local prototype actions in your current session. It is not persisted to any
          server and resets when the demo data is reset.
        </p>
      </div>
    </PageContainer>
  );
}
