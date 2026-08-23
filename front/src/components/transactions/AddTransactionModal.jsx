import { useState } from 'react';
import Modal from '../shared/Modal.jsx';
import { useFinance } from '../../context/useFinance.js';
import { incomeCategories, transferCategories } from '../../data/mockData.js';
import { toInputDate } from '../../utils/dates.js';

export default function AddTransactionModal() {
  const { isAddOpen, closeAdd } = useFinance();

  return (
    <Modal title="Add transaction" open={isAddOpen} onClose={closeAdd}>
      {isAddOpen ? <AddTransactionForm /> : null}
    </Modal>
  );
}

function categoriesForType(type, data) {
  if (type === 'income') return incomeCategories;
  if (type === 'transfer') return transferCategories;
  return data.categories.map((category) => category.name);
}

function AddTransactionForm() {
  const { data, addTransaction } = useFinance();
  const expenseNames = data.categories.map((category) => category.name);
  const [form, setForm] = useState({
    type: 'expense',
    amount: '',
    category: expenseNames[0] || '',
    accountId: data.accounts[0]?.id || '',
    note: '',
    date: toInputDate(),
  });

  const categories = categoriesForType(form.type, data);
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
    setForm((prev) => ({
      ...prev,
      type,
      category: categoriesForType(type, data)[0] || '',
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    addTransaction(form);
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

      <label className="form-field">
        <span className="form-label">Category</span>
        <select
          value={form.category}
          onChange={(event) => updateField('category', event.target.value)}
          required
          disabled={categories.length === 0}
        >
          {categories.length === 0 ? (
            <option value="">Add a category first</option>
          ) : (
            categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))
          )}
        </select>
      </label>

      <label className="form-field">
        <span className="form-label">Account</span>
        <select
          value={form.accountId}
          onChange={(event) => updateField('accountId', event.target.value)}
        >
          {data.accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
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

      <button
        type="submit"
        className="btn btn-primary btn-block"
        disabled={form.type === 'expense' && categories.length === 0}
      >
        {saveLabel}
      </button>
    </form>
  );
}
