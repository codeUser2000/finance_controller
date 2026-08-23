import {
  ArrowLeftRight,
  Banknote,
  Bus,
  Car,
  Coffee,
  Receipt,
  Shield,
  ShoppingBag,
  Sparkles,
  Umbrella,
  Wine,
} from 'lucide-react';

const ICONS = {
  Transport: Bus,
  'Food & Coffee': Coffee,
  Wildberries: ShoppingBag,
  'Going Out': Wine,
  Personal: Sparkles,
  Buffer: Umbrella,
  Income: Banknote,
  Transfer: ArrowLeftRight,
  Salary: Banknote,
  Other: Banknote,
  'Car Fund': Car,
  'Emergency Reserve': Shield,
};

export default function CategoryIcon({ name, size = 18, tone }) {
  const Icon = ICONS[name] || Receipt;
  const toneClass =
    tone && tone !== 'primary' ? `icon-badge icon-badge--${tone}` : 'icon-badge';

  return (
    <span className={toneClass}>
      <Icon size={size} strokeWidth={1.75} />
    </span>
  );
}
