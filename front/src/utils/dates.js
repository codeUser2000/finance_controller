export function toInputDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getGreetingKey() {
  const hour = new Date().getHours();
  if (hour < 12) return 'greeting.morning';
  if (hour < 18) return 'greeting.afternoon';
  return 'greeting.evening';
}

export function getBudgetPeriod(date = new Date(), locale = 'hy-AM') {
  return {
    month: date.getMonth() + 1,
    year: date.getFullYear(),
    label: date.toLocaleString(locale, { month: 'long', year: 'numeric' }),
  };
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function parseLocalDate(value) {
  if (!value) return new Date();
  const raw = String(value).slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [year, month, day] = raw.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  return new Date(value);
}

export function isInPeriod(value, month, year) {
  const date = parseLocalDate(value);
  return date.getMonth() + 1 === Number(month) && date.getFullYear() === Number(year);
}

export function formatMonthYear(month, year, locale = 'hy-AM') {
  return new Date(year, month - 1, 1).toLocaleString(locale, {
    month: 'long',
    year: 'numeric',
  });
}

export function listMonthOptions(transactions, currentPeriod, locale = 'hy-AM') {
  const map = new Map();
  map.set(`${currentPeriod.year}-${currentPeriod.month}`, {
    month: currentPeriod.month,
    year: currentPeriod.year,
    label: formatMonthYear(currentPeriod.month, currentPeriod.year, locale),
  });

  for (const transaction of transactions) {
    const date = parseLocalDate(transaction.occurredAt);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    map.set(`${year}-${month}`, {
      month,
      year,
      label: formatMonthYear(month, year, locale),
    });
  }

  return [...map.values()].sort((a, b) => b.year - a.year || b.month - a.month);
}

export function getDateGroup(iso) {
  const date = parseLocalDate(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (isSameDay(date, today)) return 'today';
  if (isSameDay(date, yesterday)) return 'yesterday';
  return 'earlier';
}

export function formatTime(iso) {
  return parseLocalDate(iso).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatShortDate(iso, locale = 'hy-AM') {
  return parseLocalDate(iso).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
  });
}

export function groupTransactions(transactions) {
  const groups = { today: [], yesterday: [], earlier: [] };

  for (const transaction of transactions) {
    groups[getDateGroup(transaction.occurredAt)].push(transaction);
  }

  return ['today', 'yesterday', 'earlier']
    .map((key) => ({ key, items: groups[key] }))
    .filter((group) => group.items.length > 0);
}

export function dateToIso(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  const now = new Date();
  return new Date(
    year,
    month - 1,
    day,
    now.getHours(),
    now.getMinutes(),
    0,
    0,
  ).toISOString();
}
