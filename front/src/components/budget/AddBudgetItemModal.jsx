import { useState } from 'react';
import Modal from '../shared/Modal.jsx';
import { useFinance } from '../../context/useFinance.js';
import { useLanguage } from '../../context/useLanguage.js';
import { useToast } from '../../context/ToastProvider.jsx';

export default function AddBudgetItemModal({ open, onClose }) {
  const { t } = useLanguage();

  return (
    <Modal title={t('modal.addBudgetCategory')} open={open} onClose={onClose}>
      {open ? <AddBudgetCategoryForm onClose={onClose} /> : null}
    </Modal>
  );
}

function AddBudgetCategoryForm({ onClose }) {
  const { addBudgetItem } = useFinance();
  const { t } = useLanguage();
  const toast = useToast();
  const [name, setName] = useState('');
  const [budget, setBudget] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    const result = await addBudgetItem({ name, budget });
    setSaving(false);
    if (result) {
      setError(result);
      return;
    }
    toast.success(t('toast.budgetCreated'));
    onClose();
  }

  return (
    <form onSubmit={handleSubmit}>
      <p className="form-hint">{t('modal.budgetCategoryHint')}</p>

      <label className="form-field">
        <span className="form-label">{t('modal.categoryName')}</span>
        <input
          type="text"
          placeholder={t('modal.groceriesPlaceholder')}
          required
          autoFocus
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setError('');
          }}
        />
      </label>

      <label className="form-field">
        <span className="form-label">{t('modal.monthlyBudget')}</span>
        <div className="amount-field">
          <input
            type="number"
            min="0"
            step="100"
            inputMode="numeric"
            required
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
      <button type="submit" className="btn btn-primary btn-block" disabled={saving}>
        {saving ? t('modal.saving') : t('modal.saveBudgetCategory')}
      </button>
    </form>
  );
}
