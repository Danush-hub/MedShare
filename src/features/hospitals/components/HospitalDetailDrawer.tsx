import { Mail, Phone, User } from 'lucide-react';
import { Drawer } from '@/components/ui/Overlay';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DetailField, DetailList } from '@/components/ui/Detail';
import { EquipmentCategoryIcon } from '@/components/common/EquipmentCategoryIcon';
import { formatDate } from '@/lib/format';
import type { EquipmentItem, Institution } from '@/features/workspace';

interface HospitalDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  institution: Institution | null;
  equipment: EquipmentItem[];
  isCurrent: boolean;
}

/** Read-only institution profile with its associated (sample) inventory. */
export function HospitalDetailDrawer({
  open,
  onClose,
  institution,
  equipment,
  isCurrent,
}: HospitalDetailDrawerProps) {
  if (!institution) return null;
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={institution.name}
      description={`${institution.type} · ${institution.city}`}
      ariaLabel={institution.name}
      size="lg"
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={institution.status} />
          {isCurrent && <Badge tone="info">Your institution</Badge>}
        </div>

        <DetailList>
          <DetailField label="Institution ID">{institution.id}</DetailField>
          <DetailField label="Type">{institution.type}</DetailField>
          <DetailField label="City">{institution.city}</DetailField>
          <DetailField label="Region">{institution.region}</DetailField>
          <DetailField label="Contact person">
            <span className="inline-flex items-center gap-1.5">
              <User className="h-4 w-4 text-ink-subtle" aria-hidden="true" />
              {institution.contactPerson}
            </span>
          </DetailField>
          <DetailField label="Joined">{formatDate(institution.joinedAt)}</DetailField>
          <DetailField label="Email" className="sm:col-span-2">
            <span className="inline-flex items-center gap-1.5">
              <Mail className="h-4 w-4 text-ink-subtle" aria-hidden="true" />
              {institution.contactEmail}
            </span>
          </DetailField>
          <DetailField label="Phone" className="sm:col-span-2">
            <span className="inline-flex items-center gap-1.5">
              <Phone className="h-4 w-4 text-ink-subtle" aria-hidden="true" />
              {institution.contactPhone}
            </span>
          </DetailField>
        </DetailList>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-ink">
            Listed equipment ({equipment.length})
          </h3>
          {equipment.length === 0 ? (
            <div className="rounded-field border border-line bg-surface-muted/40 p-4">
              <p className="text-sm text-ink-muted">
                This institution has no listed equipment in the sample dataset.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-line overflow-hidden rounded-field border border-line">
              {equipment.map((item) => (
                <li key={item.id} className="flex items-center gap-3 p-3">
                  <EquipmentCategoryIcon category={item.category} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{item.name}</p>
                    <p className="text-xs text-ink-subtle">{item.category}</p>
                  </div>
                  <div className="text-right text-xs text-ink-muted">
                    <p>
                      {item.availableQuantity}/{item.quantity} available
                    </p>
                    <StatusBadge status={item.availability} className="mt-1" />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="text-xs text-ink-subtle">
          All institutions and contacts are fictional sample data for this prototype and imply no real
          partnerships or registrations.
        </p>
      </div>

      <div className="mt-6 flex justify-end border-t border-line pt-4">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </Drawer>
  );
}
