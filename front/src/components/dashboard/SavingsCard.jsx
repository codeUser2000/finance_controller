import { Car, Shield } from 'lucide-react';
import { formatMoney, formatPercent } from '../../utils/formatMoney.js';
import ProgressBar from '../shared/ProgressBar.jsx';

export default function SavingsCard({ goal }) {
  const remaining = Math.max(goal.target - goal.current, 0);
  const percent = formatPercent(goal.current, goal.target);
  const Icon = goal.id === 'car' ? Car : Shield;

  return (
    <article className="card savings-card">
      <div className="savings-card-top">
        <span className="icon-badge icon-badge--secondary">
          <Icon size={18} strokeWidth={1.75} />
        </span>
        <p className="savings-percent">{percent}%</p>
      </div>
      <p className="card-name">{goal.name}</p>
      <p className="card-meta">{formatMoney(goal.current)}</p>
      <ProgressBar value={goal.current} max={goal.target} tone="secondary" />
      <p className="card-remaining is-secondary">{formatMoney(remaining)} remaining</p>
    </article>
  );
}
