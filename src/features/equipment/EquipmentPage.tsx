import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, MoreHorizontal, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { PageContainer } from '@/components/common/PageContainer';
import { EquipmentCategoryIcon } from '@/components/common/EquipmentCategoryIcon';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Menu } from '@/components/ui/Menu';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Modal } from '@/components/ui/Overlay';
import { useToast } from '@/components/ui/ToastProvider';
import { LoadingState, ErrorState } from '@/components/common';
import { formatDate } from '@/lib/format';
import { ROUTES } from '@/constants';
import {
  EQUIPMENT_AVAILABILITIES,
  EQUIPMENT_CATEGORIES,
  EQUIPMENT_CONDITIONS,
  usePermissions,
  useCurrentInstitutionId,
  type EquipmentItem,
} from '@/features/workspace';
import type { EquipmentDraft } from '@/features/workspace/store';
import { useServices } from '@/services/ServiceProvider';
import { useServiceQuery } from '@/hooks/useServiceQuery';
import { toServiceError } from '@/services/errors';
import { EquipmentForm } from './components/EquipmentForm';
import { EquipmentDetailDrawer } from './components/EquipmentDetailDrawer';

interface Filters {
  query: string;
  category: string;
  availability: string;
  condition: string;
}

const EMPTY_FILTERS: Filters = { query: '', category: '', availability: '', condition: '' };

