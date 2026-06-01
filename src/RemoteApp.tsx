import { StrictMode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
// @ts-ignore: CSS import types are handled outside this file
import './index.css';

// When consumed as a Module Federation remote inside an Angular (or any non-React)
// shell, BrowserRouter fails because the shell owns the real browser history and
// there is no shared React instance to satisfy useRef. MemoryRouter keeps routing
// fully self-contained inside this micro-frontend without touching window.history.
const RemoteApp = () => (
  <StrictMode>
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>
  </StrictMode>
);

export default RemoteApp;
