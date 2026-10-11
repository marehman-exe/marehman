import type { Metadata } from "next";
import { profile } from "@/data/profile";
import { SectionLabel } from "@/components/SectionLabel";
import { ViewFilter } from "@/components/ViewFilter";
import { HomePipeline } from "@/components/HomePipeline";
import { FlagshipProjects } from "@/components/FlagshipProjects";
import { HeroSummary } from "@/components/HeroSummary";
import { journey } from "@/data/journey";
import { secondaryProjects } from "@/data/projects";
import Link from "next/link";

const baseUrl = "https://marehman.me";

export const metadata: Metadata = {
  title: "marehman",
  description: profile.tagline,
  alternates: { canonical: baseUrl },
  openGraph: {
    url: baseUrl,
    title: `${profile.name} — ${profile.title}`,
    description: profile.tagline,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  url: baseUrl,
  jobTitle: profile.title,
  address: {
    "@type": "PostalAddress",
    addressLocality: profile.location,
  },
  email: `mailto:${profile.links.email}`,
  sameAs: [profile.links.github, profile.links.linkedin],
};

export default function HomePage() {
  return (
    <main className="mx-auto max-w-content px-6 py-12">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── 01 · Profile ─────────────────────────────────────────────── */}
      <section aria-labelledby="hero-heading">
        {/* Metadata eyebrow */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-muted">
          <span className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-live" aria-hidden />
            building with ai &amp; python
          </span>
          <span aria-hidden className="text-line">|</span>
          <span>{profile.location}</span>
          <span aria-hidden className="text-line">|</span>
          <span>01 · profile</span>
        </div>

        {/* Headline */}
        <h1
          id="hero-heading"
          className="mt-5 max-w-4xl font-display text-4xl font-bold leading-[1.06] tracking-tight text-ink sm:text-5xl"
        >
          {profile.tagline}
        </h1>

        {/* Sub-headline — updates with role selection */}
        <HeroSummary />

        {/* View-as filter */}
        <ViewFilter />
      </section>

      {/* ── 02 · System Map ──────────────────────────────────────────── */}
      <section className="mt-16" aria-labelledby="section-02">
        <SectionLabel
          number="02"
          label="system map"
          href="/journey"
          linkLabel="full journey"
        />
        <div className="mt-4">
          <HomePipeline nodes={journey} />
        </div>
      </section>

      {/* ── 03 · Flagship Systems ────────────────────────────────────── */}
      <section className="mt-16" aria-labelledby="section-03">
        <SectionLabel
          number="03"
          label="flagship systems"
          href="/projects"
          linkLabel="all projects"
        />
        <FlagshipProjects />
      </section>

      {/* ── 04 · Selected Experiments ────────────────────────────────── */}
      {secondaryProjects.length > 0 && (
        <section className="mt-16" aria-labelledby="section-04">
          <SectionLabel
            number="04"
            label="selected experiments"
            href="/projects"
            linkLabel="all projects"
          />
          <ul className="mt-5 flex flex-col divide-y divide-line">
            {secondaryProjects.map((p) => (
              <li key={p.id} className="py-4">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <span className="font-display text-sm font-medium text-ink">{p.name}</span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted">
                    {p.status} · {p.period}
                  </span>
                </div>
                <p className="mt-1 max-w-2xl font-body text-sm leading-relaxed text-muted">
                  {p.oneLiner}
                </p>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {p.stack.map((tech) => (
                    <li
                      key={tech}
                      className="rounded-sm border border-line px-2 py-0.5 font-mono text-[11px] text-muted"
                    >
                      {tech}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
          <Link
            href="/projects"
            className="mt-4 inline-flex items-center font-mono text-xs uppercase tracking-[0.08em] text-signal hover:underline"
          >
            explore all projects →
          </Link>
        </section>
      )}
    </main>
  );
}
