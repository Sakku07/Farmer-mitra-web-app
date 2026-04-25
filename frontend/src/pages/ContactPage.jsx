import { useState } from "react";
import { Mail, Send, Copy, Check, MessageSquare, Clock } from "lucide-react";
import Layout from "../components/Layout";

const SUPPORT_EMAIL = "shaklensaifi@gmail.com";

export default function ContactPage() {
  const [copied, setCopied] = useState(false);
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  function copyEmail() {
    try {
      navigator.clipboard.writeText(SUPPORT_EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  }

  function buildMailto() {
    const lines = [
      message.trim(),
      "",
      "—",
      name.trim() ? `From: ${name.trim()}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    const params = new URLSearchParams({
      subject: subject || "Farmer Helper — Feedback",
      body: lines,
    });
    return `mailto:${SUPPORT_EMAIL}?${params.toString()}`;
  }

  return (
    <Layout showTopAd={false}>
      <div className="mb-5 flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
          <Mail className="h-5 w-5" />
        </span>
        <div>
          <h1
            data-testid="contact-title"
            className="font-heading text-3xl font-bold text-slate-900 sm:text-4xl"
          >
            Contact Us
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Feedback, support &amp; partnership requests
          </p>
        </div>
      </div>

      <section className="mb-6 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5 shadow-sm sm:p-7">
        <p className="text-base leading-7 text-slate-800">
          We'd love to hear from you. Whether you've spotted an issue with a
          mandi price, want a new feature added, need help applying for a
          government scheme, or want to partner with us — drop us a line and a
          real human will respond.
        </p>
        <div className="mt-5 rounded-xl border border-emerald-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
            Verified support email
          </p>
          <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
            <a
              data-testid="contact-email-link"
              href={`mailto:${SUPPORT_EMAIL}`}
              className="break-all font-heading text-xl font-bold text-slate-900 underline-offset-4 hover:text-emerald-700 hover:underline sm:text-2xl"
            >
              {SUPPORT_EMAIL}
            </a>
            <button
              onClick={copyEmail}
              data-testid="contact-copy-email"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-emerald-500 hover:text-emerald-700"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-600" /> Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" /> Copy
                </>
              )}
            </button>
          </div>
        </div>
        <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-slate-600">
          <Clock className="h-4 w-4" /> Typical response time: within 24–48
          hours, Monday to Saturday.
        </p>
      </section>

      <section
        data-testid="contact-form-card"
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
      >
        <h2 className="mb-1 flex items-center gap-2 font-heading text-xl font-bold text-slate-900">
          <MessageSquare className="h-5 w-5 text-emerald-600" />
          Send us a message
        </h2>
        <p className="mb-4 text-sm text-slate-600">
          Fill in the details below and your default email app will open with a
          ready-to-send message.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            window.location.href = buildMailto();
          }}
          className="space-y-3"
          data-testid="contact-form"
        >
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">
              Your name (optional)
            </span>
            <input
              data-testid="contact-name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ramesh Patil"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-base focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">
              Subject
            </span>
            <input
              data-testid="contact-subject-input"
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Feedback on mandi prices"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-base focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">
              Message
            </span>
            <textarea
              data-testid="contact-message-input"
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us what's on your mind…"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-base focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </label>
          <button
            type="submit"
            data-testid="contact-submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 sm:w-auto"
          >
            <Send className="h-4 w-4" /> Open email
          </button>
        </form>
      </section>

      <section className="mt-6 grid gap-3 sm:grid-cols-2">
        <FaqCard
          q="The mandi price for my crop looks wrong. What do I do?"
          a="Mandi prices are pulled directly from data.gov.in and refreshed multiple times a day. Please always verify with your local mandi before making a sales decision. If you spot a clear error, email us with the crop name, mandi name, and date."
        />
        <FaqCard
          q="I want to list my agricultural product or scheme on Farmer Helper."
          a="We're always open to partnerships that genuinely benefit farmers. Drop us an email with your offering and we'll get back to you with the next steps."
        />
        <FaqCard
          q="Do you offer the App in my language?"
          a="Today we support English, हिन्दी, मराठी and ਪੰਜਾਬੀ. More Indian languages are on our roadmap — write in if you'd like to see your language added next."
        />
        <FaqCard
          q="How do I report a bug or request a feature?"
          a="Use the form above or email us directly. Please describe what you saw, what you expected, your device (phone model / browser), and a screenshot if possible."
        />
      </section>
    </Layout>
  );
}

function FaqCard({ q, a }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="font-heading text-base font-bold text-slate-900">{q}</h3>
      <p className="mt-1 text-sm leading-6 text-slate-600">{a}</p>
    </article>
  );
}
