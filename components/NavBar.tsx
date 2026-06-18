import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const NavBar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const navLinks = [
    { href: '/#demo', label: 'Demo' },
    { href: '/#growth-proof', label: 'Results' },
    { href: '/#why', label: 'Why hOpOn' },
    { href: '/#flexible-growth', label: 'Plans' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${scrolled ? 'border-b border-black bg-white' : 'bg-white/92 backdrop-blur'}`}>
      <div className="mx-auto flex max-w-[1920px] items-center justify-between px-4 py-4 md:px-8 md:py-5">
        <Link to="/" onClick={scrollToTop} className="group flex items-center gap-3">
          <div className="relative h-9 w-9 transition-transform duration-300 group-hover:rotate-6 md:h-10 md:w-10">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full drop-shadow-sm">
              <rect x="11" y="2" width="2" height="20" fill="#5C3A21" stroke="black" strokeWidth="1.5" />
              <rect x="5" y="6" width="14" height="6" rx="1" fill="#FF2A2A" stroke="black" strokeWidth="1.5" />
              <rect x="14" y="7" width="2" height="2" fill="white" fillOpacity="0.8" />
              <rect x="5" y="14" width="14" height="6" rx="1" fill="#FF2A2A" stroke="black" strokeWidth="1.5" />
              <rect x="14" y="15" width="2" height="2" fill="white" fillOpacity="0.8" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-display text-xl font-bold leading-none md:text-2xl">hOpOn</span>
            <span className="mt-0.5 font-mono text-[10px] uppercase leading-none text-black/60">Agentic growth platform</span>
          </div>
        </Link>

        <div className="flex items-center gap-3 md:gap-5 lg:gap-7">
          <div className="hidden items-center gap-3 md:flex lg:gap-5">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="font-display text-xs font-bold uppercase hover:underline lg:text-sm">
                {link.label}
              </a>
            ))}
          </div>
          <Link
            to="/merchant/signup"
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-black bg-hopon-black px-4 py-3 font-display text-xs font-bold uppercase text-white transition-colors hover:bg-hopon-red md:px-5"
          >
            Start Growing
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </nav>
  );
};
