import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShieldCheck, RotateCcw, Search } from 'lucide-react';
import { PageContainer } from '@/components/common/PageContainer';
import { EquipmentCategoryIcon } from '@/components/common/EquipmentCategoryIcon';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/ToastProvider';
import { LoadingState, ErrorState } from '@/components/common';
import {
  EQUIPMENT_AVAILABILITIES,
  EQUIPMENT_CATEGORIES,
  EQUIPMENT_CONDITIONS,
  isRequestableAvailability,
  usePermissions,
  useCurrentInstitutionId,
  type EquipmentItem,
} from '@/features/workspace';
import type { RequestDraft } from '@/features/workspace/store';
import { useServices } from '@/services/ServiceProvider';
import { useServiceQuery } from '@/hooks/useServiceQuery';
import { toServiceError } from '@/services/errors';
import { RequestEquipmentModal } from './components/RequestEquipmentModal';
import { EquipmentDetailDrawer } from '@/features/equipment/components/EquipmentDetailDrawer';

interface Filters {
  query: string;
  category: string;
  city: string;
  condition: string;
  availability: string;
  minQuantity: number;
  from: string;
  to: string;
  includeOwn: boolean;
}

const DEFAULTS: Filters = {
  query: '',
  category: '',
  city: '',
  condition: '',
  availability: '',
  minQuantity: 1,
  from: '',
  to: '',
  includeOwn: false,
};

