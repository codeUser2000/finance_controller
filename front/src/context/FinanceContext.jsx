import { useState } from 'react';
import { initialFinance } from '../data/mockData.js';
import { dateToIso } from '../utils/dates.js';
import { FinanceContext } from './financeContext.js';

function createId() {
  return crypto.randomUUID();
}

export function FinanceProvider({ children }) {
  const [data, setData] = useState(() => structuredClone(initialFinance));
  const [isAddOpen, setIsAddOpen] = useState(false);

  const remaining = data.spendingBudget - data.spent;

  function openAdd() {
    setIsAddOpen(true);
  }

  function closeAdd() {
    setIsAddOpen(false);
  }

  function getAccountName(accountId) {
    return data.accounts.find((account) => account.id === accountId)?.name || '';
  }

  function addTransaction({ type, amount, category, accountId, note, date }) {
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) return;

    const description = note?.trim() || category;
    const transaction = {
      id: createId(),
      description,
      category:
        type === 'income' ? 'Income' : type === 'transfer' ? 'Transfer' : category,
      type,
      amount: numericAmount,
      accountId,
      occurredAt: dateToIso(date),
    };

    setData((prev) => {
      const next = {
        ...prev,
        transactions: [transaction, ...prev.transactions],
      };

      if (type === 'expense') {
        next.spent = prev.spent + numericAmount;
        next.categories = prev.categories.map((item) =>
          item.name === category
            ? { ...item, spent: item.spent + numericAmount }
            : item,
        );
        next.accounts = prev.accounts.map((account) =>
          account.id === accountId
            ? { ...account, balance: account.balance - numericAmount }
            : account,
        );
      }

      if (type === 'income') {
        next.accounts = prev.accounts.map((account) =>
          account.id === accountId
            ? { ...account, balance: account.balance + numericAmount }
            : account,
        );
      }

      if (type === 'transfer') {
        next.accounts = prev.accounts.map((account) =>
          account.id === accountId
            ? { ...account, balance: account.balance - numericAmount }
            : account,
        );

        const goal = prev.savings.find((item) => item.transferCategory === category);
        if (goal) {
          next.savings = prev.savings.map((item) =>
            item.id === goal.id
              ? {
                  ...item,
                  current: item.current + numericAmount,
                  contributions: [
                    { id: createId(), label: 'Just now', amount: numericAmount },
                    ...item.contributions,
                  ],
                }
              : item,
          );
          next.accounts = next.accounts.map((account) =>
            account.id === goal.accountId
              ? { ...account, balance: account.balance + numericAmount }
              : account,
          );
        }
      }

      return next;
    });

    setIsAddOpen(false);
  }

  function updateCategoryBudget(categoryId, budget) {
    const numericBudget = Number(budget);
    if (Number.isNaN(numericBudget) || numericBudget < 0) return;

    setData((prev) => {
      const categories = prev.categories.map((item) =>
        item.id === categoryId ? { ...item, budget: numericBudget } : item,
      );
      const spendingBudget = categories.reduce((sum, item) => sum + item.budget, 0);
      return { ...prev, categories, spendingBudget };
    });
  }

  return (
    <FinanceContext.Provider
      value={{
        data,
        remaining,
        isAddOpen,
        openAdd,
        closeAdd,
        addTransaction,
        updateCategoryBudget,
        getAccountName,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}
