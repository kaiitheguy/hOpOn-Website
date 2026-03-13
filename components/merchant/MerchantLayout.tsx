import React from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { Home, FileCheck, Search, Trophy, User } from 'lucide-react';
import { useMerchantLocale } from '../../context/MerchantLocaleContext';

export const MerchantLayout: React.FC = () => {
  const { locale, setLocale, t } = useMerchantLocale();
  const nav = [
    { to: '/merchant', end: true, label: t.home, icon: Home },
    { to: '/merchant/review', end: false, label: t.review, icon: FileCheck },
    { to: '/merchant/hunt', end: false, label: t.hunt, icon: Search },
    { to: '/merchant/achievements', end: false, label: t.achievementsTitle, icon: Trophy },
    { to: '/merchant/profile', end: false, label: t.profile, icon: User },
  ];

  return (
    <div className="min-h-screen bg-white text-hopon-black flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-black">
        <div className="flex justify-between items-center h-14 px-4 md:px-8 max-w-[1920px] mx-auto">
          <Link
            to="/merchant"
            className="flex items-center gap-3 group"
          >
            <div className="relative w-8 h-8 md:w-10 md:h-10 transition-transform duration-300 group-hover:rotate-12">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
                <rect x="11" y="2" width="2" height="20" fill="#5C3A21" stroke="black" strokeWidth="1.5" />
                <rect x="5" y="6" width="14" height="6" rx="1" fill="#FF2A2A" stroke="black" strokeWidth="1.5" />
                <rect x="14" y="7" width="2" height="2" fill="white" fillOpacity="0.8" />
                <rect x="5" y="14" width="14" height="6" rx="1" fill="#FF2A2A" stroke="black" strokeWidth="1.5" />
                <rect x="14" y="15" width="2" height="2" fill="white" fillOpacity="0.8" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-xl md:text-2xl tracking-tighter leading-none text-hopon-black">
                hOpOn
              </span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-black/60 leading-none mt-0.5">
                / 串店
              </span>
            </div>
          </Link>
          <nav className="flex items-center gap-1">
            {nav.map(({ to, end, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded font-mono text-xs uppercase tracking-wider border-2 transition-colors ${
                    isActive
                      ? 'bg-hopon-black text-white border-black'
                      : 'border-transparent text-black/70 hover:text-hopon-black hover:border-black/30'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </NavLink>
            ))}
            <div className="flex border-2 border-black/20 rounded ml-2">
              <button
                type="button"
                onClick={() => setLocale('zh')}
                className={`px-2 py-1 font-mono text-xs uppercase ${locale === 'zh' ? 'bg-hopon-black text-white' : 'bg-white text-black/70 hover:bg-black/5'}`}
              >
                中
              </button>
              <button
                type="button"
                onClick={() => setLocale('en')}
                className={`px-2 py-1 font-mono text-xs uppercase ${locale === 'en' ? 'bg-hopon-black text-white' : 'bg-white text-black/70 hover:bg-black/5'}`}
              >
                En
              </button>
            </div>
          </nav>
        </div>
      </header>
      <main className="flex-1 pt-14 pb-8 px-4 md:px-8 max-w-[1200px] mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
};
