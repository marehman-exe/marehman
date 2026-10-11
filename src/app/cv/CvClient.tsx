"use client";

import Link from "next/link";
import { useRole } from "@/context/RoleContext";
import { profile, ROLES, type RoleKey } from "@/data/profile";
import { skillGroups, experience, education, certifications } from "@/data/skills";
import { projects } from "@/data/projects";

function fmtDate(iso: string) {
  const [y, m] = iso.split("-");
  if (!m) return y;
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[parseInt(m) - 1]} ${y}`;
}

function dateRange(start: string, end?: string) {
  return `${fmtDate(start)} – ${end ? fmtDate(end) : "Present"}`;
}

const ROLE_LABELS: Record<RoleKey, string> = {
  ai: "AI Engineer / RAG Systems",
  backend: "Python Backend Developer",
  projects: "Project Portfolio",
};

function CvSectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 border-b border-[#e3e7e4] pb-1 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-[#0a6e68]">
      {children}
    </h2>
  );
}

export function CvClient() {
  const { role, setRole } = useRole();

  const cvProjects = [
    ...projects.filter((p) => p.roles.includes(role as never)).slice(0, 4),
    ...projects.filter((p) => !p.roles.includes(role as never)),
  ].slice(0, 5);

  const cvSkills = [
    ...skillGroups.filter((g) => g.roles.includes(role)),
    ...skillGroups.filter((g) => !g.roles.includes(role)),
  ];

  return (
    <main className="bg-paper py-8 print:bg-white print:py-0">
      {/* Controls bar */}
      <div className="no-print mx-auto mb-6 flex max-w-cv flex-wrap items-center justify-between gap-3 px-4">
        <Link
          href="/"
          className="font-mono text-xs uppercase tracking-[0.1em] text-muted hover:text-ink"
        >
          ← back to site
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          {/* Role tabs */}
          <div
            role="tablist"
            aria-label="CV variant"
            className="inline-flex flex-wrap gap-1 rounded-sm border border-line bg-panel/60 p-1"
          >
            {ROLES.map((r) => (
              <button
                key={r}
                role="tab"
                aria-selected={r === role}
                onClick={() => setRole(r)}
                className={[
                  "rounded-[3px] px-3 py-1.5 font-mono text-xs transition-colors",
                  r === role ? "bg-signal text-paper" : "text-muted hover:text-ink",
                ].join(" ")}
              >
                {r}
              </button>
            ))}
          </div>
          {/* Print */}
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-sm border border-signal bg-signal px-4 py-2 font-mono text-xs uppercase tracking-[0.1em] text-paper transition-opacity hover:opacity-90"
          >
            Download PDF ↓
          </button>
        </div>
      </div>

      {/* CV document */}
      <article className="mx-auto max-w-cv bg-white px-10 py-10 text-[#16191b] shadow-[0_1px_0_rgba(0,0,0,0.06),0_12px_40px_-24px_rgba(0,0,0,0.35)] print:max-w-none print:px-0 print:py-0 print:shadow-none">
        {/* Header */}
        <header className="border-b border-[#e3e7e4] pb-5">
          <h1 className="font-display text-3xl font-bold tracking-tight text-[#16191b]">
            {profile.name}
          </h1>
          <p className="mt-1 font-mono text-xs uppercase tracking-[0.14em] text-[#0a6e68]">
            {ROLE_LABELS[role]}
          </p>
          <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-0 font-mono text-[11px] text-[#565f5b]">
            {profile.links.email && (
              <a href={`mailto:${profile.links.email}`} className="inline-block py-1 hover:text-[#0a6e68]">
                {profile.links.email}
              </a>
            )}
            <span className="py-1">{profile.location}</span>
            {profile.links.github && (
              <a href={profile.links.github} className="inline-block py-1 hover:text-[#0a6e68]">
                {profile.links.github.replace("https://", "")}
              </a>
            )}
            {profile.links.linkedin && (
              <a href={profile.links.linkedin} className="inline-block py-1 hover:text-[#0a6e68]">
                {profile.links.linkedin.replace("https://", "")}
              </a>
            )}
          </p>
        </header>

        {/* Summary */}
        <section className="mt-5">
          <p className="font-body text-sm leading-relaxed text-[#2c332f]">
            {profile.summaryByRole[role]}
          </p>
          <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.1em] text-[#565f5b]">
            working professionally since {profile.startedProfessionally}
          </p>
        </section>

        {/* Experience */}
        <section className="mt-6">
          <CvSectionHeading>Experience</CvSectionHeading>
          <div className="flex flex-col gap-4">
            {experience.map((exp) => (
              <div key={exp.id} className="break-inside-avoid">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <h3 className="font-display text-sm font-medium text-[#16191b]">
                    {exp.title}
                    {exp.org && <span className="text-[#565f5b]"> · {exp.org}</span>}
                  </h3>
                  <span className="font-mono text-[11px] text-[#565f5b]">
                    {dateRange(exp.start, exp.end)}
                  </span>
                </div>
                <p className="mt-1 font-body text-[13px] leading-snug text-[#2c332f]">
                  {exp.summary}
                </p>
                {exp.detail && exp.detail.length > 0 && (
                  <ul className="mt-1.5 flex flex-col gap-1">
                    {exp.detail.map((d, i) => (
                      <li key={i} className="flex gap-2 font-body text-[13px] leading-snug text-[#2c332f]">
                        <span aria-hidden className="mt-[3px] text-[#0a6e68]">▪</span>
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Selected projects */}
        <section className="mt-6">
          <CvSectionHeading>Selected projects</CvSectionHeading>
          <div className="flex flex-col gap-3">
            {cvProjects.map((p) => (
              <div key={p.id} className="break-inside-avoid">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <h3 className="font-display text-sm font-medium text-[#16191b]">{p.name}</h3>
                  <span className="font-mono text-[11px] text-[#565f5b]">{p.period}</span>
                </div>
                <p className="mt-0.5 font-body text-[13px] leading-snug text-[#2c332f]">
                  {p.oneLiner}
                </p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.08em] text-[#565f5b]">
                  {p.stack.join(" · ")}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Skills */}
        <section className="mt-6">
          <CvSectionHeading>Skills</CvSectionHeading>
          <div className="flex flex-col gap-2">
            {cvSkills.map((group) => (
              <div key={group.id} className="break-inside-avoid text-[13px]">
                <span className="font-display font-medium text-[#16191b]">{group.label}: </span>
                <span className="font-body text-[#2c332f]">
                  {group.skills.map((s) => s.name).join(", ")}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Education */}
        <section className="mt-6">
          <CvSectionHeading>Education</CvSectionHeading>
          <div className="flex flex-col gap-2">
            {education.map((edu) => (
              <div key={edu.id} className="flex flex-wrap items-baseline justify-between gap-x-3 break-inside-avoid">
                <h3 className="font-display text-sm font-medium text-[#16191b]">
                  {edu.title}
                  {edu.org && <span className="text-[#565f5b]"> · {edu.org}</span>}
                </h3>
                <span className="font-mono text-[11px] text-[#565f5b]">
                  {edu.start}{edu.end ? `–${edu.end}` : ""}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Certifications */}
        <section className="mt-6">
          <CvSectionHeading>Certifications</CvSectionHeading>
          <div className="flex flex-col gap-1">
            {certifications.map((cert) => (
              <div key={cert.id} className="break-inside-avoid">
                <span className="font-body text-[13px] leading-snug text-[#2c332f]">
                  {cert.title}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-8 border-t border-[#e3e7e4] pt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[#565f5b]">
          Full portfolio & case studies:{" "}
          <a href="https://marehman.me/" className="normal-case text-[#0a6e68] hover:underline">
            https://marehman.me/
          </a>
        </footer>
      </article>
    </main>
  );
}
