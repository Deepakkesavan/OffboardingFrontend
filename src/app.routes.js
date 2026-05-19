/**
 * app.routes.js
 * Centralized route configuration for Offboarding UI
 * Base path: /offui
 */

import Dashboard         from './screens/Dashboard';
import NewRequest        from './screens/NewRequest';
import OffboardingDetail from './screens/offboardingDetail';
import HRQueue           from './screens/hr/HRQueue';

/**
 * Route definitions
 * - path    : relative to basename (/offui)
 * - name    : human-readable label used in nav, breadcrumbs, page titles
 * - element : React component to render
 */
export const ROUTES = [
  {
    path:    '/',
    name:    'Overview',
    element: Dashboard,
  },
  {
    path:    '/exits',
    name:    'Exit Cases',
    element: Dashboard,
  },
  {
    path:    '/exits/:id',
    name:    'Exit Case Detail',
    element: OffboardingDetail,
  },
  {
    path:    '/hr-queue',
    name:    'HR Queue',
    element: HRQueue,
  },
  {
    path:    '/initiate',
    name:    'Initiate Exit',
    element: NewRequest,
  },
];

/**
 * Nav items — subset of ROUTES shown in the sidebar
 * (detail pages are excluded from nav)
 */
export const NAV_ROUTES = [
  { path: '/',          name: 'Overview',     icon: '🏠' },
  { path: '/exits',     name: 'Exit Cases',   icon: '🚪' },
  { path: '/hr-queue',  name: 'HR Queue',     icon: '📋' },
  { path: '/initiate',  name: 'Initiate Exit',icon: '➕' },
];

/**
 * Helper — build a detail page path from an exit case ID
 */
export const exitDetailPath = (id) => `/exits/${id}`;