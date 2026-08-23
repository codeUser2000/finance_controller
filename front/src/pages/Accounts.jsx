import { useState } from 'react';
import { CreditCard, PiggyBank, Plus } from 'lucide-react';
import { useFinance } from '../context/useFinance.js';
import { formatMoney } from '../utils/formatMoney.js';
import AddAccountModal from '../components/accounts/AddAccountModal.jsx';

export default function Accounts() {
  const { data } = useFinance();
  const [adding, setAdding] = useState(false);

  return (
    <>
      <header className="page-header">
        <div className="page-header-top">
          <div>
            <h1 className="page-title">Accounts</h1>
          </div>
          <div className="page-actions">
            <button
              type="button"
              className="btn btn-primary btn-small"
              onClick={() => setAdding(true)}
            >
              <Plus size={16} />
              Account
            </button>
          </div>
        </div>
        <p className="page-subtitle">
          Where the money actually sits. Budgets are limits, not accounts.
        </p>
      </header>

      <p className="callout">
        Spending accounts are for this month. Savings accounts are reserved and
        should not feel spendable.
      </p>

      {data.accounts.length === 0 ? (
        <div className="card empty-state">
          <p>No accounts yet.</p>
          <button type="button" className="btn btn-primary" onClick={() => setAdding(true)}>
            Add account
          </button>
        </div>
      ) : (
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
      )}

      <AddAccountModal open={adding} onClose={() => setAdding(false)} />
    </>
  );
}
