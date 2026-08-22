import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BrandHeader } from '../components/BrandHeader';
import { LEGAL_EFFECTIVE_DATE } from '../lib/legal';

const CONTACT_EMAIL = 'contact@thehoponapp.com';

export const PrivacyPolicy: React.FC = () => {
  useEffect(() => {
    document.title = 'Privacy Policy | hOpOn';
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F2E8]">
      <BrandHeader />

      <main className="px-4 pb-20 pt-28 md:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 max-w-3xl">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-black/50">
              Effective date: {LEGAL_EFFECTIVE_DATE}
            </p>
            <h1 className="mt-4 font-display text-4xl font-bold uppercase tracking-tighter text-hopon-black md:text-5xl">
              Privacy Policy
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-black/70">
              This policy explains what hOpOn collects, why we use it, and the choices available to people who use our
              merchant, creator, campaign, and offer experiences.
            </p>
          </div>

          <div className="mb-10 flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-black/15 py-4 font-mono text-xs uppercase tracking-wider">
            <Link to="/terms" className="text-hopon-red hover:underline underline-offset-4">
              Terms of Use
            </Link>
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-black/60 hover:text-hopon-red hover:underline underline-offset-4">
              Questions? {CONTACT_EMAIL}
            </a>
          </div>

          <article className="space-y-8 text-[15px] leading-7 text-black/80">
            <section className="rounded-2xl border border-black/10 bg-white p-5 md:p-7">
              <p>
                This policy applies to the website, mobile app, campaign tools, creator and merchant profiles, public offer
                pages, redemption links, and support services offered under the hOpOn name (&quot;hOpOn,&quot; &quot;we,&quot; &quot;our,&quot;
                or &quot;us&quot;). hOpOn helps local merchants and creators coordinate campaigns and measure offer activity. hOpOn
                is currently operated under the hOpOn name and is not yet a registered company. When a registered entity
                assumes operation of the Platform, this policy will be updated to identify that entity and its effective
                date.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-hopon-black">
                Information we collect
              </h2>
              <p className="mt-3">
                We collect information you provide, information created when you use hOpOn, and limited information from
                connected services. Depending on how you use the platform, this can include:
              </p>
              <ul className="mt-4 list-disc space-y-2 pl-6 marker:text-hopon-red">
                <li>
                  <span className="font-semibold text-hopon-black">Account details:</span> email address, authentication
                  information, phone number, role, and account status.
                </li>
                <li>
                  <span className="font-semibold text-hopon-black">Profiles:</span> display name, username or handle,
                  bio, city, avatar, tags, public social links, and contact identifiers you choose to provide (for example,
                  WeChat or another messaging ID).
                </li>
                <li>
                  <span className="font-semibold text-hopon-black">Merchant and campaign details:</span> business and
                  store name, store address or area, category, campaign brief, dates, requirements, offer details, and
                  campaign communications.
                </li>
                <li>
                  <span className="font-semibold text-hopon-black">Creator activity and content:</span> applications,
                  invitations, check-in or visit status, messages, drafts, photos, videos, captions, links, and other
                  content submitted for a profile or campaign.
                </li>
                <li>
                  <span className="font-semibold text-hopon-black">Offer and attribution events:</span> campaign or
                  creator selected, redemption-link clicks, offer views, redemption events, and whether a link or offer was
                  reached directly or through a public list.
                </li>
                <li>
                  <span className="font-semibold text-hopon-black">Card-on-file and charge records:</span> Stripe customer
                  and payment-method identifiers, card brand, last four digits, expiration month and year, campaign
                  authorization terms, authorization status, and charge or dispute results. Full card numbers and security
                  codes are entered into Stripe&apos;s payment interface and are not stored by hOpOn.
                </li>
                <li>
                  <span className="font-semibold text-hopon-black">Technical and support information:</span> browser and
                  device information, app installation and push-notification identifiers, approximate network information,
                  event logs, error reports, contact-form submissions, and messages you send to support.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-hopon-black">
                Optional location information
              </h2>
              <p className="mt-3">
                hOpOn requests foreground location only when a location-dependent action needs it, such as creator check-in
                or nearby offer verification. If you grant permission, we receive the device coordinates used for that
                action. We use them to verify proximity, reduce misuse, and measure qualifying activity. You can decline or
                later disable location in device or browser settings, but the related verification will not work. hOpOn does
                not use continuous background location tracking.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-hopon-black">
                Daily identifiers and redemption-link attribution
              </h2>
              <p className="mt-3">
                To count a visitor without requiring an account and prevent repeated refreshes from inflating campaign
                metrics, hOpOn creates a randomized pseudonymous daily identifier in browser storage. It expires at the end
                of its daily scope and does not contain a name, email address, or phone number.
              </p>
              <p className="mt-3">
                A public redemption link can carry a campaign and creator reference. When that link resolves, we record the
                link slug, source, landing path, campaign or creator attribution, and related offer events. This lets
                merchants and creators understand which links and offers drove activity. We do not add an email address or
                phone number to a public-link click just to attribute it.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-hopon-black">
                How we use information
              </h2>
              <ul className="mt-4 list-disc space-y-2 pl-6 marker:text-hopon-red">
                <li>Provide accounts, profiles, campaign workflows, messages, check-ins, public offer pages, and support.</li>
                <li>Match creators and merchants, show campaign requirements, and coordinate deliverables.</li>
                <li>Verify offer availability and attribute link clicks, visits, and redemptions to campaigns or creators.</li>
                <li>Save card-on-file references through Stripe, record campaign-specific authorizations, and process an approved charge case.</li>
                <li>Generate and evaluate campaign recommendations, creator matches, draft content, and performance reports with AI-assisted tools.</li>
                <li>Keep the platform secure, prevent fraud or abuse, troubleshoot errors, and improve reliability.</li>
                <li>Send service messages, respond to requests, and make changes required by law or a valid legal process.</li>
              </ul>
              <p className="mt-4">
                We do not sell or rent personal information, disclose it for another company&apos;s independent marketing, or
                share it for cross-context behavioral advertising. hOpOn does not run third-party behavioral advertising on
                the Platform.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-hopon-black">
                What other people and providers can see
              </h2>
              <p className="mt-3">
                hOpOn is collaborative by design. A creator profile and approved public content may be visible to merchants
                and visitors. A merchant&apos;s business and campaign information may be visible to creators or visitors when a
                campaign or offer is made public. Applications, messages, drafts, check-in status, and other private
                workflow information are shared with the relevant campaign participants and service operators who need it
                to run the workflow.
              </p>
              <p className="mt-3">
                We use service providers for authentication, hosting and databases, file storage, email delivery, push
                notifications, maps and geocoding, payment processing, AI-assisted features, security, and operational
                diagnostics. These providers process the information needed to perform those services. If you open a social
                platform link or publish content on another platform, that platform handles the activity under its own
                privacy policy. We also disclose information when required by law or when needed to protect users, enforce
                our Terms, investigate misuse, or complete a transaction or campaign you requested.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-hopon-black">
                Browser and device storage
              </h2>
              <p className="mt-3">
                The website and app use local device or browser storage for authentication sessions, language preference,
                short-lived display caches, and the daily attribution identifier described above. hOpOn does not currently
                use third-party advertising cookies. Because browsers do not apply a single consistent Do Not Track
                standard, the website does not respond differently to a Do Not Track signal.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-hopon-black">
                Retention and deletion
              </h2>
              <p className="mt-3">
                We keep information for as long as it is reasonably needed to provide the service, complete or document a
                campaign, keep records accurate, resolve disputes, prevent abuse, and meet legal or security obligations.
                A daily browser identifier is designed to expire and be replaced, while associated campaign and redemption
                records may remain when needed for those purposes. We do not promise a fixed retention period because the
                right period depends on the type of information and the context in which it was collected.
              </p>
              <p className="mt-3">
                You may request access, correction, or deletion of information associated with your account by using an
                available in-app setting or emailing{' '}
                <a href={`mailto:${CONTACT_EMAIL}`} className="font-mono text-sm text-hopon-red hover:underline underline-offset-4">
                  {CONTACT_EMAIL}
                </a>
                . We will review the request and may retain limited information where necessary for security, legal
                obligations, dispute resolution, or legitimate service records.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-hopon-black">
                Security
              </h2>
              <p className="mt-3">
                We use reasonable technical and organizational safeguards designed to protect information. No online service
                can guarantee perfect security, so please use a strong, unique password, protect your devices, and tell us
                promptly if you believe an account or link has been misused.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-hopon-black">
                Children and minors
              </h2>
              <p className="mt-3">
                hOpOn accounts are for people who are at least 18 years old. The Platform is not directed to children, and
                we do not knowingly collect personal information from anyone under 13. If you believe a child provided
                information, contact us so we can review and delete it as appropriate.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-hopon-black">
                International users
              </h2>
              <p className="mt-3">
                hOpOn is operated from the United States. Our service providers process information in the United States and
                in other locations where they operate. If you use hOpOn from another country, your information is transferred
                to and processed in those locations, whose privacy laws may differ from the laws where you live.
              </p>
            </section>

            <section id="contact" className="scroll-mt-28 border-t border-black/15 pt-8">
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-hopon-black">
                Contact and policy updates
              </h2>
              <p className="mt-3">
                Questions, privacy requests, or concerns can be sent to{' '}
                <a href={`mailto:${CONTACT_EMAIL}`} className="font-mono text-sm text-hopon-red hover:underline underline-offset-4">
                  {CONTACT_EMAIL}
                </a>
                . We may update this policy as hOpOn changes. The effective date above identifies the current version; if a
                change is material, we will take reasonable steps to make it clear in the product or on this page.
              </p>
              <p className="mt-4">
                For the rules that apply when you use hOpOn, read our{' '}
                <Link to="/terms" className="font-mono text-sm text-hopon-red hover:underline underline-offset-4">
                  Terms of Use
                </Link>
                .
              </p>
            </section>
          </article>
        </div>
      </main>
    </div>
  );
};
