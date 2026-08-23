import { Link, Outlet } from 'react-router-dom';
import { Landmark, WalletCards } from 'lucide-react';
import Sidebar from './Sidebar.jsx';
import MobileNav from './MobileNav.jsx';
import AddTransactionModal from '../transactions/AddTransactionModal.jsx';

export default function AppLayout() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-area">
        <header className="mobile-topbar">
          <Link to="/" className="mobile-topbar-brand">
            <span className="brand-mark">
              <WalletCards size={18} />
            </span>
            Money Manager
          </Link>
          <Link to="/accounts" className="icon-button" aria-label="Accounts">
            <Landmark size={18} />
          </Link>
        </header>
        <main className="app-content">
          <Outlet />
        </main>
      </div>
      <MobileNav />
      <AddTransactionModal />
    </div>
  );
}
