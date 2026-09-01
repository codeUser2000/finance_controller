import { Target } from 'lucide-react';
import { useLanguage } from '../../context/useLanguage.js';
import { formatMoney, formatPercent } from '../../utils/formatMoney.js';
import ProgressBar from '../shared/ProgressBar.jsx';

export default function GoalCard({ goal }) {
  const { t } = useLanguage();
  const remaining = Math.max(goal.target - goal.current, 0);
  const percent = formatPercent(goal.current, goal.target);

  return (
    <article className="card goal-card">
      <div className="savings-card-top">
        <span className="icon-badge icon-badge--accent">
          <Target size={18} strokeWidth={1.75} />
        </span>
        <p className="goal-percent">{percent}%</p>
      </div>
      <p className="card-name">{goal.title}</p>
      <p className="card-meta">
        {goal.accountName
          ? t('goals.linkedAccount', { name: goal.accountName })
          : null}
        {goal.accountName ? ' · ' : ''}
        {t('goals.savedOf', {
          current: formatMoney(goal.current),
          target: formatMoney(goal.target),
        })}
      </p>
      <ProgressBar value={goal.current} max={goal.target} tone="secondary" />
      <p className="card-remaining is-secondary">
        {t('goals.remaining', { amount: formatMoney(remaining) })}
      </p>
    </article>
  );
}
