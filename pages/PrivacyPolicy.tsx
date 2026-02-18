import React, { useEffect } from 'react';
import { BrandHeader } from '../components/BrandHeader';

export const PrivacyPolicy: React.FC = () => {
  useEffect(() => {
    document.title = 'Privacy Policy | hOpOn';
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <BrandHeader />

      <main className="pt-24 pb-16 px-4 md:px-8">
        <div className="max-w-[720px] mx-auto">
          <p className="font-mono text-xs uppercase tracking-widest text-black/50 mb-8">
            Last updated: February 2026
          </p>

          <h1 className="font-display font-bold text-3xl md:text-4xl uppercase tracking-tighter text-hopon-black mb-8">
            Privacy Policy
          </h1>

          <div className="prose prose-neutral max-w-none font-sans text-hopon-black space-y-8">
            <p className="text-black/90 leading-relaxed">
              hOpOn (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) respects your privacy.
            </p>

            <section>
              <h2 className="font-display font-bold text-xl uppercase tracking-tight text-hopon-black mb-4">
                Information We Collect
              </h2>
              <p className="text-black/80 mb-3">
                We may collect the following information when you use our app:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-black/80">
                <li>Account information (such as email address and username)</li>
                <li>Profile information</li>
                <li>City/location information provided by the user</li>
                <li>Usage data necessary for app functionality</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display font-bold text-xl uppercase tracking-tight text-hopon-black mb-4">
                How We Use Information
              </h2>
              <p className="text-black/80 mb-3">
                We use collected information to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-black/80">
                <li>Provide and improve app functionality</li>
                <li>Enable campaign browsing and applications</li>
                <li>Communicate with users regarding their account</li>
              </ul>
              <p className="text-black/80 mt-4">
                We do not sell personal data.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-xl uppercase tracking-tight text-hopon-black mb-4">
                Data Sharing
              </h2>
              <p className="text-black/80">
                We do not share personal information with third parties except as necessary to operate the app (e.g., hosting providers).
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-xl uppercase tracking-tight text-hopon-black mb-4">
                Data Security
              </h2>
              <p className="text-black/80">
                We take reasonable measures to protect user information.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-xl uppercase tracking-tight text-hopon-black mb-4">
                Contact
              </h2>
              <p className="text-black/80 mb-2">
                If you have questions, contact:
              </p>
              <a
                href="mailto:contact@thehoponapp.com"
                className="font-mono text-sm text-hopon-red hover:underline underline-offset-4"
              >
                contact@thehoponapp.com
              </a>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};
