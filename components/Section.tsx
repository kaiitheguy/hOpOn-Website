import React from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  dark?: boolean;
  id?: string;
}

export const Section: React.FC<SectionProps> = ({ children, className = '', dark = false, id }) => {
  const [ref, isVisible] = useIntersectionObserver();

  return (
    <section 
      id={id}
      className={`relative w-full px-6 md:px-12 lg:px-24 py-24 md:py-32 overflow-hidden transition-colors duration-500 ${dark ? 'bg-hopon-black text-white' : 'bg-white text-hopon-black'} ${className}`}
    >
      <div 
        ref={ref}
        className={`max-w-7xl mx-auto transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
      >
        {children}
      </div>
    </section>
  );
};