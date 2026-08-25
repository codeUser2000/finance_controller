import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth.js';
import { FinanceProvider } from '../../context/FinanceContext.jsx';
import AppLayout from './AppLayout.jsx';

export default function ProtectedLayout() {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return (
    <FinanceProvider>
      <AppLayout />
    </FinanceProvider>
  );
}
