import { NavLink } from 'react-router-dom';
import { ArrowLeftRight, Home, Plus, Target, Wallet } from 'lucide-react';
import { useFinance } from '../../context/useFinance.js';
import { useLanguage } from '../../context/useLanguage.js';

export default function MobileNav() {
  const { openAdd } = useFinance();
  const { t } = useLanguage();

  const links = [
    { to: '/', label: t('nav.home'), icon: Home, end: true },
    { to: '/transactions', label: t('nav.transactions'), icon: ArrowLeftRight },
    { to: '/budget', label: t('nav.budget'), icon: Wallet },
    { to: '/goals', label: t('nav.goals'), icon: Target },
  ];

  return (
    <nav className="mobile-nav" aria-label={t('nav.home')}>
      {links.slice(0, 2).map((link) => {
        const Icon = link.icon;
        return (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              isActive ? 'mobile-nav-link is-active' : 'mobile-nav-link'
            }
          >
            <Icon size={20} strokeWidth={1.75} />
            {link.label}
          </NavLink>
        );
      })}

      <div className="mobile-nav-add-wrap">
        <button
          type="button"
          className="mobile-nav-add"
          onClick={openAdd}
          aria-label={t('nav.addTransaction')}
        >
          <Plus size={22} />
        </button>
        {t('nav.add')}
      </div>

      {links.slice(2).map((link) => {
        const Icon = link.icon;
        return (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              isActive ? 'mobile-nav-link is-active' : 'mobile-nav-link'
            }
          >
            <Icon size={20} strokeWidth={1.75} />
            {link.label}
          </NavLink>
        );
      })}
    </nav>
  );
}
