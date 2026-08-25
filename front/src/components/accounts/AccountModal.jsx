import { useState } from 'react';
import Modal from '../shared/Modal.jsx';
import { useFinance } from '../../context/useFinance.js';
import { useLanguage } from '../../context/useLanguage.js';
import { formatMoney } from '../../utils/formatMoney.js';

export default function AccountModal({ open, account, onClose }) {
  const { t } = useLanguage();

  return (
    <Modal
      title={account ? t('modal.editAccount') : t('modal.addAccount')}
      open={open}
      onClose={onClose}
    >
      {open ? <AccountForm account={account} onClose={onClose} /> : null}
    </Modal>
  );
}

function AccountForm({ account, onClose }) {
  const { addAccount, updateAccount } = useFinance();
  const { t } = useLanguage();
  const [name, setName] = useState(account?.name || '');
  const [type, setType] = useState(account?.type || 'card');
  const [balance, setBalance] = useState(account ? String(account.balance) : '0');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(account);

  const accountTypes = [
    { id: 'cash', label: t('accounts.cash') },
    { id: 'card', label: t('accounts.card') },
    { id: 'bank', label: t('accounts.bank') },
    { id: 'savings', label: t('accounts.savings') },
  ];

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    const result = isEdit
      ? await updateAccount(account.id, { name, type })
      : await addAccount({ name, type, balance });
    setSaving(false);
    if (result) {
      setError(result);
      return;
    }
    onClose();
  }

  return (
    <form onSubmit={handleSubmit}>
      <p className="form-hint">
        {isEdit ? t('modal.accountHintEdit') : t('modal.accountHintAdd')}
      </p>

      <label className="form-field">
        <span className="form-label">{t('modal.name')}</span>
        <input
          type="text"
          placeholder={t('modal.dailyCardPlaceholder')}
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
        <div className="segmented segmented-4">
          {accountTypes.map((option) => (
            <button
              key={option.id}
              type="button"
              className={type === option.id ? 'is-active' : ''}
              onClick={() => setType(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {isEdit ? (
        <p className="card-meta">
          {t('modal.currentBalance', { amount: formatMoney(account.balance) })}
        </p>
      ) : (
        <label className="form-field">
          <span className="form-label">{t('modal.openingBalance')}</span>
          <div className="amount-field">
            <input
              type="number"
              step="1"
              inputMode="numeric"
              required
              value={balance}
              onChange={(event) => {
                setBalance(event.target.value);
                setError('');
              }}
            />
            <span className="amount-suffix">AMD</span>
          </div>
        </label>
      )}

      {error ? <p className="form-error">{error}</p> : null}
      <button type="submit" className="btn btn-primary btn-block" disabled={saving}>
        {saving
          ? t('modal.saving')
          : isEdit
            ? t('modal.saveChanges')
            : t('modal.saveAccount')}
      </button>
    </form>
  );
}
