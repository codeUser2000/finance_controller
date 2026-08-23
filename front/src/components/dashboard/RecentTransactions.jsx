import { Link } from 'react-router-dom';
import { useFinance } from '../../context/useFinance.js';
import TransactionRow from '../shared/TransactionRow.jsx';

export default function RecentTransactions() {
  const { data, getAccountName } = useFinance();
  const recent = data.transactions.slice(0, 5);

  return (
    <section className="section">
      <div className="section-header">
        <h2 className="section-title">Recent transactions</h2>
        <Link to="/transactions" className="section-link">
          View all
        </Link>
      </div>
      <div className="card">
        <div className="tx-list">
          {recent.map((transaction) => (
            <TransactionRow
              key={transaction.id}
              transaction={transaction}
              accountName={getAccountName(transaction.accountId)}
              compact
            />
          ))}
        </div>
      </div>
    </section>
  );
}
