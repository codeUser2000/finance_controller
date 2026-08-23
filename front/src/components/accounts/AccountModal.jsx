import { useState } from 'react';
import Modal from '../shared/Modal.jsx';
import { useFinance } from '../../context/useFinance.js';
import { formatMoney } from '../../utils/formatMoney.js';

const ACCOUNT_TYPES = [
  { id: 'cash', label: 'Cash' },
  { id: 'card', label: 'Card' },
  { id: 'bank', label: 'Bank' },
  { id: 'savings', label: 'Savings' },
];

export default function AccountModal({ open, account, onClose }) {
  return (
    <Modal title={account ? 'Edit account' : 'Add account'} open={open} onClose={onClose}>
      {open ? <AccountForm account={account} onClose={onClose} /> : null}
    </Modal>
  );
}

function AccountForm({ account, onClose }) {
  const { addAccount, updateAccount } = useFinance();
  const [name, setName] = useState(account?.name || '');
  const [type, setType] = useState(account?.type || 'card');
  const [balance, setBalance] = useState(account ? String(account.balance) : '0');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(account);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    const result = isEdit
      ? await updateAccount(account.id, { name, type })
      : await addAccount({ name, type, balance });
    setSaving(false);
    if (result) {
      setError(result);
      return;
    }
    onClose();
  }

  return (
    <form onSubmit={handleSubmit}>
      <p className="form-hint">
        {isEdit
          ? 'The balance changes when you add or delete transactions.'
          : 'Accounts are where money sits. Start at 0 unless you already have cash there.'}
      </p>

      <label className="form-field">
        <span className="form-label">Name</span>
        <input
          type="text"
          placeholder="Daily card"
          required
          autoFocus
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setError('');
          }}
        />
      </label>

      <div className="form-field">
        <span className="form-label">Type</span>
        <div className="segmented segmented-4">
          {ACCOUNT_TYPES.map((option) => (
            <button
              key={option.id}
              type="button"
              className={type === option.id ? 'is-active' : ''}
              onClick={() => setType(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {isEdit ? (
        <p className="card-meta">Current balance: {formatMoney(account.balance)}</p>
      ) : (
        <label className="form-field">
          <span className="form-label">Opening balance</span>
          <div className="amount-field">
            <input
              type="number"
              step="1"
              inputMode="numeric"
              required
              value={balance}
              onChange={(event) => {
                setBalance(event.target.value);
                setError('');
              }}
            />
            <span className="amount-suffix">AMD</span>
          </div>
        </label>
      )}

      {error ? <p className="form-error">{error}</p> : null}
      <button type="submit" className="btn btn-primary btn-block" disabled={saving}>
        {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Save account'}
      </button>
    </form>
  );
}
