import Link from "next/link";
import { flagshipProjects } from "@/data/projects";
import type { Project } from "@/data/projects";

function statusColor(status: Project["status"]) {
  if (status === "live") return "text-live";
  if (status === "in-progress") return "text-signal";
  return "text-muted";
}

function ProjectCard({ project, large = false }: { project: Project; large?: boolean }) {
  return (
    <Link href={`/projects/${project.slug}`} className="block h-full">
      <article className="flex h-full flex-col rounded-sm border border-line bg-panel/60 p-4 transition-colors hover:border-signal sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className={`font-display text-ink ${large ? "text-2xl" : "text-lg"}`}>
            {project.name}
          </h3>
        </div>

        <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.1em] text-muted">
          <span aria-hidden className={statusColor(project.status)}>●</span>{" "}
          {project.status} · {project.period}
        </p>

        <p className={`mt-3 font-body leading-relaxed text-muted ${large ? "text-base" : "text-sm"}`}>
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

        <p className="mt-4 font-mono text-xs text-signal">case study →</p>
      </article>
    </Link>
  );
}

export function FlagshipProjects() {
  const [first, ...rest] = flagshipProjects;

  return (
    <div className="mt-5">
      <div className="grid gap-3 sm:grid-cols-2">
        {/* First project: full-width emphasis */}
        {first && (
          <div className="sm:col-span-2">
            <ProjectCard project={first} large />
          </div>
        )}
        {/* Remaining: half-width */}
        {rest.map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}
      </div>
    </div>
  );
}
