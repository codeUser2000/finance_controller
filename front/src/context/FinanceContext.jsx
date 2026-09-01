import { useCallback, useEffect, useMemo, useState } from 'react';
import { getBudgetPeriod, isInPeriod } from '../utils/dates.js';
import { FinanceContext } from './financeContext.js';
import { useLanguage } from './useLanguage.js';
import { api } from '../api/client.js';

function mapAccount(account) {
  return {
    id: account.id,
    name: account.name,
    type: account.type,
    kind: account.type === 'savings' ? 'savings' : 'spending',
    balance: Number(account.balance),
    currency: account.currency || 'AMD',
  };
}

function mapGoal(goal) {
  return {
    id: goal.id,
    title: goal.title,
    current: Number(goal.current_amount),
    target: Number(goal.target_amount),
    accountId: goal.account_id ?? null,
    accountName: goal.Account?.name ?? null,
  };
}

function mapTransaction(transaction) {
  return {
    id: transaction.id,
    type: transaction.type,
    amount: Number(transaction.amount),
    categoryId: transaction.category_id,
    category: transaction.Category?.name || '',
    accountId: transaction.account_id,
    accountName: transaction.Account?.name || '',
    toAccountId: transaction.to_account_id,
    toAccountName: transaction.ToAccount?.name || '',
    description: transaction.note || transaction.Category?.name || '',
    occurredAt: transaction.occurred_at,
  };
}

function mergeCategories(apiCategories, budgetItems, transactions, month, year) {
  return apiCategories.map((category) => {
    const budgetItem = budgetItems.find(
      (item) => Number(item.category_id) === Number(category.id),
    );
    const spent = transactions
      .filter(
        (transaction) =>
          transaction.type === 'expense' &&
          Number(transaction.categoryId) === Number(category.id) &&
          isInPeriod(transaction.occurredAt, month, year),
      )
      .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

    return {
      id: category.id,
      name: category.name,
      type: category.type,
      icon: category.icon,
      color: category.color,
      isActive: category.is_active !== false && Number(category.is_active) !== 0,
      budgetActive: budgetItem
        ? budgetItem.is_active !== false && Number(budgetItem.is_active) !== 0
        : false,
      budget: budgetItem ? Number(budgetItem.amount) : 0,
      spent,
      budgetItemId: budgetItem?.id ?? null,
    };
  });
}

function isTracked(category) {
  if (!category.isActive) return false;
  if (category.budgetItemId && !category.budgetActive) return false;
  return true;
}

