import { FileText } from "lucide-react";
import Layout from "../components/Layout";

export default function TermsPage() {
  const updated = "April 2026";
  return (
    <Layout showTopAd={false}>
      <div className="mb-5 flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
          <FileText className="h-5 w-5" />
        </span>
        <div>
          <h1
            data-testid="terms-title"
            className="font-heading text-3xl font-bold text-slate-900 sm:text-4xl"
          >
            Terms &amp; Conditions
          </h1>
          <p className="mt-1 text-sm text-slate-500">Last updated: {updated}</p>
        </div>
      </div>

      <article className="prose-content space-y-5 rounded-2xl border border-slate-200 bg-white p-5 text-base leading-7 text-slate-700 shadow-sm sm:p-7">
        <section>
          <h2 className="font-heading text-xl font-bold text-slate-900">
            1. About this service
          </h2>
          <p>
            Farmer Helper ("the App", "we", "us") is a free, mobile-first web
            application that aggregates and displays publicly available
            agricultural information for Indian farmers. Specifically, the App
            provides:
          </p>
          <ul className="ml-5 list-disc space-y-1">
            <li>
              <b>Mandi Bhav (mandi prices)</b> — sourced from the open
              data.gov.in API.
            </li>
            <li>
              <b>Local weather forecasts</b> — sourced from third-party weather
              providers such as OpenWeather.
            </li>
            <li>
              <b>Government schemes</b> — descriptive listings linking to the
              relevant official scheme portals.
            </li>
            <li>
              <b>Farm Store</b> — curated agricultural product listings that
              link to third-party retailers (e.g., Amazon).
            </li>
          </ul>
          <p>
            The App is purely <b>informational</b> in nature. It does not
            execute trades, place purchase orders, file scheme applications, or
            transact on a user's behalf.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-bold text-slate-900">
            2. Acceptance of terms
          </h2>
          <p>
            By accessing or using Farmer Helper you agree to be bound by these
            Terms &amp; Conditions and by our{" "}
            <a className="text-emerald-700 underline" href="/privacy">
              Privacy Policy
            </a>
            . If you do not agree, please do not use the service.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-bold text-slate-900">
            3. Information accuracy &amp; disclaimer
          </h2>
          <p>
            We display data fetched from third-party sources that we consider
            reliable, but we cannot and do not guarantee that the information is
            accurate, complete, current, or error-free.
          </p>
          <ul className="ml-5 list-disc space-y-1">
            <li>
              Mandi prices vary intra-day and across markets; figures shown may
              be delayed by the source feed.
            </li>
            <li>
              Weather forecasts are probabilistic and may differ from actual
              conditions.
            </li>
            <li>
              Government scheme details, eligibility and benefit amounts are
              subject to change by the issuing authority.
            </li>
            <li>
              Product prices and availability on third-party stores are
              controlled by those stores and may change without notice.
            </li>
          </ul>
          <p>
            <b>No guarantee of outcomes is provided.</b> Any decision —
            agricultural, financial, or otherwise — taken on the basis of
            information shown in the App is the user's sole responsibility.
            Users are strongly encouraged to verify critical information with
            their local mandi, agriculture officer, or the official scheme
            portal before acting.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-bold text-slate-900">
            4. User responsibility
          </h2>
          <ul className="ml-5 list-disc space-y-1">
            <li>
              You agree to use the App only for lawful, personal,
              non-commercial purposes.
            </li>
            <li>
              You agree not to scrape, mass-download, or otherwise misuse data
              served through the App.
            </li>
            <li>
              You are responsible for any agricultural, financial, or
              transactional decision you make. The App is an information aid,
              not a substitute for professional advice.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading text-xl font-bold text-slate-900">
            5. Third-party links and affiliate disclosure
          </h2>
          <p>
            The App contains links to third-party websites (data.gov.in,
            OpenWeather, Amazon, government scheme portals, etc.). We do not
            control, endorse, or assume responsibility for the content,
            policies, or practices of any third-party site. Some product links
            may be affiliate links; we may earn a small commission if you make
            a purchase, at no extra cost to you. This does not influence the
            information we display.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-bold text-slate-900">
            6. Advertising
          </h2>
          <p>
            The App may display advertisements served by Google AdSense or
            other ad networks to keep the service free for farmers. These
            advertisements are clearly labelled "Sponsored" or "Advertisement"
            and are independent of editorial content. Please see our Privacy
            Policy for details about how advertising partners may collect and
            use information.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-bold text-slate-900">
            7. Intellectual property
          </h2>
          <p>
            All trademarks, logos, and content (other than third-party data and
            user-supplied content) are the property of Farmer Helper or its
            licensors. You may not reproduce, redistribute, or modify the
            App's interface or original content without prior written consent.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-bold text-slate-900">
            8. Limitation of liability
          </h2>
          <p>
            To the maximum extent permitted by law, Farmer Helper, its
            operators, and contributors shall not be liable for any indirect,
            incidental, consequential, or punitive damages arising out of or in
            connection with your use of the App, including but not limited to
            crop losses, mandi-trade losses, loss of data, or interruption of
            service.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-bold text-slate-900">
            9. Changes to these terms
          </h2>
          <p>
            We may update these Terms &amp; Conditions from time to time. The
            updated version will be posted on this page with a revised "Last
            updated" date. Continued use of the App after a change constitutes
            acceptance of the revised terms.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-bold text-slate-900">
            10. Contact
          </h2>
          <p>
            For questions about these Terms please write to us at{" "}
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
