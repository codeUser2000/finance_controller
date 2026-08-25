import { Trash2 } from 'lucide-react';
import CategoryIcon from './CategoryIcon.jsx';
import { formatSignedMoney } from '../../utils/formatMoney.js';
import { formatShortDate } from '../../utils/dates.js';
import { useLanguage } from '../../context/useLanguage.js';

export default function TransactionRow({
  transaction,
  accountName,
  compact = false,
  onDelete,
}) {
  const { t, locale } = useLanguage();
  const categoryLabel = transaction.category || t(`types.${transaction.type}`);
  const description = transaction.description || categoryLabel;
  const meta = compact
    ? categoryLabel
    : [categoryLabel, accountName, formatShortDate(transaction.occurredAt, locale)]
        .filter(Boolean)
        .join(' · ');

  return (
    <div className="tx-row">
      <CategoryIcon name={transaction.category || transaction.type} />
      <div className="tx-row-main">
        <div className="tx-row-desc">{description}</div>
        <div className="tx-row-meta">{meta}</div>
      </div>
      <div
        className={`tx-row-amount amount ${transaction.type === 'income' ? 'amount-income' : ''}`}
      >
        {formatSignedMoney(transaction.amount, transaction.type)}
      </div>
      {onDelete ? (
        <button
          type="button"
          className="icon-button"
          aria-label={t('budget.delete')}
          onClick={() => onDelete(transaction)}
        >
          <Trash2 size={16} />
        </button>
      ) : null}
    </div>
  );
}