export function FinanceProvider({ children }) {
  const { t, locale } = useLanguage();
  const period = useMemo(() => getBudgetPeriod(new Date(), locale), [locale]);
  const [apiCategories, setApiCategories] = useState([]);
  const [budgetItems, setBudgetItems] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [goals, setGoals] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    const { month, year } = getBudgetPeriod();
    const [nextCategories, nextAccounts, nextBudgets, nextGoals, nextTransactions] =
      await Promise.all([
      api.get('/categories'),
      api.get('/accounts'),
      api.get(`/budgets?month=${month}&year=${year}`),
      api.get('/goals'),
      api.get('/transactions'),
    ]);
    setApiCategories(nextCategories);
    setAccounts(nextAccounts.map(mapAccount));
    setBudgetItems(nextBudgets);
    setGoals(nextGoals.map(mapGoal));
    setTransactions(nextTransactions.map(mapTransaction));
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setError('');
        await reload();
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.message || 'load-failed');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [reload]);

  const categories = useMemo(
    () => mergeCategories(apiCategories, budgetItems, transactions, period.month, period.year),
    [apiCategories, budgetItems, transactions, period.month, period.year],
  );

  const trackedCategories = categories.filter(isTracked);
  const spendingBudget = trackedCategories.reduce((sum, category) => sum + category.budget, 0);
  const spent = trackedCategories.reduce((sum, category) => sum + category.spent, 0);
  const savingsAccounts = accounts.filter((account) => account.type === 'savings');

  const data = {
    month: period.label,
    budgetMonth: period.month,
    budgetYear: period.year,
    spendingBudget,
    spent,
    savingsAccounts,
    goals,
    categories,
    accounts,
    transactions,
  };

  const remaining = spendingBudget - spent;

  function openAdd() {
    setIsAddOpen(true);
  }

  function closeAdd() {
    setIsAddOpen(false);
  }

  function getAccountName(accountId) {
    return accounts.find((account) => String(account.id) === String(accountId))?.name || '';
  }

  async function addTransaction({ type, amount, categoryId, accountId, toAccountId, note, date }) {
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) return t('errors.enterAmount');
    if (!accountId) return t('errors.chooseAccount');
    if (type === 'expense' && !categoryId) return t('errors.chooseCategory');
    if (type === 'transfer') {
      if (accounts.length < 2) return t('errors.needTwoAccounts');
      if (!toAccountId) return t('errors.chooseToAccount');
      if (String(accountId) === String(toAccountId)) return t('errors.sameAccount');
    }

    try {
      await api.post('/transactions', {
        type,
        amount: numericAmount,
        category_id: categoryId || null,
        account_id: accountId,
        to_account_id: type === 'transfer' ? toAccountId : null,
        note: note?.trim() || null,
        occurred_at: date,
      });
      await reload();
      setIsAddOpen(false);
      return null;
    } catch (saveError) {
      return saveError.message;
    }
  }

  async function updateCategoryBudget(categoryId, budget) {
    const numericBudget = Number(budget);
    if (Number.isNaN(numericBudget) || numericBudget < 0) {
      return t('errors.enterBudget');
    }

    const category = categories.find((item) => String(item.id) === String(categoryId));
    if (!category) return t('errors.chooseCategory');

    try {
      if (category.budgetItemId) {
        await api.put(`/budgets/${category.budgetItemId}`, { amount: numericBudget });
      } else {
        await api.post('/budgets', {
          category_id: category.id,
          month: period.month,
          year: period.year,
          amount: numericBudget,
        });
      }
      await reload();
      return null;
    } catch (saveError) {
      return saveError.message;
    }
  }

  async function addCategory({ name, type = 'expense' }) {
    const trimmed = name.trim();
    if (!trimmed) return t('errors.enterCategoryName');

    try {
      await api.post('/categories', {
        name: trimmed,
        type: type === 'income' ? 'income' : 'expense',
      });
      await reload();
      return null;
    } catch (saveError) {
      return saveError.message;
    }
  }

  async function setCategoryActive(categoryId, isActive) {
    try {
      await api.put(`/categories/${categoryId}`, { is_active: isActive });
      await reload();
      return null;
    } catch (saveError) {
      return saveError.message;
    }
  }

  async function deleteCategory(categoryId) {
    try {
      await api.delete(`/categories/${categoryId}`);
      await reload();
      return null;
    } catch (saveError) {
      return saveError.message;
    }
  }

  async function setBudgetItemActive(budgetItemId, isActive) {
    try {
      await api.put(`/budgets/${budgetItemId}`, { is_active: isActive });
      await reload();
      return null;
    } catch (saveError) {
      return saveError.message;
    }
  }

  async function deleteBudgetItem(budgetItemId) {
    try {
      await api.delete(`/budgets/${budgetItemId}`);
      await reload();
      return null;
    } catch (saveError) {
      return saveError.message;
    }
  }

  async function addBudgetItem({ categoryId, name, budget }) {
    const numericBudget = Number(budget);
    if (Number.isNaN(numericBudget) || numericBudget < 0) {
      return t('errors.enterBudget');
    }

    try {
      let nextCategoryId = categoryId;
      if (!nextCategoryId) {
        const trimmed = name.trim();
        if (!trimmed) return t('errors.enterCategoryName');
        const created = await api.post('/categories', {
          name: trimmed,
          type: 'expense',
        });
        nextCategoryId = created.id;
      }

      const existing = categories.find((item) => String(item.id) === String(nextCategoryId));
      if (existing?.budgetItemId) {
        await api.put(`/budgets/${existing.budgetItemId}`, { amount: numericBudget });
      } else {
        await api.post('/budgets', {
          category_id: nextCategoryId,
          month: period.month,
          year: period.year,
          amount: numericBudget,
        });
      }

      await reload();
      return null;
    } catch (saveError) {
      return saveError.message;
    }
  }

  async function addAccount({ name, type, balance }) {
    const trimmed = name.trim();
    if (!trimmed) return t('errors.enterAccountName');

    const numericBalance = balance === '' || balance === undefined ? 0 : Number(balance);
    if (Number.isNaN(numericBalance)) return t('errors.enterOpeningBalance');

    const accountType = ['cash', 'card', 'bank', 'savings'].includes(type)
      ? type
      : 'card';

    try {
      await api.post('/accounts', {
        name: trimmed,
        type: accountType,
        balance: numericBalance,
        currency: 'AMD',
      });
      await reload();
      return null;
    } catch (saveError) {
      return saveError.message;
    }
  }

  async function updateAccount(accountId, { name, type }) {
    const trimmed = name.trim();
    if (!trimmed) return t('errors.enterAccountName');

    const accountType = ['cash', 'card', 'bank', 'savings'].includes(type)
      ? type
      : 'card';

    try {
      await api.put(`/accounts/${accountId}`, {
        name: trimmed,
        type: accountType,
      });
      await reload();
      return null;
    } catch (saveError) {
      return saveError.message;
    }
  }

  async function deleteAccount(accountId) {
    try {
      await api.delete(`/accounts/${accountId}`);
      await reload();
      return null;
    } catch (saveError) {
      return saveError.message;
    }
  }

  async function addGoal({ title, current, target, accountId }) {
    const trimmed = title.trim();
    if (!trimmed) return t('errors.enterGoalTitle');

    const targetAmount = Number(target);
    if (Number.isNaN(targetAmount) || targetAmount <= 0) {
      return t('errors.enterGoalTarget');
    }

    const payload = {
      title: trimmed,
      target_amount: targetAmount,
      account_id: accountId || null,
    };

    if (!accountId) {
      const currentAmount = current === '' || current === undefined ? 0 : Number(current);
      if (Number.isNaN(currentAmount) || currentAmount < 0) {
        return t('errors.enterGoalCurrent');
      }
      payload.current_amount = currentAmount;
    }

    try {
      await api.post('/goals', payload);
      await reload();
      return null;
    } catch (saveError) {
      return saveError.message;
    }
  }

  async function updateGoal(goalId, { title, current, target, accountId }) {
    const trimmed = title.trim();
    if (!trimmed) return t('errors.enterGoalTitle');

    const targetAmount = Number(target);
    if (Number.isNaN(targetAmount) || targetAmount <= 0) {
      return t('errors.enterGoalTarget');
    }

    const payload = {
      title: trimmed,
      target_amount: targetAmount,
      account_id: accountId || null,
    };

    if (!accountId) {
      const currentAmount = current === '' || current === undefined ? 0 : Number(current);
      if (Number.isNaN(currentAmount) || currentAmount < 0) {
        return t('errors.enterGoalCurrent');
      }
      payload.current_amount = currentAmount;
    }

    try {
      await api.put(`/goals/${goalId}`, payload);
      await reload();
      return null;
    } catch (saveError) {
      return saveError.message;
    }
  }

  async function deleteGoal(goalId) {
    try {
      await api.delete(`/goals/${goalId}`);
      await reload();
      return null;
    } catch (saveError) {
      return saveError.message;
    }
  }

  async function deleteTransaction(transactionId) {
    try {
      await api.delete(`/transactions/${transactionId}`);
      await reload();
      return null;
    } catch (saveError) {
      return saveError.message;
    }
  }

  return (
    <FinanceContext.Provider
      value={{
        data,
        remaining,
        loading,
        error,
        isAddOpen,
        openAdd,
        closeAdd,
        addTransaction,
        deleteTransaction,
        updateCategoryBudget,
        addCategory,
        setCategoryActive,
        deleteCategory,
        setBudgetItemActive,
        deleteBudgetItem,
        addBudgetItem,
        addAccount,
        updateAccount,
        deleteAccount,
        addGoal,
        updateGoal,
        deleteGoal,
        getAccountName,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}
