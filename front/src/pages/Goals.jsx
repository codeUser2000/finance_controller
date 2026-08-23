import { PiggyBank } from 'lucide-react';
import { useFinance } from '../context/useFinance.js';
import { formatMoney } from '../utils/formatMoney.js';

export default function Goals() {
  const { data } = useFinance();

  return (
    <>
      <header className="page-header">
        <h1 className="page-title">Goals</h1>
        <p className="page-subtitle">
          Savings accounts from your backend. Empty until you add one.
        </p>
      </header>

      {data.savingsAccounts.length === 0 ? (
        <div className="card empty-state">
          <p>No savings accounts yet.</p>
        </div>
      ) : (
        <div className="savings-grid">
          {data.savingsAccounts.map((account) => (
            <article key={account.id} className="card">
              <div className="account-card-top">
                <span className="icon-badge icon-badge--success">
                  <PiggyBank size={18} strokeWidth={1.75} />
                </span>
              </div>
              <p className="card-name">{account.name}</p>
              <p className="account-balance amount">{formatMoney(account.balance)}</p>
              <p className="card-meta">{account.currency}</p>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
