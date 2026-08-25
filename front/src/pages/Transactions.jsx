import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useFinance } from '../context/useFinance.js';
import { useLanguage } from '../context/useLanguage.js';
import { formatMoney } from '../utils/formatMoney.js';
import {
  groupTransactions,
  isInPeriod,
  listMonthOptions,
} from '../utils/dates.js';
import TransactionRow from '../components/shared/TransactionRow.jsx';

export default function Transactions() {
  const { data, getAccountName, openAdd, deleteTransaction } = useFinance();
  const { t, locale } = useLanguage();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const monthOptions = listMonthOptions(
    data.transactions,
    {
      month: data.budgetMonth,
      year: data.budgetYear,
      label: data.month,
    },
    locale,
  );
  const [monthKey, setMonthKey] = useState(`${data.budgetYear}-${data.budgetMonth}`);
  const [selectedYear, selectedMonth] = monthKey.split('-').map(Number);

  const monthlyTransactions = useMemo(
    () =>
      data.transactions.filter((transaction) =>
        isInPeriod(transaction.occurredAt, selectedMonth, selectedYear),
      ),
    [data.transactions, selectedMonth, selectedYear],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return monthlyTransactions.filter((transaction) => {
      const matchesType = filter === 'all' || transaction.type === filter;
      const haystack = [
        transaction.description,
        transaction.category,
        getAccountName(transaction.accountId),
      ]
        .join(' ')
        .toLowerCase();
      const matchesQuery = !needle || haystack.includes(needle);
      return matchesType && matchesQuery;
    });
  }, [monthlyTransactions, filter, query, getAccountName]);

  const groups = groupTransactions(filtered);

  async function handleDelete(transaction) {
    const confirmed = window.confirm(t('transactions.deleteConfirm'));
    if (!confirmed) return;
    await deleteTransaction(transaction.id);
  }

  const monthSpent = monthlyTransactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const monthIncome = monthlyTransactions
    .filter((transaction) => transaction.type === 'income')
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const spentByCategory = data.categories
    .map((category) => ({
      id: category.id,
      name: category.name,
      amount: monthlyTransactions
        .filter(
          (transaction) =>
            transaction.type === 'expense' &&
            Number(transaction.categoryId) === Number(category.id),
        )
        .reduce((sum, transaction) => sum + transaction.amount, 0),
    }))
    .filter((item) => item.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  const filters = [
    { id: 'all', label: t('transactions.all') },
    { id: 'expense', label: t('transactions.expenses') },
    { id: 'income', label: t('transactions.income') },
    { id: 'transfer', label: t('transactions.transfers') },
  ];

  return (
    <>
      <header className="page-header">
        <h1 className="page-title">{t('transactions.title')}</h1>
        <p className="page-subtitle">{t('transactions.subtitle')}</p>
      </header>

      <label className="form-field">
        <span className="form-label">{t('transactions.month')}</span>
        <select value={monthKey} onChange={(event) => setMonthKey(event.target.value)}>
          {monthOptions.map((option) => (
            <option key={`${option.year}-${option.month}`} value={`${option.year}-${option.month}`}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <section className="card">
        <div className="summary-grid">
          <div className="stat">
            <div className="stat-label">{t('transactions.spent')}</div>
            <div className="stat-value">{formatMoney(monthSpent)}</div>
          </div>
          <div className="stat">
            <div className="stat-label">{t('transactions.income')}</div>
            <div className="stat-value">{formatMoney(monthIncome)}</div>
          </div>
          <div className="stat">
            <div className="stat-label">{t('transactions.count')}</div>
            <div className="stat-value">{monthlyTransactions.length}</div>
          </div>
        </div>
      </section>

      {spentByCategory.length > 0 ? (
        <section className="section">
          <h2 className="section-title">{t('transactions.where')}</h2>
          <div className="card">
            <div className="breakdown-list">
              {spentByCategory.map((item) => (
                <div key={item.id} className="breakdown-row">
                  <span>{item.name}</span>
                  <strong>{formatMoney(item.amount)}</strong>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <div className="toolbar">
        <div className="search-field">
          <Search size={16} />
          <input
            type="search"
            placeholder={t('transactions.search')}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className="filters">
          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`chip ${filter === item.id ? 'is-active' : ''}`}
              onClick={() => setFilter(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="card empty-state">
          <p>{t('transactions.empty')}</p>
          <button type="button" className="btn btn-primary" onClick={openAdd}>
            {t('transactions.add')}
          </button>
        </div>
      ) : (
        groups.map((group) => (
          <section key={group.key} className="tx-group">
            <h2 className="tx-group-title">{t(`dateGroup.${group.key}`)}</h2>
            <div className="card">
              <div className="tx-list">
                {group.items.map((transaction) => (
                  <TransactionRow
                    key={transaction.id}
                    transaction={transaction}
                    accountName={getAccountName(transaction.accountId)}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          </section>
        ))
      )}
    </>
  );
}
