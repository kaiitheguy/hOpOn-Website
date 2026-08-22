import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BrandHeader } from '../components/BrandHeader';
import { LEGAL_EFFECTIVE_DATE } from '../lib/legal';

const CONTACT_EMAIL = 'contact@thehoponapp.com';

export const Terms: React.FC = () => {
  useEffect(() => {
    document.title = 'Terms of Use | hOpOn';
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
              Terms of Use
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-black/70">
              Practical rules for using hOpOn to run local campaigns, collaborate with creators, publish content, and
              measure offer activity.
            </p>
          </div>

          <div className="mb-10 flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-black/15 py-4 font-mono text-xs uppercase tracking-wider">
            <Link to="/privacy" className="text-hopon-red hover:underline underline-offset-4">
              Privacy Policy
            </Link>
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-black/60 hover:text-hopon-red hover:underline underline-offset-4">
              Questions? {CONTACT_EMAIL}
            </a>
          </div>

          <article className="space-y-8 text-[15px] leading-7 text-black/80">
            <section className="rounded-2xl border border-black/10 bg-white p-5 md:p-7">
              <p>
                These Terms of Use (&quot;Terms&quot;) govern access to and use of hOpOn, including the website, app, merchant
                workspace, creator tools, campaign pages, public offers, redemption links, and related services (together,
                the &quot;Platform&quot;). By using the Platform, you agree to these Terms and our{' '}
                <Link to="/privacy" className="text-hopon-red hover:underline underline-offset-4">
                  Privacy Policy
                </Link>
                . hOpOn is currently offered under the hOpOn name and is not yet a registered company. References to
                &quot;hOpOn,&quot; &quot;we,&quot; &quot;our,&quot; or &quot;us&quot; mean the operator of the Platform. If you do not agree, do not use hOpOn.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-hopon-black">
                1. What hOpOn does
              </h2>
              <p className="mt-3">
                hOpOn provides software and workflow tools that let merchants publish campaign briefs, find or invite
                creators, coordinate visits and deliverables, review content, and measure offer and redemption activity.
                Unless a campaign brief expressly identifies hOpOn as the party providing compensation or an offer, the
                campaign arrangement is between the participating merchant and creator. hOpOn does not guarantee a match,
                campaign result, offer, creator statement, or merchant statement.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-hopon-black">
                2. Eligibility and accounts
              </h2>
              <ul className="mt-4 list-disc space-y-2 pl-6 marker:text-hopon-red">
                <li>You must be at least 18 years old and legally able to enter a binding agreement where you live.</li>
                <li>If you use hOpOn for a business, you confirm that you have authority to act for that business.</li>
                <li>Keep login details private, use your own account, and promptly tell us about unauthorized access.</li>
                <li>Merchants are responsible for the accuracy of their business, offer, location, and campaign details.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-hopon-black">
                3. Campaign briefs set the deal
              </h2>
              <p className="mt-3">
                A campaign-specific brief or other written campaign terms control the relationship for that campaign. The
                brief controls creator compensation, required deliverables, deadlines, review steps, disclosure
                requirements, and usage rights. Any compensation, reimbursement, or other economic term must be stated in
                the applicable brief or a separate agreement; these Terms do not set pricing.
              </p>
              <p className="mt-3">
                hOpOn displays campaign status and routes workflow messages. Merchants and creators remain responsible for
                confirming their campaign arrangement, meeting their commitments, keeping their own tax records, and
                resolving campaign-specific questions. Each party is responsible for taxes arising from compensation,
                products, discounts, or other value it receives or provides.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-hopon-black">
                4. Content and usage rights
              </h2>
              <p className="mt-3">
                Creators retain ownership of their photos, videos, writing, likeness, and other original content. By
                submitting content to hOpOn, a creator grants hOpOn a non-exclusive, worldwide, royalty-free license to
                host, store, reproduce, format, display, and make technical adaptations of that content as reasonably
                necessary to operate the Platform, administer the relevant campaign, keep records, and show the content to
                the people the creator chose to reach. This service-operation license does not transfer ownership.
              </p>
              <p className="mt-3">
                Merchants receive only the content rights explicitly granted in the campaign-specific brief or another
                written agreement. No broader right to repost, edit, run ads with, sublicense, or otherwise use creator
                content is implied by an application, approval, payment, or display on hOpOn. A creator must have the rights
                and permissions needed for submitted content, including permissions for identifiable people, music, brands,
                and locations.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-hopon-black">
                5. Merchant and creator responsibilities
              </h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-black/10 bg-white p-5">
                  <h3 className="font-display text-lg font-bold uppercase text-hopon-black">Merchants</h3>
                  <ul className="mt-3 list-disc space-y-2 pl-5 marker:text-hopon-red">
                    <li>Publish clear, lawful briefs and honor the offer and deliverables you approve.</li>
                    <li>Obtain permissions for business names, locations, trademarks, and supplied materials.</li>
                    <li>Do not require deceptive claims, undisclosed endorsements, or discriminatory targeting.</li>
                    <li>Use creator content only within the rights the campaign expressly grants.</li>
                  </ul>
                </div>
                <div className="rounded-2xl border border-black/10 bg-white p-5">
                  <h3 className="font-display text-lg font-bold uppercase text-hopon-black">Creators</h3>
                  <ul className="mt-3 list-disc space-y-2 pl-5 marker:text-hopon-red">
                    <li>Submit authentic work, meet the brief, and communicate promptly about timing or conflicts.</li>
                    <li>Use only content, music, likenesses, and claims you are allowed to use.</li>
                    <li>Keep campaign and customer information confidential unless the brief says it is public.</li>
                    <li>Do not promise results or present an experience you did not have.</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-hopon-black">
                6. FTC and platform disclosures
              </h2>
              <p className="mt-3">
                Creators must clearly and conspicuously disclose material connections, including payment, free products,
                discounts, invitations, or another benefit, whenever required by the U.S. Federal Trade Commission (FTC),
                another applicable regulator, or the rules of the platform where content appears. Follow the platform&apos;s
                branded-content and disclosure tools when available. Do not hide a disclosure in a hashtag block, behind a
                click, or after a misleading opening. Merchants must not ask creators to remove or obscure a required
                disclosure, and both sides must follow applicable advertising, consumer-protection, and platform rules.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-hopon-black">
                7. Offers, check-ins, and attribution
              </h2>
              <p className="mt-3">
                Offers are subject to the campaign brief, the merchant&apos;s stated terms, availability, and any eligibility
                conditions shown at the time of redemption. A public redemption link may identify a campaign or creator and
                may be used to attribute activity; it is not a guarantee that an offer remains active. A check-in or nearby
                verification feature may request optional device location permission. Do not share, duplicate, manipulate, or
                redeem an offer in a way that bypasses the stated terms or interferes with campaign measurement.
              </p>
              <p className="mt-3">
                hOpOn reports activity using available signals and may deduplicate or correct events. Attribution is an
                operational estimate, not a promise of a particular conversion count, payout, or business outcome.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-hopon-black">
                8. Card-on-file campaigns
              </h2>
              <p className="mt-3">
                Some complimentary-experience campaigns require a creator to save a credit or debit card with Stripe before
                applying. hOpOn and merchants do not receive the full card number or security code. Before applying, the
                creator sees and separately accepts the campaign&apos;s maximum authorized amount and card-on-file terms.
              </p>
              <p className="mt-3">
                A merchant cannot charge the saved card directly. If a merchant reports non-delivery, hOpOn provides notice
                and an opportunity to cure or appeal. A charge up to the accepted maximum can be submitted to Stripe only
                after a hOpOn administrator reviews and approves the case. Bank or card-network rights, including chargeback
                rights, continue to apply. Removing a payment method is unavailable while it is attached to an active
                campaign authorization.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-hopon-black">
                9. AI-assisted features
              </h2>
              <p className="mt-3">
                hOpOn uses AI-assisted tools to generate campaign drafts, creator-match explanations, content feedback,
                scheduling suggestions, and performance summaries. These outputs can be incomplete or inaccurate. Merchants
                and creators must review an output before relying on it, publishing it, approving content, or making a
                campaign decision. Do not submit confidential information that is not needed for the requested workflow.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-hopon-black">
                10. Prohibited conduct
              </h2>
              <p className="mt-3">You may not:</p>
              <ul className="mt-4 list-disc space-y-2 pl-6 marker:text-hopon-red">
                <li>Break the law, infringe rights, harass or discriminate against another person, or expose private information.</li>
                <li>Impersonate a person or business, create fake engagement, buy or misrepresent followers, or submit fabricated visits or redemptions.</li>
                <li>Make false, misleading, unsafe, or unsubstantiated claims about a business, product, offer, or experience.</li>
                <li>Upload malware or harmful code, probe or disrupt the Platform, scrape data, or bypass access controls or rate limits.</li>
                <li>Use another person&apos;s account, content, location, payment details, or personal information without authorization.</li>
                <li>Circumvent a campaign&apos;s approval, disclosure, usage-rights, redemption, or attribution rules.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-hopon-black">
                11. Third-party services and links
              </h2>
              <p className="mt-3">
                The Platform relies on third-party services for authentication, hosting and storage, maps, email, push
                notifications, payments, AI-assisted features, and links to social platforms. Those services are controlled
                by their own operators and terms. Review the applicable terms before using a connected service or following
                a link. hOpOn is not responsible for a third party&apos;s availability, content, or independent handling of
                information.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-hopon-black">
                12. Platform content and feedback
              </h2>
              <p className="mt-3">
                hOpOn and its interface, branding, software, and original materials are protected by applicable intellectual
                property laws. We give you a limited, revocable, non-transferable permission to use the Platform for its
                intended campaign and offer purposes. If you send suggestions or feedback, you allow hOpOn to use it without
                restriction or payment, provided we do not use it to identify you publicly without permission.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-hopon-black">
                13. Suspension and ending access
              </h2>
              <p className="mt-3">
                We may limit, pause, or end access to an account, campaign, offer, or feature when we reasonably believe it
                is necessary to protect users, investigate abuse, enforce these Terms, address a security issue, or comply
                with law. You may stop using hOpOn at any time. Ending access does not erase campaign records or rights that
                by their nature should continue, including content licenses needed to operate the service, confidentiality,
                outstanding obligations, and the terms governing past activity.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-hopon-black">
                14. Disclaimers
              </h2>
              <p className="mt-3">
                To the maximum extent permitted by law, the Platform is provided &quot;as is&quot; and &quot;as available&quot; without
                warranties of merchantability, fitness for a particular purpose, title, or non-infringement. hOpOn does not
                promise uninterrupted access, a particular creator or merchant match, offer availability, content
                performance, attribution accuracy, conversion results, or a campaign outcome. Users must verify campaign
                terms, creator content, offers, and attribution reports before acting on them.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-hopon-black">
                15. Limitation of liability
              </h2>
              <p className="mt-3">
                To the maximum extent permitted by law, hOpOn and its operator will not be liable for indirect, incidental,
                special, consequential, exemplary, or punitive damages, or for lost profits, revenue, data, goodwill, or
                business opportunities arising from the Platform, a campaign, creator content, a merchant offer, or a
                third-party service. hOpOn&apos;s total liability for a claim will not exceed the greater of USD $100 or the
                amount the claimant paid directly to hOpOn for the Platform during the six months before the event giving
                rise to the claim. These limits do not apply where applicable law does not allow them.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-hopon-black">
                16. Responsibility for claims
              </h2>
              <p className="mt-3">
                You are responsible for claims, losses, and reasonable costs arising from your content, business, offer,
                campaign conduct, violation of these Terms, or infringement of another person&apos;s rights. To the extent
                permitted by law, you agree to defend and reimburse hOpOn and its operator against those claims and costs.
                hOpOn will notify you of a covered claim and allow you to participate in its defense; you may not settle a
                claim in a way that admits fault by or imposes an obligation on hOpOn without written consent.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-hopon-black">
                17. Resolving a dispute
              </h2>
              <p className="mt-3">
                Before filing a formal claim against hOpOn, email the facts, requested resolution, and supporting records to{' '}
                <a href={`mailto:${CONTACT_EMAIL}`} className="font-mono text-sm text-hopon-red hover:underline underline-offset-4">
                  {CONTACT_EMAIL}
                </a>
                . We will try to resolve the dispute informally. These Terms do not require arbitration and do not select a
                governing state or court. Applicable law determines those questions.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-hopon-black">
                18. Changes to these Terms
              </h2>
              <p className="mt-3">
                We update these Terms when the Platform or its rules change. The effective date above identifies the current
                version. Material changes will be shown in the product or on this page before they take effect when advance
                notice is practical. Continued use after an updated version takes effect constitutes acceptance of that
                version.
              </p>
            </section>

            <section id="contact" className="scroll-mt-28 border-t border-black/15 pt-8">
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-hopon-black">
                Contact
              </h2>
              <p className="mt-3">
                Questions about these Terms or a campaign can be sent to{' '}
                <a href={`mailto:${CONTACT_EMAIL}`} className="font-mono text-sm text-hopon-red hover:underline underline-offset-4">
                  {CONTACT_EMAIL}
                </a>
                . For information about how hOpOn handles personal data, read our{' '}
                <Link to="/privacy" className="font-mono text-sm text-hopon-red hover:underline underline-offset-4">
                  Privacy Policy
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
