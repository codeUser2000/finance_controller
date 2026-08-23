import { NavLink } from 'react-router-dom';
import { ArrowLeftRight, Home, Plus, Target, Wallet } from 'lucide-react';
import { useFinance } from '../../context/useFinance.js';

const links = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/budget', label: 'Budget', icon: Wallet },
  { to: '/goals', label: 'Goals', icon: Target },
];

export default function MobileNav() {
  const { openAdd } = useFinance();

  return (
    <nav className="mobile-nav" aria-label="Mobile">
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
          aria-label="Add transaction"
        >
          <Plus size={22} />
        </button>
        Add
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
