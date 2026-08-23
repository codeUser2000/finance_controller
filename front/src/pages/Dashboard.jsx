import { Link } from 'react-router-dom';
import { useFinance } from '../context/useFinance.js';
import { getGreeting } from '../utils/dates.js';
import { formatMoney } from '../utils/formatMoney.js';
import SpendableCard from '../components/dashboard/SpendableCard.jsx';
import BudgetCard from '../components/dashboard/BudgetCard.jsx';
import RecentTransactions from '../components/dashboard/RecentTransactions.jsx';

export default function Dashboard() {
  const { data } = useFinance();

  return (
    <>
      <header className="page-header">
        <p className="page-kicker">{getGreeting()}</p>
        <h1 className="page-title">{data.month}</h1>
      </header>

      <SpendableCard />

      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Monthly budget</h2>
          <Link to="/budget" className="section-link">
            View all
          </Link>
        </div>
        {data.categories.length === 0 ? (
          <p className="empty-copy">No categories yet. Add one from Budget.</p>
        ) : (
          <div className="budget-grid">
            {data.categories.map((category) => (
              <BudgetCard key={category.id} category={category} />
            ))}
          </div>
        )}
      </section>

      <div className="dashboard-lower">
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">Savings accounts</h2>
            <Link to="/accounts" className="section-link">
              View accounts
            </Link>
          </div>
          {data.savingsAccounts.length === 0 ? (
            <p className="empty-copy">No savings accounts yet.</p>
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
