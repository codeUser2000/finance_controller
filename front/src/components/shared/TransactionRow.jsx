import { Trash2 } from 'lucide-react';
import CategoryIcon from './CategoryIcon.jsx';
import { formatSignedMoney } from '../../utils/formatMoney.js';
import { formatShortDate } from '../../utils/dates.js';

export default function TransactionRow({
  transaction,
  accountName,
  compact = false,
  onDelete,
}) {
  const meta = compact
    ? transaction.category
    : [transaction.category, accountName, formatShortDate(transaction.occurredAt)]
        .filter(Boolean)
        .join(' · ');

  return (
    <div className="tx-row">
      <CategoryIcon name={transaction.category} />
      <div className="tx-row-main">
        <div className="tx-row-desc">{transaction.description}</div>
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
          aria-label="Delete transaction"
          onClick={() => onDelete(transaction)}
        >
          <Trash2 size={16} />
        </button>
      ) : null}
    </div>
  );
}
