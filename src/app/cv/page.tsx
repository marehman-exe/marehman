import type { Metadata } from "next";
import { profile, DEFAULT_ROLE, type RoleKey } from "@/data/profile";
import { skillGroups, experience, education, certifications } from "@/data/skills";
import { projects } from "@/data/projects";
import { CvRoleSwitcher, CvRoleTitle, CvRoleSummary } from "./CvClient";

export const metadata: Metadata = {
  title: "CV",
  description: `Curriculum vitae of ${profile.name} — ${profile.title}. RAG systems, backend engineering, and applied machine learning.`,
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  const [y, m] = iso.split("-");
  if (!m) return y;
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[parseInt(m) - 1]} ${y}`;
}

function dateRange(start: string, end?: string) {
  return `${fmtDate(start)} – ${end ? fmtDate(end) : "Present"}`;
}

function CvSectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 border-b border-[#e3e7e4] pb-1 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-[#0a6e68]">
      {children}
    </h2>
  );
}

// ── Server-rendered CV content ───────────────────────────────────────────────
// Role-dependent sections (title line, summary, project + skill ordering)
// are handled by thin client islands (CvRoleTitle, CvRoleSummary) that read
// from RoleContext — set by CvRoleSwitcher. All other content is static.

export default function CvPage() {
  // Server-side defaults for first paint — client islands will hydrate with
  // the actual role from the URL (?role=) on the client.
  const defaultRole: RoleKey = DEFAULT_ROLE;

  const defaultProjects = [
    ...projects.filter((p) => p.roles.includes(defaultRole)).slice(0, 4),
    ...projects.filter((p) => !p.roles.includes(defaultRole)),
  ].slice(0, 5);

  const defaultSkills = [
    ...skillGroups.filter((g) => g.roles.includes(defaultRole)),
    ...skillGroups.filter((g) => !g.roles.includes(defaultRole)),
  ];

  return (
    <>
      {/*
        Print styles — inlined here so they are always present without an
        additional CSS file. They override Tailwind utilities for print.
      */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: #fff !important; color: #16191b !important; }
          .cv-doc {
            max-width: none !important;
            padding: 0 !important;
            box-shadow: none !important;
            margin: 0 !important;
          }
          /* Avoid breaking inside experience / project / skill blocks */
          .break-inside-avoid { break-inside: avoid; page-break-inside: avoid; }
          /* Prevent orphaned headings */
          h2, h3 { break-after: avoid; page-break-after: avoid; }
          /* Remove link underlines on print */
          a { text-decoration: none !important; color: inherit !important; }
          /* Ensure colour shows on print */
          .cv-signal { color: #0a6e68 !important; }
        }
      `}</style>

      <main className="bg-paper py-8 print:bg-white print:py-0">
        {/* Controls bar — client island */}
        <CvRoleSwitcher />

        {/* CV document — server rendered */}
        <article
          className="cv-doc mx-auto max-w-cv bg-white px-10 py-10 text-[#16191b] shadow-[0_1px_0_rgba(0,0,0,0.06),0_12px_40px_-24px_rgba(0,0,0,0.35)] print:max-w-none print:px-8 print:py-8 print:shadow-none"
          aria-label={`Curriculum vitae of ${profile.name}`}
        >
          {/* Header — always static */}
          <header className="border-b border-[#e3e7e4] pb-5">
            <h1 className="font-display text-3xl font-bold tracking-tight text-[#16191b]">
              {profile.name}
            </h1>
            {/* Role title — client island updates on role switch */}
            <CvRoleTitle />
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

          {/* Summary — client island (role-dependent) */}
          <CvRoleSummary summaryByRole={profile.summaryByRole} />
          <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.1em] text-[#565f5b]">
            working professionally since {profile.startedProfessionally}
          </p>

          {/* Experience — fully static */}
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
                          <span aria-hidden className="mt-[3px] cv-signal text-[#0a6e68]">▪</span>
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Selected projects — server-rendered with default role ordering.
              Role switching re-orders client-side via context in a future
              enhancement; for now the default (AI) order is shown on first
              paint and after hydration for the default role. */}
          <section className="mt-6">
            <CvSectionHeading>Selected projects</CvSectionHeading>
            <div className="flex flex-col gap-3">
              {defaultProjects.map((p) => (
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

          {/* Skills — server-rendered with default role ordering */}
          <section className="mt-6">
            <CvSectionHeading>Skills</CvSectionHeading>
            <div className="flex flex-col gap-2">
              {defaultSkills.map((group) => (
                <div key={group.id} className="break-inside-avoid text-[13px]">
                  <span className="font-display font-medium text-[#16191b]">{group.label}: </span>
                  <span className="font-body text-[#2c332f]">
                    {group.skills.map((s) => s.name).join(", ")}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Education — fully static */}
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

          {/* Certifications — fully static */}
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
            Full portfolio &amp; case studies:{" "}
            <a href="https://marehmandev.vercel.app/" className="normal-case cv-signal text-[#0a6e68] hover:underline">
              marehmandev.vercel.app
            </a>
          </footer>
        </article>
      </main>
    </>
  );
}
