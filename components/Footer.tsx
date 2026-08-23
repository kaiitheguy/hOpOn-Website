import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { APP_STORE_URL } from './Hero';

export const Footer: React.FC = () => {
  const scrollToTop = (event: React.MouseEvent) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-black bg-hopon-black text-white">
      <div className="grid grid-cols-1 border-b border-white/20 md:grid-cols-2 lg:grid-cols-4">
        <div className="border-b border-white/20 p-8 md:border-b-0 md:border-r md:p-12">
          <h4 className="mb-8 font-mono text-xs uppercase text-white/50">Product</h4>
          <ul className="space-y-4 font-display text-lg font-bold uppercase">
            <li><a href="/#demo" className="transition-colors hover:text-hopon-red">Demo</a></li>
            <li><a href="/#why" className="transition-colors hover:text-hopon-red">Why hOpOn</a></li>
            <li><Link to="/verify" className="transition-colors hover:text-hopon-red">Claim Offer</Link></li>
          </ul>
        </div>

        <div className="border-b border-white/20 p-8 md:border-b-0 lg:border-r md:p-12">
          <h4 className="mb-8 font-mono text-xs uppercase text-white/50">Business</h4>
          <ul className="space-y-4 font-display text-lg font-bold uppercase">
            <li><Link to="/pricing" className="transition-colors hover:text-hopon-red">Pricing</Link></li>
            <li><a href={APP_STORE_URL} target="_blank" rel="noreferrer" className="transition-colors hover:text-hopon-red">Download App</a></li>
            <li><Link to="/merchant/login" className="transition-colors hover:text-hopon-red">Merchant Login</Link></li>
          </ul>
        </div>

        <div id="contact" className="scroll-mt-28 border-b border-white/20 p-8 md:border-b-0 md:border-r lg:border-r md:p-12">
          <h4 className="font-mono text-xs uppercase text-white/50">Talk to us</h4>
          <p className="mt-6 font-display text-2xl font-bold leading-tight">Merchant pilot, platform integration, or creator partnership?</p>
          <p className="mt-4 text-sm leading-6 text-white/60">Choose the right request type and give our team the context needed to respond.</p>
          <Link
            to="/contact"
            className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-white px-4 font-display text-sm font-bold uppercase text-hopon-black transition-colors hover:bg-hopon-red hover:text-white"
          >
            Contact hOpOn
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a href="mailto:contact@thehoponapp.com" className="mt-4 block break-all text-xs text-white/45 underline underline-offset-4 hover:text-white">
            contact@thehoponapp.com
          </a>
        </div>

        <div className="p-8 md:p-12">
          <h4 className="mb-8 font-mono text-xs uppercase text-white/50">Promise</h4>
          <p className="font-display text-3xl font-bold leading-tight">
            Creator marketing you can finally measure.
          </p>
          <p className="mt-5 text-sm leading-6 text-white/60">
            hOpOn helps local merchants launch campaigns, bring people into the store, and know which creators, offers, and content drove growth.
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-between gap-4 p-4 md:flex-row md:p-6">
        <div className="font-mono text-[10px] uppercase text-white/40">
          © {new Date().getFullYear()} THE hOpOn APP
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          <span className="font-mono text-[10px] uppercase text-white/40">New York</span>
          <Link to="/privacy" className="font-mono text-[10px] uppercase text-white/40 transition-colors hover:text-white">
            Privacy
          </Link>
          <Link to="/terms" className="font-mono text-[10px] uppercase text-white/40 transition-colors hover:text-white">
            Terms
          </Link>
          <a href="#" onClick={scrollToTop} className="font-mono text-[10px] uppercase text-white/40 transition-colors hover:text-white">
            Back to Top
          </a>
        </div>
      </div>
    </footer>
  );
};
