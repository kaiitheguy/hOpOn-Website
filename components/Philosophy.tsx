import React from 'react';
import { Section } from './Section';

export const Philosophy: React.FC = () => {
  return (
    <Section id="context" className="!py-0 bg-hopon-grey">
      <div className="w-full border-t border-black">
        
        {/* 001 Context */}
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
                        It became messy slowly, then all at once.
                    </p>
                    <p>
                        What was meant to be simple turned into scattered conversations, unclear expectations, and fragile agreements.<br/>
                        Not because people stopped caring, but because nothing was built to hold the process together.
                    </p>
                    <p className="text-hopon-red font-medium">
                        Everyone is participating.<br/>
                        No one has a system that actually works.
                    </p>
                </div>
            </div>
        </div>

        {/* 002 Findings */}
         <div className="grid grid-cols-1 md:grid-cols-2 border-b border-black">
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

        {/* 003 Solution */}
        <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-6 md:p-12 border-b md:border-b-0 md:border-r border-black">
                <span className="font-mono text-xs uppercase tracking-widest text-black/50 block mb-32 md:mb-64">003 — Solution</span>
                <h2 className="font-display font-bold text-4xl md:text-5xl uppercase leading-none">
                    Clarity<br/>As A Service
                </h2>
            </div>
            <div className="p-6 md:p-12 flex flex-col justify-end">
                <div className="font-mono text-sm md:text-base leading-relaxed max-w-md space-y-6">
                    <p>
                        So we made a decision.<br/>
                        We standardized what shouldn’t be vague.
                    </p>
                    <p>
                        hOpOn is not here to manage creativity or dictate outcomes.<br/>
                        It exists to remove ambiguity.
                    </p>
                    <p>
                        A place where participation is clear, timelines are visible, and collaborations have a beginning, a middle, and an end.
                    </p>
                    <p>
                        Where creators keep their voice.<br/>
                        And restaurants know what’s happening without chasing it.
                    </p>
                    <p className="text-hopon-red font-medium">
                        Less guessing.<br/>
                        More alignment.
                    </p>
                </div>
            </div>
        </div>

      </div>
    </Section>
  );
};