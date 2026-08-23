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

const links = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/budget', label: 'Budget', icon: Wallet },
  { to: '/goals', label: 'Goals', icon: Target },
  { to: '/accounts', label: 'Accounts', icon: Landmark },
];

export default function Sidebar() {
  const { openAdd } = useFinance();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-mark">
          <WalletCards size={18} />
        </span>
        Money Manager
      </div>
      <nav className="sidebar-nav" aria-label="Main">
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
      <button type="button" className="btn btn-primary btn-block sidebar-add" onClick={openAdd}>
        <Plus size={18} />
        Add transaction
      </button>
    </aside>
  );
}
