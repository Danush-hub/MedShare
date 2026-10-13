import {
  Activity,
  Armchair,
  ScanLine,
  Siren,
  Stethoscope,
  Wind,
  type LucideIcon,
} from 'lucide-react';
import type { EquipmentCategory } from '@/features/workspace';
import { cn } from '@/lib/cn';

const CATEGORY_ICONS: Record<EquipmentCategory, LucideIcon> = {
  'Patient Monitoring': Activity,
  'Respiratory Support': Wind,
  'Diagnostic Equipment': ScanLine,
  'Emergency Equipment': Siren,
  'Mobility & Patient Care': Armchair,
  'Surgical Support': Stethoscope,
};

export function categoryIcon(category: EquipmentCategory): LucideIcon {
  return CATEGORY_ICONS[category] ?? Activity;
}

interface EquipmentCategoryIconProps {
  category: EquipmentCategory;
  className?: string;
}

/** Consistent category glyph used across inventory, discovery and detail views. */
export function EquipmentCategoryIcon({ category, className }: EquipmentCategoryIconProps) {
  const Icon = categoryIcon(category);
  return (
    <span
      className={cn(
        'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-field bg-primary-light text-primary',
        className,
      )}
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
    </span>
  );
}
