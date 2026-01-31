import React from 'react';
import { Section } from './Section';

export const Philosophy: React.FC = () => {
  return (
    <Section id="philosophy" className="!py-0 bg-hopon-grey">
      <div className="w-full border-t border-black">
        
        {/* Header Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 border-b border-black">
            <div className="p-6 md:p-12 border-b md:border-b-0 md:border-r border-black">
                <span className="font-mono text-xs uppercase tracking-widest text-black/50 block mb-32 md:mb-64">001 — Context</span>
                <h2 className="font-display font-bold text-4xl md:text-5xl uppercase leading-none">
                    The Noise<br/>of Influence
                </h2>
            </div>
            <div className="p-6 md:p-12 flex flex-col justify-end">
                <p className="font-mono text-sm md:text-base leading-relaxed uppercase max-w-md">
                    Traditional influencer marketing is chaotic. Unmanageable DMs. Vague deliverables. Transactional relationships. It is inefficient and undignified.
                </p>
            </div>
        </div>

        {/* Content Row */}
         <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-6 md:p-12 border-b md:border-b-0 md:border-r border-black order-2 md:order-1 flex flex-col justify-end">
                <p className="font-mono text-sm md:text-base leading-relaxed uppercase max-w-md text-hopon-red">
                    We replaced the noise with a standard. hOpOn is a structured environment where expectations are clear and experiences remain authentic.
                </p>
            </div>
            <div className="p-6 md:p-12 order-1 md:order-2">
                <span className="font-mono text-xs uppercase tracking-widest text-black/50 block mb-32 md:mb-64">002 — Solution</span>
                <h2 className="font-display font-bold text-4xl md:text-5xl uppercase leading-none">
                    Clarity as<br/>a Service
                </h2>
            </div>
        </div>

      </div>
    </Section>
  );
};