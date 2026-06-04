import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export const NavBar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);

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
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white border-b border-black' : 'bg-transparent'}`}>
      <div className="flex justify-between items-center px-4 md:px-8 py-4 md:py-5 max-w-[1920px] mx-auto">
        
        {/* Logo Section */}
        <Link to="/" onClick={scrollToTop} className="flex items-center gap-3 group cursor-pointer">
            {/* Pixel Art Skewer Logo */}
            <div className="relative w-8 h-8 md:w-10 md:h-10 transition-transform duration-300 group-hover:rotate-12">
               <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
                  {/* Stick */}
                  <rect x="11" y="2" width="2" height="20" fill="#5C3A21" stroke="black" strokeWidth="1.5" />
                  {/* Top Chunk */}
                  <rect x="5" y="6" width="14" height="6" rx="1" fill="#FF2A2A" stroke="black" strokeWidth="1.5" />
                  <rect x="14" y="7" width="2" height="2" fill="white" fillOpacity="0.8" />
                  {/* Bottom Chunk */}
                  <rect x="5" y="14" width="14" height="6" rx="1" fill="#FF2A2A" stroke="black" strokeWidth="1.5" />
                  <rect x="14" y="15" width="2" height="2" fill="white" fillOpacity="0.8" />
               </svg>
            </div>
            
            <div className="flex flex-col">
                <span className="font-display font-bold text-xl md:text-2xl tracking-tighter leading-none">
                    hOpOn
                </span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-black/60 leading-none mt-0.5">
                   / 串店
                </span>
            </div>
        </Link>
        
        {/* Links Section - RAD style: Bold, uppercase, minimal */}
        <div className="flex items-center gap-4 md:gap-8">
          <a href="/#mission" className="hidden md:block font-display font-bold text-sm uppercase tracking-wider hover:underline underline-offset-4 decoration-2">
            Mission
          </a>
          <a href="/#workflow" className="hidden md:block font-display font-bold text-sm uppercase tracking-wider hover:underline underline-offset-4 decoration-2">
            Workflow
          </a>
          <Link to="/discover/best-asian-dessert-nyc" className="font-display font-bold text-sm uppercase tracking-wider hover:underline underline-offset-4 decoration-2">
            Discover
          </Link>
          <Link to="/verify" className="font-display font-bold text-sm uppercase tracking-wider hover:underline underline-offset-4 decoration-2">
            Redeem
          </Link>
          <a href="mailto:contact@thehoponapp.com" className="bg-hopon-black text-white font-mono text-xs font-bold uppercase px-6 py-3 border border-black hover:bg-white hover:text-black transition-colors duration-300">
            Contact
          </a>
        </div>
      </div>
    </nav>
  );
};
