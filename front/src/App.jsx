import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageProvider.jsx';
import { FinanceProvider } from './context/FinanceContext.jsx';
import AppLayout from './components/layout/AppLayout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Transactions from './pages/Transactions.jsx';
import Budget from './pages/Budget.jsx';
import Goals from './pages/Goals.jsx';
import Accounts from './pages/Accounts.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <FinanceProvider>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/budget" element={<Budget />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/accounts" element={<Accounts />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </FinanceProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
