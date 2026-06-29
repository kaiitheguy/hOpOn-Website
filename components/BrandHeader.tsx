import React from 'react';
import { Link } from 'react-router-dom';

/** Compact hOpOn header lockup shared by utility pages. */
export const BrandHeader: React.FC<{ rightSlot?: React.ReactNode }> = ({ rightSlot }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-black">
      <div className="flex justify-between items-center px-4 md:px-8 py-4 md:py-5 max-w-[1920px] mx-auto">
        <Link to="/" className="flex items-center gap-3 group cursor-pointer">
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
              Growth Platform
            </span>
          </div>
        </Link>
        {rightSlot != null && <div className="flex items-center gap-2">{rightSlot}</div>}
      </div>
    </header>
  );
};
