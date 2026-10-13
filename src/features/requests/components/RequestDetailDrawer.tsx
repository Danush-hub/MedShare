import { Truck } from 'lucide-react';
import { Drawer } from '@/components/ui/Overlay';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DetailField, DetailList } from '@/components/ui/Detail';
import { Timeline } from '@/components/ui/Timeline';
import { formatDate } from '@/lib/format';
import type { Institution, ShareRequest } from '@/features/workspace';

interface RequestDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  request: ShareRequest | null;
  institutions: Institution[];
  currentInstitutionId: string;
  hasTransfer: boolean;
  /** Capability flags from the permission model (default: allowed). */
  canApprove?: boolean;
  canCancel?: boolean;
  canDispatch?: boolean;
  onApprove: (request: ShareRequest) => void;
  onReject: (request: ShareRequest) => void;
  onCancel: (request: ShareRequest) => void;
  onCreateTransfer: (request: ShareRequest) => void;
}

/** Detailed request view with workflow actions scoped by direction + status. */
export function RequestDetailDrawer({
  open,
  onClose,
  request,
  institutions,
  currentInstitutionId,
  hasTransfer,
  canApprove = true,
  canCancel = true,
  canDispatch = true,
  onApprove,
  onReject,
  onCancel,
  onCreateTransfer,
}: RequestDetailDrawerProps) {
  if (!request) return null;

  const name = (id: string) => institutions.find((i) => i.id === id)?.name ?? id;
  const isIncoming = request.supplyingInstitutionId === currentInstitutionId;
  const isOutgoing = request.requestingInstitutionId === currentInstitutionId;
  const canDecide = isIncoming && request.status === 'Pending' && canApprove;
  const canCancelThis = isOutgoing && request.status === 'Pending' && canCancel;
  const canPrepareTransfer = isIncoming && request.status === 'Approved' && !hasTransfer && canDispatch;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={`Request ${request.id}`}
      description={request.equipmentName}
      ariaLabel={`Request ${request.id}`}
      size="lg"
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={request.status} />
          <Badge tone={isIncoming ? 'info' : 'neutral'}>{isIncoming ? 'Incoming' : 'Outgoing'}</Badge>
        </div>

        <DetailList>
          <DetailField label="Equipment">{request.equipmentName}</DetailField>
          <DetailField label="Equipment ID">{request.equipmentId}</DetailField>
          <DetailField label="Requesting institution">{name(request.requestingInstitutionId)}</DetailField>
          <DetailField label="Supplying institution">{name(request.supplyingInstitutionId)}</DetailField>
          <DetailField label="Requested quantity">{request.quantity}</DetailField>
          <DetailField label="Requested on">{formatDate(request.requestedDate)}</DetailField>
          <DetailField label="Required by">{formatDate(request.requiredDate)}</DetailField>
          <DetailField label="Expected return">{formatDate(request.expectedReturnDate)}</DetailField>
          <DetailField label="Delivery location" className="sm:col-span-2">
            {request.deliveryLocation}
          </DetailField>
          <DetailField label="Purpose" className="sm:col-span-2">
            {request.purpose}
          </DetailField>
          {request.notes && (
            <DetailField label="Notes" className="sm:col-span-2">
              {request.notes}
            </DetailField>
          )}
          {request.rejectReason && (
            <DetailField label="Rejection reason" className="sm:col-span-2">
              <span className="text-error-foreground">{request.rejectReason}</span>
            </DetailField>
          )}
        </DetailList>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-ink">Status history</h3>
          <Timeline items={request.history} />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 border-t border-line pt-4">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        {canDecide && (
          <>
            <Button variant="danger" onClick={() => onReject(request)}>
              Reject
            </Button>
            <Button onClick={() => onApprove(request)}>Approve</Button>
          </>
        )}
        {canCancelThis && (
          <Button variant="danger" onClick={() => onCancel(request)}>
            Cancel request
          </Button>
        )}
        {canPrepareTransfer && (
          <Button onClick={() => onCreateTransfer(request)}>
            <Truck className="h-4 w-4" aria-hidden="true" />
            Prepare transfer
          </Button>
        )}
      </div>
    </Drawer>
  );
}
