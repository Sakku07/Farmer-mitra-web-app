import { Sprout, Tractor, Cloud, Leaf, Store, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";

export default function AboutPage() {
  return (
    <Layout showTopAd={false}>
      <div className="mb-5 flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
          <Sprout className="h-5 w-5" />
        </span>
        <div>
          <h1
            data-testid="about-title"
            className="font-heading text-3xl font-bold text-slate-900 sm:text-4xl"
          >
            About Farmer Helper
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Built so every Indian farmer has the right information at their
            fingertips.
          </p>
        </div>
      </div>

      <article className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 text-base leading-7 text-slate-700 shadow-sm sm:p-7">
        <p>
          Farmer Helper is a free, mobile-first information utility designed
          specifically for India's rural farming community. Across 2.5 lakh
          villages and dozens of languages, the daily questions farmers face
          are remarkably consistent: <i>What is today's mandi price for my
          crop? Will it rain this week? Which government scheme can I apply
          for? Where do I buy the right seeds and tools?</i> The App brings
          credible answers to those four questions into one clean, fast
          interface that works on the most basic Android browser.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <Feature
            icon={Tractor}
            title="Live Mandi Bhav"
            body="State-wise, district-wise mandi prices for 12+ major commodities, sourced live from data.gov.in. Tap any market to see a 7-day price trend and historical records."
          />
          <Feature
            icon={Cloud}
            title="Local weather"
            body="Current temperature, humidity and a 3-day forecast for your exact location. Plan irrigation, sowing and harvest with confidence."
          />
          <Feature
            icon={Leaf}
            title="Govt schemes"
            body="A curated, regularly updated catalogue of central agricultural schemes — PM-KISAN, PMFBY, Soil Health Card, KCC, PKVY and more — with eligibility and one-tap apply links."
          />
          <Feature
            icon={Store}
            title="Farm Store"
            body="A handpicked shortlist of seeds, tools, fertilizers and irrigation kits with a direct link to buy on Amazon at the latest price."
          />
        </div>

        <section>
          <h2 className="font-heading text-xl font-bold text-slate-900">
            Our principles
          </h2>
          <ul className="ml-5 list-disc space-y-1">
            <li>
              <b>Free for farmers.</b> Always. Ads keep the lights on; the data
              and tools stay free.
            </li>
            <li>
              <b>Real data, not opinions.</b> Prices come from data.gov.in,
              weather from established providers, scheme info from official
              portals.
            </li>
            <li>
              <b>Mobile-first &amp; offline-friendly.</b> Cached responses load
              instantly even on patchy 2G/3G connections.
            </li>
            <li>
              <b>No accounts, no tracking.</b> Use the entire app without
              creating an account. We collect the absolute minimum (see our{" "}
              <Link to="/privacy" className="text-emerald-700 underline">
                Privacy Policy
              </Link>
              ).
            </li>
            <li>
              <b>Transparent.</b> Every information disclaimer, source link,
              and contact email is in plain sight.
            </li>
          </ul>
        </section>

        <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <h3 className="flex items-center gap-2 font-heading text-base font-bold text-slate-900">
            <ShieldCheck className="h-4 w-4 text-emerald-700" /> A note on
            decisions
          </h3>
          <p className="mt-1 text-sm leading-6 text-slate-700">
            The information shown is for guidance only. Mandi prices, weather,
            and scheme details can change — please verify with your local
            mandi or block agriculture office before any major sale, purchase,
            or scheme application. See the full disclaimer in our{" "}
            <Link to="/terms" className="text-emerald-700 underline">
              Terms &amp; Conditions
            </Link>
            .
          </p>
        </section>
      </article>
    </Layout>
  );
}

function Feature({ icon: Icon, title, body }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
        <Icon className="h-4 w-4" />
      </span>
      <p className="mt-2 font-heading text-base font-bold text-slate-900">{title}</p>
      <p className="mt-1 text-sm leading-6 text-slate-600">{body}</p>
    </div>
  );
}
