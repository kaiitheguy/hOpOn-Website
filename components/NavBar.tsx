import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Menu, X } from 'lucide-react';

export const NavBar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navLinks = [
    { href: '/#demo', label: 'Product' },
    { href: '/#growth-proof', label: 'Results' },
    { href: '/#why', label: 'Why hOpOn' },
    { href: '/pricing', label: 'Pricing' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen]);

  useEffect(() => {
    const desktopQuery = window.matchMedia('(min-width: 1280px)');
    const closeOnDesktop = () => {
      if (desktopQuery.matches) setMenuOpen(false);
    };

    desktopQuery.addEventListener('change', closeOnDesktop);
    return () => desktopQuery.removeEventListener('change', closeOnDesktop);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav aria-label="Primary" className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${scrolled ? 'border-b border-black bg-white' : 'bg-white/92 backdrop-blur'}`}>
      <div className="mx-auto flex max-w-[1920px] items-center justify-between px-4 py-4 md:px-8 md:py-5">
        <Link to="/" onClick={scrollToTop} className="group flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hopon-red focus-visible:ring-offset-2">
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
          <div className="hidden items-center gap-3 xl:flex xl:gap-5">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="font-display text-xs font-bold uppercase hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hopon-red focus-visible:ring-offset-2 xl:text-sm">
                {link.label}
              </a>
            ))}
          </div>
          <div className="hidden items-center gap-3 xl:flex">
            <Link
              to="/merchant/login"
              className="inline-flex min-h-[44px] items-center px-2 font-display text-xs font-bold uppercase text-black/65 underline underline-offset-4 transition-colors hover:text-hopon-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hopon-red focus-visible:ring-offset-2"
            >
              Log in
            </Link>
            <Link
              to="/contact"
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-black bg-hopon-black px-4 py-3 font-display text-xs font-bold uppercase text-white transition-colors hover:bg-hopon-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hopon-red focus-visible:ring-offset-2 xl:px-5"
            >
              Book a Demo
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <button
            type="button"
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-black bg-white px-3 py-2 font-display text-xs font-bold uppercase text-hopon-black transition-colors hover:bg-hopon-grey focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hopon-red focus-visible:ring-offset-2 xl:hidden"
            aria-expanded={menuOpen}
            aria-controls="primary-navigation"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X className="h-4 w-4" aria-hidden="true" /> : <Menu className="h-4 w-4" aria-hidden="true" />}
            <span>{menuOpen ? 'Close' : 'Menu'}</span>
          </button>
        </div>
      </div>

      <div
        id="primary-navigation"
        className={`${menuOpen ? 'block' : 'hidden'} border-t border-black bg-white px-4 pb-5 pt-3 xl:hidden`}
      >
        <div className="flex flex-col">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={closeMenu}
              className="border-b border-black/10 py-3 font-display text-sm font-bold uppercase hover:text-hopon-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hopon-red focus-visible:ring-offset-2"
            >
              {link.label}
            </a>
          ))}
          <div className="mt-4 border-t border-black/20 pt-4">
            <Link
              to="/contact"
              onClick={closeMenu}
              className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg border border-black bg-hopon-black px-4 py-3 font-display text-sm font-bold uppercase text-white transition-colors hover:bg-hopon-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hopon-red focus-visible:ring-offset-2"
            >
              Book a Demo
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/merchant/login"
              onClick={closeMenu}
              className="mt-3 inline-flex min-h-[44px] items-center px-1 font-mono text-xs font-bold uppercase text-black/60 underline underline-offset-4 hover:text-hopon-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hopon-red focus-visible:ring-offset-2"
            >
              Log in
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
