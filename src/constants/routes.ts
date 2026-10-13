/**
 * Single source of truth for application route paths.
 * Using constants avoids scattered string literals across links and guards.
 */
export const ROUTES = {
  home: '/',
  login: '/login',
  signup: '/signup',
  app: {
    root: '/app',
    equipment: '/app/equipment',
    findEquipment: '/app/find-equipment',
    requests: '/app/requests',
    transfers: '/app/transfers',
    hospitals: '/app/hospitals',
    activity: '/app/activity',
    settings: '/app/settings',
  },
  /** Sentinel used by the router for unmatched paths. */
  notFound: '*',
} as const;

export type AppSection = keyof typeof ROUTES.app;
