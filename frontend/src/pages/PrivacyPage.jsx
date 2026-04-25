import { ShieldCheck } from "lucide-react";
import Layout from "../components/Layout";

export default function PrivacyPage() {
  const updated = "April 2026";
  return (
    <Layout showTopAd={false}>
      <div className="mb-5 flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <div>
          <h1
            data-testid="privacy-title"
            className="font-heading text-3xl font-bold text-slate-900 sm:text-4xl"
          >
            Privacy Policy
          </h1>
          <p className="mt-1 text-sm text-slate-500">Last updated: {updated}</p>
        </div>
      </div>

      <article className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 text-base leading-7 text-slate-700 shadow-sm sm:p-7">
        <section>
          <p>
            Farmer Helper ("we", "us") respects your privacy. This Privacy
            Policy explains what information we collect, how we use it, and the
            choices you have.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-bold text-slate-900">
            1. Information we collect
          </h2>
          <p>
            We collect only the minimum information needed to provide the
            service:
          </p>
          <ul className="ml-5 list-disc space-y-1">
            <li>
              <b>Approximate location</b> — only if you grant the browser's
              location permission, and only used to fetch local weather. We do
              not store your location on our servers.
            </li>
            <li>
              <b>Device &amp; browser information</b> — User-Agent, screen
              size, language preference. This is collected by your browser as
              part of any normal HTTP request and is used in standard server
              logs to keep the service secure and reliable.
            </li>
            <li>
              <b>Language preference</b> — stored locally in your browser
              (localStorage) so the App remembers your chosen language between
              visits. Never sent to our servers as personal data.
            </li>
            <li>
              <b>Cached data</b> — schemes, product listings and similar
              non-personal API responses are cached locally in your browser to
              make the App fast.
            </li>
          </ul>
          <p>
            <b>We do not require you to create an account</b> to use the App.
            No email, phone number, or name is collected from end users.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-bold text-slate-900">
            2. How we use information
          </h2>
          <ul className="ml-5 list-disc space-y-1">
            <li>To deliver the requested feature (e.g., local weather).</li>
            <li>To monitor and prevent abuse of the service.</li>
            <li>
              To improve performance, debug errors, and improve the user
              experience.
            </li>
          </ul>
          <p>
            We do <b>not</b> sell or rent personal information to anyone.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-bold text-slate-900">
            3. Third-party services
          </h2>
          <p>
            The App relies on the following third-party services to function:
          </p>
          <ul className="ml-5 list-disc space-y-1">
            <li>
              <b>data.gov.in</b> — government open-data portal that provides
              live mandi prices.
            </li>
            <li>
              <b>OpenWeather</b> — weather data provider.
            </li>
            <li>
              <b>Amazon</b> — product information and affiliate links in the
              Store section.
            </li>
            <li>
              <b>Google AdSense</b> — advertising network used to display ads
              that keep the service free.
            </li>
          </ul>
          <p>
            Each of these services has its own privacy policy. We encourage
            users to review their policies.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-bold text-slate-900">
            4. Advertising &amp; cookies (Google AdSense)
          </h2>
          <p>
            We use Google AdSense to serve advertisements. Google and its
            partners use cookies and similar technologies to serve ads based on
            a user's prior visits to this website or other websites. Google's
            use of advertising cookies enables it and its partners to serve ads
            to users based on their visit to our App and/or other sites on the
            internet.
          </p>
          <ul className="ml-5 list-disc space-y-1">
            <li>
              You may opt out of personalised advertising by visiting{" "}
              <a
                className="text-emerald-700 underline"
                href="https://www.google.com/settings/ads"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google Ads Settings
              </a>
              .
            </li>
            <li>
              Alternatively you can opt out of a third-party vendor's use of
              cookies for personalised advertising by visiting{" "}
              <a
                className="text-emerald-700 underline"
                href="https://www.aboutads.info"
                target="_blank"
                rel="noopener noreferrer"
              >
                www.aboutads.info
              </a>
              .
            </li>
            <li>
              Third-party vendors, including Google, use cookies to serve ads
              based on a user's prior visits to your website or other
              websites.
            </li>
          </ul>
          <p>
            For more information about how Google uses data, please review{" "}
            <a
              className="text-emerald-700 underline"
              href="https://policies.google.com/technologies/partner-sites"
              target="_blank"
              rel="noopener noreferrer"
            >
              "How Google uses data when you use our partners' sites or apps"
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-bold text-slate-900">
            5. Children's privacy
          </h2>
          <p>
            The App is not directed to children under 13. We do not knowingly
            collect personal information from children under 13. If we become
            aware that a child under 13 has provided us with personal
            information, we will delete it promptly.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-bold text-slate-900">
            6. Data retention
          </h2>
          <p>
            Server logs are retained for a limited period (typically up to 30
            days) for security and debugging purposes and are then deleted.
            Locally cached data in your browser is fully under your control and
            can be cleared from your browser settings at any time.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-bold text-slate-900">
            7. Your rights
          </h2>
          <p>
            You have the right to access, correct, or request deletion of any
            personal information we may hold about you. Because we collect
            essentially no personally identifiable information from end users,
            most requests can be honoured by simply clearing your browser
            storage. For any specific request, please write to{" "}
            <a
              className="text-emerald-700 underline"
              href="mailto:shaklensaifi@gmail.com"
            >
              shaklensaifi@gmail.com
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-bold text-slate-900">
            8. Updates to this policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time. The updated
            version will be posted on this page with a revised "Last updated"
            date.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-bold text-slate-900">
            9. Contact
          </h2>
          <p>
            For privacy-related questions or concerns, please write to{" "}
            <a
              className="text-emerald-700 underline"
              href="mailto:shaklensaifi@gmail.com"
            >
              shaklensaifi@gmail.com
            </a>
            .
          </p>
        </section>
      </article>
    </Layout>
  );
}
