import { useEffect, useState, type FormEvent } from 'react';
import { Modal } from '@/components/ui/Overlay';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { formatDate, todayISO } from '@/lib/format';
import type { EquipmentItem, Institution } from '@/features/workspace';
import type { RequestDraft } from '@/features/workspace/store';

interface RequestEquipmentModalProps {
  open: boolean;
  onClose: () => void;
  equipment: EquipmentItem | null;
  requestingInstitution: Institution | undefined;
  onSubmit: (draft: RequestDraft) => void | Promise<void>;
}

interface FormState {
  quantity: number;
  purpose: string;
  requiredDate: string;
  expectedReturnDate: string;
  deliveryLocation: string;
  notes: string;
}

function initialForm(_equipment: EquipmentItem | null, institution?: Institution): FormState {
  return {
    quantity: 1,
    purpose: '',
    requiredDate: '',
    expectedReturnDate: '',
    deliveryLocation: institution ? `${institution.name}, ${institution.city}` : '',
    notes: '',
  };
}

/** Request-to-borrow modal with local validation; creates a Pending request only. */
export function RequestEquipmentModal({
  open,
  onClose,
  equipment,
  requestingInstitution,
  onSubmit,
}: RequestEquipmentModalProps) {
  const [form, setForm] = useState<FormState>(() => initialForm(equipment, requestingInstitution));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(initialForm(equipment, requestingInstitution));
      setErrors({});
      setSubmitting(false);
    }
  }, [open, equipment, requestingInstitution]);

  if (!equipment) return null;

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!Number.isInteger(form.quantity) || form.quantity < 1)
      next.quantity = 'Enter a whole quantity of at least 1.';
    else if (form.quantity > equipment.availableQuantity)
      next.quantity = `Only ${equipment.availableQuantity} unit(s) are listed as available.`;
    if (!form.purpose.trim()) next.purpose = 'State the intended use or reason.';
    if (!form.requiredDate) next.requiredDate = 'Choose a required date.';
    if (!form.expectedReturnDate) next.expectedReturnDate = 'Choose an expected return date.';
    if (form.requiredDate && form.expectedReturnDate && form.expectedReturnDate < form.requiredDate)
      next.expectedReturnDate = 'Return date must be on or after the required date.';
    if (!form.deliveryLocation.trim()) next.deliveryLocation = 'Provide a delivery location.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    // Guard against a second submit firing before the first resolves; a
    // duplicate create would mint a second request id.
    if (submitting) return;
    if (!validate()) return;
    setSubmitting(true);
    try {
      await onSubmit({
        equipmentId: equipment.id,
        requestingInstitutionId: requestingInstitution?.id ?? '',
        supplyingInstitutionId: equipment.institutionId,
        quantity: form.quantity,
        purpose: form.purpose.trim(),
        requestedDate: todayISO(),
        requiredDate: form.requiredDate,
        expectedReturnDate: form.expectedReturnDate,
        deliveryLocation: form.deliveryLocation.trim(),
        notes: form.notes.trim() || undefined,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Request Equipment"
      description={equipment.name}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" form="request-form" isLoading={submitting} disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit request'}
          </Button>
        </>
      }
    >
      <div className="mb-4 rounded-field border border-primary-100 bg-primary-light px-4 py-3 text-sm text-info-foreground">
        <p>
          <span className="font-semibold">Requesting:</span> {equipment.name} ({equipment.category})
        </p>
        <p className="mt-0.5 text-ink-muted">
          {equipment.availableQuantity} of {equipment.quantity} unit(s) available ·{' '}
          {requestingInstitution?.name ?? 'Your institution'}
        </p>
      </div>

      <form id="request-form" onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2" noValidate>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="rq-institution">Requesting institution</Label>
          <Input id="rq-institution" value={requestingInstitution?.name ?? ''} readOnly disabled />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="rq-quantity" required>
            Requested quantity
          </Label>
          <Input
            id="rq-quantity"
            type="number"
            min={1}
            max={equipment.availableQuantity}
            value={form.quantity}
            invalid={Boolean(errors.quantity)}
            onChange={(e) => set('quantity', Number(e.target.value))}
          />
          {errors.quantity && <p className="text-xs text-error">{errors.quantity}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="rq-delivery" required>
            Delivery location
          </Label>
          <Input
            id="rq-delivery"
            value={form.deliveryLocation}
            invalid={Boolean(errors.deliveryLocation)}
            onChange={(e) => set('deliveryLocation', e.target.value)}
          />
          {errors.deliveryLocation && <p className="text-xs text-error">{errors.deliveryLocation}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="rq-required" required>
            Required by
          </Label>
          <Input
            id="rq-required"
            type="date"
            value={form.requiredDate}
            invalid={Boolean(errors.requiredDate)}
            onChange={(e) => set('requiredDate', e.target.value)}
          />
          {errors.requiredDate && <p className="text-xs text-error">{errors.requiredDate}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="rq-return" required>
            Expected return
          </Label>
          <Input
            id="rq-return"
            type="date"
            value={form.expectedReturnDate}
            invalid={Boolean(errors.expectedReturnDate)}
            onChange={(e) => set('expectedReturnDate', e.target.value)}
          />
          {errors.expectedReturnDate && (
            <p className="text-xs text-error">{errors.expectedReturnDate}</p>
          )}
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="rq-purpose" required>
            Intended use / reason
          </Label>
          <Textarea
            id="rq-purpose"
            value={form.purpose}
            invalid={Boolean(errors.purpose)}
            onChange={(e) => set('purpose', e.target.value)}
            placeholder="Explain why the equipment is needed and for how long."
          />
          {errors.purpose && <p className="text-xs text-error">{errors.purpose}</p>}
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="rq-notes">Additional notes</Label>
          <Textarea
            id="rq-notes"
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            placeholder="Handling, access or scheduling notes (optional)."
          />
        </div>
      </form>

      <p className="mt-4 rounded-field bg-surface-muted px-3 py-2 text-xs text-ink-muted">
        Equipment availability and suitability must be confirmed by the supplying institution before
        transfer. Submitting a request does not reserve stock or approve a transfer. Requested on{' '}
        {formatDate(todayISO())}.
      </p>
    </Modal>
  );
}
