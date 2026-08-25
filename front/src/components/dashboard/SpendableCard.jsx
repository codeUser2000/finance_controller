import { useFinance } from '../../context/useFinance.js';
import { useLanguage } from '../../context/useLanguage.js';
import { formatMoney, getBudgetTone } from '../../utils/formatMoney.js';
import ProgressBar from '../shared/ProgressBar.jsx';

export default function SpendableCard() {
  const { data, remaining } = useFinance();
  const { t } = useLanguage();
  const tone = getBudgetTone(data.spent, data.spendingBudget);
  const remainingClass = remaining < 0 ? 'amount-danger' : '';

  return (
    <section className="card">
      <p className="spendable-label">{t('dashboard.available')}</p>
      <p className={`spendable-amount amount ${remainingClass}`}>{formatMoney(remaining)}</p>
      <p className="spendable-meta">
        {t('dashboard.spentOf', {
          spent: formatMoney(data.spent),
          total: formatMoney(data.spendingBudget),
        })}
      </p>
      <ProgressBar value={data.spent} max={data.spendingBudget} tone={tone} />
    </section>
  );
}
