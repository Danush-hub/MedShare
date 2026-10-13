import type { EquipmentCategory } from './types';
import { EQUIPMENT_CATEGORIES } from './types';
import type { EquipmentTransfer, MedicalEquipment } from '@/types/domain';

/**
 * Derived, record-backed metrics. Used by module summary rows that must stay
 * consistent with the visible data (transfers, hospitals, equipment) rather
 * than the dashboard's fixed demonstration headline numbers.
 *
 * These helpers now take the specific collections (as returned by the service
 * read contracts) instead of the whole store snapshot, so presentation pages
 * compute figures from service data without reading workspace state directly.
 */

export interface CategoryBreakdown {
  category: EquipmentCategory;
  total: number;
  available: number;
}

export function equipmentByCategory(equipment: MedicalEquipment[]): CategoryBreakdown[] {
  return EQUIPMENT_CATEGORIES.map((category) => {
    const items = equipment.filter((item) => item.category === category);
    return {
      category,
      total: items.reduce((sum, item) => sum + item.quantity, 0),
      available: items.reduce((sum, item) => sum + item.availableQuantity, 0),
    };
  });
}

export function institutionEquipmentCount(
  equipment: MedicalEquipment[],
  institutionId: string,
): number {
  return equipment
    .filter((item) => item.institutionId === institutionId)
    .reduce((sum, item) => sum + item.quantity, 0);
}

/** Transfer counts derived from the dataset for the transfers summary row. */
export function transferSummary(transfers: EquipmentTransfer[]) {
  const count = (statuses: string[]) =>
    transfers.filter((transfer) => statuses.includes(transfer.status)).length;
  return {
    awaitingDispatch: count(['Awaiting Dispatch']),
    inTransit: count(['Dispatched', 'In Transit']),
    received: count(['Received']),
    awaitingReturn: count(['Return Scheduled']),
    active: count(['Awaiting Dispatch', 'Dispatched', 'In Transit', 'Received', 'Return Scheduled']),
  };
}
