import { useState } from 'react';
import Modal from '../shared/Modal.jsx';
import { useFinance } from '../../context/useFinance.js';
import { useLanguage } from '../../context/useLanguage.js';

export default function AddCategoryModal({ open, onClose }) {
  const { t } = useLanguage();

  return (
    <Modal title={t('modal.addCategory')} open={open} onClose={onClose}>
      {open ? <AddCategoryForm onClose={onClose} /> : null}
    </Modal>
  );
}

function AddCategoryForm({ onClose }) {
  const { addCategory } = useFinance();
  const { t } = useLanguage();
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
      <p className="form-hint">{t('modal.categoryHint')}</p>
      <label className="form-field">
        <span className="form-label">{t('modal.name')}</span>
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
      <div className="form-field">
        <span className="form-label">{t('modal.type')}</span>
        <div className="segmented segmented-2">
          <button
            type="button"
            className={type === 'expense' ? 'is-active' : ''}
            onClick={() => setType('expense')}
          >
            {t('types.expense')}
          </button>
          <button
            type="button"
            className={type === 'income' ? 'is-active' : ''}
            onClick={() => setType('income')}
          >
            {t('types.income')}
          </button>
        </div>
      </div>
      {error ? <p className="form-error">{error}</p> : null}
      <button type="submit" className="btn btn-primary btn-block" disabled={saving}>
        {saving ? t('modal.saving') : t('modal.saveCategory')}
      </button>
    </form>
  );
}
