import {
  Boxes,
  CheckCircle2,
  FileText,
  Pencil,
  Settings,
  Trash2,
  Truck,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import type { ActivityType } from './types';

interface ActivityMeta {
  icon: LucideIcon;
  tone: string;
  label: string;
}

/** Shared visual language for the activity feed across dashboard + history. */
export const ACTIVITY_META: Record<ActivityType, ActivityMeta> = {
  equipment_created: { icon: Boxes, tone: 'text-primary', label: 'Equipment created' },
  equipment_updated: { icon: Pencil, tone: 'text-info-foreground', label: 'Equipment updated' },
  equipment_deleted: { icon: Trash2, tone: 'text-error', label: 'Equipment removed' },
  request_submitted: { icon: FileText, tone: 'text-primary', label: 'Request submitted' },
  request_approved: { icon: CheckCircle2, tone: 'text-success', label: 'Request approved' },
  request_rejected: { icon: XCircle, tone: 'text-error', label: 'Request rejected' },
  request_cancelled: { icon: XCircle, tone: 'text-ink-muted', label: 'Request cancelled' },
  transfer_created: { icon: Truck, tone: 'text-primary', label: 'Transfer prepared' },
  transfer_updated: { icon: Truck, tone: 'text-info-foreground', label: 'Transfer updated' },
  settings_updated: { icon: Settings, tone: 'text-ink-muted', label: 'Settings updated' },
};
