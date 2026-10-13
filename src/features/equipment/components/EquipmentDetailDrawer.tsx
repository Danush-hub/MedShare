import { Pencil, ShieldCheck, Stethoscope, Trash2 } from 'lucide-react';
import { Drawer } from '@/components/ui/Overlay';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DetailField, DetailList } from '@/components/ui/Detail';
import { formatDate } from '@/lib/format';
import type { EquipmentItem, Institution } from '@/features/workspace';

interface EquipmentDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  equipment: EquipmentItem | null;
  institution?: Institution;
  onRequestSimilar: (equipment: EquipmentItem) => void;
  /** Optional management actions (shown on the inventory page, also reachable on mobile). */
  onEdit?: (equipment: EquipmentItem) => void;
  onDelete?: (equipment: EquipmentItem) => void;
}

/** Read-only equipment detail panel with a "request similar" action. */
export function EquipmentDetailDrawer({
  open,
  onClose,
  equipment,
  institution,
  onRequestSimilar,
  onEdit,
  onDelete,
}: EquipmentDetailDrawerProps) {
  if (!equipment) return null;
  return (
    <Drawer open={open} onClose={onClose} title={equipment.name} ariaLabel={equipment.name} size="lg">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={equipment.availability} />
          <StatusBadge status={equipment.condition} />
          {equipment.documentationOnFile && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-success-foreground">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              Documentation on file
            </span>
          )}
        </div>

        {equipment.description && (
          <p className="text-sm text-ink-muted">{equipment.description}</p>
        )}

        <DetailList>
          <DetailField label="Equipment ID">{equipment.id}</DetailField>
          <DetailField label="Internal reference">{equipment.internalReference || '—'}</DetailField>
          <DetailField label="Category">{equipment.category}</DetailField>
          <DetailField label="Condition">{equipment.condition}</DetailField>
          <DetailField label="Institution">{institution?.name ?? '—'}</DetailField>
          <DetailField label="City">{equipment.city}</DetailField>
          <DetailField label="Total quantity">{equipment.quantity}</DetailField>
          <DetailField label="Available quantity">{equipment.availableQuantity}</DetailField>
          <DetailField label="Availability start">{formatDate(equipment.availableFrom)}</DetailField>
          <DetailField label="Availability end">{formatDate(equipment.availableUntil)}</DetailField>
          <DetailField label="Last updated" className="sm:col-span-2">
            {formatDate(equipment.updatedAt)}
          </DetailField>
        </DetailList>

        {equipment.maintenanceNotes && (
          <div className="rounded-field border border-line bg-surface-muted/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-subtle">
              Maintenance &amp; calibration
            </p>
            <p className="mt-1 text-sm text-ink">{equipment.maintenanceNotes}</p>
          </div>
        )}

        <p className="text-xs text-ink-subtle">
          Inventory shown here is sample prototype data and is not a recommendation for clinical use.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 border-t border-line pt-4">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        {onEdit && (
          <Button variant="outline" onClick={() => onEdit(equipment)}>
            <Pencil className="h-4 w-4" aria-hidden="true" />
            Edit
          </Button>
        )}
        {onDelete && (
          <Button variant="danger" onClick={() => onDelete(equipment)}>
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Delete
          </Button>
        )}
        <Button onClick={() => onRequestSimilar(equipment)}>
          <Stethoscope className="h-4 w-4" aria-hidden="true" />
          Find / request similar equipment
        </Button>
      </div>
    </Drawer>
  );
}
