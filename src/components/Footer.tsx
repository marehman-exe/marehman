import Link from "next/link";
import { profile } from "@/data/profile";
import { GitHubIcon, LinkedInIcon, EmailIcon } from "./Icons";

export function Footer() {
  const { name, title, location, links } = profile;

  return (
    <footer className="mt-24 border-t border-line print:hidden">
      <div className="mx-auto flex max-w-content flex-col gap-6 px-6 py-10 sm:flex-row sm:items-end sm:justify-between">
        {/* Left: identity */}
        <div>
          <p className="font-display text-lg text-ink">{name}</p>
          <p className="mt-1 font-mono text-xs text-muted">
            {title} · {location}
          </p>
          <p className="mt-1 font-mono text-xs text-muted">
            Python · AI Applications · RAG · LLMs · Backend Engineering
          </p>
        </div>

        {/* Right: links + nav */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-4">
            {links.github && (
              <a
                href={links.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="text-muted transition-colors hover:text-signal"
              >
                <GitHubIcon size={16} />
              </a>
            )}
            {links.linkedin && (
              <a
                href={links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="text-muted transition-colors hover:text-signal"
              >
                <LinkedInIcon size={16} />
              </a>
            )}
            {links.email && (
              <a
                href={`mailto:${links.email}`}
                aria-label="Email"
                className="text-muted transition-colors hover:text-signal"
              >
                <EmailIcon size={16} />
              </a>
            )}
          </div>
          <nav className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-muted">
            <Link href="/journey" className="hover:text-ink">Journey</Link>
            <Link href="/projects" className="hover:text-ink">Projects</Link>
            <Link href="/about" className="hover:text-ink">About</Link>
            <a href={`mailto:${links.email}`} className="hover:text-ink">Contact</a>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-content px-6 pb-8">
        <p className="font-mono text-[11px] text-muted">
          © {new Date().getFullYear()} {name}. Built static with Next.js · no analytics, no trackers.
        </p>
      </div>
    </footer>
  );
}
