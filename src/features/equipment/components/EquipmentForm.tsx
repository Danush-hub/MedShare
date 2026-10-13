import { useEffect, useState, type FormEvent } from 'react';
import { Modal } from '@/components/ui/Overlay';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import {
  EQUIPMENT_AVAILABILITIES,
  EQUIPMENT_CATEGORIES,
  EQUIPMENT_CONDITIONS,
  type EquipmentAvailability,
  type EquipmentCategory,
  type EquipmentCondition,
  type EquipmentItem,
  type Institution,
} from '@/features/workspace';
import type { EquipmentDraft } from '@/features/workspace/store';

type FormValues = Omit<EquipmentItem, 'id' | 'updatedAt'>;

interface EquipmentFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (draft: EquipmentDraft) => void | Promise<void>;
  institutions: Institution[];
  /** Existing record when editing; null when adding. */
  initial: EquipmentItem | null;
  defaultInstitutionId: string;
}

function blank(institutionId: string): FormValues {
  return {
    name: '',
    category: 'Patient Monitoring',
    internalReference: '',
    institutionId,
    quantity: 1,
    availableQuantity: 1,
    city: '',
    condition: 'Good',
    availability: 'Available',
    description: '',
    maintenanceNotes: '',
    availableFrom: '',
    availableUntil: '',
    documentationOnFile: false,
  };
}

