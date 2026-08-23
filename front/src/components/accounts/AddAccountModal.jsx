import { useState } from 'react';
import Modal from '../shared/Modal.jsx';
import { useFinance } from '../../context/useFinance.js';

export default function AddAccountModal({ open, onClose }) {
  return (
    <Modal title="Add account" open={open} onClose={onClose}>
      {open ? <AddAccountForm onClose={onClose} /> : null}
    </Modal>
  );
}

function AddAccountForm({ onClose }) {
  const { addAccount } = useFinance();
  const [name, setName] = useState('');
  const [kind, setKind] = useState('spending');
  const [balance, setBalance] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    const result = addAccount({ name, kind, balance, note });
    if (result) {
      setError(result);
      return;
    }
    onClose();
  }

  return (
    <form onSubmit={handleSubmit}>
      <p className="form-hint">
        Accounts are where money sits. Budgets are only monthly limits.
      </p>

      <label className="form-field">
        <span className="form-label">Name</span>
        <input
          type="text"
          placeholder="Cash"
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
        <div className="segmented">
          <button
            type="button"
            className={kind === 'spending' ? 'is-active' : ''}
            onClick={() => setKind('spending')}
          >
            Spending
          </button>
          <button
            type="button"
            className={kind === 'savings' ? 'is-active' : ''}
            onClick={() => setKind('savings')}
          >
            Savings
          </button>
        </div>
      </div>

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

      <label className="form-field">
        <span className="form-label">Note</span>
        <input
          type="text"
          placeholder="Optional"
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
      </label>

      {error ? <p className="form-error">{error}</p> : null}
      <button type="submit" className="btn btn-primary btn-block">
        Save account
      </button>
    </form>
  );
}