export function FindEquipmentPage() {
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const services = useServices();
  const currentInstitutionId = useCurrentInstitutionId();
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
  const canRequest = can('requests:create');
  const [filters, setFilters] = useState<Filters>(() => ({
    ...DEFAULTS,
    query: searchParams.get('q') ?? '',
    category: searchParams.get('category') ?? '',
  }));
  const [requesting, setRequesting] = useState<EquipmentItem | null>(null);
  const [detail, setDetail] = useState<EquipmentItem | null>(null);

  // Keep in sync when arriving from the topbar search while already mounted.
  useEffect(() => {
    const q = searchParams.get('q');
    const category = searchParams.get('category');
    if (q !== null || category !== null) {
      setFilters((current) => ({ ...current, query: q ?? current.query, category: category ?? current.category }));
    }
  }, [searchParams]);

  const cityOptions = useMemo(
    () => Array.from(new Set(equipment.map((item) => item.city))).sort(),
    [equipment],
  );

  const currentInstitution = institutions.find((i) => i.id === currentInstitutionId);

  const results = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    return equipment.filter((item) => {
      if (!filters.includeOwn && item.institutionId === currentInstitutionId) return false;
      // Only listings that can currently be borrowed are discoverable.
      if (!isRequestableAvailability(item.availability)) return false;
      if (q && !`${item.name} ${item.category} ${item.id}`.toLowerCase().includes(q)) return false;
      if (filters.category && item.category !== filters.category) return false;
      if (filters.city && item.city !== filters.city) return false;
      if (filters.condition && item.condition !== filters.condition) return false;
      if (filters.availability && item.availability !== filters.availability) return false;
      if (filters.minQuantity > 0 && item.availableQuantity < filters.minQuantity) return false;
      // Availability-window overlap: no window means always available.
      if (filters.from && item.availableUntil && item.availableUntil < filters.from) return false;
      if (filters.to && item.availableFrom && item.availableFrom > filters.to) return false;
      return true;
    });
  }, [equipment, currentInstitutionId, filters]);

  const institutionName = (id: string) => institutions.find((i) => i.id === id)?.name ?? '—';

  // Always validate against the live record: availability can change while the
  // modal is open (e.g. another request gets approved in this session).
  const requestingEquipment = requesting
    ? equipment.find((e) => e.id === requesting.id) ?? null
    : null;

  const handleRequestSubmit = async (draft: RequestDraft) => {
    // The service re-checks live availability against the store and fails with
    // a CONFLICT if units were reserved while the modal was open.
    try {
      await services.requests.createRequest(draft);
      setRequesting(null);
      toast.success('Request submitted', 'Your request is now Pending with the supplying institution.');
    } catch (error) {
      setRequesting(null);
      toast.error('Request not submitted', toServiceError(error).message);
    }
  };

  const resetFilters = () => setFilters(DEFAULTS);

  /** Open the request modal, guarding against a role without request rights. */
  const openRequest = (item: EquipmentItem) => {
    if (!canRequest) {
      toast.error('Not permitted', 'Your current demo role cannot submit equipment requests.');
      return;
    }
    setRequesting(item);
  };

  return (
    <PageContainer
      eyebrow="Discovery"
      title="Find Equipment"
      description="Discover potentially available equipment and submit a request to another institution."
    >
      <div className="space-y-6">
        <Card className="p-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <SearchInput
              value={filters.query}
              onChange={(e) => setFilters((f) => ({ ...f, query: e.target.value }))}
              onClear={() => setFilters((f) => ({ ...f, query: '' }))}
              placeholder="Keyword or equipment name…"
              aria-label="Search equipment"
            />
            <Select
              value={filters.category}
              placeholder="All categories"
              options={EQUIPMENT_CATEGORIES.map((c) => ({ value: c, label: c }))}
              onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
              aria-label="Category"
            />
            <Select
              value={filters.city}
              placeholder="All cities"
              options={cityOptions.map((c) => ({ value: c, label: c }))}
              onChange={(e) => setFilters((f) => ({ ...f, city: e.target.value }))}
              aria-label="City or region"
            />
            <div className="space-y-1">
              <Label htmlFor="fe-from" className="text-xs">
                Available from
              </Label>
              <Input
                id="fe-from"
                type="date"
                value={filters.from}
                onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="fe-to" className="text-xs">
                Available until
              </Label>
              <Input
                id="fe-to"
                type="date"
                value={filters.to}
                onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="fe-min" className="text-xs">
                Minimum quantity
              </Label>
              <Input
                id="fe-min"
                type="number"
                min={1}
                value={filters.minQuantity}
                onChange={(e) => setFilters((f) => ({ ...f, minQuantity: Number(e.target.value) }))}
              />
            </div>
            <Select
              value={filters.condition}
              placeholder="Any condition"
              options={EQUIPMENT_CONDITIONS.map((c) => ({ value: c, label: c }))}
              onChange={(e) => setFilters((f) => ({ ...f, condition: e.target.value }))}
              aria-label="Condition"
            />
            <Select
              value={filters.availability}
              placeholder="Any availability"
              options={EQUIPMENT_AVAILABILITIES.map((c) => ({ value: c, label: c }))}
              onChange={(e) => setFilters((f) => ({ ...f, availability: e.target.value }))}
              aria-label="Availability"
            />
            <label className="flex cursor-pointer items-end gap-2 pb-1 text-sm text-ink">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-line-strong accent-primary"
                checked={filters.includeOwn}
                onChange={(e) => setFilters((f) => ({ ...f, includeOwn: e.target.checked }))}
              />
              Include my own inventory
            </label>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-sm text-ink-muted">
              {results.length} result(s) from other institutions
            </p>
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Clear filters
            </Button>
          </div>
        </Card>

        {loading ? (
          <LoadingState label="Loading discoverable equipment…" />
        ) : loadError ? (
          <ErrorState message={loadError.message} onRetry={retry} />
        ) : results.length === 0 ? (
          <Card>
            <EmptyState
              icon={Search}
              title="No equipment found"
              description="No sample listings match these filters. Try widening your search or including more categories."
            />
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((item) => (
              <Card key={item.id} className="flex flex-col p-5">
                <div className="flex items-start gap-3">
                  <EquipmentCategoryIcon category={item.category} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink">{item.name}</p>
                    <p className="text-xs text-ink-subtle">{item.category}</p>
                  </div>
                </div>

                <dl className="mt-4 space-y-1.5 text-sm">
                  <div className="flex justify-between gap-2">
                    <dt className="text-ink-muted">Institution</dt>
                    <dd className="truncate text-ink">{institutionName(item.institutionId)}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-ink-muted">City</dt>
                    <dd className="text-ink">{item.city}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-ink-muted">Available</dt>
                    <dd className="tabular-nums text-ink">
                      {item.availableQuantity} of {item.quantity}
                    </dd>
                  </div>
                </dl>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <StatusBadge status={item.availability} />
                  <StatusBadge status={item.condition} />
                  {item.documentationOnFile && (
                    <span className="inline-flex items-center gap-1 text-xs text-success-foreground">
                      <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                      Docs on file
                    </span>
                  )}
                </div>

                <div className="mt-4 flex gap-2 border-t border-line pt-4">
                  <Button variant="outline" size="sm" onClick={() => setDetail(item)}>
                    View Details
                  </Button>
                  <Button
                    size="sm"
                    disabled={!canRequest}
                    title={canRequest ? undefined : 'Your role cannot submit equipment requests'}
                    onClick={() => openRequest(item)}
                  >
                    Request Equipment
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        <p className="text-xs text-ink-subtle">
          Availability and suitability must be confirmed by the supplying institution before transfer.
          All institutions shown are fictional sample data and imply no real partnerships.
        </p>
      </div>

      <RequestEquipmentModal
        open={requesting !== null}
        onClose={() => setRequesting(null)}
        equipment={requestingEquipment}
        requestingInstitution={currentInstitution}
        onSubmit={handleRequestSubmit}
      />

      <EquipmentDetailDrawer
        open={detail !== null}
        onClose={() => setDetail(null)}
        equipment={detail}
        institution={institutions.find((i) => i.id === detail?.institutionId)}
        onRequestSimilar={(equipment) => {
          setDetail(null);
          openRequest(equipment);
        }}
      />
    </PageContainer>
  );
}
