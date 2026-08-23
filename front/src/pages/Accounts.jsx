import { useState } from 'react';
import { CreditCard, PiggyBank, Plus } from 'lucide-react';
import { useFinance } from '../context/useFinance.js';
import { formatMoney } from '../utils/formatMoney.js';
import AccountModal from '../components/accounts/AccountModal.jsx';

function typeLabel(type) {
  if (type === 'cash') return 'Cash';
  if (type === 'bank') return 'Bank';
  if (type === 'savings') return 'Savings';
  return 'Card';
}

export default function Accounts() {
  const { data, deleteAccount } = useFinance();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
  }

  async function handleDelete(account) {
    const confirmed = window.confirm(`Delete ${account.name}?`);
    if (!confirmed) return;
    await deleteAccount(account.id);
  }

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
              onClick={() => {
                setEditing(null);
                setModalOpen(true);
              }}
            >
              <Plus size={16} />
              Account
            </button>
          </div>
        </div>
        <p className="page-subtitle">
          Where the money actually sits. Adding or deleting a transaction changes the balance.
        </p>
      </header>

      <p className="callout">
        Expense removes money. Income adds money. Deleting a transaction reverses that change.
      </p>

      {data.accounts.length === 0 ? (
        <div className="card empty-state">
          <p>No accounts yet.</p>
          <button type="button" className="btn btn-primary" onClick={() => setModalOpen(true)}>
            Add account
          </button>
        </div>
      ) : (
        <div className="account-grid">
          {data.accounts.map((account) => {
            const isSavings = account.type === 'savings';
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
                <p className="card-meta">{account.currency || 'AMD'}</p>
                <span className={`account-kind ${isSavings ? 'is-savings' : ''}`}>
                  {typeLabel(account.type)}
                </span>
                <div className="account-actions">
                  <button
                    type="button"
                    className="btn btn-ghost btn-small"
                    onClick={() => {
                      setEditing(account);
                      setModalOpen(true);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-small"
                    onClick={() => handleDelete(account)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <AccountModal open={modalOpen} account={editing} onClose={closeModal} />
    </>
  );
}
