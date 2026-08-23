import CategoryIcon from '../shared/CategoryIcon.jsx';
import ProgressBar from '../shared/ProgressBar.jsx';
import { formatMoney, getBudgetTone } from '../../utils/formatMoney.js';

export default function BudgetCard({ category }) {
  const remaining = category.budget - category.spent;
  const tone = getBudgetTone(category.spent, category.budget);
  const remainingClass =
    tone === 'danger' ? 'is-danger' : tone === 'warning' ? 'is-warning' : '';

  const remainingLabel =
    remaining < 0
      ? `${formatMoney(Math.abs(remaining))} over`
      : remaining === 0
        ? 'Budget used'
        : `${formatMoney(remaining)} left`;

  return (
    <article className="card">
      <div className="budget-card-top">
        <CategoryIcon name={category.name} tone={tone} />
        <div>
          <p className="card-name">{category.name}</p>
          <p className="card-meta">
            {formatMoney(category.spent)} / {formatMoney(category.budget)}
          </p>
        </div>
      </div>
      <ProgressBar value={category.spent} max={category.budget} tone={tone} />
      <p className={`card-remaining ${remainingClass}`}>{remainingLabel}</p>
    </article>
  );
}
