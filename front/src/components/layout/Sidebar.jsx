import { NavLink } from 'react-router-dom';
import {
  ArrowLeftRight,
  Home,
  Landmark,
  Plus,
  Target,
  Wallet,
  WalletCards,
} from 'lucide-react';
import { useFinance } from '../../context/useFinance.js';
import { useLanguage } from '../../context/useLanguage.js';
import { useAuth } from '../../context/useAuth.js';
import LanguageToggle from './LanguageToggle.jsx';

export default function Sidebar() {
  const { openAdd } = useFinance();
  const { t } = useLanguage();
  const { user, logout } = useAuth();

  const links = [
    { to: '/', label: t('nav.home'), icon: Home, end: true },
    { to: '/transactions', label: t('nav.transactions'), icon: ArrowLeftRight },
    { to: '/budget', label: t('nav.budget'), icon: Wallet },
    { to: '/goals', label: t('nav.goals'), icon: Target },
    { to: '/accounts', label: t('nav.accounts'), icon: Landmark },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-mark">
          <WalletCards size={18} />
        </span>
        {t('appName')}
      </div>
      <nav className="sidebar-nav" aria-label={t('nav.home')}>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                isActive ? 'nav-link is-active' : 'nav-link'
              }
            >
              <Icon size={18} strokeWidth={1.75} />
              {link.label}
            </NavLink>
          );
        })}
      </nav>
      <div className="sidebar-footer">
        {user ? <p className="sidebar-user">{user.name}</p> : null}
        <LanguageToggle />
        <button type="button" className="btn btn-primary btn-block sidebar-add" onClick={openAdd}>
          <Plus size={18} />
          {t('nav.addTransaction')}
        </button>
        <button type="button" className="btn btn-ghost btn-block" onClick={logout}>
          {t('auth.logout')}
        </button>
      </div>
    </aside>
  );
}