export function EquipmentPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const services = useServices();
  const currentId = useCurrentInstitutionId();
  const equipmentQuery = useServiceQuery(
    () => services.equipment.listEquipment(),
    [services],
  );
  const institutionsQuery = useServiceQuery(
    () => services.hospitals.listHospitals(),
    [services],
  );
  const equipment = useMemo(() => equipmentQuery.data ?? [], [equipmentQuery.data]);
  const institutions = useMemo(() => institutionsQuery.data ?? [], [institutionsQuery.data]);
  const loading = equipmentQuery.loading || institutionsQuery.loading;
  const loadError = equipmentQuery.error ?? institutionsQuery.error;
  const retry = () => {
    equipmentQuery.refetch();
    institutionsQuery.refetch();
  };
  const { can } = usePermissions();
  const canManage = can('equipment:manage');
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  // The `new=1` deep-link opens the create form, but only for a role that may
  // manage equipment — otherwise a Viewer following a dashboard shortcut would
  // land on a form they cannot legitimately use.
  const [formOpen, setFormOpen] = useState(
    () => searchParams.get('new') === '1' && canManage,
  );
  const [editing, setEditing] = useState<EquipmentItem | null>(null);
  const [detail, setDetail] = useState<EquipmentItem | null>(null);
  const [pendingDelete, setPendingDelete] = useState<EquipmentItem | null>(null);
  const [deleteBlocked, setDeleteBlocked] = useState<{ item: EquipmentItem; reason: string } | null>(null);

  // Consume the `new=1` flag once so refreshes do not reopen the modal.
  useEffect(() => {
    if (searchParams.get('new') === '1') {
      searchParams.delete('new');
      setSearchParams(searchParams, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const institutionById = useMemo(() => {
    const map = new Map<string, string>();
    institutions.forEach((i) => map.set(i.id, i.name));
    return map;
  }, [institutions]);

  const filtered = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    return equipment.filter((item) => {
      if (q && !`${item.name} ${item.id} ${item.internalReference ?? ''}`.toLowerCase().includes(q))
        return false;
      if (filters.category && item.category !== filters.category) return false;
      if (filters.availability && item.availability !== filters.availability) return false;
      if (filters.condition && item.condition !== filters.condition) return false;
      return true;
    });
  }, [equipment, filters]);

  const activeFilterCount = Object.entries(filters).filter(
    ([key, value]) => value && key !== 'query',
  ).length;

  const openAdd = () => {
    if (!canManage) {
      toast.error('Not permitted', 'Your current demo role cannot manage equipment listings.');
      return;
    }
    setEditing(null);
    setFormOpen(true);
  };

  // Always render the live record so edits/deletes reflect without reopening.
  const activeDetail = detail ? equipment.find((e) => e.id === detail.id) ?? null : null;
  const openEdit = (item: EquipmentItem) => {
    if (!canManage) {
      toast.error('Not permitted', 'Your current demo role cannot manage equipment listings.');
      return;
    }
    setEditing(item);
    setFormOpen(true);
  };

  /** Delete only when no active transfer or open request references the record. */
  const attemptDelete = async (item: EquipmentItem) => {
    if (!canManage) {
      toast.error('Not permitted', 'Your current demo role cannot manage equipment listings.');
      return;
    }
    // The service evaluates the business rule; the component never inspects
    // unrelated datasets to decide whether deletion is allowed.
    const blocker = await services.equipment.getDeleteBlocker(item.id);
    if (blocker) {
      setDeleteBlocked({ item, reason: blocker });
      return;
    }
    setPendingDelete(item);
  };

  const handleSubmit = async (draft: EquipmentDraft) => {
    if (!canManage) {
      toast.error('Not permitted', 'Your current demo role cannot manage equipment listings.');
      return;
    }
    try {
      if (editing) {
        await services.equipment.updateEquipment(editing.id, draft);
        toast.success('Equipment updated', `${draft.name} was saved to this prototype session.`);
      } else {
        await services.equipment.createEquipment(draft);
        toast.success('Equipment added', `${draft.name} was added to the sample inventory.`);
      }
      setFormOpen(false);
      setEditing(null);
    } catch (error) {
      toast.error('Could not save equipment', toServiceError(error).message);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const target = pendingDelete;
    try {
      await services.equipment.deleteEquipment(target.id);
      toast.success('Equipment removed', `${target.name} was deleted from the inventory.`);
      setPendingDelete(null);
    } catch (error) {
      // A CONFLICT (e.g. a reservation appeared) is shown as the blocker dialog.
      setPendingDelete(null);
      setDeleteBlocked({ item: target, reason: toServiceError(error).message });
    }
  };

  const columns: Column<EquipmentItem>[] = [
    {
      key: 'name',
      header: 'Equipment',
      sortValue: (r) => r.name,
      cell: (r) => (
        <div className="flex items-center gap-3">
          <EquipmentCategoryIcon category={r.category} />
          <div className="min-w-0">
            <p className="truncate font-medium text-ink">{r.name}</p>
            <p className="text-xs text-ink-subtle">{r.id}</p>
          </div>
        </div>
      ),
    },
    { key: 'category', header: 'Category', cell: (r) => r.category, hideOnMobile: true },
    {
      key: 'hospital',
      header: 'Institution',
      cell: (r) => institutionById.get(r.institutionId) ?? '—',
      hideOnMobile: true,
    },
    {
      key: 'quantity',
      header: 'Qty',
      align: 'right',
      sortValue: (r) => r.availableQuantity,
      cell: (r) => (
        <span className="tabular-nums">
          {r.availableQuantity}/{r.quantity}
        </span>
      ),
    },
    { key: 'location', header: 'Location', cell: (r) => r.city, hideOnMobile: true },
    { key: 'condition', header: 'Condition', cell: (r) => <StatusBadge status={r.condition} /> },
    { key: 'availability', header: 'Availability', cell: (r) => <StatusBadge status={r.availability} /> },
    {
      key: 'updated',
      header: 'Updated',
      cell: (r) => formatDate(r.updatedAt),
      hideOnMobile: true,
      sortValue: (r) => r.updatedAt,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      hideOnMobile: true,
      cell: (r) => (
        <div onClick={(event) => event.stopPropagation()}>
          <Menu
            ariaLabel={`Actions for ${r.name}`}
            trigger={<MoreHorizontal className="h-5 w-5" aria-hidden="true" />}
            items={[
              { label: 'View details', icon: <Eye className="h-4 w-4" aria-hidden="true" />, onSelect: () => setDetail(r) },
              ...(canManage
                ? [
                    { label: 'Edit', icon: <Pencil className="h-4 w-4" aria-hidden="true" />, onSelect: () => openEdit(r) },
                    {
                      label: 'Delete',
                      tone: 'danger' as const,
                      icon: <Trash2 className="h-4 w-4" aria-hidden="true" />,
                      onSelect: () => attemptDelete(r),
                    },
                  ]
                : []),
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <PageContainer
      eyebrow="Inventory"
      title="Equipment Inventory"
      description="Manage listed equipment, availability, condition and sharing details."
      actions={
        canManage ? (
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Equipment
          </Button>
        ) : undefined
      }
    >
      <div className="space-y-4">
        <Card className="p-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <SearchInput
              value={filters.query}
              onChange={(e) => setFilters((f) => ({ ...f, query: e.target.value }))}
              onClear={() => setFilters((f) => ({ ...f, query: '' }))}
              placeholder="Search by name or ID…"
              aria-label="Search equipment"
            />
            <Select
              value={filters.category}
              placeholder="All categories"
              options={EQUIPMENT_CATEGORIES.map((c) => ({ value: c, label: c }))}
              onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
              aria-label="Filter by category"
            />
            <Select
              value={filters.availability}
              placeholder="All availability"
              options={EQUIPMENT_AVAILABILITIES.map((c) => ({ value: c, label: c }))}
              onChange={(e) => setFilters((f) => ({ ...f, availability: e.target.value }))}
              aria-label="Filter by availability"
            />
            <Select
              value={filters.condition}
              placeholder="All conditions"
              options={EQUIPMENT_CONDITIONS.map((c) => ({ value: c, label: c }))}
              onChange={(e) => setFilters((f) => ({ ...f, condition: e.target.value }))}
              aria-label="Filter by condition"
            />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-sm text-ink-muted">
              Showing {filtered.length} of {equipment.length} listings
            </p>
            {(activeFilterCount > 0 || filters.query) && (
              <Button variant="ghost" size="sm" onClick={() => setFilters(EMPTY_FILTERS)}>
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Clear filters
              </Button>
            )}
          </div>
        </Card>

        {loading ? (
          <LoadingState label="Loading inventory…" />
        ) : loadError ? (
          <ErrorState message={loadError.message} onRetry={retry} />
        ) : (
          <DataTable
            columns={columns}
            rows={filtered}
            rowKey={(row) => row.id}
            onRowClick={(row) => setDetail(row)}
            initialSort={{ key: 'updated', dir: 'desc' }}
            emptyState={
              <EmptyState
                title="No equipment matches your filters"
                description="Try adjusting or clearing the filters to see more of the sample inventory."
                action={
                  <Button variant="outline" onClick={() => setFilters(EMPTY_FILTERS)}>
                    Clear filters
                  </Button>
                }
              />
            }
          />
        )}
      </div>

      <EquipmentForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
        institutions={institutions}
        initial={editing}
        defaultInstitutionId={currentId}
      />

      <EquipmentDetailDrawer
        open={detail !== null}
        onClose={() => setDetail(null)}
        equipment={activeDetail}
        institution={institutions.find((i) => i.id === activeDetail?.institutionId)}
        onEdit={
          canManage && activeDetail?.institutionId === currentId
            ? (equipment) => {
                setDetail(null);
                openEdit(equipment);
              }
            : undefined
        }
        onDelete={
          canManage && activeDetail?.institutionId === currentId
            ? (equipment) => {
                setDetail(null);
                attemptDelete(equipment);
              }
            : undefined
        }
        onRequestSimilar={(equipment) => {
          setDetail(null);
          navigate(`${ROUTES.app.findEquipment}?category=${encodeURIComponent(equipment.category)}`);
        }}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete equipment"
        tone="danger"
        confirmLabel="Delete"
        message={
          <span>
            Are you sure you want to remove <strong>{pendingDelete?.name}</strong> (
            {pendingDelete?.id}) from the sample inventory? This cannot be undone in this session.
          </span>
        }
        onConfirm={confirmDelete}
        onClose={() => setPendingDelete(null)}
      />

      <Modal
        open={deleteBlocked !== null}
        onClose={() => setDeleteBlocked(null)}
        title="Cannot delete equipment"
        description={deleteBlocked?.item.name}
        size="md"
        footer={
          <Button variant="outline" onClick={() => setDeleteBlocked(null)}>
            Close
          </Button>
        }
      >
        <p className="text-sm text-ink-muted">{deleteBlocked?.reason}</p>
      </Modal>
    </PageContainer>
  );
}
