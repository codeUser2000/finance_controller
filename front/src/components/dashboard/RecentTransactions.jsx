import { Link } from 'react-router-dom';
import { useFinance } from '../../context/useFinance.js';
import TransactionRow from '../shared/TransactionRow.jsx';

export default function RecentTransactions() {
  const { data, getAccountName, openAdd } = useFinance();
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
        {recent.length === 0 ? (
          <div className="empty-state">
            <p>No transactions yet.</p>
            <button type="button" className="btn btn-primary" onClick={openAdd}>
              Add transaction
            </button>
          </div>
        ) : (
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
        )}
      </div>
    </section>
  );
}
