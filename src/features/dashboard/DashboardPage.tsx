import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Boxes,
  CheckCircle2,
  ClipboardCheck,
  Database,
  Hourglass,
  PlusCircle,
  Search,
  Truck,
} from 'lucide-react';
import { PageContainer } from '@/components/common/PageContainer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/constants';
import { formatDate } from '@/lib/format';
import { LoadingState, ErrorState } from '@/components/common';
import {
  usePermissions,
  equipmentByCategory,
  transferSummary,
  ACTIVITY_META,
  type EquipmentItem,
  type Transfer,
} from '@/features/workspace';
import type { Permission } from '@/features/workspace/permissions';
import type { ShareRequest } from '@/features/workspace';
import { useServices } from '@/services/ServiceProvider';
import { useServiceQuery } from '@/hooks/useServiceQuery';

/** Headline metrics derived from the sample dataset so they never contradict the modules. */
function useWorkspaceMetrics(
  equipment: EquipmentItem[],
  requests: ShareRequest[],
  transfers: Transfer[],
) {
  return useMemo(() => {
    const listedUnits = equipment.reduce((sum, item) => sum + item.quantity, 0);
    const availableUnits = equipment.reduce((sum, item) => sum + item.availableQuantity, 0);
    const pendingRequests = requests.filter((request) => request.status === 'Pending').length;
    return [
      { label: 'Listed Units', value: listedUnits, icon: Boxes, tone: 'primary' as const, hint: 'Across the sample network' },
      { label: 'Available Units', value: availableUnits, icon: CheckCircle2, tone: 'success' as const, hint: 'Unreserved in the sample inventory' },
      { label: 'Pending Requests', value: pendingRequests, icon: Hourglass, tone: 'warning' as const, hint: 'Awaiting a decision' },
      { label: 'Active Transfers', value: transferSummary(transfers).active, icon: Truck, tone: 'info' as const, hint: 'Not yet completed in the network' },
    ];
  }, [equipment, requests, transfers]);
}

const QUICK_ACTIONS: { label: string; to: string; icon: typeof Search; perm?: Permission }[] = [
  { label: 'Add Equipment', to: `${ROUTES.app.equipment}?new=1`, icon: PlusCircle, perm: 'equipment:manage' },
  { label: 'Find Equipment', to: ROUTES.app.findEquipment, icon: Search },
  { label: 'Review Requests', to: ROUTES.app.requests, icon: ClipboardCheck },
  { label: 'View Transfers', to: ROUTES.app.transfers, icon: Truck },
];

