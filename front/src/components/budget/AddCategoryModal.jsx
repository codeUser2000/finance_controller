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
  const [error, setError] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    const result = addCategory(name);
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
      {error ? <p className="form-error">{error}</p> : null}
      <button type="submit" className="btn btn-primary btn-block">
        Save category
      </button>
    </form>
  );
}
