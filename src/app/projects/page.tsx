import type { Metadata } from "next";
import Link from "next/link";
import { flagshipProjects, secondaryProjects } from "@/data/projects";
import type { Project } from "@/data/projects";
import { SectionLabel } from "@/components/SectionLabel";
import { profile } from "@/data/profile";

export const metadata: Metadata = {
  title: "Projects",
  description: `Engineering projects by ${profile.name} — multi-tenant systems, automation pipelines, and backend architecture.`,
};

function statusColor(status: Project["status"]) {
  if (status === "live") return "text-live";
  if (status === "in-progress") return "text-signal";
  return "text-muted";
}

function ProjectCard({
  project,
  large = false,
}: {
  project: Project;
  large?: boolean;
}) {
  const hasCaseStudy = !!project.caseStudy;
  const inner = (
    <article
      className={[
        "flex h-full flex-col rounded-sm border border-line bg-panel/60 p-4 transition-colors",
        hasCaseStudy ? "hover:border-signal" : "",
        "sm:p-5",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <h3
          className={`font-display text-ink ${
            large ? "text-2xl" : "text-base font-medium"
          }`}
        >
          {project.name}
        </h3>
      </div>

      <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.1em] text-muted">
        <span aria-hidden className={statusColor(project.status)}>
          ●
        </span>{" "}
        {project.status} · {project.period}
      </p>

      <p
        className={`mt-3 font-body leading-relaxed text-muted ${
          large ? "text-base" : "text-sm"
        }`}
      >
        {project.description}
      </p>

      <ul className="mt-4 flex flex-wrap gap-1.5">
        {project.stack.map((tech) => (
          <li
            key={tech}
            className="rounded-sm border border-line px-2 py-0.5 font-mono text-[11px] text-muted"
          >
            {tech}
          </li>
        ))}
      </ul>

      {hasCaseStudy && (
        <p className="mt-4 font-mono text-xs text-signal">case study →</p>
      )}
    </article>
  );

  if (hasCaseStudy) {
    return (
      <Link href={`/projects/${project.slug}`} className="block h-full">
        {inner}
      </Link>
    );
  }
  return inner;
}

export default function ProjectsPage() {
  return (
    <main className="mx-auto max-w-content px-6 py-12">
      {/* Page header */}
      <div className="mb-10">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
          03 · projects
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Engineering evidence.
        </h1>
        <p className="mt-3 max-w-2xl font-body text-base leading-relaxed text-muted">
          Systems built in production — multi-tenant platforms, automation
          pipelines, and backend architecture. Each flagship project is
          documented with context, decisions, and outcomes.
        </p>
      </div>

      {/* ── 01 · Flagship systems ─────────────────────────────── */}
      <section aria-labelledby="flagship-projects-label">
        <SectionLabel number="01" label="flagship systems" />
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {flagshipProjects.map((p, i) => (
            <div key={p.id} className={i === 0 ? "sm:col-span-2" : ""}>
              <ProjectCard project={p} large={i === 0} />
            </div>
          ))}
        </div>
      </section>

      {/* ── 02 · Earlier work ────────────────────────────────── */}
      {secondaryProjects.length > 0 && (
        <section className="mt-16" aria-labelledby="secondary-projects-label">
          <SectionLabel number="02" label="earlier work" />
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {secondaryProjects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
