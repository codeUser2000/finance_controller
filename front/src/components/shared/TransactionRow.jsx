import CategoryIcon from './CategoryIcon.jsx';
import { formatSignedMoney } from '../../utils/formatMoney.js';
import { formatShortDate, formatTime, getDateGroup } from '../../utils/dates.js';

export default function TransactionRow({
  transaction,
  accountName,
  compact = false,
}) {
  const group = getDateGroup(transaction.occurredAt);
  const timeLabel =
    group === 'Earlier'
      ? `${formatShortDate(transaction.occurredAt)}, ${formatTime(transaction.occurredAt)}`
      : formatTime(transaction.occurredAt);

  const meta = compact
    ? transaction.category
    : [transaction.category, accountName, timeLabel].filter(Boolean).join(' · ');

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
    </div>
  );
}
