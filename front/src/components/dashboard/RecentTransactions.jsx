import { Link } from 'react-router-dom';
import { useFinance } from '../../context/useFinance.js';
import { useLanguage } from '../../context/useLanguage.js';
import TransactionRow from '../shared/TransactionRow.jsx';

export default function RecentTransactions() {
  const { data, getAccountName, openAdd } = useFinance();
  const { t } = useLanguage();
  const recent = data.transactions.slice(0, 5);

  return (
    <section className="section">
      <div className="section-header">
        <h2 className="section-title">{t('dashboard.recent')}</h2>
        <Link to="/transactions" className="section-link">
          {t('dashboard.viewAll')}
        </Link>
      </div>
      <div className="card">
        {recent.length === 0 ? (
          <div className="empty-state">
            <p>{t('dashboard.noTransactions')}</p>
            <button type="button" className="btn btn-primary" onClick={openAdd}>
              {t('nav.addTransaction')}
            </button>
          </div>
        ) : (
          <div className="tx-list">
            {recent.map((transaction) => (
              <TransactionRow
                key={transaction.id}
                transaction={transaction}
                accountName={getAccountName(transaction.accountId)}
                compact
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
