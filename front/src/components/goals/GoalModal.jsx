import { useMemo, useState } from 'react';
import Modal from '../shared/Modal.jsx';
import { useFinance } from '../../context/useFinance.js';
import { useLanguage } from '../../context/useLanguage.js';
import { formatMoney } from '../../utils/formatMoney.js';

export default function GoalModal({ open, goal, onClose }) {
  const { t } = useLanguage();

  return (
    <Modal
      title={goal ? t('modal.editGoal') : t('modal.addGoal')}
      open={open}
      onClose={onClose}
    >
      {open ? <GoalForm key={goal?.id ?? 'new'} goal={goal} onClose={onClose} /> : null}
    </Modal>
  );
}

function GoalForm({ goal, onClose }) {
  const { data, addGoal, updateGoal } = useFinance();
  const { t } = useLanguage();
  const [title, setTitle] = useState(goal?.title || '');
  const [accountId, setAccountId] = useState(goal?.accountId ? String(goal.accountId) : '');
  const [current, setCurrent] = useState(goal?.accountId ? '0' : goal ? String(goal.current) : '0');
  const [target, setTarget] = useState(goal ? String(goal.target) : '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(goal);

  const linkableAccounts = useMemo(
    () =>
      [...data.accounts].sort((a, b) => {
        if (a.type === 'savings' && b.type !== 'savings') return -1;
        if (a.type !== 'savings' && b.type === 'savings') return 1;
        return a.name.localeCompare(b.name);
      }),
    [data.accounts],
  );

  const linkedAccount = linkableAccounts.find(
    (account) => String(account.id) === String(accountId),
  );

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    const result = isEdit
      ? await updateGoal(goal.id, {
          title,
          current,
          target,
          accountId: accountId || null,
        })
      : await addGoal({
          title,
          current,
          target,
          accountId: accountId || null,
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
      <label className="form-field">
        <span className="form-label">{t('modal.goalTitle')}</span>
        <input
          type="text"
          required
          autoFocus
          placeholder={t('modal.goalTitlePlaceholder')}
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            setError('');
          }}
        />
      </label>
      <label className="form-field">
        <span className="form-label">{t('modal.goalAccount')}</span>
        <select
          value={accountId}
          onChange={(event) => {
            setAccountId(event.target.value);
            setError('');
          }}
        >
          <option value="">{t('modal.goalManualAmount')}</option>
          {linkableAccounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
              {account.type === 'savings' ? ` (${t('accounts.savings')})` : ''}
              {' — '}
              {formatMoney(account.balance)}
            </option>
          ))}
        </select>
      </label>
      {accountId ? (
        <p className="card-meta">
          {t('modal.goalLinkedBalance', {
            amount: formatMoney(linkedAccount?.balance ?? 0),
          })}
        </p>
      ) : (
        <label className="form-field">
          <span className="form-label">{t('modal.goalCurrent')}</span>
          <div className="amount-field">
            <input
              type="number"
              min="0"
              step="100"
              inputMode="numeric"
              required
              value={current}
              onChange={(event) => {
                setCurrent(event.target.value);
                setError('');
              }}
            />
            <span className="amount-suffix">AMD</span>
          </div>
        </label>
      )}
      <label className="form-field">
        <span className="form-label">{t('modal.goalTarget')}</span>
        <div className="amount-field">
          <input
            type="number"
            min="1"
            step="100"
            inputMode="numeric"
            required
            value={target}
            onChange={(event) => {
              setTarget(event.target.value);
              setError('');
            }}
          />
          <span className="amount-suffix">AMD</span>
        </div>
      </label>
      {error ? <p className="form-error">{error}</p> : null}
      <button type="submit" className="btn btn-primary btn-block" disabled={saving}>
        {saving ? t('modal.saving') : isEdit ? t('modal.saveChanges') : t('modal.saveGoal')}
      </button>
    </form>
  );
}
