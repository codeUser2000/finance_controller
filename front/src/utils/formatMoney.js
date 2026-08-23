export function formatMoney(amount) {
  const value = Number(amount) || 0;
  return `${Math.abs(value).toLocaleString('en-US')} AMD`;
}

export function formatSignedMoney(amount, type) {
  const formatted = formatMoney(amount);
  if (type === 'income') return `+${formatted}`;
  if (type === 'expense' || type === 'transfer') return `−${formatted}`;
  return formatted;
}

export function formatPercent(part, whole) {
  if (!whole) return 0;
  return Math.round((Number(part) / Number(whole)) * 100);
}

export function getBudgetTone(spent, budget) {
  if (!budget) return 'primary';
  const percent = (Number(spent) / Number(budget)) * 100;
  if (percent >= 100) return 'danger';
  if (percent >= 75) return 'warning';
  return 'primary';
}
