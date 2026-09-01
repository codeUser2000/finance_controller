import { Link, Outlet } from 'react-router-dom';
import { Landmark, User } from 'lucide-react';
import Sidebar from './Sidebar.jsx';
import MobileNav from './MobileNav.jsx';
import LanguageToggle from './LanguageToggle.jsx';
import AppIcon from '../shared/AppIcon.jsx';
import AddTransactionModal from '../transactions/AddTransactionModal.jsx';
import { useFinance } from '../../context/useFinance.js';
import { useLanguage } from '../../context/useLanguage.js';

export default function AppLayout() {
  const { loading, error } = useFinance();
  const { t } = useLanguage();

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-area">
        <header className="mobile-topbar">
          <Link to="/" className="mobile-topbar-brand">
            <span className="brand-mark">
              <AppIcon size={36} />
            </span>
            {t('appName')}
          </Link>
          <div className="mobile-topbar-actions">
            <LanguageToggle compact />
            <Link to="/accounts" className="icon-button" aria-label={t('nav.accounts')}>
              <Landmark size={18} />
            </Link>
            <Link to="/profile" className="icon-button" aria-label={t('nav.profile')}>
              <User size={18} />
            </Link>
          </div>
        </header>
        <main className="app-content">
          {error ? <p className="app-banner">{t('errors.loadFailed')}</p> : null}
          {loading ? (
            <p className="loading-copy">{t('errors.loading')}</p>
          ) : (
            <div className="page-body">
              <Outlet />
            </div>
          )}
        </main>
      </div>
      <MobileNav />
      <AddTransactionModal />
    </div>
  );
}
