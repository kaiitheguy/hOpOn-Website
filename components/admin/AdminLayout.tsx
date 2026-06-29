import React from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { BarChart3, Compass, LayoutDashboard, LogOut, ShieldCheck, Sparkles, UsersRound } from 'lucide-react';
import { signOutAdmin } from '../../lib/admin/api';

const nav = [
  { to: '/admin', end: true, label: 'Overview', icon: LayoutDashboard },
  { to: '/admin/sourcing', end: false, label: 'Campaign Sourcing', icon: Compass },
  { to: '/admin/leads', end: false, label: 'Growth OS Discovery', icon: Sparkles },
];

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOutAdmin();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="admin-shell min-h-screen bg-[#F7F2E8] text-hopon-black">
      <style>{`
        .admin-shell {
          background:
            radial-gradient(circle at 8% 4%, rgba(255, 42, 42, 0.09), transparent 26rem),
            linear-gradient(180deg, #fbf6ec 0%, #f7f2e8 52%, #f3eadf 100%);
        }
        .admin-card {
          border: 1px solid rgba(0,0,0,0.11);
          border-radius: 24px;
          background: rgba(255,255,255,0.88);
          box-shadow: 0 18px 50px rgba(26, 18, 12, 0.06);
        }
        .admin-chip {
          border: 1px solid rgba(0,0,0,0.1);
          border-radius: 999px;
          background: rgba(255,255,255,0.72);
        }
        .admin-button {
          border-radius: 14px;
          border: 1px solid rgba(0,0,0,0.14);
          transition: transform 160ms ease, box-shadow 160ms ease, background 160ms ease;
        }
        .admin-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 12px 28px rgba(26, 18, 12, 0.10);
        }
        .admin-input {
          border: 1px solid rgba(0,0,0,0.14);
          border-radius: 14px;
          background: rgba(255,255,255,0.9);
        }
        .admin-input:focus {
          outline: none;
          border-color: rgba(0,0,0,0.35);
          box-shadow: 0 0 0 4px rgba(255,42,42,0.08);
        }
      `}</style>
      <header className="sticky top-0 z-40 border-b border-black/10 bg-[#F7F2E8]/88 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 md:px-8">
          <Link to="/admin" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-black/10 bg-white shadow-sm">
              <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
                <rect x="11" y="2" width="2" height="20" fill="#5C3A21" stroke="black" strokeWidth="1.5" />
                <rect x="5" y="6" width="14" height="6" rx="1" fill="#FF2A2A" stroke="black" strokeWidth="1.5" />
                <rect x="14" y="7" width="2" height="2" fill="white" fillOpacity="0.85" />
                <rect x="5" y="14" width="14" height="6" rx="1" fill="#FF2A2A" stroke="black" strokeWidth="1.5" />
                <rect x="14" y="15" width="2" height="2" fill="white" fillOpacity="0.85" />
              </svg>
            </div>
            <div>
              <div className="font-display text-xl font-bold tracking-tight leading-none">hOpOn Admin</div>
              <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-black/50">growth control room</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            {nav.map(({ to, end, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `admin-button inline-flex items-center gap-2 px-3.5 py-2 font-mono text-xs uppercase tracking-wider ${
                    isActive ? 'bg-hopon-black text-white border-hopon-black' : 'bg-white/70 text-black/65 hover:text-black'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="admin-chip hidden items-center gap-2 px-3 py-2 text-xs font-mono uppercase tracking-wider text-black/60 sm:flex">
              <ShieldCheck className="h-4 w-4 text-emerald-700" />
              Admin
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="admin-button inline-flex items-center gap-2 bg-white px-3 py-2 font-mono text-xs uppercase tracking-wider text-black/65"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1440px] px-4 py-6 md:px-8 md:py-8">
        <div className="mb-4 flex gap-2 overflow-x-auto md:hidden">
          {nav.map(({ to, end, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `admin-button inline-flex shrink-0 items-center gap-2 px-3 py-2 font-mono text-xs uppercase tracking-wider ${
                  isActive ? 'bg-hopon-black text-white border-hopon-black' : 'bg-white/70 text-black/65'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </div>
        <Outlet />
      </main>

      <footer className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-4 pb-8 text-xs text-black/40 md:px-8">
        <span>Admin operations stay human-reviewed.</span>
        <span className="hidden items-center gap-1 sm:flex">
          <BarChart3 className="h-3.5 w-3.5" />
          Campaign sourcing bridge
        </span>
        <span className="hidden items-center gap-1 sm:flex">
          <UsersRound className="h-3.5 w-3.5" />
          No auto outreach
        </span>
      </footer>
    </div>
  );
};
