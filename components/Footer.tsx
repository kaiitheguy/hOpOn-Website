import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { APP_STORE_URL } from './Hero';

function ContactForm() {
  const [business, setBusiness] = useState('');
  const [contact, setContact] = useState('');
  const [message, setMessage] = useState('');

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const subject = encodeURIComponent(`Hopon inquiry from ${business || 'local business'}`);
    const body = encodeURIComponent(
      [
        `Business: ${business || '-'}`,
        `Contact: ${contact || '-'}`,
        '',
        'Message:',
        message || '-',
      ].join('\n')
    );
    window.location.href = `mailto:contact@thehoponapp.com?subject=${subject}&body=${body}`;
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <input
        value={business}
        onChange={(event) => setBusiness(event.target.value)}
        placeholder="Business name"
        className="min-h-[44px] w-full rounded-lg border border-white/20 bg-white/10 px-3 font-mono text-xs uppercase text-white placeholder:text-white/35 outline-none focus:border-white"
      />
      <input
        value={contact}
        onChange={(event) => setContact(event.target.value)}
        placeholder="Email or phone"
        className="min-h-[44px] w-full rounded-lg border border-white/20 bg-white/10 px-3 font-mono text-xs uppercase text-white placeholder:text-white/35 outline-none focus:border-white"
      />
      <textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="What do you want Hopon to help with?"
        rows={3}
        className="w-full resize-none rounded-lg border border-white/20 bg-white/10 px-3 py-3 font-mono text-xs uppercase text-white placeholder:text-white/35 outline-none focus:border-white"
      />
      <button
        type="submit"
        className="min-h-[44px] w-full rounded-lg bg-white px-4 font-display text-sm font-bold uppercase text-hopon-black transition-colors hover:bg-hopon-red hover:text-white"
      >
        Submit
      </button>
    </form>
  );
}

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
            <li><Link to="/merchant/signup" className="transition-colors hover:text-hopon-red">Start Growing</Link></li>
            <li><a href={APP_STORE_URL} target="_blank" rel="noreferrer" className="transition-colors hover:text-hopon-red">Download App</a></li>
            <li><Link to="/merchant/login" className="transition-colors hover:text-hopon-red">Merchant Login</Link></li>
          </ul>
        </div>

        <div id="contact" className="scroll-mt-28 border-b border-white/20 p-8 md:border-b-0 md:border-r lg:border-r md:p-12">
          <h4 className="mb-8 font-mono text-xs uppercase text-white/50">Contact</h4>
          <ContactForm />
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
        <div className="flex gap-4">
          <span className="font-mono text-[10px] uppercase text-white/40">New York</span>
          <a href="#" onClick={scrollToTop} className="font-mono text-[10px] uppercase text-white/40 transition-colors hover:text-white">
            Back to Top
          </a>
        </div>
      </div>
    </footer>
  );
};
