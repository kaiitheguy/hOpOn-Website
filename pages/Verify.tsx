import React from 'react';
import { Link } from 'react-router-dom';
import { useLocale } from '../i18n';
import { VerifyCard } from '../components/VerifyCard';

export const Verify: React.FC = () => {
  const [locale, setLocale, t] = useLocale('en');

  return (
    <div className="min-h-screen bg-white">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-black">
        <div className="flex justify-between items-center px-4 md:px-8 py-4 max-w-[1920px] mx-auto">
          <Link
            to="/"
            className="font-display font-bold text-xl tracking-tighter text-hopon-black hover:text-hopon-red transition-colors"
          >
            hOpOn
          </Link>
          <div className="flex items-center gap-2 font-mono text-sm uppercase tracking-wider">
            <button
              type="button"
              onClick={() => setLocale('en')}
              className={`px-2 py-1 border ${
                locale === 'en'
                  ? 'bg-hopon-black text-white border-black'
                  : 'border-black/30 text-black/70 hover:border-black'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLocale('zh')}
              className={`px-2 py-1 border ${
                locale === 'zh'
                  ? 'bg-hopon-black text-white border-black'
                  : 'border-black/30 text-black/70 hover:border-black'
              }`}
            >
              中文
            </button>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-12 px-4 md:px-8">
        <div className="max-w-[1920px] mx-auto">
          <h1 className="font-display font-bold text-3xl md:text-4xl uppercase tracking-tighter text-hopon-black mb-8">
            {t.pageTitle}
          </h1>
          <div className="flex justify-start">
            <VerifyCard locale={locale} />
          </div>
        </div>
      </main>
    </div>
  );
};
