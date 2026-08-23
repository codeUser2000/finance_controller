import { useState } from 'react';
import Modal from '../shared/Modal.jsx';
import { useFinance } from '../../context/useFinance.js';

export default function AddBudgetItemModal({ open, onClose }) {
  return (
    <Modal title="Add budget item" open={open} onClose={onClose}>
      {open ? <AddBudgetItemForm onClose={onClose} /> : null}
    </Modal>
  );
}

function AddBudgetItemForm({ onClose }) {
  const { data, addBudgetItem } = useFinance();
  const hasCategories = data.categories.length > 0;
  const [mode, setMode] = useState(hasCategories ? 'existing' : 'new');
  const [categoryId, setCategoryId] = useState(data.categories[0]?.id || '');
  const [name, setName] = useState('');
  const [budget, setBudget] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    const result = addBudgetItem({
      categoryId: mode === 'existing' ? categoryId : '',
      name,
      budget,
    });
    if (result) {
      setError(result);
      return;
    }
    onClose();
  }

  return (
    <form onSubmit={handleSubmit}>
      <p className="form-hint">
        A budget item is a monthly spending limit for a category.
      </p>

      {hasCategories ? (
        <div className="form-field">
          <span className="form-label">Assign to</span>
          <div className="segmented">
            <button
              type="button"
              className={mode === 'existing' ? 'is-active' : ''}
              onClick={() => setMode('existing')}
            >
              Existing
            </button>
            <button
              type="button"
              className={mode === 'new' ? 'is-active' : ''}
              onClick={() => setMode('new')}
            >
              New category
            </button>
          </div>
        </div>
      ) : null}

      {mode === 'existing' && hasCategories ? (
        <label className="form-field">
          <span className="form-label">Category</span>
          <select
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
          >
            {data.categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <label className="form-field">
          <span className="form-label">Category name</span>
          <input
            type="text"
            placeholder="Subscriptions"
            required
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setError('');
            }}
          />
        </label>
      )}

      <label className="form-field">
        <span className="form-label">Monthly budget</span>
        <div className="amount-field">
          <input
            type="number"
            min="0"
            step="100"
            inputMode="numeric"
            required
            autoFocus
            value={budget}
            onChange={(event) => {
              setBudget(event.target.value);
              setError('');
            }}
          />
          <span className="amount-suffix">AMD</span>
        </div>
      </label>
      {error ? <p className="form-error">{error}</p> : null}
      <button type="submit" className="btn btn-primary btn-block">
        Save budget item
      </button>
    </form>
  );
}
