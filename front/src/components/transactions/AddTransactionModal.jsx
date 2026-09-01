import { useState } from 'react';
import Modal from '../shared/Modal.jsx';
import { useFinance } from '../../context/useFinance.js';
import { useLanguage } from '../../context/useLanguage.js';
import { toInputDate } from '../../utils/dates.js';

export default function AddTransactionModal() {
  const { isAddOpen, closeAdd } = useFinance();
  const { t } = useLanguage();

  return (
    <Modal title={t('modal.addTransaction')} open={isAddOpen} onClose={closeAdd}>
      {isAddOpen ? <AddTransactionForm /> : null}
    </Modal>
  );
}

function categoriesForType(type, categories) {
  const active = categories.filter((category) => category.isActive);
  if (type === 'income') {
    return active.filter((category) => category.type === 'income');
  }
  if (type === 'transfer') return [];
  return active.filter((category) => category.type === 'expense');
}

function defaultToAccountId(accounts, fromAccountId) {
  return accounts.find((account) => String(account.id) !== String(fromAccountId))?.id || '';
}

function AddTransactionForm() {
  const { data, addTransaction } = useFinance();
  const { t } = useLanguage();
  const [form, setForm] = useState({
    type: 'expense',
    amount: '',
    categoryId:
      data.categories.find((category) => category.type === 'expense' && category.isActive)?.id ||
      '',
    accountId: data.accounts[0]?.id || '',
    toAccountId: defaultToAccountId(data.accounts, data.accounts[0]?.id),
    note: '',
    date: toInputDate(),
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const categories = categoriesForType(form.type, data.categories);
  const needsCategory = form.type === 'expense';
  const isTransfer = form.type === 'transfer';
  const saveLabel =
    form.type === 'income'
      ? t('modal.saveIncome')
      : form.type === 'transfer'
        ? t('modal.saveTransfer')
        : t('modal.saveExpense');

  function updateField(field, value) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'accountId' && String(value) === String(prev.toAccountId)) {
        next.toAccountId = defaultToAccountId(data.accounts, value);
      }
      return next;
    });
  }

  function handleTypeChange(type) {
    const nextCategories = categoriesForType(type, data.categories);
    setForm((prev) => ({
      ...prev,
      type,
      categoryId: nextCategories[0]?.id || '',
      toAccountId:
        type === 'transfer'
          ? defaultToAccountId(data.accounts, prev.accountId)
          : prev.toAccountId,
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

  const transferBlocked = isTransfer && data.accounts.length < 2;

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-field">
        <span className="form-label">{t('modal.type')}</span>
        <div className="segmented">
          {[
            { id: 'expense', label: t('types.expense') },
            { id: 'income', label: t('types.income') },
            { id: 'transfer', label: t('types.transfer') },
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
        <span className="form-label">{t('modal.amount')}</span>
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

      {!isTransfer ? (
        <label className="form-field">
          <span className="form-label">{t('modal.category')}</span>
          <select
            value={form.categoryId}
            onChange={(event) => updateField('categoryId', event.target.value)}
            required={needsCategory}
            disabled={categories.length === 0}
          >
            {categories.length === 0 ? (
              <option value="">{t('modal.addCategoryFirst')}</option>
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

      {isTransfer ? (
        <>
          <label className="form-field">
            <span className="form-label">{t('modal.fromAccount')}</span>
            <select
              value={form.accountId}
              onChange={(event) => updateField('accountId', event.target.value)}
              required
              disabled={data.accounts.length === 0}
            >
              {data.accounts.length === 0 ? (
                <option value="">{t('modal.addAccountFirst')}</option>
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
            <span className="form-label">{t('modal.toAccount')}</span>
            <select
              value={form.toAccountId}
              onChange={(event) => updateField('toAccountId', event.target.value)}
              required
              disabled={transferBlocked}
            >
              {transferBlocked ? (
                <option value="">{t('modal.needTwoAccounts')}</option>
              ) : (
                data.accounts
                  .filter((account) => String(account.id) !== String(form.accountId))
                  .map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))
              )}
            </select>
          </label>
        </>
      ) : (
        <label className="form-field">
          <span className="form-label">{t('modal.account')}</span>
          <select
            value={form.accountId}
            onChange={(event) => updateField('accountId', event.target.value)}
            required
            disabled={data.accounts.length === 0}
          >
            {data.accounts.length === 0 ? (
              <option value="">{t('modal.addAccountFirst')}</option>
            ) : (
              data.accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))
            )}
          </select>
        </label>
      )}

      <label className="form-field">
        <span className="form-label">{t('modal.note')}</span>
        <input
          type="text"
          placeholder={t('modal.notePlaceholder')}
          value={form.note}
          onChange={(event) => updateField('note', event.target.value)}
        />
      </label>

      <label className="form-field">
        <span className="form-label">{t('modal.date')}</span>
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
          transferBlocked ||
          (needsCategory && categories.length === 0)
        }
      >
        {saving ? t('modal.saving') : saveLabel}
      </button>
    </form>
  );
}
