import { useState } from 'react';
import { CreditCard, Pencil, PiggyBank, Plus, Trash2 } from 'lucide-react';
import { useFinance } from '../context/useFinance.js';
import { useLanguage } from '../context/useLanguage.js';
import { formatMoney } from '../utils/formatMoney.js';
import AccountModal from '../components/accounts/AccountModal.jsx';

export default function Accounts() {
  const { data, deleteAccount } = useFinance();
  const { t } = useLanguage();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  function typeLabel(type) {
    if (type === 'cash') return t('accounts.cash');
    if (type === 'bank') return t('accounts.bank');
    if (type === 'savings') return t('accounts.savings');
    return t('accounts.card');
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
  }

  async function handleDelete(account) {
    const confirmed = window.confirm(t('accounts.deleteConfirm', { name: account.name }));
    if (!confirmed) return;
    await deleteAccount(account.id);
  }

  return (
    <>
      <header className="page-header">
        <div className="page-header-top">
          <div>
            <h1 className="page-title">{t('accounts.title')}</h1>
          </div>
          <div className="page-actions">
            <button
              type="button"
              className="btn btn-primary btn-small"
              onClick={() => {
                setEditing(null);
                setModalOpen(true);
              }}
            >
              <Plus size={16} />
              {t('accounts.account')}
            </button>
          </div>
        </div>
        <p className="page-subtitle">{t('accounts.subtitle')}</p>
      </header>

      <p className="callout">{t('accounts.callout')}</p>

      {data.accounts.length === 0 ? (
        <div className="card empty-state">
          <p>{t('accounts.empty')}</p>
          <button type="button" className="btn btn-primary" onClick={() => setModalOpen(true)}>
            {t('accounts.add')}
          </button>
        </div>
      ) : (
        <div className="account-grid">
          {data.accounts.map((account) => {
            const isSavings = account.type === 'savings';
            return (
              <article key={account.id} className="card">
                <div className="account-card-top">
                  <span className={`icon-badge ${isSavings ? 'icon-badge--success' : ''}`}>
                    {isSavings ? (
                      <PiggyBank size={18} strokeWidth={1.75} />
                    ) : (
                      <CreditCard size={18} strokeWidth={1.75} />
                    )}
                  </span>
                </div>
                <p className="card-name">{account.name}</p>
                <p className="account-balance amount">{formatMoney(account.balance)}</p>
                <p className="card-meta">{account.currency || 'AMD'}</p>
                <span className={`account-kind ${isSavings ? 'is-savings' : ''}`}>
                  {typeLabel(account.type)}
                </span>
                <div className="account-actions">
                  <button
                    type="button"
                    className="icon-button"
                    aria-label={t('accounts.edit')}
                    title={t('accounts.edit')}
                    onClick={() => {
                      setEditing(account);
                      setModalOpen(true);
                    }}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    className="icon-button is-danger"
                    aria-label={t('accounts.delete')}
                    title={t('accounts.delete')}
                    onClick={() => handleDelete(account)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <AccountModal open={modalOpen} account={editing} onClose={closeModal} />
    </>
  );
}
