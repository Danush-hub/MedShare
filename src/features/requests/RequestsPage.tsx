import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, RotateCcw } from 'lucide-react';
import { PageContainer } from '@/components/common/PageContainer';
import { LoadingState, ErrorState } from '@/components/common';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/ToastProvider';
import { formatDate } from '@/lib/format';
import { ROUTES } from '@/constants';
import {
  REQUEST_STATUSES,
  usePermissions,
  useCurrentInstitutionId,
  type ShareRequest,
} from '@/features/workspace';
import { useServices } from '@/services/ServiceProvider';
import { useServiceQuery } from '@/hooks/useServiceQuery';
import { toServiceError } from '@/services/errors';
import { RequestDetailDrawer } from './components/RequestDetailDrawer';

type TabValue = 'all' | 'incoming' | 'outgoing';

export function RequestsPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const services = useServices();
  const currentId = useCurrentInstitutionId();
  const requestsQuery = useServiceQuery(() => services.requests.listRequests(), [services]);
  const institutionsQuery = useServiceQuery(() => services.hospitals.listHospitals(), [services]);
  const transfersQuery = useServiceQuery(() => services.transfers.listTransfers(), [services]);
  const requests = useMemo(() => requestsQuery.data ?? [], [requestsQuery.data]);
  const institutions = useMemo(() => institutionsQuery.data ?? [], [institutionsQuery.data]);
  const transfers = useMemo(() => transfersQuery.data ?? [], [transfersQuery.data]);
  const loading = requestsQuery.loading || institutionsQuery.loading || transfersQuery.loading;
  const loadError = requestsQuery.error ?? institutionsQuery.error ?? transfersQuery.error;
  const retry = () => {
    requestsQuery.refetch();
    institutionsQuery.refetch();
    transfersQuery.refetch();
  };
  const { can } = usePermissions();
  const canApprove = can('requests:approve');
  const canCancel = can('requests:cancel');
  const canDispatch = can('transfers:update');

  const [tab, setTab] = useState<TabValue>('all');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [detail, setDetail] = useState<ShareRequest | null>(null);
  const [rejecting, setRejecting] = useState<ShareRequest | null>(null);
  const [cancelling, setCancelling] = useState<ShareRequest | null>(null);

  const institutionName = (id: string) => institutions.find((i) => i.id === id)?.name ?? id;

  const scoped = useMemo(
    () =>
      requests.filter(
        (r) => r.requestingInstitutionId === currentId || r.supplyingInstitutionId === currentId,
      ),
    [requests, currentId],
  );

  const counts = useMemo(() => {
    const incoming = scoped.filter((r) => r.supplyingInstitutionId === currentId).length;
    const outgoing = scoped.filter((r) => r.requestingInstitutionId === currentId).length;
    return { all: scoped.length, incoming, outgoing };
  }, [scoped, currentId]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return scoped
      .filter((r) => {
        if (tab === 'incoming' && r.supplyingInstitutionId !== currentId) return false;
        if (tab === 'outgoing' && r.requestingInstitutionId !== currentId) return false;
        if (statusFilter && r.status !== statusFilter) return false;
        if (q && !`${r.id} ${r.equipmentName}`.toLowerCase().includes(q)) return false;
        return true;
      })
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [scoped, tab, statusFilter, query, currentId]);

  const direction = (r: ShareRequest) => (r.supplyingInstitutionId === currentId ? 'Incoming' : 'Outgoing');

  const handleApprove = async (request: ShareRequest) => {
    if (!canApprove) {
      toast.error('Not permitted', 'Your current demo role cannot approve requests.');
      return;
    }
    try {
      // The service re-checks live availability at decision time; approval reserves units.
      await services.requests.approveRequest(request.id);
      setDetail(null);
      toast.success(
        'Request approved',
        `${request.id} approved and the requested units are now reserved.`,
      );
    } catch (error) {
      toast.error('Request cannot be approved', toServiceError(error).message);
    }
  };
  const handleRejectConfirm = async (reason?: string) => {
    if (!rejecting) return;
    if (!canApprove) {
      toast.error('Not permitted', 'Your current demo role cannot reject requests.');
      setRejecting(null);
      return;
    }
    const target = rejecting;
    try {
      await services.requests.rejectRequest(target.id, reason ?? '');
      setRejecting(null);
      setDetail(null);
      toast.success('Request rejected', `${target.id} was rejected.`);
    } catch (error) {
      toast.error('Request could not be rejected', toServiceError(error).message);
    }
  };
  const handleCancelConfirm = async () => {
    if (!cancelling) return;
    if (!canCancel) {
      toast.error('Not permitted', 'Your current demo role cannot cancel requests.');
      setCancelling(null);
      return;
    }
    const target = cancelling;
    try {
      await services.requests.cancelRequest(target.id);
      setCancelling(null);
      setDetail(null);
      toast.success('Request cancelled', `${target.id} was cancelled.`);
    } catch (error) {
      toast.error('Request could not be cancelled', toServiceError(error).message);
    }
  };
  const handleCreateTransfer = async (request: ShareRequest) => {
    if (!canDispatch) {
      toast.error('Not permitted', 'Your current demo role cannot prepare transfers.');
      return;
    }
    try {
      await services.transfers.createTransfer(request.id);
      setDetail(null);
      toast.success('Transfer prepared', `${request.id} is now awaiting dispatch.`);
    } catch (error) {
      toast.error('Transfer could not be prepared', toServiceError(error).message);
    }
  };

  const columns: Column<ShareRequest>[] = [
    { key: 'id', header: 'Request', sortValue: (r) => r.id, cell: (r) => <span className="font-medium">{r.id}</span>, hideOnMobile: true },
    { key: 'equipment', header: 'Equipment', sortValue: (r) => r.equipmentName, cell: (r) => r.equipmentName },
    { key: 'requesting', header: 'Requesting', cell: (r) => institutionName(r.requestingInstitutionId), hideOnMobile: true },
    { key: 'supplying', header: 'Supplying', cell: (r) => institutionName(r.supplyingInstitutionId), hideOnMobile: true },
    { key: 'quantity', header: 'Qty', align: 'right', cell: (r) => r.quantity, hideOnMobile: true },
    { key: 'requested', header: 'Requested', cell: (r) => formatDate(r.requestedDate), hideOnMobile: true },
    { key: 'required', header: 'Required by', sortValue: (r) => r.requiredDate, cell: (r) => formatDate(r.requiredDate), hideOnMobile: true },
    { key: 'type', header: 'Type', cell: (r) => <Badge tone={direction(r) === 'Incoming' ? 'info' : 'neutral'}>{direction(r)}</Badge>, hideOnMobile: true },
    { key: 'status', header: 'Status', sortValue: (r) => r.status, cell: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'action',
      header: '',
      align: 'right',
      cell: (r) => (
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            setDetail(r);
          }}
        >
          <Eye className="h-4 w-4" aria-hidden="true" />
          View
        </Button>
      ),
    },
  ];

  const activeDetail = detail ? requests.find((r) => r.id === detail.id) ?? detail : null;

  // Open a request from the dashboard deep-link (?request=ID). Data loads
  // asynchronously, so wait until the first request list settles, then consume
  // the flag exactly once so refreshes do not reopen the drawer.
  const deepLinkHandled = useRef(false);
  useEffect(() => {
    if (deepLinkHandled.current || requestsQuery.loading) return;
    deepLinkHandled.current = true;
    const target = searchParams.get('request');
    if (target) {
      const found = requests.find((r) => r.id === target);
      if (found) setDetail(found);
      searchParams.delete('request');
      setSearchParams(searchParams, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requests, requestsQuery.loading]);

  return (
    <PageContainer
      eyebrow="Workflow"
      title="Requests"
      description="Manage incoming and outgoing equipment sharing requests."
      actions={
        <Button variant="outline" onClick={() => navigate(ROUTES.app.findEquipment)}>
          Find Equipment
        </Button>
      }
    >
      <div className="space-y-4">
        <Tabs
          value={tab}
          onChange={(value) => setTab(value as TabValue)}
          ariaLabel="Request direction"
          items={[
            { value: 'all', label: 'All Requests', badge: counts.all },
            { value: 'incoming', label: 'Incoming Requests', badge: counts.incoming },
            { value: 'outgoing', label: 'Outgoing Requests', badge: counts.outgoing },
          ]}
        />

        <Card className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchInput
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onClear={() => setQuery('')}
              placeholder="Search by request ID or equipment…"
              aria-label="Search requests"
              className="sm:max-w-xs"
            />
            <Select
              value={statusFilter}
              placeholder="All statuses"
              options={REQUEST_STATUSES.map((s) => ({ value: s, label: s }))}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by status"
              className="sm:max-w-[12rem]"
            />
            {(query || statusFilter) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setQuery('');
                  setStatusFilter('');
                }}
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Clear
              </Button>
            )}
          </div>
        </Card>

        {loading ? (
          <LoadingState label="Loading requests…" />
        ) : loadError ? (
          <ErrorState message={loadError.message} onRetry={retry} />
        ) : (
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(row) => row.id}
            onRowClick={(row) => setDetail(row)}
            emptyState={
            query || statusFilter ? (
              <EmptyState
                title="No requests match your filters"
                description="Try adjusting the search or status filter to see more of this tab."
                action={
                  <Button
                    variant="outline"
                    onClick={() => {
                      setQuery('');
                      setStatusFilter('');
                    }}
                  >
                    Clear filters
                  </Button>
                }
              />
            ) : (
              <EmptyState
                title="No requests here yet"
                description="Requests you receive or submit will appear in this tab."
              />
            )
          }
          />
        )}
      </div>

      <RequestDetailDrawer
        open={activeDetail !== null}
        onClose={() => setDetail(null)}
        request={activeDetail}
        institutions={institutions}
        currentInstitutionId={currentId}
        hasTransfer={transfers.some((t) => t.requestId === activeDetail?.id)}
        canApprove={canApprove}
        canCancel={canCancel}
        canDispatch={canDispatch}
        onApprove={handleApprove}
        onReject={setRejecting}
        onCancel={setCancelling}
        onCreateTransfer={handleCreateTransfer}
      />

      <ConfirmDialog
        open={rejecting !== null}
        title="Reject request"
        tone="danger"
        confirmLabel="Reject request"
        requireReason
        reasonLabel="Reason for rejection"
        message={<span>Provide a reason for rejecting <strong>{rejecting?.id}</strong>.</span>}
        onConfirm={handleRejectConfirm}
        onClose={() => setRejecting(null)}
      />

      <ConfirmDialog
        open={cancelling !== null}
        title="Cancel request"
        tone="danger"
        confirmLabel="Cancel request"
        message={<span>Are you sure you want to cancel <strong>{cancelling?.id}</strong>?</span>}
        onConfirm={handleCancelConfirm}
        onClose={() => setCancelling(null)}
      />
    </PageContainer>
  );
}
