import { useMemo, useState } from 'react';
import { Building2, Eye, RotateCcw } from 'lucide-react';
import { PageContainer } from '@/components/common/PageContainer';
import { LoadingState, ErrorState } from '@/components/common';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  institutionEquipmentCount,
  useCurrentInstitutionId,
  type Institution,
} from '@/features/workspace';
import { useServices } from '@/services/ServiceProvider';
import { useServiceQuery } from '@/hooks/useServiceQuery';
import { HospitalDetailDrawer } from './components/HospitalDetailDrawer';

const INSTITUTION_TYPES = ['Hospital', 'Clinic', 'Medical Center', 'Community Health Center'];

export function HospitalsPage() {
  const services = useServices();
  const currentId = useCurrentInstitutionId();
  const institutionsQuery = useServiceQuery(
    () => services.hospitals.listHospitals(),
    [services],
  );
  const equipmentQuery = useServiceQuery(
    () => services.equipment.listEquipment(),
    [services],
  );
  const institutions = useMemo(() => institutionsQuery.data ?? [], [institutionsQuery.data]);
  const equipment = useMemo(() => equipmentQuery.data ?? [], [equipmentQuery.data]);
  const loading = institutionsQuery.loading || equipmentQuery.loading;
  const loadError = institutionsQuery.error ?? equipmentQuery.error;
  const retry = () => {
    institutionsQuery.refetch();
    equipmentQuery.refetch();
  };

  const [query, setQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [detail, setDetail] = useState<Institution | null>(null);

  const cityOptions = useMemo(
    () => Array.from(new Set(institutions.map((i) => i.city))).sort(),
    [institutions],
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return institutions.filter((i) => {
      if (cityFilter && i.city !== cityFilter) return false;
      if (typeFilter && i.type !== typeFilter) return false;
      if (q && !`${i.name} ${i.city} ${i.contactPerson}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [institutions, query, cityFilter, typeFilter]);

  const hasFilters = Boolean(query || cityFilter || typeFilter);
  const clearFilters = () => {
    setQuery('');
    setCityFilter('');
    setTypeFilter('');
  };

  const columns: Column<Institution>[] = [
    {
      key: 'name',
      header: 'Institution',
      sortValue: (i) => i.name,
      cell: (i) => (
        <div className="flex items-center gap-2">
          <span className="font-medium text-ink">{i.name}</span>
          {i.id === currentId && <Badge tone="info">You</Badge>}
        </div>
      ),
    },
    { key: 'type', header: 'Type', sortValue: (i) => i.type, cell: (i) => i.type, hideOnMobile: true },
    { key: 'city', header: 'City', sortValue: (i) => i.city, cell: (i) => `${i.city}, ${i.region}` },
    {
      key: 'contact',
      header: 'Contact person',
      cell: (i) => i.contactPerson,
      hideOnMobile: true,
    },
    {
      key: 'equipment',
      header: 'Listed units',
      align: 'right',
      sortValue: (i) => institutionEquipmentCount(equipment, i.id),
      cell: (i) => institutionEquipmentCount(equipment, i.id),
    },
    { key: 'status', header: 'Status', sortValue: (i) => i.status, cell: (i) => <StatusBadge status={i.status} /> },
    {
      key: 'action',
      header: '',
      align: 'right',
      cell: (i) => (
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            setDetail(i);
          }}
        >
          <Eye className="h-4 w-4" aria-hidden="true" />
          View
        </Button>
      ),
    },
  ];

  const activeDetail = detail ? institutions.find((i) => i.id === detail.id) ?? null : null;
  const detailEquipment = activeDetail
    ? equipment.filter((e) => e.institutionId === activeDetail.id)
    : [];

  return (
    <PageContainer
      eyebrow="Network"
      title="Hospitals & Institutions"
      description="Browse the fictional partner institutions sharing equipment across the network."
    >
      <div className="space-y-4">
        <Card className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchInput
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onClear={() => setQuery('')}
              placeholder="Search by name or contact…"
              aria-label="Search institutions"
              className="sm:max-w-xs"
            />
            <Select
              value={cityFilter}
              placeholder="All cities"
              options={cityOptions.map((c) => ({ value: c, label: c }))}
              onChange={(e) => setCityFilter(e.target.value)}
              aria-label="Filter by city"
              className="sm:max-w-[12rem]"
            />
            <Select
              value={typeFilter}
              placeholder="All types"
              options={INSTITUTION_TYPES.map((t) => ({ value: t, label: t }))}
              onChange={(e) => setTypeFilter(e.target.value)}
              aria-label="Filter by type"
              className="sm:max-w-[14rem]"
            />
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Clear
              </Button>
            )}
          </div>
        </Card>

        {loading ? (
          <LoadingState label="Loading institutions…" />
        ) : loadError ? (
          <ErrorState message={loadError.message} onRetry={retry} />
        ) : (
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(row) => row.id}
            onRowClick={(row) => setDetail(row)}
            emptyState={
              <EmptyState
                icon={Building2}
                title="No institutions found"
                description="No sample institutions match these filters. Try clearing the filters."
              />
            }
          />
        )}

        <p className="text-xs text-ink-subtle">
          Institutions, contacts and counts are fictional sample data for this prototype and do not represent
          real healthcare facilities or partnerships.
        </p>
      </div>

      <HospitalDetailDrawer
        open={activeDetail !== null}
        onClose={() => setDetail(null)}
        institution={activeDetail}
        equipment={detailEquipment}
        isCurrent={activeDetail?.id === currentId}
      />
    </PageContainer>
  );
}
