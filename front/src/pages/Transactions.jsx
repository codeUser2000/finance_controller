import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useFinance } from '../context/useFinance.js';
import { groupTransactions } from '../utils/dates.js';
import TransactionRow from '../components/shared/TransactionRow.jsx';

const filters = [
  { id: 'all', label: 'All' },
  { id: 'expense', label: 'Expenses' },
  { id: 'income', label: 'Income' },
  { id: 'transfer', label: 'Transfers' },
];

export default function Transactions() {
  const { data, getAccountName, openAdd } = useFinance();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return data.transactions.filter((transaction) => {
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
  }, [data.transactions, filter, query, getAccountName]);

  const groups = groupTransactions(filtered);

  return (
    <>
      <header className="page-header">
        <h1 className="page-title">Transactions</h1>
        <p className="page-subtitle">Your spending, income, and transfers.</p>
      </header>

      <div className="toolbar">
        <div className="search-field">
          <Search size={16} />
          <input
            type="search"
            placeholder="Search by name or category"
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
          <p>No transactions found.</p>
          <button type="button" className="btn btn-primary" onClick={openAdd}>
            Add transaction
          </button>
        </div>
      ) : (
        groups.map((group) => (
          <section key={group.label} className="tx-group">
            <h2 className="tx-group-title">{group.label}</h2>
            <div className="card">
              <div className="tx-list">
                {group.items.map((transaction) => (
                  <TransactionRow
                    key={transaction.id}
                    transaction={transaction}
                    accountName={getAccountName(transaction.accountId)}
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
