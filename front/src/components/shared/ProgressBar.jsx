export default function ProgressBar({ value, max, tone = 'primary' }) {
  const percent = max > 0 ? Math.min((Number(value) / Number(max)) * 100, 100) : 0;
  const toneClass =
    tone === 'warning'
      ? 'progress-fill--warning'
      : tone === 'danger'
        ? 'progress-fill--danger'
        : tone === 'success'
          ? 'progress-fill--success'
          : '';

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
