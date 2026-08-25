import { useState } from 'react';
import Modal from '../shared/Modal.jsx';
import { useFinance } from '../../context/useFinance.js';
import { useLanguage } from '../../context/useLanguage.js';

export default function AddBudgetItemModal({ open, onClose }) {
  const { t } = useLanguage();

  return (
    <Modal title={t('modal.addBudgetItem')} open={open} onClose={onClose}>
      {open ? <AddBudgetItemForm onClose={onClose} /> : null}
    </Modal>
  );
}

function AddBudgetItemForm({ onClose }) {
  const { data, addBudgetItem } = useFinance();
  const { t } = useLanguage();
  const hasCategories = data.categories.length > 0;
  const [mode, setMode] = useState(hasCategories ? 'existing' : 'new');
  const [categoryId, setCategoryId] = useState(data.categories[0]?.id || '');
  const [name, setName] = useState('');
  const [budget, setBudget] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    const result = await addBudgetItem({
      categoryId: mode === 'existing' ? categoryId : '',
      name,
      budget,
    });
    setSaving(false);
    if (result) {
      setError(result);
      return;
    }
    onClose();
  }

  return (
    <form onSubmit={handleSubmit}>
      <p className="form-hint">{t('modal.budgetHint')}</p>

      {hasCategories ? (
        <div className="form-field">
          <span className="form-label">{t('modal.assignTo')}</span>
          <div className="segmented segmented-2">
            <button
              type="button"
              className={mode === 'existing' ? 'is-active' : ''}
              onClick={() => setMode('existing')}
            >
              {t('modal.existing')}
            </button>
            <button
              type="button"
              className={mode === 'new' ? 'is-active' : ''}
              onClick={() => setMode('new')}
            >
              {t('modal.newCategory')}
            </button>
          </div>
        </div>
      ) : null}

      {mode === 'existing' && hasCategories ? (
        <label className="form-field">
          <span className="form-label">{t('modal.category')}</span>
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
          <span className="form-label">{t('modal.categoryName')}</span>
          <input
            type="text"
            placeholder={t('modal.subscriptionsPlaceholder')}
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
        <span className="form-label">{t('modal.monthlyBudget')}</span>
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
      <button type="submit" className="btn btn-primary btn-block" disabled={saving}>
        {saving ? t('modal.saving') : t('modal.saveBudgetItem')}
      </button>
    </form>
  );
}
