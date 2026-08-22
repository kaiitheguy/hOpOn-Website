import React, { useEffect } from 'react';
import { Building2, Network, UsersRound } from 'lucide-react';
import { BrandHeader } from '../components/BrandHeader';
import { ContactInquiryForm } from '../components/ContactInquiryForm';

const paths = [
  { icon: Building2, title: 'Merchant pilot', copy: 'Launch a measurable creator campaign for one location or a multi-location group.' },
  { icon: Network, title: 'Platform partnership', copy: 'Explore creator operations, content workflows, attribution, or data integration.' },
  { icon: UsersRound, title: 'Creator partnership', copy: 'Ask about joining hOpOn or participating in an upcoming local campaign.' },
];

export const Contact: React.FC = () => {
  useEffect(() => {
    document.title = 'Contact | hOpOn';
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <BrandHeader />
      <main className="px-5 pb-20 pt-28 md:px-8 md:pb-28 md:pt-32">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-start">
            <section className="lg:sticky lg:top-28">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-hopon-red">Contact hOpOn</p>
              <h1 className="mt-4 max-w-xl font-display text-5xl font-bold leading-[0.95] text-hopon-black md:text-7xl">
                Let’s make creator growth measurable.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-black/65 md:text-lg md:leading-8">
                Tell us whether you are exploring a merchant pilot, a platform integration, or a creator partnership. We will route your request to the right person.
              </p>
              <div className="mt-8 grid gap-3">
                {paths.map(({ icon: Icon, title, copy }) => (
                  <div key={title} className="rounded-2xl border border-black/10 bg-white p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F7F2E8]"><Icon className="h-5 w-5" /></div>
                      <div>
                        <h2 className="font-display font-bold text-hopon-black">{title}</h2>
                        <p className="mt-1 text-sm leading-6 text-black/55">{copy}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-sm text-black/55">
                Prefer email? <a href="mailto:contact@thehoponapp.com" className="font-semibold text-hopon-black underline underline-offset-4">contact@thehoponapp.com</a>
              </p>
            </section>
            <ContactInquiryForm />
          </div>
        </div>
      </main>
    </div>
  );
};
