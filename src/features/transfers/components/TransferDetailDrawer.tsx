import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Drawer } from '@/components/ui/Overlay';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DetailField, DetailList } from '@/components/ui/Detail';
import { Timeline } from '@/components/ui/Timeline';
import { formatDate } from '@/lib/format';
import {
  transferTransitionOptions,
  type Institution,
  type Transfer,
  type TransferStatus,
} from '@/features/workspace';

interface TransferDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  transfer: Transfer | null;
  institutions: Institution[];
  currentInstitutionId: string;
  /** Whether the active role may record transfer status changes (default: allowed). */
  canUpdate?: boolean;
  onAdvance: (transfer: Transfer, status: TransferStatus) => void;
}

/** Detailed transfer view with a timeline and controlled status transitions. */
export function TransferDetailDrawer({
  open,
  onClose,
  transfer,
  institutions,
  currentInstitutionId,
  canUpdate = true,
  onAdvance,
}: TransferDetailDrawerProps) {
  if (!transfer) return null;
  const name = (id: string) => institutions.find((i) => i.id === id)?.name ?? id;
  const { available, counterpartOwned } = transferTransitionOptions(transfer, currentInstitutionId);
  const isSupplier = transfer.sendingInstitutionId === currentInstitutionId;
  const isReceiver = transfer.receivingInstitutionId === currentInstitutionId;
  const isParticipant = isSupplier || isReceiver;
  const counterpartName = isSupplier
    ? name(transfer.receivingInstitutionId)
    : name(transfer.sendingInstitutionId);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={`Transfer ${transfer.id}`}
      description={transfer.equipmentName}
      ariaLabel={`Transfer ${transfer.id}`}
      size="lg"
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={transfer.status} />
          {isSupplier && <span className="text-xs text-ink-subtle">You are the sending institution</span>}
          {isReceiver && <span className="text-xs text-ink-subtle">You are the receiving institution</span>}
        </div>

        <DetailList>
          <DetailField label="Related request">
            <Link
              to={`/app/requests?request=${transfer.requestId}`}
              className="text-primary hover:underline"
            >
              {transfer.requestId}
            </Link>
          </DetailField>
          <DetailField label="Equipment ID">{transfer.equipmentId}</DetailField>
          <DetailField label="Equipment">{transfer.equipmentName}</DetailField>
          <DetailField label="Quantity">{transfer.quantity}</DetailField>
          <DetailField label="Sending institution">{name(transfer.sendingInstitutionId)}</DetailField>
          <DetailField label="Receiving institution">{name(transfer.receivingInstitutionId)}</DetailField>
          <DetailField label="Dispatch date">{formatDate(transfer.dispatchDate)}</DetailField>
          <DetailField label="Expected return">{formatDate(transfer.expectedReturn)}</DetailField>
          {transfer.handoverNotes && (
            <DetailField label="Handover notes" className="sm:col-span-2">
              {transfer.handoverNotes}
            </DetailField>
          )}
        </DetailList>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-ink">Status timeline</h3>
          <Timeline items={transfer.timeline} />
        </div>

        <p className="text-xs text-ink-subtle">
          Status updates are manually entered prototype data. MedShare does not perform real shipment
          tracking, GPS or carrier integration.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-line pt-4">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        {canUpdate &&
          available.map((status) => (
            <Button key={status} size="sm" onClick={() => onAdvance(transfer, status)}>
              Advance to {status}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          ))}
        {!canUpdate && available.length > 0 && (
          <span className="text-sm text-ink-muted">
            Read-only role — you cannot record transfer status changes.
          </span>
        )}
        {available.length === 0 && counterpartOwned.length > 0 && isParticipant && (
          <span className="text-sm text-ink-muted">
            No action for you now — {counterpartName} records the next step ({counterpartOwned.join(' / ')}).
          </span>
        )}
        {available.length === 0 && counterpartOwned.length > 0 && !isParticipant && (
          <span className="text-sm text-ink-muted">
            Viewing only — {name(transfer.sendingInstitutionId)} and{' '}
            {name(transfer.receivingInstitutionId)} manage this transfer.
          </span>
        )}
        {available.length === 0 && counterpartOwned.length === 0 && (
          <span className="text-sm text-ink-muted">This transfer is {transfer.status.toLowerCase()}.</span>
        )}
      </div>
    </Drawer>
  );
}
