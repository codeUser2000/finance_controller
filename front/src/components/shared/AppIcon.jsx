import { useResolvedTheme } from '../../hooks/useSystemTheme.js';

export default function AppIcon({ size = 36, className = '' }) {
  const theme = useResolvedTheme();

  return (
    <img
      src={`/${theme}/android-chrome-192x192.png`}
      alt=""
      className={`app-icon ${className}`.trim()}
      width={size}
      height={size}
      decoding="async"
    />
  );
}