function greetingWord(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function DashboardPage() {
  const navigate = useNavigate();
  const services = useServices();
  const equipmentQuery = useServiceQuery(() => services.equipment.listEquipment(), [services]);
  const requestsQuery = useServiceQuery(() => services.requests.listRequests(), [services]);
  const transfersQuery = useServiceQuery(() => services.transfers.listTransfers(), [services]);
  const institutionsQuery = useServiceQuery(() => services.hospitals.listHospitals(), [services]);
  const activityQuery = useServiceQuery(() => services.activity.listActivities(), [services]);
  const equipment = useMemo(() => equipmentQuery.data ?? [], [equipmentQuery.data]);
  const requests = useMemo(() => requestsQuery.data ?? [], [requestsQuery.data]);
  const transfers = useMemo(() => transfersQuery.data ?? [], [transfersQuery.data]);
  const institutions = useMemo(() => institutionsQuery.data ?? [], [institutionsQuery.data]);
  const activities = useMemo(() => activityQuery.data ?? [], [activityQuery.data]);
  const loading =
    equipmentQuery.loading ||
    requestsQuery.loading ||
    transfersQuery.loading ||
    institutionsQuery.loading ||
    activityQuery.loading;
  const loadError =
    equipmentQuery.error ??
    requestsQuery.error ??
    transfersQuery.error ??
    institutionsQuery.error ??
    activityQuery.error;
  const retry = () => {
    equipmentQuery.refetch();
    requestsQuery.refetch();
    transfersQuery.refetch();
    institutionsQuery.refetch();
    activityQuery.refetch();
  };
  const { can } = usePermissions();
  const metrics = useWorkspaceMetrics(equipment, requests, transfers);
  const breakdown = equipmentByCategory(equipment);
  const maxTotal = Math.max(1, ...breakdown.map((row) => row.total));
  const recentRequests = [...requests]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 5);
  const recentActivity = activities.slice(0, 5);

  const requestColumns: Column<ShareRequest>[] = [
    { key: 'id', header: 'Request', cell: (r) => <span className="font-medium text-ink">{r.id}</span>, hideOnMobile: true },
    { key: 'equipment', header: 'Equipment', cell: (r) => r.equipmentName },
    {
      key: 'hospital',
      header: 'Requesting hospital',
      cell: (r) =>
        institutions.find((i) => i.id === r.requestingInstitutionId)?.name ?? '—',
    },
    { key: 'requested', header: 'Requested', cell: (r) => formatDate(r.createdAt.slice(0, 10)) },
    { key: 'status', header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'action',
      header: '',
      align: 'right',
      cell: (r) => (
        <Button
          size="sm"
          variant="outline"
          onClick={(event) => {
            event.stopPropagation();
            navigate(`${ROUTES.app.requests}?request=${r.id}`);
          }}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <PageContainer
      eyebrow="Overview"
      title={`${greetingWord()}, Administrator`}
      description="Here is an overview of equipment sharing activity across your MedShare workspace."
      actions={
        <span className="rounded-full border border-line bg-surface px-3 py-1.5 text-sm text-ink-muted">
          {new Date().toLocaleDateString(undefined, {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </span>
      }
    >
      <div className="space-y-6">
        <div className="flex items-center gap-2 rounded-field border border-line bg-surface-muted/50 px-3 py-2 text-xs text-ink-muted">
          <Database className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          This workspace runs on sample demonstration data. Summary figures below are computed
          from the fictional dataset and are not live platform statistics.
        </div>

        {loading ? (
          <LoadingState label="Loading workspace overview…" />
        ) : loadError ? (
          <ErrorState message={loadError.message} onRetry={retry} />
        ) : (
          <>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <StatCard
              key={metric.label}
              icon={metric.icon}
              value={metric.value}
              label={metric.label}
              hint={metric.hint}
              tone={metric.tone}
            />
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Equipment availability overview</CardTitle>
              <CardDescription>
                Sample distribution of listed units by category in this workspace.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {breakdown.map((row) => (
                <div key={row.category}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-ink">{row.category}</span>
                    <span className="text-ink-muted">
                      {row.available} / {row.total} available
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${Math.round((row.total / maxTotal) * 100)}%` }}
                    />
                    <div
                      className="-mt-2.5 h-2.5 rounded-full bg-success/70"
                      style={{ width: `${Math.round((row.available / maxTotal) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
              <p className="pt-1 text-xs text-ink-subtle">
                Blue = total units · Green = currently available units.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick actions</CardTitle>
              <CardDescription>Jump into the most common workflows.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              {QUICK_ACTIONS.filter((action) => !action.perm || can(action.perm)).map((action) => (
                <Button
                  key={action.label}
                  variant="outline"
                  fullWidth
                  className="justify-start"
                  onClick={() => navigate(action.to)}
                >
                  <action.icon className="h-4 w-4 text-primary" aria-hidden="true" />
                  {action.label}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="h-section">Recent requests</h2>
              <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.app.requests)}>
                View all
              </Button>
            </div>
            <DataTable
              columns={requestColumns}
              rows={recentRequests}
              rowKey={(row) => row.id}
              onRowClick={(row) => navigate(`${ROUTES.app.requests}?request=${row.id}`)}
              emptyState={<p className="p-8 text-center text-sm text-ink-muted">No requests yet.</p>}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent activity</CardTitle>
              <CardDescription>Sample workspace activity.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.map((activity) => {
                const meta = ACTIVITY_META[activity.type];
                const Icon = meta.icon;
                return (
                  <div key={activity.id} className="flex gap-3">
                    <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-light">
                      <Icon className={`h-4 w-4 ${meta.tone}`} aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm text-ink">{activity.description}</p>
                      <p className="text-xs text-ink-subtle">
                        {formatDate(activity.at)} · Sample activity
                      </p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
          </>
        )}
      </div>
    </PageContainer>
  );
}
