import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './styles/global.css';

import Sidebar           from './components/Sidebar';
import DevRoleSwitcher   from './components/DevRoleSwitcher';
import Dashboard         from './screens/Dashboard';
import NewRequest        from './screens/NewRequest';
import OffboardingDetail from './screens/offboardingDetail';
import HRQueue           from './screens/hr/HRQueue';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename="/workforce/offboarding">
        <div className="app-shell">
          <Sidebar />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginLeft: '240px' }}>
            {/* DEV ONLY — delete in Phase 2 */}
            <DevRoleSwitcher />
            <main className="main-content" style={{ marginLeft: 0 }}>
              <Routes>
                <Route path="/"                 element={<Dashboard />} />
                <Route path="/offboarding"      element={<Dashboard />} />
                <Route path="/offboarding/:id"  element={<OffboardingDetail />} />
                <Route path="/hr-queue"         element={<HRQueue />} />
                <Route path="/new"              element={<NewRequest />} />
              </Routes>
            </main>
          </div>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}