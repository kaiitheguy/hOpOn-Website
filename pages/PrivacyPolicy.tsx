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
            LAST UPDATED: February 2026
          </p>

          <h1 className="font-display font-bold text-3xl md:text-4xl uppercase tracking-tighter text-hopon-black mb-8">
            Privacy Policy
          </h1>

          <div className="prose prose-neutral max-w-none font-sans text-hopon-black space-y-8">
            <p className="text-black/90 leading-relaxed">
              hOpOn (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) respects your privacy and is committed to protecting your personal information.
            </p>

            <section>
              <h2 className="font-display font-bold text-xl uppercase tracking-tight text-hopon-black mb-4">
                Information We Collect
              </h2>
              <p className="text-black/80 mb-3">
                We may collect the following information when you use our app:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-black/80">
                <li>Account information (such as email address, username, and phone number)</li>
                <li>Profile information (such as display name, bio, city, and WeChat ID or other contact identifiers voluntarily provided)</li>
                <li>Merchant information (including store name, store location, campaign details, and related business information provided by merchants)</li>
                <li>User-generated content (such as photos, campaign applications, and profile content)</li>
                <li>Usage data necessary for app functionality (such as interactions within the app)</li>
                <li>Crash and diagnostic data used to maintain app performance</li>
              </ul>
              <p className="text-black/80 mt-4">
                We do not collect precise device location data unless explicitly enabled by the user.
              </p>
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
                <li>Enable campaign browsing and collaboration applications</li>
                <li>Facilitate communication between creators and businesses</li>
                <li>Maintain account security and platform integrity</li>
                <li>Respond to user inquiries and support requests</li>
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
                We do not share personal information with third parties except as necessary to operate the app (such as hosting, database, or infrastructure providers).
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-xl uppercase tracking-tight text-hopon-black mb-4">
                Data Retention
              </h2>
              <p className="text-black/80">
                We retain personal information only as long as necessary to provide the service and comply with legal obligations.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-xl uppercase tracking-tight text-hopon-black mb-4">
                Account Deletion
              </h2>
              <p className="text-black/80">
                Users may request account deletion at any time within the app settings or by contacting us at{' '}
                <a href="mailto:contact@thehoponapp.com" className="font-mono text-sm text-hopon-red hover:underline underline-offset-4">
                  contact@thehoponapp.com
                </a>
                . Upon deletion, associated personal data will be removed from active systems within a reasonable period, subject to legal requirements.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-xl uppercase tracking-tight text-hopon-black mb-4">
                Data Security
              </h2>
              <p className="text-black/80">
                We implement reasonable technical and organizational measures to protect user information.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-xl uppercase tracking-tight text-hopon-black mb-4">
                Contact
              </h2>
              <p className="text-black/80 mb-2">
                If you have questions regarding this Privacy Policy, contact:
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
