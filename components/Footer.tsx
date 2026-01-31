import React from 'react';

export const Footer: React.FC = () => {
  const scrollToTop = (e: React.MouseEvent) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-hopon-black text-white border-t border-black">
      
      {/* Top Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-b border-white/20">
          <div className="p-8 md:p-12 border-b md:border-b-0 md:border-r border-white/20">
              <h4 className="font-mono text-xs uppercase tracking-widest text-white/50 mb-8">Platform</h4>
              <ul className="space-y-4 font-display font-bold text-lg uppercase">
                  <li><a href="#mission" className="hover:text-hopon-red transition-colors">Mission</a></li>
                  <li><a href="#workflow" className="hover:text-hopon-red transition-colors">Workflow</a></li>
                  <li><a href="#" className="hover:text-hopon-red transition-colors">Pricing</a></li>
              </ul>
          </div>
          
          <div className="p-8 md:p-12 border-b md:border-b-0 lg:border-r border-white/20">
               <h4 className="font-mono text-xs uppercase tracking-widest text-white/50 mb-8">Legal</h4>
               <ul className="space-y-4 font-display font-bold text-lg uppercase">
                  <li><a href="#" className="hover:text-hopon-red transition-colors">Terms</a></li>
                  <li><a href="#" className="hover:text-hopon-red transition-colors">Privacy</a></li>
                  <li><a href="#" className="hover:text-hopon-red transition-colors">Cookies</a></li>
              </ul>
          </div>

          <div className="col-span-1 lg:col-span-2 p-8 md:p-12 flex flex-col justify-between">
               <div>
                   <h4 className="font-mono text-xs uppercase tracking-widest text-white/50 mb-8">Newsletter</h4>
                   <div className="flex border-b border-white pb-2">
                       <input type="email" placeholder="YOUR@EMAIL.COM" className="bg-transparent w-full outline-none font-mono text-sm uppercase placeholder:text-white/30" />
                       <button className="font-mono text-sm uppercase hover:text-hopon-red">→</button>
                   </div>
               </div>
               
               <div className="mt-12">
                   <p className="font-display font-bold text-2xl md:text-3xl leading-none">
                       BUILT FOR<br/>LONG-TERM RELEVANCE.
                   </p>
               </div>
          </div>
      </div>

      {/* Bottom Section */}
      <div className="p-4 md:p-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="font-mono text-[10px] uppercase tracking-widest text-white/40">
            © {new Date().getFullYear()} hOpOn Platform.
        </div>
        <div className="flex gap-4">
            <span className="font-mono text-[10px] uppercase tracking-widest text-white/40">
                Shanghai • Tokyo • Seoul
            </span>
            <a href="#" onClick={scrollToTop} className="font-mono text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-colors">
                ↑ Back to Top
            </a>
        </div>
      </div>
    </footer>
  );
};