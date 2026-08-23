import { useState } from 'react';
import Modal from '../shared/Modal.jsx';
import { useFinance } from '../../context/useFinance.js';

export default function AddCategoryModal({ open, onClose }) {
  return (
    <Modal title="Add category" open={open} onClose={onClose}>
      {open ? <AddCategoryForm onClose={onClose} /> : null}
    </Modal>
  );
}

function AddCategoryForm({ onClose }) {
  const { addCategory } = useFinance();
  const [name, setName] = useState('');
  const [type, setType] = useState('expense');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    const result = await addCategory({ name, type });
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
        Categories group your spending. You can give this one a monthly budget
        next.
      </p>
      <label className="form-field">
        <span className="form-label">Name</span>
        <input
          type="text"
          placeholder="Groceries"
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
        <div className="segmented segmented-2">
          <button
            type="button"
            className={type === 'expense' ? 'is-active' : ''}
            onClick={() => setType('expense')}
          >
            Expense
          </button>
          <button
            type="button"
            className={type === 'income' ? 'is-active' : ''}
            onClick={() => setType('income')}
          >
            Income
          </button>
        </div>
      </div>
      {error ? <p className="form-error">{error}</p> : null}
      <button type="submit" className="btn btn-primary btn-block" disabled={saving}>
        {saving ? 'Saving…' : 'Save category'}
      </button>
    </form>
  );
}
