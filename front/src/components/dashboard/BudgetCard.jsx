import CategoryIcon from '../shared/CategoryIcon.jsx';
import ProgressBar from '../shared/ProgressBar.jsx';
import { formatMoney, getBudgetTone } from '../../utils/formatMoney.js';
import { useLanguage } from '../../context/useLanguage.js';

export default function BudgetCard({ category }) {
  const { t } = useLanguage();
  const remaining = category.budget - category.spent;
  const tone = getBudgetTone(category.spent, category.budget);
  const remainingClass =
    tone === 'danger' ? 'is-danger' : tone === 'warning' ? 'is-warning' : '';

  const remainingLabel =
    category.budget === 0
      ? t('dashboard.noBudgetSet')
      : remaining < 0
        ? t('dashboard.overOf', {
            over: formatMoney(Math.abs(remaining)),
            total: formatMoney(category.budget),
          })
        : remaining === 0
          ? t('dashboard.zeroLeftOf', { total: formatMoney(category.budget) })
          : t('dashboard.leftOf', {
              left: formatMoney(remaining),
              total: formatMoney(category.budget),
            });

  return (
    <article className="card">
      <div className="budget-card-top">
        <CategoryIcon name={category.name} tone={tone} />
        <div>
          <p className="card-name">{category.name}</p>
          <p className="card-meta">
            {category.budget === 0
              ? t('dashboard.noBudgetSet')
              : t('dashboard.spentOfBudget', {
                  spent: formatMoney(category.spent),
                  total: formatMoney(category.budget),
                })}
          </p>
        </div>
      </div>
      <ProgressBar value={category.spent} max={category.budget} tone={tone} />
      <p className={`card-remaining ${remainingClass}`}>{remainingLabel}</p>
    </article>
  );
}
