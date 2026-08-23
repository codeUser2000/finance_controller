import { useState } from 'react';
import Modal from '../shared/Modal.jsx';
import { useFinance } from '../../context/useFinance.js';

export default function EditBudgetModal({ category, onClose }) {
  if (!category) return null;

  return (
    <EditBudgetForm key={category.id} category={category} onClose={onClose} />
  );
}

function EditBudgetForm({ category, onClose }) {
  const { updateCategoryBudget } = useFinance();
  const [budget, setBudget] = useState(category.budget);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    const result = await updateCategoryBudget(category.id, budget);
    setSaving(false);
    if (result) {
      setError(result);
      return;
    }
    onClose();
  }

  return (
    <Modal title={`Edit ${category.name}`} open onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <label className="form-field">
          <span className="form-label">Monthly budget</span>
          <div className="amount-field">
            <input
              type="number"
              min="0"
              step="100"
              inputMode="numeric"
              required
              value={budget}
              onChange={(event) => setBudget(event.target.value)}
            />
            <span className="amount-suffix">AMD</span>
          </div>
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <button type="submit" className="btn btn-primary btn-block" disabled={saving}>
          {saving ? 'Saving…' : 'Save budget'}
        </button>
      </form>
    </Modal>
  );
}
