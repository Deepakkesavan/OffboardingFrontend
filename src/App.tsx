import { Routes, Route } from 'react-router-dom';
// @ts-ignore: support for CSS side-effect import
import './styles/global.css';

// import Sidebar         from './components/Sidebar';
import DevRoleSwitcher from './components/DevRoleSwitcher';
import { ROUTES }      from './app.routes';

export default function App() {
  return (
    <div className="app-shell">
      {/* <Sidebar /> */}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginLeft: '240px' }}>
        {/* DEV ONLY — remove in Phase 2 */}
        <DevRoleSwitcher />

        <main className="main-content" style={{ marginLeft: 0 }}>
          <Routes>
            {ROUTES.map((route) => (
              <Route key={route.path} path={route.path} element={<route.element />} />
            ))}
          </Routes>
        </main>
      </div>
    </div>
  );
}