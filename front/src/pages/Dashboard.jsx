import { Link } from 'react-router-dom';
import { useFinance } from '../context/useFinance.js';
import { getGreeting } from '../utils/dates.js';
import SpendableCard from '../components/dashboard/SpendableCard.jsx';
import BudgetCard from '../components/dashboard/BudgetCard.jsx';
import SavingsCard from '../components/dashboard/SavingsCard.jsx';
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
        <div className="budget-grid">
          {data.categories.map((category) => (
            <BudgetCard key={category.id} category={category} />
          ))}
        </div>
      </section>

      <div className="dashboard-lower">
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">Savings</h2>
            <Link to="/goals" className="section-link">
              View goals
            </Link>
          </div>
          <div className="savings-grid">
            {data.savings.map((goal) => (
              <SavingsCard key={goal.id} goal={goal} />
            ))}
          </div>
        </section>
        <RecentTransactions />
      </div>
    </>
  );
}
