import type { ActivityService } from './activity';
import type { AuthService } from './auth';
import type { EquipmentService } from './equipment';
import type { HospitalService } from './hospitals';
import type { RequestService } from './requests';
import type { SettingsService } from './settings';
import type { TransferService } from './transfers';

export type { AuthService } from './auth';
export type { EquipmentService, EquipmentDraft } from './equipment';
export type { RequestService, RequestDraft } from './requests';
export type { TransferService, TransferTransitionOptions } from './transfers';
export type { HospitalService } from './hospitals';
export type { ActivityService } from './activity';
export type { SettingsService } from './settings';

/**
 * The complete set of feature services consumed through `useServices()`.
 * Each member is a contract interface — implementations are selected by the
 * service factory in `src/services/config/factory.ts`.
 */
export interface AppServices {
  auth: AuthService;
  hospitals: HospitalService;
  equipment: EquipmentService;
  requests: RequestService;
  transfers: TransferService;
  activity: ActivityService;
  settings: SettingsService;
}
