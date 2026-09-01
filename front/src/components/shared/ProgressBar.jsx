const TONE_CLASSES = {
  primary: '',
  secondary: 'progress-fill--secondary',
  accent: 'progress-fill--accent',
  warning: 'progress-fill--warning',
  danger: 'progress-fill--danger',
  success: 'progress-fill--success',
};

export default function ProgressBar({ value, max, tone = 'primary' }) {
  const percent = max > 0 ? Math.min((Number(value) / Number(max)) * 100, 100) : 0;
  const toneClass = TONE_CLASSES[tone] ?? '';

  return (
    <div
      className="progress"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(percent)}
    >
      <div className={`progress-fill ${toneClass}`} style={{ width: `${percent}%` }} />
    </div>
  );
}
