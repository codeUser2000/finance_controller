import CategoryIcon from '../shared/CategoryIcon.jsx';
import ProgressBar from '../shared/ProgressBar.jsx';
import { formatMoney, getBudgetTone } from '../../utils/formatMoney.js';

export default function BudgetCard({ category }) {
  const remaining = category.budget - category.spent;
  const tone = getBudgetTone(category.spent, category.budget);
  const remainingClass =
    tone === 'danger' ? 'is-danger' : tone === 'warning' ? 'is-warning' : '';

  const remainingLabel =
    category.budget === 0
      ? 'No budget set'
      : remaining < 0
        ? `${formatMoney(Math.abs(remaining))} over of ${formatMoney(category.budget)}`
        : remaining === 0
          ? `0 left of ${formatMoney(category.budget)}`
          : `${formatMoney(remaining)} left of ${formatMoney(category.budget)}`;

  return (
    <article className="card">
      <div className="budget-card-top">
        <CategoryIcon name={category.name} tone={tone} />
        <div>
          <p className="card-name">{category.name}</p>
          <p className="card-meta">
            {category.budget === 0
              ? 'No budget set'
              : `${formatMoney(category.spent)} spent of ${formatMoney(category.budget)}`}
          </p>
        </div>
      </div>
      <ProgressBar value={category.spent} max={category.budget} tone={tone} />
      <p className={`card-remaining ${remainingClass}`}>{remainingLabel}</p>
    </article>
  );
}
