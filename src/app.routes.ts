/**
 * app.routes.ts
 * Centralized route configuration for Offboarding UI
 */

import Dashboard         from './screens/Dashboard';
import NewRequest        from './screens/NewRequest';
import OffboardingDetail from './screens/offboardingDetail';
import HRQueue           from './screens/hr/HRQueue';
import type { RouteDefinition, NavRouteDefinition } from './types';

export const ROUTES: RouteDefinition[] = [
  { path: '/',         name: 'Overview',        element: Dashboard         },
  { path: '/exits',    name: 'Exit Cases',      element: Dashboard         },
  { path: '/exits/:id',name: 'Exit Case Detail', element: OffboardingDetail },
  { path: '/hr-queue', name: 'HR Queue',        element: HRQueue           },
  { path: '/initiate', name: 'Initiate Exit',   element: NewRequest        },
];

export const NAV_ROUTES: NavRouteDefinition[] = [
  { path: '/',         name: 'Overview',      icon: '🏠' },
  { path: '/exits',    name: 'Exit Cases',    icon: '🚪' },
  { path: '/hr-queue', name: 'HR Queue',      icon: '📋' },
  { path: '/initiate', name: 'Initiate Exit', icon: '➕' },
];

export const exitDetailPath = (id: string): string => `/exits/${id}`;