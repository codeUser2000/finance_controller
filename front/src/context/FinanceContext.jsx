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

  function addCategory(name) {
    const trimmed = name.trim();
    if (!trimmed) return 'Enter a category name.';

    const exists = data.categories.some(
      (item) => item.name.toLowerCase() === trimmed.toLowerCase(),
    );
    if (exists) return 'That category already exists.';

    setData((prev) => ({
      ...prev,
      categories: [
        ...prev.categories,
        { id: createId(), name: trimmed, budget: 0, spent: 0 },
      ],
    }));

    return null;
  }

  function addBudgetItem({ categoryId, name, budget }) {
    const numericBudget = Number(budget);
    if (Number.isNaN(numericBudget) || numericBudget < 0) {
      return 'Enter a valid budget amount.';
    }

    if (categoryId) {
      const category = data.categories.find((item) => item.id === categoryId);
      if (!category) return 'Choose a category.';
      updateCategoryBudget(categoryId, numericBudget);
      return null;
    }

    const trimmed = name.trim();
    if (!trimmed) return 'Enter a category name.';

    const existing = data.categories.find(
      (item) => item.name.toLowerCase() === trimmed.toLowerCase(),
    );

    if (existing) {
      updateCategoryBudget(existing.id, numericBudget);
      return null;
    }

    setData((prev) => {
      const categories = [
        ...prev.categories,
        { id: createId(), name: trimmed, budget: numericBudget, spent: 0 },
      ];
      const spendingBudget = categories.reduce((sum, item) => sum + item.budget, 0);
      return { ...prev, categories, spendingBudget };
    });

    return null;
  }

  function addAccount({ name, kind, balance, note }) {
    const trimmed = name.trim();
    if (!trimmed) return 'Enter an account name.';

    const exists = data.accounts.some(
      (item) => item.name.toLowerCase() === trimmed.toLowerCase(),
    );
    if (exists) return 'That account already exists.';

    const numericBalance = Number(balance);
    if (Number.isNaN(numericBalance)) return 'Enter a valid opening balance.';

    const accountKind = kind === 'savings' ? 'savings' : 'spending';

    setData((prev) => ({
      ...prev,
      accounts: [
        ...prev.accounts,
        {
          id: createId(),
          name: trimmed,
          balance: numericBalance,
          kind: accountKind,
          note:
            note?.trim() ||
            (accountKind === 'savings' ? 'Savings account' : 'Spending account'),
        },
      ],
    }));

    return null;
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
        addCategory,
        addBudgetItem,
        addAccount,
        getAccountName,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}
