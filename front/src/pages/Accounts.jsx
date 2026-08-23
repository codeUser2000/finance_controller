import { CreditCard, PiggyBank } from 'lucide-react';
import { useFinance } from '../context/useFinance.js';
import { formatMoney } from '../utils/formatMoney.js';

export default function Accounts() {
  const { data } = useFinance();

  return (
    <>
      <header className="page-header">
        <h1 className="page-title">Accounts</h1>
        <p className="page-subtitle">
          Where the money actually sits. Budgets are limits, not accounts.
        </p>
      </header>

      <p className="callout">
        The Daily Card is for this month’s spending. Main and Side Savings are
        reserved money and should not feel spendable.
      </p>

      <div className="account-grid">
        {data.accounts.map((account) => {
          const isSavings = account.kind === 'savings';
          return (
            <article key={account.id} className="card">
              <div className="account-card-top">
                <span className={`icon-badge ${isSavings ? 'icon-badge--success' : ''}`}>
                  {isSavings ? (
                    <PiggyBank size={18} strokeWidth={1.75} />
                  ) : (
                    <CreditCard size={18} strokeWidth={1.75} />
                  )}
                </span>
              </div>
              <p className="card-name">{account.name}</p>
              <p className="account-balance amount">{formatMoney(account.balance)}</p>
              <p className="card-meta">{account.note}</p>
              <span className={`account-kind ${isSavings ? 'is-savings' : ''}`}>
                {isSavings ? 'Savings' : 'Spending'}
              </span>
            </article>
          );
        })}
      </div>
    </>
  );
}
