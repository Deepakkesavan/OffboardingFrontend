import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from './app.routes';

 const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {ROUTES.map((route) => {
          const Component = route.element;

          return (
            <Route
              key={route.path}
              path={route.path}
              element={<Component />}
            />
          );
        })}

        {/* Optional: redirect unknown routes */}
        <Route path="*" element={<Navigate to="/offui" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;