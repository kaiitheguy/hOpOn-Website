import React from 'react';
import { Section } from './Section';

export const Concepts: React.FC = () => {
  return (
    <Section className="!py-24 md:!py-32 overflow-hidden border-t border-black">
      <div className="mb-16 px-4">
        <h2 className="font-display font-bold text-6xl md:text-9xl uppercase leading-none tracking-tighter text-center">
            REAL LIFE<br/>REAL IMPACT
        </h2>
      </div>

      <div className="w-full bg-hopon-black text-white py-4 md:py-6 overflow-hidden rotate-1 scale-105 border-y-4 border-hopon-red">
        <div className="animate-marquee whitespace-nowrap flex gap-12 items-center">
            <span className="font-display font-bold text-2xl md:text-4xl uppercase tracking-wider">Real Footfall</span>
            <span className="w-4 h-4 bg-hopon-red rounded-full"></span>
            <span className="font-display font-bold text-2xl md:text-4xl uppercase tracking-wider">Structured Collaboration</span>
            <span className="w-4 h-4 bg-hopon-red rounded-full"></span>
            <span className="font-display font-bold text-2xl md:text-4xl uppercase tracking-wider">Clear Expectations</span>
            <span className="w-4 h-4 bg-hopon-red rounded-full"></span>
            <span className="font-display font-bold text-2xl md:text-4xl uppercase tracking-wider">Built to Repeat</span>
            <span className="w-4 h-4 bg-hopon-red rounded-full"></span>
            <span className="font-display font-bold text-2xl md:text-4xl uppercase tracking-wider">No Guesswork</span>
            <span className="w-4 h-4 bg-hopon-red rounded-full"></span>
            <span className="font-display font-bold text-2xl md:text-4xl uppercase tracking-wider">More Signal</span>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto mt-24 px-6 text-center">
          <p className="font-mono text-sm md:text-base tracking-wide">
              Not just content, but experiences.<br/>
              Not just reach, but real visits.<br/>
              Not one-off campaigns, but partnerships built to last.<br/>
              <br/>
              <br/>
              <span className="font-display font-bold text-2xl md:text-2xl uppercase leading-none tracking-tighter text-center">hOpOn is built around those outcomes.</span>
          </p>
      </div>
    </Section>
  );
};