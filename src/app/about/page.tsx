import type { Metadata } from "next";
import { profile } from "@/data/profile";
import { skillGroups, experience, education, certifications } from "@/data/skills";
import { SectionLabel } from "@/components/SectionLabel";
import { GitHubIcon, LinkedInIcon, EmailIcon } from "@/components/Icons";

export const metadata: Metadata = {
  title: "About",
  description: `About ${profile.name} — engineering background, technical philosophy, and current focus.`,
};

function fmtDate(iso: string) {
  const [y, m] = iso.split("-");
  if (!m) return y;
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[parseInt(m) - 1]} ${y}`;
}

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-content px-6 py-12">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="mb-10">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">04 · about</p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          {profile.name}
        </h1>
        <p className="mt-1 font-mono text-xs uppercase tracking-[0.1em] text-muted">
          {profile.title} · {profile.location}
        </p>
        <p className="mt-1 font-mono text-xs text-muted">
          working professionally since {profile.startedProfessionally}
        </p>

        {/* Links */}
        <div className="mt-4 flex items-center gap-4">
          {profile.links.github && (
            <a href={profile.links.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="text-muted transition-colors hover:text-signal">
              <GitHubIcon size={16} />
            </a>
          )}
          {profile.links.linkedin && (
            <a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-muted transition-colors hover:text-signal">
              <LinkedInIcon size={16} />
            </a>
          )}
          {profile.links.email && (
            <a href={`mailto:${profile.links.email}`} aria-label="Email" className="text-muted transition-colors hover:text-signal">
              <EmailIcon size={16} />
            </a>
          )}
        </div>
      </div>

      {/* ── 01 · Background ──────────────────────────────────────── */}
      <section className="mt-10" aria-labelledby="about-background">
        <SectionLabel number="01" label="background" />
        <div className="mt-5 flex flex-col gap-4 max-w-2xl">
          {profile.bio.map((para, i) => (
            <p key={i} className="font-body text-base leading-relaxed text-muted">
              {para}
            </p>
          ))}
        </div>
      </section>

      {/* ── 02 · Current focus ───────────────────────────────────── */}
      <section className="mt-16" aria-labelledby="about-focus">
        <SectionLabel number="02" label="current focus" />
        <p className="mt-5 max-w-2xl font-body text-base leading-relaxed text-muted">
          {profile.availability}
        </p>
      </section>

      {/* ── 03 · Engineering philosophy ─────────────────────────── */}
      <section className="mt-16" aria-labelledby="about-philosophy">
        <SectionLabel number="03" label="engineering philosophy" />
        <ul className="mt-5 flex flex-col gap-3 max-w-2xl">
          {profile.philosophy.map((p, i) => (
            <li key={i} className="flex gap-3 font-body text-sm leading-relaxed text-muted">
              <span aria-hidden className="mt-1 text-signal font-mono text-xs">▪</span>
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── 04 · Skills ──────────────────────────────────────────── */}
      <section className="mt-16" aria-labelledby="about-skills">
        <SectionLabel number="04" label="skills" />
        <div className="mt-5 flex flex-col gap-4">
          {skillGroups.map((group) => (
            <div key={group.id} className="text-sm">
              <span className="font-display font-medium text-ink">{group.label}: </span>
              <span className="font-body text-muted">
                {group.skills.map((s) => s.name).join(", ")}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 05 · Experience ──────────────────────────────────────── */}
      <section className="mt-16" aria-labelledby="about-experience">
        <SectionLabel number="05" label="experience" />
        <div className="mt-5 flex flex-col gap-6">
          {experience.map((exp) => (
            <div key={exp.id} className="break-inside-avoid">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <h3 className="font-display text-sm font-medium text-ink">
                  {exp.title}
                  {exp.org && <span className="text-muted"> · {exp.org}</span>}
                </h3>
                <span className="font-mono text-[11px] text-muted">
                  {fmtDate(exp.start)}{exp.end ? ` – ${fmtDate(exp.end)}` : " – Present"}
                </span>
              </div>
              <p className="mt-1 font-body text-sm leading-relaxed text-muted">{exp.summary}</p>
              {exp.detail && (
                <ul className="mt-2 flex flex-col gap-1">
                  {exp.detail.map((d, i) => (
                    <li key={i} className="flex gap-2 font-body text-sm leading-relaxed text-muted">
                      <span aria-hidden className="mt-0.5 text-signal text-xs">▪</span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── 06 · Education ───────────────────────────────────────── */}
      <section className="mt-16" aria-labelledby="about-education">
        <SectionLabel number="06" label="education" />
        <div className="mt-5 flex flex-col gap-3">
          {education.map((edu) => (
            <div key={edu.id} className="flex flex-wrap items-baseline justify-between gap-x-3">
              <h3 className="font-display text-sm font-medium text-ink">
                {edu.title}
                {edu.org && <span className="text-muted"> · {edu.org}</span>}
              </h3>
              <span className="font-mono text-[11px] text-muted">
                {edu.start}{edu.end ? `–${edu.end}` : ""}
                {"note" in edu && edu.note ? ` · ${edu.note}` : ""}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 07 · Certifications ──────────────────────────────────────── */}
      <section className="mt-16" aria-labelledby="about-certifications">
        <SectionLabel number="07" label="certifications" />
        <ul className="mt-5 flex flex-col gap-2">
          {certifications.map((cert) => (
            <li key={cert.id} className="flex gap-2 font-body text-sm leading-relaxed text-muted">
              <span aria-hidden className="mt-1 text-signal font-mono text-xs">▪</span>
              <span>{cert.title}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
