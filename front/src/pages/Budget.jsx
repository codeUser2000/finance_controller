import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useFinance } from '../context/useFinance.js';
import { useLanguage } from '../context/useLanguage.js';
import { formatMoney, getBudgetTone } from '../utils/formatMoney.js';
import CategoryIcon from '../components/shared/CategoryIcon.jsx';
import ProgressBar from '../components/shared/ProgressBar.jsx';
import EditBudgetModal from '../components/budget/EditBudgetModal.jsx';
import AddCategoryModal from '../components/budget/AddCategoryModal.jsx';
import AddBudgetItemModal from '../components/budget/AddBudgetItemModal.jsx';

export default function Budget() {
  const { data, remaining, deleteCategory } = useFinance();
  const { t } = useLanguage();
  const [editing, setEditing] = useState(null);
  const [addingCategory, setAddingCategory] = useState(false);
  const [addingBudgetItem, setAddingBudgetItem] = useState(false);

  return (
    <>
      <header className="page-header">
        <div className="page-header-top">
          <div>
            <p className="page-kicker">{data.month}</p>
            <h1 className="page-title">{t('budget.title')}</h1>
          </div>
          <div className="page-actions">
            <button
              type="button"
              className="btn btn-ghost btn-small"
              onClick={() => setAddingCategory(true)}
            >
              <Plus size={16} />
              {t('budget.category')}
            </button>
            <button
              type="button"
              className="btn btn-primary btn-small"
              onClick={() => setAddingBudgetItem(true)}
            >
              <Plus size={16} />
              {t('budget.budgetItem')}
            </button>
          </div>
        </div>
        <p className="page-subtitle">{t('budget.subtitle')}</p>
      </header>

      <section className="card">
        <p className="spendable-label">{t('budget.leftThisMonth')}</p>
        <p className={`spendable-amount amount ${remaining < 0 ? 'amount-danger' : ''}`}>
          {formatMoney(remaining)}
        </p>
        <p className="spendable-meta">
          {t('budget.startedWith', { total: formatMoney(data.spendingBudget) })}
        </p>
        <div className="summary-grid">
          <div className="stat">
            <div className="stat-label">{t('budget.had')}</div>
            <div className="stat-value">{formatMoney(data.spendingBudget)}</div>
          </div>
          <div className="stat">
            <div className="stat-label">{t('budget.spent')}</div>
            <div className="stat-value">{formatMoney(data.spent)}</div>
          </div>
          <div className="stat">
            <div className="stat-label">{t('budget.left')}</div>
            <div className={`stat-value ${remaining < 0 ? 'amount-danger' : ''}`}>
              {formatMoney(remaining)}
            </div>
          </div>
        </div>
      </section>

      {data.categories.length === 0 ? (
        <div className="card empty-state">
          <p>{t('budget.empty')}</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setAddingBudgetItem(true)}
          >
            {t('budget.addItem')}
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
                        ? t('budget.noBudgetSet')
                        : leftover < 0
                          ? t('budget.overOf', {
                              over: formatMoney(Math.abs(leftover)),
                              total: formatMoney(category.budget),
                            })
                          : t('budget.leftOf', {
                              left: formatMoney(leftover),
                              total: formatMoney(category.budget),
                            })}
                    </p>
                  </div>
                  <div className="account-actions">
                    <button
                      type="button"
                      className="btn btn-ghost btn-small"
                      onClick={() => setEditing(category)}
                    >
                      {t('budget.edit')}
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-small"
                      onClick={async () => {
                        const confirmed = window.confirm(
                          t('budget.deleteConfirm', { name: category.name }),
                        );
                        if (!confirmed) return;
                        await deleteCategory(category.id);
                      }}
                    >
                      {t('budget.delete')}
                    </button>
                  </div>
                </div>
                <div className="budget-row-figures">
                  <div>
                    {t('budget.had')}
                    <strong>{formatMoney(category.budget)}</strong>
                  </div>
                  <div>
                    {t('budget.spent')}
                    <strong>{formatMoney(category.spent)}</strong>
                  </div>
                  <div>
                    {t('budget.left')}
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
