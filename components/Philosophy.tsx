import React from 'react';
import { Section } from './Section';

export const Philosophy: React.FC = () => {
  return (
    <Section id="context" className="!py-0 bg-hopon-grey">
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
                <div className="font-mono text-sm md:text-base leading-relaxed max-w-md space-y-6">
                    <p>
                        Influencer marketing didn’t start broken.<br/>
                        It became broken over time.
                    </p>
                    <p>
                        What was meant to be simple — people sharing real experiences —
                        slowly turned into scattered DMs, unclear asks, and fragile arrangements.
                    </p>
                    <p>
                        Everyone is doing their best.<br/>
                        No one has a system that actually works.
                    </p>
                </div>
            </div>
        </div>

        {/* Content Row */}
         <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-6 md:p-12 border-b md:border-b-0 md:border-r border-black order-2 md:order-1 flex flex-col justify-end">
                <div className="font-mono text-sm md:text-base leading-relaxed max-w-md space-y-6">
                    <p>We kept seeing good collaborations struggle for the same reasons.</p>
                    
                    <ul className="space-y-2 pl-4 border-l border-hopon-red/30 text-black/70">
                        <li>Conversations lived in private messages.</li>
                        <li>Expectations shifted midstream.</li>
                        <li>Outcomes were discussed loosely, if at all.</li>
                    </ul>

                    <p>
                        After the work was done, there was rarely anything to return to.<br/>
                        <span className="text-black/60">No shared record. No shared understanding.</span>
                    </p>

                    <p className="text-hopon-red font-medium">
                        The problem wasn’t effort.<br/>
                        It was structure.
                    </p>
                </div>
            </div>
            <div className="p-6 md:p-12 order-1 md:order-2">
                <span className="font-mono text-xs uppercase tracking-widest text-black/50 block mb-32 md:mb-64">002 — Findings</span>
                <h2 className="font-display font-bold text-4xl md:text-5xl uppercase leading-none">
                    What We<br/>Saw
                </h2>
            </div>
        </div>

      </div>
    </Section>
  );
};