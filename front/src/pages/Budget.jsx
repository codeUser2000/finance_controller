import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useFinance } from '../context/useFinance.js';
import { formatMoney, getBudgetTone } from '../utils/formatMoney.js';
import CategoryIcon from '../components/shared/CategoryIcon.jsx';
import ProgressBar from '../components/shared/ProgressBar.jsx';
import EditBudgetModal from '../components/budget/EditBudgetModal.jsx';
import AddCategoryModal from '../components/budget/AddCategoryModal.jsx';
import AddBudgetItemModal from '../components/budget/AddBudgetItemModal.jsx';

export default function Budget() {
  const { data, remaining, deleteCategory } = useFinance();
  const [editing, setEditing] = useState(null);
  const [addingCategory, setAddingCategory] = useState(false);
  const [addingBudgetItem, setAddingBudgetItem] = useState(false);

  return (
    <>
      <header className="page-header">
        <div className="page-header-top">
          <div>
            <p className="page-kicker">{data.month}</p>
            <h1 className="page-title">Budget</h1>
          </div>
          <div className="page-actions">
            <button
              type="button"
              className="btn btn-ghost btn-small"
              onClick={() => setAddingCategory(true)}
            >
              <Plus size={16} />
              Category
            </button>
            <button
              type="button"
              className="btn btn-primary btn-small"
              onClick={() => setAddingBudgetItem(true)}
            >
              <Plus size={16} />
              Budget item
            </button>
          </div>
        </div>
        <p className="page-subtitle">
          Monthly spending limits. This is not the same as your savings.
        </p>
      </header>

      <section className="card">
        <p className="spendable-label">Left this month</p>
        <p className={`spendable-amount amount ${remaining < 0 ? 'amount-danger' : ''}`}>
          {formatMoney(remaining)}
        </p>
        <p className="spendable-meta">
          of {formatMoney(data.spendingBudget)} you started with
        </p>
        <div className="summary-grid">
          <div className="stat">
            <div className="stat-label">Had</div>
            <div className="stat-value">{formatMoney(data.spendingBudget)}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Spent</div>
            <div className="stat-value">{formatMoney(data.spent)}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Left</div>
            <div className={`stat-value ${remaining < 0 ? 'amount-danger' : ''}`}>
              {formatMoney(remaining)}
            </div>
          </div>
        </div>
      </section>

      {data.categories.length === 0 ? (
        <div className="card empty-state">
          <p>No budget items yet.</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setAddingBudgetItem(true)}
          >
            Add budget item
          </button>
        </div>
      ) : (
        <section className="section budget-rows">
          {data.categories.map((category) => {
            const leftover = category.budget - category.spent;
            const tone = getBudgetTone(category.spent, category.budget);
            return (
              <article key={category.id} className="card budget-row">
                <div className="budget-row-head">
                  <CategoryIcon name={category.name} tone={tone} />
                  <div className="budget-row-copy">
                    <p className="card-name">{category.name}</p>
                    <p className="card-meta">
                      {category.budget === 0
                        ? 'No budget set'
                        : leftover < 0
                          ? `${formatMoney(Math.abs(leftover))} over of ${formatMoney(category.budget)}`
                          : `${formatMoney(leftover)} left of ${formatMoney(category.budget)}`}
                    </p>
                  </div>
                  <div className="account-actions">
                    <button
                      type="button"
                      className="btn btn-ghost btn-small"
                      onClick={() => setEditing(category)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-small"
                      onClick={async () => {
                        const confirmed = window.confirm(`Delete ${category.name}?`);
                        if (!confirmed) return;
                        await deleteCategory(category.id);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="budget-row-figures">
                  <div>
                    Had
                    <strong>{formatMoney(category.budget)}</strong>
                  </div>
                  <div>
                    Spent
                    <strong>{formatMoney(category.spent)}</strong>
                  </div>
                  <div>
                    Left
                    <strong className={leftover < 0 ? 'amount-danger' : ''}>
                      {formatMoney(leftover)}
                    </strong>
                  </div>
                </div>
                <ProgressBar value={category.spent} max={category.budget} tone={tone} />
              </article>
            );
          })}
        </section>
      )}

      <EditBudgetModal category={editing} onClose={() => setEditing(null)} />
      <AddCategoryModal
        open={addingCategory}
        onClose={() => setAddingCategory(false)}
      />
      <AddBudgetItemModal
        open={addingBudgetItem}
        onClose={() => setAddingBudgetItem(false)}
      />
    </>
  );
}
