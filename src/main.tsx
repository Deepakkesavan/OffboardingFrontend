import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
// @ts-ignore: support for CSS side-effect import

import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
    <BrowserRouter basename="/">
      <App />
    </BrowserRouter>
);