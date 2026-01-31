import React, { useState } from 'react';
import { Section } from './Section';
import { ArrowDownRight } from 'lucide-react';

type UserType = 'merchant' | 'creator';

interface Step {
  step: string;
  title: string;
  desc: string;
}

export const Workflow: React.FC = () => {
  const [activeTab, setActiveTab] = useState<UserType>('merchant');

  const merchantSteps: Step[] = [
    { step: "01", title: "PUBLISH", desc: "Define your offer, usage rights, and vibe." },
    { step: "02", title: "SELECT", desc: "Approve creators. Only who fits." },
    { step: "03", title: "HOST", desc: "Scan QR. No awkward intros." },
    { step: "04", title: "RECEIVE", desc: "Posts live. Footfall follows. Run it again — or don't." },
  ];

  const creatorSteps: Step[] = [
    { step: "01", title: "BROWSE", desc: "Curated experiences in your area." },
    { step: "02", title: "APPLY", desc: "Request slots. No DMs." },
    { step: "03", title: "VISIT", desc: "Enjoy the service. Capture the mood." },
    { step: "04", title: "DELIVER", desc: "Share the work. Keep access open." },
  ];

  const activeSteps = activeTab === 'merchant' ? merchantSteps : creatorSteps;

  return (
    <Section id="workflow" className="!py-0 border-t border-black bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[800px]">
        
        {/* Controls */}
        <div className="lg:col-span-5 p-6 md:p-12 border-b lg:border-b-0 lg:border-r border-black bg-hopon-grey">
          <span className="font-mono text-xs uppercase tracking-widest text-black/50 block mb-12">
            Select View
          </span>
          
          <div className="flex flex-col items-start gap-2">
            <button 
              onClick={() => setActiveTab('merchant')}
              className={`font-display font-bold text-3xl md:text-5xl uppercase transition-all duration-300 ${activeTab === 'merchant' ? 'text-black translate-x-4' : 'text-gray-300 hover:text-gray-400'}`}
            >
              Merchants
            </button>
            <button 
              onClick={() => setActiveTab('creator')}
              className={`font-display font-bold text-3xl md:text-5xl uppercase transition-all duration-300 ${activeTab === 'creator' ? 'text-black translate-x-4' : 'text-gray-300 hover:text-gray-400'}`}
            >
              Creators
            </button>
          </div>

          <div className="mt-24 font-mono text-xs text-black/60 max-w-xs">
            Designed to remove friction.
            <br/>
            {activeTab === 'merchant' ? "You control who comes in." : "You control where you go."}
          </div>
        </div>

        {/* Steps List */}
        <div className="lg:col-span-7">
          {activeSteps.map((item, i) => (
            <div key={item.title} className="group border-b border-black last:border-b-0 p-6 md:p-10 flex flex-col gap-4 hover:bg-black hover:text-white transition-colors duration-300 cursor-default">
               <div className="flex justify-between items-start">
                   <span className="font-mono text-xs font-bold pt-1">0{i+1}</span>
                   <ArrowDownRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
               </div>
               
               <div>
                   <h3 className="font-display font-bold text-4xl md:text-5xl mb-2">{item.title}</h3>
                   <p className="font-mono text-sm opacity-60 max-w-sm">{item.desc}</p>
               </div>
            </div>
          ))}
        </div>

      </div>
    </Section>
  );
};