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

  function handleSubmit(event) {
    event.preventDefault();
    updateCategoryBudget(category.id, budget);
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
        <button type="submit" className="btn btn-primary btn-block">
          Save budget
        </button>
      </form>
    </Modal>
  );
}
