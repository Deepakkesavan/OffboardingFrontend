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
  { path: '/offui',         name: 'Overview',        element: Dashboard         },
  { path: '/offui/exits',    name: 'Exit Cases',      element: Dashboard         },
  { path: '/offui/exits/:id',name: 'Exit Case Detail', element: OffboardingDetail },
  { path: '/offui/hr-queue', name: 'HR Queue',        element: HRQueue           },
  { path: '/offui/initiate', name: 'Initiate Exit',   element: NewRequest        },
];

export const NAV_ROUTES: NavRouteDefinition[] = [
  { path: '/offui',         name: 'Overview',      icon: '🏠' },
  { path: '/offui/exits',    name: 'Exit Cases',    icon: '🚪' },
  { path: '/offui/hr-queue', name: 'HR Queue',      icon: '📋' },
  { path: '/offui/initiate', name: 'Initiate Exit', icon: '➕' },
];

export const exitDetailPath = (id: string): string => `/exits/${id}`;