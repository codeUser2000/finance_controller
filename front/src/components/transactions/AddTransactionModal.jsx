import { useState } from 'react';
import Modal from '../shared/Modal.jsx';
import { useFinance } from '../../context/useFinance.js';
import { toInputDate } from '../../utils/dates.js';

export default function AddTransactionModal() {
  const { isAddOpen, closeAdd } = useFinance();

  return (
    <Modal title="Add transaction" open={isAddOpen} onClose={closeAdd}>
      {isAddOpen ? <AddTransactionForm /> : null}
    </Modal>
  );
}

function categoriesForType(type, categories) {
  if (type === 'income') {
    return categories.filter((category) => category.type === 'income');
  }
  if (type === 'transfer') return [];
  return categories.filter((category) => category.type === 'expense');
}

function AddTransactionForm() {
  const { data, addTransaction } = useFinance();
  const [form, setForm] = useState({
    type: 'expense',
    amount: '',
    categoryId: data.categories.find((category) => category.type === 'expense')?.id || '',
    accountId: data.accounts[0]?.id || '',
    note: '',
    date: toInputDate(),
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const categories = categoriesForType(form.type, data.categories);
  const needsCategory = form.type === 'expense';
  const saveLabel =
    form.type === 'income'
      ? 'Save income'
      : form.type === 'transfer'
        ? 'Save transfer'
        : 'Save expense';

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleTypeChange(type) {
    const nextCategories = categoriesForType(type, data.categories);
    setForm((prev) => ({
      ...prev,
      type,
      categoryId: nextCategories[0]?.id || '',
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    const result = await addTransaction(form);
    setSaving(false);
    if (result) {
      setError(result);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-field">
        <span className="form-label">Type</span>
        <div className="segmented">
          {[
            { id: 'expense', label: 'Expense' },
            { id: 'income', label: 'Income' },
            { id: 'transfer', label: 'Transfer' },
          ].map((option) => (
            <button
              key={option.id}
              type="button"
              className={form.type === option.id ? 'is-active' : ''}
              onClick={() => handleTypeChange(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <label className="form-field">
        <span className="form-label">Amount</span>
        <div className="amount-field">
          <input
            type="number"
            min="1"
            step="1"
            inputMode="numeric"
            required
            autoFocus
            value={form.amount}
            onChange={(event) => updateField('amount', event.target.value)}
          />
          <span className="amount-suffix">AMD</span>
        </div>
      </label>

      {form.type !== 'transfer' ? (
        <label className="form-field">
          <span className="form-label">Category</span>
          <select
            value={form.categoryId}
            onChange={(event) => updateField('categoryId', event.target.value)}
            required={needsCategory}
            disabled={categories.length === 0}
          >
            {categories.length === 0 ? (
              <option value="">Add a category first</option>
            ) : (
              categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))
            )}
          </select>
        </label>
      ) : null}

      <label className="form-field">
        <span className="form-label">Account</span>
        <select
          value={form.accountId}
          onChange={(event) => updateField('accountId', event.target.value)}
          required
          disabled={data.accounts.length === 0}
        >
          {data.accounts.length === 0 ? (
            <option value="">Add an account first</option>
          ) : (
            data.accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))
          )}
        </select>
      </label>

      <label className="form-field">
        <span className="form-label">Note</span>
        <input
          type="text"
          placeholder="Taxi to university"
          value={form.note}
          onChange={(event) => updateField('note', event.target.value)}
        />
      </label>

      <label className="form-field">
        <span className="form-label">Date</span>
        <input
          type="date"
          required
          value={form.date}
          onChange={(event) => updateField('date', event.target.value)}
        />
      </label>

      {error ? <p className="form-error">{error}</p> : null}
      <button
        type="submit"
        className="btn btn-primary btn-block"
        disabled={
          saving ||
          data.accounts.length === 0 ||
          (needsCategory && categories.length === 0)
        }
      >
        {saving ? 'Saving…' : saveLabel}
      </button>
    </form>
  );
}
