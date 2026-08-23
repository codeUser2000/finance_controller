function occurredAt(daysAgo, hours, minutes) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
}

export const expenseCategories = [
  'Transport',
  'Food & Coffee',
  'Wildberries',
  'Going Out',
  'Personal',
  'Buffer',
];

export const incomeCategories = ['Salary', 'Other'];

export const transferCategories = ['Car Fund', 'Emergency Reserve'];

export const initialFinance = {
  month: 'August 2026',
  spendingBudget: 69000,
  spent: 18400,
  savings: [
    {
      id: 'car',
      name: 'First Car',
      current: 2440000,
      target: 3000000,
      transferCategory: 'Car Fund',
      accountId: 'main-savings',
      contributions: [
        { id: 'c1', label: 'August', amount: 950000 },
        { id: 'c2', label: 'July', amount: 200000 },
        { id: 'c3', label: 'June', amount: 200000 },
      ],
    },
    {
      id: 'reserve',
      name: 'Emergency Reserve',
      current: 204500,
      target: 500000,
      transferCategory: 'Emergency Reserve',
      accountId: 'side-savings',
      contributions: [
        { id: 'r1', label: 'August', amount: 45000 },
        { id: 'r2', label: 'July', amount: 80000 },
      ],
    },
  ],
  categories: [
    { id: 'transport', name: 'Transport', budget: 20000, spent: 6200 },
    { id: 'food', name: 'Food & Coffee', budget: 18000, spent: 4500 },
    { id: 'wildberries', name: 'Wildberries', budget: 10000, spent: 7700 },
    { id: 'going-out', name: 'Going Out', budget: 8000, spent: 0 },
    { id: 'personal', name: 'Personal', budget: 4000, spent: 0 },
    { id: 'buffer', name: 'Buffer', budget: 9000, spent: 0 },
  ],
  accounts: [
    {
      id: 'daily',
      name: 'Daily Card',
      balance: 69000,
      kind: 'spending',
      note: 'Money you can spend this month',
    },
    {
      id: 'main-savings',
      name: 'Main Savings',
      balance: 2440000,
      kind: 'savings',
      note: 'First Car fund',
    },
    {
      id: 'side-savings',
      name: 'Side Savings',
      balance: 204500,
      kind: 'savings',
      note: 'Emergency reserve',
    },
  ],
  transactions: [
    {
      id: 't1',
      description: 'Taxi to university',
      category: 'Transport',
      type: 'expense',
      amount: 1700,
      accountId: 'daily',
      occurredAt: occurredAt(0, 9, 42),
    },
    {
      id: 't2',
      description: 'Coffee',
      category: 'Food & Coffee',
      type: 'expense',
      amount: 1200,
      accountId: 'daily',
      occurredAt: occurredAt(0, 8, 15),
    },
    {
      id: 't3',
      description: 'Wildberries',
      category: 'Wildberries',
      type: 'expense',
      amount: 6400,
      accountId: 'daily',
      occurredAt: occurredAt(1, 19, 20),
    },
    {
      id: 't4',
      description: 'Lunch',
      category: 'Food & Coffee',
      type: 'expense',
      amount: 2200,
      accountId: 'daily',
      occurredAt: occurredAt(1, 13, 10),
    },
    {
      id: 't5',
      description: 'Bus to center',
      category: 'Transport',
      type: 'expense',
      amount: 400,
      accountId: 'daily',
      occurredAt: occurredAt(1, 8, 50),
    },
    {
      id: 't6',
      description: 'Grocery shop',
      category: 'Food & Coffee',
      type: 'expense',
      amount: 1100,
      accountId: 'daily',
      occurredAt: occurredAt(4, 18, 5),
    },
    {
      id: 't7',
      description: 'Yandex Go',
      category: 'Transport',
      type: 'expense',
      amount: 1500,
      accountId: 'daily',
      occurredAt: occurredAt(3, 17, 40),
    },
    {
      id: 't8',
      description: 'Taxi home',
      category: 'Transport',
      type: 'expense',
      amount: 2600,
      accountId: 'daily',
      occurredAt: occurredAt(5, 21, 12),
    },
    {
      id: 't9',
      description: 'Wildberries',
      category: 'Wildberries',
      type: 'expense',
      amount: 1300,
      accountId: 'daily',
      occurredAt: occurredAt(7, 16, 30),
    },
    {
      id: 't10',
      description: 'Car Savings',
      category: 'Transfer',
      type: 'transfer',
      amount: 200000,
      accountId: 'daily',
      occurredAt: occurredAt(8, 11, 0),
    },
    {
      id: 't11',
      description: 'Salary',
      category: 'Income',
      type: 'income',
      amount: 500000,
      accountId: 'daily',
      occurredAt: occurredAt(22, 10, 0),
    },
  ],
};
