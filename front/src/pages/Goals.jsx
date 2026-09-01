import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useFinance } from '../context/useFinance.js';
import { useLanguage } from '../context/useLanguage.js';
import GoalCard from '../components/goals/GoalCard.jsx';
import GoalModal from '../components/goals/GoalModal.jsx';

export default function Goals() {
  const { data, deleteGoal } = useFinance();
  const { t } = useLanguage();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
  }

  async function handleDelete(goal) {
    const confirmed = window.confirm(t('goals.deleteConfirm', { name: goal.title }));
    if (!confirmed) return;
    await deleteGoal(goal.id);
  }

  return (
    <>
      <header className="page-header">
        <div className="page-header-top">
          <div>
            <h1 className="page-title">{t('goals.title')}</h1>
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
              {t('goals.add')}
            </button>
          </div>
        </div>
      </header>

      {data.goals.length === 0 ? (
        <div className="card empty-state">
          <p>{t('goals.empty')}</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setModalOpen(true)}
          >
            {t('goals.add')}
          </button>
        </div>
      ) : (
        <div className="savings-grid">
          {data.goals.map((goal) => (
            <div key={goal.id} className="goal-card-wrap">
              <GoalCard goal={goal} />
              <div className="account-actions">
                <button
                  type="button"
                  className="icon-button"
                  aria-label={t('goals.edit')}
                  title={t('goals.edit')}
                  onClick={() => {
                    setEditing(goal);
                    setModalOpen(true);
                  }}
                >
                  <Pencil size={16} />
                </button>
                <button
                  type="button"
                  className="icon-button is-danger"
                  aria-label={t('goals.delete')}
                  title={t('goals.delete')}
                  onClick={() => handleDelete(goal)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <GoalModal open={modalOpen} goal={editing} onClose={closeModal} />
    </>
  );
}
