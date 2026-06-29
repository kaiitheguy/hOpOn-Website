import React from 'react';
import { Link } from 'react-router-dom';

export const brandInputClass =
  'h-12 w-full rounded-2xl border border-black/15 bg-white px-4 text-sm text-hopon-black focus:border-black/40 focus:outline-none focus:ring-4 focus:ring-hopon-red/10 disabled:opacity-60';

export const brandTextareaClass =
  'w-full rounded-2xl border border-black/15 bg-white px-4 py-3 text-sm leading-6 text-hopon-black focus:border-black/40 focus:outline-none focus:ring-4 focus:ring-hopon-red/10 disabled:opacity-60';

export const brandPrimaryButtonClass =
  'inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-hopon-black px-5 font-display text-sm font-bold uppercase tracking-wider text-white transition hover:bg-hopon-red disabled:opacity-50';

export const brandSecondaryButtonClass =
  'inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-black/15 bg-white px-5 font-mono text-xs uppercase tracking-wider text-black/65 transition hover:border-black/35 hover:bg-[#FAFAF7] disabled:opacity-50';

export const brandCardClass =
  'rounded-[30px] border border-black/10 bg-white/88 shadow-[0_24px_80px_rgba(20,14,8,0.08)] backdrop-blur';

export function HoponMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="inline-flex items-center gap-3">
      <div className={`${compact ? 'h-10 w-10 rounded-2xl' : 'h-12 w-12 rounded-2xl'} flex items-center justify-center border border-black/10 bg-white shadow-sm`}>
        <svg viewBox="0 0 24 24" fill="none" className={compact ? 'h-7 w-7' : 'h-8 w-8'} aria-hidden="true">
          <rect x="11" y="2" width="2" height="20" fill="#5C3A21" stroke="black" strokeWidth="1.5" />
          <rect x="5" y="6" width="14" height="6" rx="1" fill="#FF2A2A" stroke="black" strokeWidth="1.5" />
          <rect x="14" y="7" width="2" height="2" fill="white" fillOpacity="0.85" />
          <rect x="5" y="14" width="14" height="6" rx="1" fill="#FF2A2A" stroke="black" strokeWidth="1.5" />
          <rect x="14" y="15" width="2" height="2" fill="white" fillOpacity="0.85" />
        </svg>
      </div>
      <div>
        <div className={`${compact ? 'text-xl' : 'text-2xl'} font-display font-bold leading-none tracking-tight text-hopon-black`}>hOpOn</div>
        <div className="mt-1 font-mono text-[10px] uppercase leading-none tracking-[0.24em] text-black/45">growth platform</div>
      </div>
    </Link>
  );
}

export function BrandBackground({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`min-h-screen bg-[#F7F2E8] text-hopon-black ${className}`}>
      <style>{`
        .brand-app-bg {
          background:
            radial-gradient(circle at 16% 10%, rgba(255, 42, 42, 0.13), transparent 28rem),
            radial-gradient(circle at 84% 6%, rgba(13, 148, 136, 0.10), transparent 24rem),
            linear-gradient(180deg, #fbf6ec 0%, #f7f2e8 56%, #f1e4d5 100%);
        }
      `}</style>
      <div className="brand-app-bg min-h-screen">{children}</div>
    </div>
  );
}

export function FieldLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-black/55">
      {children}
    </label>
  );
}

export function BrandAuthLayout({
  eyebrow,
  title,
  description,
  badges,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  badges?: string[];
  children: React.ReactNode;
}) {
  return (
    <BrandBackground>
      <main className="flex min-h-screen items-center justify-center px-4 py-10">
        <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className={`${brandCardClass} p-8 md:p-10`}>
            <div className="mb-10">
              <HoponMark />
            </div>
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.24em] text-black/45">{eyebrow}</p>
            <h1 className="font-display text-4xl font-bold leading-tight tracking-tight md:text-5xl">{title}</h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-black/65">{description}</p>
            {badges?.length ? (
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {badges.map((badge) => (
                  <div key={badge} className="rounded-2xl border border-black/10 bg-[#FAFAF7] px-4 py-3 font-mono text-xs uppercase tracking-wider text-black/55">
                    {badge}
                  </div>
                ))}
              </div>
            ) : null}
          </section>
          <section className={`${brandCardClass} p-6 md:p-8`}>{children}</section>
        </div>
      </main>
    </BrandBackground>
  );
}

export function BrandStatusCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={`${brandCardClass} w-full max-w-lg p-6 text-center md:p-8`}>
      <div className="mb-6 flex justify-center">
        <HoponMark compact />
      </div>
      <h1 className="font-display text-3xl font-bold tracking-tight">{title}</h1>
      {subtitle ? <p className="mt-2 text-sm text-black/50">{subtitle}</p> : null}
      {children ? <div className="mt-6">{children}</div> : null}
    </div>
  );
}
