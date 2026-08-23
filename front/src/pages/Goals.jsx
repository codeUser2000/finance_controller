import { Car, Shield } from 'lucide-react';
import { useFinance } from '../context/useFinance.js';
import { formatMoney, formatPercent } from '../utils/formatMoney.js';
import ProgressBar from '../components/shared/ProgressBar.jsx';

export default function Goals() {
  const { data, openAdd } = useFinance();

  return (
    <>
      <header className="page-header">
        <h1 className="page-title">Goals</h1>
        <p className="page-subtitle">
          Savings targets kept separate from money you can spend this month.
        </p>
      </header>

      <div className="savings-grid">
        {data.savings.map((goal) => {
          const remaining = Math.max(goal.target - goal.current, 0);
          const percent = formatPercent(goal.current, goal.target);
          const Icon = goal.id === 'car' ? Car : Shield;

          return (
            <article key={goal.id} className="card goal-card savings-card">
              <div className="savings-card-top">
                <span className="icon-badge icon-badge--success">
                  <Icon size={18} strokeWidth={1.75} />
                </span>
                <p className="savings-percent">{percent}%</p>
              </div>
              <div>
                <p className="card-name">{goal.name}</p>
                <p className="card-meta">
                  {formatMoney(goal.current)} / {formatMoney(goal.target)}
                </p>
              </div>
              <ProgressBar value={goal.current} max={goal.target} tone="success" />
              <div className="goal-stats">
                <span>{formatMoney(remaining)} remaining</span>
                <span>{percent}% complete</span>
              </div>
              <div>
                <p className="section-title">Recent contributions</p>
                <div className="contribution-list">
                  {goal.contributions.map((item) => (
                    <div key={item.id} className="contribution-item">
                      <span>{item.label}</span>
                      <span className="contribution-amount">
                        +{formatMoney(item.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="section">
        <button type="button" className="btn btn-primary" onClick={openAdd}>
          Add a transfer
        </button>
      </div>
    </>
  );
}
