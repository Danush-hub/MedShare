import { useMemo, useState } from 'react';
import { Eye, RotateCcw, Search, Truck, PackageCheck, PackageX, Undo2 } from 'lucide-react';
import { PageContainer } from '@/components/common/PageContainer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/StatCard';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/ToastProvider';
import { LoadingState, ErrorState } from '@/components/common';
import { formatDate } from '@/lib/format';
import {
  TRANSFER_STATUSES,
  transferSummary,
  usePermissions,
  useCurrentInstitutionId,
  type Transfer,
  type TransferStatus,
} from '@/features/workspace';
import { useServices } from '@/services/ServiceProvider';
import { useServiceQuery } from '@/hooks/useServiceQuery';
import { toServiceError } from '@/services/errors';
import { TransferDetailDrawer } from './components/TransferDetailDrawer';

export function TransfersPage() {
  const toast = useToast();
  const services = useServices();
  const currentId = useCurrentInstitutionId();
  const transfersQuery = useServiceQuery(
    () => services.transfers.listTransfers(),
    [services],
  );
  const institutionsQuery = useServiceQuery(
    () => services.hospitals.listHospitals(),
    [services],
  );
  const transfers = useMemo(() => transfersQuery.data ?? [], [transfersQuery.data]);
  const institutions = useMemo(() => institutionsQuery.data ?? [], [institutionsQuery.data]);
  const loading = transfersQuery.loading || institutionsQuery.loading;
  const loadError = transfersQuery.error ?? institutionsQuery.error;
  const retry = () => {
    transfersQuery.refetch();
    institutionsQuery.refetch();
  };
  const { can } = usePermissions();
  const canUpdate = can('transfers:update');

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [detail, setDetail] = useState<Transfer | null>(null);
  const [pendingAdvance, setPendingAdvance] = useState<{ transfer: Transfer; status: TransferStatus } | null>(
    null,
  );

  const institutionName = (id: string) => institutions.find((i) => i.id === id)?.name ?? id;
  const summary = useMemo(() => transferSummary(transfers), [transfers]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return transfers
      .filter((t) => {
        if (statusFilter && t.status !== statusFilter) return false;
        if (q && !`${t.id} ${t.equipmentName} ${t.requestId}`.toLowerCase().includes(q)) return false;
        return true;
      })
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [transfers, statusFilter, query]);

  const handleAdvanceConfirm = async () => {
    if (!pendingAdvance) return;
    const { transfer, status } = pendingAdvance;
    if (!canUpdate) {
      setPendingAdvance(null);
      toast.error('Not permitted', 'Your current demo role cannot update transfers.');
      return;
    }
    try {
      // The service validates the transition flow and acting-side ownership.
      await services.transfers.updateTransferStatus(transfer.id, status);
      setDetail(null);
      setPendingAdvance(null);
      toast.success('Transfer updated', `${transfer.id} is now marked ${status.toLowerCase()}.`);
    } catch (error) {
      setPendingAdvance(null);
      toast.error('Transfer not updated', toServiceError(error).message);
    }
  };

  const columns: Column<Transfer>[] = [
    {
      key: 'id',
      header: 'Transfer',
      sortValue: (t) => t.id,
      cell: (t) => <span className="font-medium">{t.id}</span>,
      hideOnMobile: true,
    },
    { key: 'equipment', header: 'Equipment', sortValue: (t) => t.equipmentName, cell: (t) => t.equipmentName },
    {
      key: 'sending',
      header: 'Sending',
      cell: (t) => institutionName(t.sendingInstitutionId),
      hideOnMobile: true,
    },
    {
      key: 'receiving',
      header: 'Receiving',
      cell: (t) => institutionName(t.receivingInstitutionId),
      hideOnMobile: true,
    },
    { key: 'quantity', header: 'Qty', align: 'right', cell: (t) => t.quantity, hideOnMobile: true },
    {
      key: 'dispatch',
      header: 'Dispatch',
      sortValue: (t) => t.dispatchDate ?? '',
      cell: (t) => formatDate(t.dispatchDate),
      hideOnMobile: true,
    },
    {
      key: 'return',
      header: 'Expected return',
      sortValue: (t) => t.expectedReturn ?? '',
      cell: (t) => formatDate(t.expectedReturn),
      hideOnMobile: true,
    },
    { key: 'status', header: 'Status', sortValue: (t) => t.status, cell: (t) => <StatusBadge status={t.status} /> },
    {
      key: 'action',
      header: '',
      align: 'right',
      cell: (t) => (
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            setDetail(t);
          }}
        >
          <Eye className="h-4 w-4" aria-hidden="true" />
          View
        </Button>
      ),
    },
  ];

  const activeDetail = detail ? transfers.find((t) => t.id === detail.id) ?? detail : null;

  return (
    <PageContainer
      eyebrow="Logistics"
      title="Equipment Transfers"
      description="Track approved equipment as it moves between facilities and back."
    >
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={PackageX}
            value={summary.awaitingDispatch}
            label="Awaiting Dispatch"
            hint="Approved and ready to send"
            tone="warning"
          />
          <StatCard
            icon={Truck}
            value={summary.inTransit}
            label="In Transit"
            hint="Dispatched or on the way"
            tone="info"
          />
          <StatCard
            icon={PackageCheck}
            value={summary.received}
            label="Received"
            hint="Delivered at the destination"
            tone="success"
          />
          <StatCard
            icon={Undo2}
            value={summary.awaitingReturn}
            label="Awaiting Return"
            hint="Return scheduled"
            tone="navy"
          />
        </div>

        <Card className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchInput
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onClear={() => setQuery('')}
              placeholder="Search by transfer, request or equipment…"
              aria-label="Search transfers"
              className="sm:max-w-xs"
            />
            <Select
              value={statusFilter}
              placeholder="All statuses"
              options={TRANSFER_STATUSES.map((s) => ({ value: s, label: s }))}
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
          <LoadingState label="Loading transfers…" />
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
                icon={Search}
                title="No transfers match your filters"
                description="Try clearing the search or status filter to see the rest of the sample transfers."
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
                icon={Truck}
                title="No transfers yet"
                description="Approved requests prepared for dispatch will appear here. All transfer records are sample data."
              />
            )
          }
          />
        )}

        <p className="text-xs text-ink-subtle">
          Status updates are entered manually for this prototype. MedShare does not perform real shipment
          tracking, GPS or carrier integration. Every institution and transfer shown is fictional sample data.
        </p>
      </div>

      <TransferDetailDrawer
        open={activeDetail !== null}
        onClose={() => setDetail(null)}
        transfer={activeDetail}
        institutions={institutions}
        currentInstitutionId={currentId}
        canUpdate={canUpdate}
        onAdvance={(transfer, status) => setPendingAdvance({ transfer, status })}
      />

      <ConfirmDialog
        open={pendingAdvance !== null}
        title="Update transfer status"
        confirmLabel="Confirm update"
        message={
          <span>
            Mark <strong>{pendingAdvance?.transfer.id}</strong> as{' '}
            <strong>{pendingAdvance?.status}</strong>? This records a status change and updates the linked
            request.
          </span>
        }
        onConfirm={handleAdvanceConfirm}
        onClose={() => setPendingAdvance(null)}
      />
    </PageContainer>
  );
}
