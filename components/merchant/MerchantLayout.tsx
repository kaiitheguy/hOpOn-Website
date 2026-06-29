import React from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { BarChart3, Bell, BriefcaseBusiness, FileCheck, Search, Trophy, User } from 'lucide-react';
import { useMerchantLocale } from '../../context/MerchantLocaleContext';

export const MerchantLayout: React.FC = () => {
  const { t } = useMerchantLocale();
  const nav = [
    { to: '/merchant', end: true, label: 'Growth', icon: BarChart3 },
    { to: '/merchant/campaigns', end: false, label: 'Campaigns', icon: BriefcaseBusiness },
    { to: '/merchant/review', end: false, label: t.review, icon: FileCheck },
    { to: '/merchant/hunt', end: false, label: t.hunt, icon: Search },
    { to: '/merchant/achievements', end: false, label: t.achievementsTitle, icon: Trophy },
    { to: '/merchant/profile', end: false, label: t.profile, icon: User },
  ];

  return (
    <div className="merchant-shell min-h-screen bg-[#F7F2E8] text-hopon-black flex flex-col">
      <style>{`
        .merchant-shell {
          background:
            radial-gradient(circle at 8% 4%, rgba(255, 42, 42, 0.09), transparent 26rem),
            radial-gradient(circle at 88% 2%, rgba(13, 148, 136, 0.08), transparent 22rem),
            linear-gradient(180deg, #fbf6ec 0%, #f7f2e8 54%, #f1e4d5 100%);
        }
        .merchant-shell main :where(input, textarea, select).border-2 {
          border-width: 1px;
          border-color: rgb(0 0 0 / 0.14);
          border-radius: 14px;
          background: white;
        }
        .merchant-shell main :where(input, textarea, select).border-2:focus {
          border-color: rgb(0 0 0 / 0.34);
          box-shadow: 0 0 0 4px rgb(255 42 42 / 0.08);
        }
        .merchant-shell main :where(section, li, article, div).border-2.border-black.bg-white,
        .merchant-shell main :where(section, li, article, div).border-2.border-black {
          border-width: 1px;
          border-color: rgb(0 0 0 / 0.12);
          border-radius: 22px;
        }
        .merchant-shell main :where(section, li, article, div).border-2.border-black.bg-white {
          box-shadow: 0 14px 38px rgb(0 0 0 / 0.035);
        }
        .merchant-shell main :where(button, a).border-2 {
          border-width: 1px;
          border-radius: 13px;
        }
        .merchant-shell main :where(button, a).bg-hopon-black {
          box-shadow: 0 10px 24px rgb(0 0 0 / 0.10);
        }
        .merchant-shell main :where(.bg-hopon-grey) {
          background-color: #FAFAF7;
        }
        .merchant-shell main :where(h1) {
          letter-spacing: 0;
        }
      `}</style>
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-black/10 bg-[#F7F2E8]/90 backdrop-blur">
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
                Merchant OS
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
                  `flex items-center gap-2 px-3 py-2 rounded-full font-mono text-xs uppercase tracking-wider border transition-colors ${
                    isActive
                      ? 'bg-hopon-black text-white border-hopon-black shadow-[0_8px_18px_rgba(0,0,0,0.10)]'
                      : 'border-transparent text-black/65 hover:text-hopon-black hover:bg-white hover:border-black/10'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span className="hidden md:inline">{label}</span>
              </NavLink>
            ))}
            <NavLink
              to="/merchant/notifications"
              className={({ isActive }) =>
                `hidden sm:inline-flex items-center justify-center h-10 w-10 rounded-full border transition-colors ${
                  isActive ? 'bg-hopon-red text-white border-hopon-red' : 'border-transparent text-black/65 hover:text-hopon-black hover:bg-white hover:border-black/10'
                }`
              }
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="flex-1 pt-14 pb-8 px-4 md:px-8 max-w-[1320px] mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
};
