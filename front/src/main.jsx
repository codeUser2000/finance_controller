import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/theme.css';
import './styles/globals.css';
import { initTheme } from './utils/applySystemTheme.js';
import { ThemeProvider } from './context/ThemeProvider.jsx';
import App from './App.jsx';

initTheme();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
);
