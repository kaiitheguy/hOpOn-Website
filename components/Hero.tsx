import React from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

export const Hero: React.FC = () => {
  const [ref, isVisible] = useIntersectionObserver();

  return (
    <header className="relative w-full min-h-screen flex flex-col justify-end pb-12 md:pb-24 px-4 md:px-8 pt-32">
      <div ref={ref} className="w-full max-w-[1920px] mx-auto border-t border-black pt-8">
        
        <div className="flex justify-between items-start mb-16 md:mb-32">
            <p className={`font-mono text-xs font-medium uppercase tracking-widest text-black/60 fade-up-enter ${isVisible ? 'fade-up-active' : ''}`}>
                [ System 1.0 ]
            </p>
            <p className={`hidden md:block font-mono text-xs font-medium uppercase tracking-widest text-black/60 text-right fade-up-enter ${isVisible ? 'fade-up-active' : ''}`}>
                Based in <br/> New York
            </p>
        </div>
        
        <div id="mission" className="relative">
            <h1 className={`font-display font-bold text-[13vw] leading-[0.8] tracking-tighter uppercase text-hopon-black fade-up-enter ${isVisible ? 'fade-up-active stagger-1' : ''}`}>
              NOT AN<br />
              AGENCY.
            </h1>
            
            <div className={`mt-4 md:mt-8 md:absolute md:right-0 md:bottom-4 md:max-w-xl text-right fade-up-enter ${isVisible ? 'fade-up-active stagger-2' : ''}`}>
                <h2 className="font-display font-bold text-4xl md:text-6xl italic tracking-tight text-hopon-red mb-6">
                    IT'S A WORKFLOW.
                </h2>
                <p className="font-mono text-xs md:text-sm leading-relaxed tracking-wide text-black/80 max-w-sm ml-auto mb-6">
                    hOpOn standardizes the collaboration between physical spaces and creators. No noise. Just structure.
                </p>
                <a href="#context" className="inline-block font-mono text-xs font-bold uppercase tracking-widest border-b border-black pb-1 hover:text-hopon-red hover:border-hopon-red transition-colors">
                    Explore Context ↓
                </a>
            </div>
        </div>

      </div>
    </header>
  );
};