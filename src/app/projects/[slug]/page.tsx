import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { projects } from "@/data/projects";
import { profile } from "@/data/profile";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return projects
    .filter((p) => !!p.caseStudy)
    .map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return {};
  return {
    title: project.name,
    description: project.oneLiner,
  };
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project || !project.caseStudy) notFound();

  const cs = project.caseStudy;

  return (
    <main className="mx-auto max-w-content px-6 py-12">
      {/* Back */}
      <Link
        href="/projects"
        className="font-mono text-xs uppercase tracking-[0.1em] text-muted hover:text-ink"
      >
        ← projects
      </Link>

      {/* Header */}
      <div className="mt-6 border-b border-line pb-6">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">case study</p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          {project.name}
        </h1>
        <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.1em] text-muted">
          <span aria-hidden className={project.status === "live" ? "text-live" : "text-signal"}>●</span>{" "}
          {project.status} · {project.period}
        </p>
        <p className="mt-4 max-w-2xl font-body text-base leading-relaxed text-muted">
          {project.description}
        </p>
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {project.stack.map((tech) => (
            <li key={tech} className="rounded-sm border border-line px-2 py-0.5 font-mono text-[11px] text-muted">
              {tech}
            </li>
          ))}
        </ul>
      </div>

      {/* Case study body */}
      <div className="mt-10 flex flex-col gap-10">
        {/* Problem */}
        <CaseSection label="Problem">
          <p className="font-body text-sm leading-relaxed text-muted">{cs.problem}</p>
        </CaseSection>

        {/* Context */}
        <CaseSection label="Context">
          <p className="font-body text-sm leading-relaxed text-muted">{cs.context}</p>
        </CaseSection>

        {/* System */}
        <CaseSection label="System">
          <p className="font-body text-sm leading-relaxed text-muted">{cs.system}</p>
        </CaseSection>

        {/* Architecture */}
        <CaseSection label="Architecture">
          <ul className="flex flex-col gap-2">
            {cs.architecture.map((item, i) => (
              <li key={i} className="flex gap-3 font-body text-sm leading-relaxed text-muted">
                <span aria-hidden className="mt-0.5 text-signal">▪</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </CaseSection>

        {/* Engineering decisions */}
        <CaseSection label="Engineering decisions">
          <div className="flex flex-col gap-5">
            {cs.decisions.map((d, i) => (
              <div key={i}>
                <h3 className="font-display text-sm font-medium text-ink">{d.title}</h3>
                <p className="mt-1 font-body text-sm leading-relaxed text-muted">{d.body}</p>
              </div>
            ))}
          </div>
        </CaseSection>

        {/* Challenges */}
        <CaseSection label="Challenges">
          <ul className="flex flex-col gap-2">
            {cs.challenges.map((c, i) => (
              <li key={i} className="flex gap-3 font-body text-sm leading-relaxed text-muted">
                <span aria-hidden className="mt-0.5 text-muted">·</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </CaseSection>

        {/* Results */}
        <CaseSection label="Results">
          <ul className="flex flex-col gap-2">
            {cs.results.map((r, i) => (
              <li key={i} className="flex gap-3 font-body text-sm leading-relaxed text-muted">
                <span aria-hidden className="mt-0.5 text-signal">▪</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </CaseSection>

        {/* Lessons */}
        <CaseSection label="Lessons">
          <ul className="flex flex-col gap-2">
            {cs.lessons.map((l, i) => (
              <li key={i} className="flex gap-3 font-body text-sm leading-relaxed text-muted">
                <span aria-hidden className="mt-0.5 text-muted">·</span>
                <span>{l}</span>
              </li>
            ))}
          </ul>
        </CaseSection>
      </div>

      {/* Back to projects */}
      <div className="mt-16 border-t border-line pt-8">
        <Link
          href="/projects"
          className="font-mono text-xs uppercase tracking-[0.1em] text-muted hover:text-ink"
        >
          ← all projects
        </Link>
      </div>
    </main>
  );
}

function CaseSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="border-b border-line pb-2">
        <h2 className="font-mono text-xs uppercase tracking-[0.14em] text-muted">{label}</h2>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}
