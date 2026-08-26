import { Link } from 'react-router-dom';
import { useFinance } from '../context/useFinance.js';
import { useLanguage } from '../context/useLanguage.js';
import { useAuth } from '../context/useAuth.js';
import { getGreetingKey } from '../utils/dates.js';
import { formatMoney } from '../utils/formatMoney.js';
import SpendableCard from '../components/dashboard/SpendableCard.jsx';
import BudgetCard from '../components/dashboard/BudgetCard.jsx';
import RecentTransactions from '../components/dashboard/RecentTransactions.jsx';

export default function Dashboard() {
  const { data } = useFinance();
  const { t } = useLanguage();
  const { user } = useAuth();

  return (
    <>
      <header className="page-header">
        <p className="page-kicker">
          {t(getGreetingKey())}
          {user?.name ? `, ${user.name}` : ''}
        </p>
        <h1 className="page-title">{data.month}</h1>
      </header>

      <SpendableCard />

      <section className="section">
        <div className="section-header">
          <h2 className="section-title">{t('dashboard.monthlyBudget')}</h2>
          <Link to="/budget" className="section-link">
            {t('dashboard.viewAll')}
          </Link>
        </div>
        {data.categories.filter((category) => category.isActive).length === 0 ? (
          <p className="empty-copy">{t('dashboard.noCategories')}</p>
        ) : (
          <div className="budget-grid">
            {data.categories
              .filter((category) => category.isActive)
              .map((category) => (
                <BudgetCard key={category.id} category={category} />
              ))}
          </div>
        )}
      </section>

      <div className="dashboard-lower">
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">{t('dashboard.savingsAccounts')}</h2>
            <Link to="/accounts" className="section-link">
              {t('dashboard.viewAccounts')}
            </Link>
          </div>
          {data.savingsAccounts.length === 0 ? (
            <p className="empty-copy">{t('dashboard.noSavings')}</p>
          ) : (
            <div className="savings-grid">
              {data.savingsAccounts.map((account) => (
                <article key={account.id} className="card">
                  <p className="card-name">{account.name}</p>
                  <p className="account-balance amount">{formatMoney(account.balance)}</p>
                </article>
              ))}
            </div>
          )}
        </section>
        <RecentTransactions />
      </div>
    </>
  );
}
