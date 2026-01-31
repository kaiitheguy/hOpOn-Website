import React from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

export const Hero: React.FC = () => {
  const [ref, isVisible] = useIntersectionObserver();

  return (
    <header className="relative w-full min-h-screen flex flex-col justify-end pb-12 md:pb-24 px-4 md:px-8 pt-32 overflow-hidden bg-white">
      
      {/* Background Graphic - Abstract Halftone/Texture */}
      <div className="absolute top-0 left-0 w-full h-[90vh] z-0 pointer-events-none mix-blend-multiply opacity-[0.12] select-none">
         <img 
            src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop" 
            alt="Abstract Background Texture" 
            className="w-full h-full object-cover grayscale contrast-125"
         />
         {/* Gradient fade to white at the bottom to blend seamlessly with the content area */}
         <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white"></div>
         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white/40"></div>
      </div>

      <div ref={ref} className="relative z-10 w-full max-w-[1920px] mx-auto border-t border-black pt-8">
        
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
                <p className="font-mono text-xs md:text-sm leading-relaxed tracking-wide text-black/80 max-w-m ml-auto mb-12">
                    System for how collaboration actually happens.<br/>
                    No noise. Just structure.
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