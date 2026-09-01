import { Link } from 'react-router-dom';
import { useLanguage } from '../context/useLanguage.js';

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <>
      <header className="page-header">
        <h1 className="page-title">{t('notFound.title')}</h1>
        <p className="page-subtitle">{t('notFound.message')}</p>
      </header>

      <div className="card empty-state not-found">
        <p className="not-found-code" aria-hidden="true">
          404
        </p>
        <Link to="/" className="btn btn-primary">
          {t('notFound.backHome')}
        </Link>
      </div>
    </>
  );
}