/** Add / edit equipment modal with local validation and no server calls. */
export function EquipmentForm({
  open,
  onClose,
  onSubmit,
  institutions,
  initial,
  defaultInstitutionId,
}: EquipmentFormProps) {
  const [values, setValues] = useState<FormValues>(() => blank(defaultInstitutionId));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValues(initial ? { ...initial } : blank(defaultInstitutionId));
    setErrors({});
    setSubmitting(false);
  }, [open, initial, defaultInstitutionId]);

  const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!values.name.trim()) next.name = 'Equipment name is required.';
    if (!(values.internalReference ?? '').trim()) next.internalReference = 'Reference is required.';
    if (!values.institutionId) next.institutionId = 'Select an institution.';
    if (!values.city.trim()) next.city = 'City is required.';
    if (!Number.isInteger(values.quantity) || values.quantity < 1)
      next.quantity = 'Quantity must be a whole number of at least 1.';
    if (!Number.isInteger(values.availableQuantity) || values.availableQuantity < 0)
      next.availableQuantity = 'Available must be a whole number of 0 or more.';
    else if (values.availableQuantity > values.quantity)
      next.availableQuantity = 'Available must be between 0 and total quantity.';
    if (values.availableFrom && values.availableUntil && values.availableUntil < values.availableFrom)
      next.availableUntil = 'End date must be on or after the start date.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    // Prevent a duplicate listing if the button is clicked twice before the
    // first create resolves (each save mints a new id).
    if (submitting) return;
    if (!validate()) return;
    const draft: EquipmentDraft = {
      ...values,
      availableFrom: values.availableFrom || undefined,
      availableUntil: values.availableUntil || undefined,
      description: values.description?.trim() || undefined,
      maintenanceNotes: values.maintenanceNotes?.trim() || undefined,
    };
    setSubmitting(true);
    try {
      await onSubmit(draft);
    } finally {
      setSubmitting(false);
    }
  };

  const institutionOptions = institutions.map((institution) => ({
    value: institution.id,
    label: `${institution.name} · ${institution.city}`,
  }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? `Edit ${initial.name}` : 'Add Equipment'}
      description={
        initial
          ? 'Update the equipment record. Changes apply to this prototype session only.'
          : 'Create a sample equipment listing. Nothing is saved to a server.'
      }
      size="lg"
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" form="equipment-form" isLoading={submitting} disabled={submitting}>
            {submitting ? 'Saving…' : initial ? 'Save changes' : 'Add equipment'}
          </Button>
        </>
      }
    >
      <form id="equipment-form" onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2" noValidate>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="eq-name" required>
            Equipment name
          </Label>
          <Input
            id="eq-name"
            value={values.name}
            invalid={Boolean(errors.name)}
            onChange={(e) => set('name', e.target.value)}
            placeholder="e.g. Multiparameter Patient Monitor"
          />
          {errors.name && <p className="text-xs text-error">{errors.name}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="eq-ref" required>
            Equipment ID / reference
          </Label>
          <Input
            id="eq-ref"
            value={values.internalReference ?? ''}
            invalid={Boolean(errors.internalReference)}
            onChange={(e) => set('internalReference', e.target.value)}
            placeholder="e.g. PM-8 / internal asset tag"
          />
          {errors.internalReference && <p className="text-xs text-error">{errors.internalReference}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="eq-category" required>
            Category
          </Label>
          <Select
            id="eq-category"
            value={values.category}
            options={EQUIPMENT_CATEGORIES.map((c) => ({ value: c, label: c }))}
            onChange={(e) => set('category', e.target.value as EquipmentCategory)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="eq-institution" required>
            Institution
          </Label>
          <Select
            id="eq-institution"
            value={values.institutionId}
            options={institutionOptions}
            invalid={Boolean(errors.institutionId)}
            onChange={(e) => set('institutionId', e.target.value)}
          />
          {errors.institutionId && <p className="text-xs text-error">{errors.institutionId}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="eq-city" required>
            City
          </Label>
          <Input
            id="eq-city"
            value={values.city}
            invalid={Boolean(errors.city)}
            onChange={(e) => set('city', e.target.value)}
            placeholder="e.g. Bengaluru"
          />
          {errors.city && <p className="text-xs text-error">{errors.city}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="eq-quantity" required>
            Total quantity
          </Label>
          <Input
            id="eq-quantity"
            type="number"
            min={1}
            value={values.quantity}
            invalid={Boolean(errors.quantity)}
            onChange={(e) => set('quantity', Number(e.target.value))}
          />
          {errors.quantity && <p className="text-xs text-error">{errors.quantity}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="eq-available" required>
            Available quantity
          </Label>
          <Input
            id="eq-available"
            type="number"
            min={0}
            value={values.availableQuantity}
            invalid={Boolean(errors.availableQuantity)}
            onChange={(e) => set('availableQuantity', Number(e.target.value))}
          />
          {errors.availableQuantity && <p className="text-xs text-error">{errors.availableQuantity}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="eq-condition" required>
            Condition
          </Label>
          <Select
            id="eq-condition"
            value={values.condition}
            options={EQUIPMENT_CONDITIONS.map((c) => ({ value: c, label: c }))}
            onChange={(e) => set('condition', e.target.value as EquipmentCondition)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="eq-availability" required>
            Availability status
          </Label>
          <Select
            id="eq-availability"
            value={values.availability}
            options={EQUIPMENT_AVAILABILITIES.map((c) => ({ value: c, label: c }))}
            onChange={(e) => set('availability', e.target.value as EquipmentAvailability)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="eq-from">Availability start</Label>
          <Input
            id="eq-from"
            type="date"
            value={values.availableFrom ?? ''}
            onChange={(e) => set('availableFrom', e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="eq-until">Availability end</Label>
          <Input
            id="eq-until"
            type="date"
            value={values.availableUntil ?? ''}
            invalid={Boolean(errors.availableUntil)}
            onChange={(e) => set('availableUntil', e.target.value)}
          />
          {errors.availableUntil && <p className="text-xs text-error">{errors.availableUntil}</p>}
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="eq-description">Short description</Label>
          <Textarea
            id="eq-description"
            value={values.description ?? ''}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Brief description shown to borrowing institutions."
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="eq-notes">Maintenance / calibration notes</Label>
          <Textarea
            id="eq-notes"
            value={values.maintenanceNotes ?? ''}
            onChange={(e) => set('maintenanceNotes', e.target.value)}
            placeholder="Servicing, calibration or handling notes."
          />
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-ink sm:col-span-2">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-line-strong accent-primary"
            checked={values.documentationOnFile}
            onChange={(e) => set('documentationOnFile', e.target.checked)}
          />
          Supporting documentation on file
        </label>
      </form>
    </Modal>
  );
}
