import type { Metadata } from "next";
import { profile } from "@/data/profile";
import { journey } from "@/data/journey";
import { JourneyMap } from "@/components/JourneyMap";

export const metadata: Metadata = {
  title: "Journey",
  description: `Career timeline and engineering evolution of ${profile.name}. From first code to technical leadership.`,
};

export default function JourneyPage() {
  return (
    <main className="mx-auto max-w-content px-6 py-12">
      {/* Page header */}
      <div className="mb-10">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">02 · journey</p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          The system map.
        </h1>
        <p className="mt-3 max-w-2xl font-body text-base leading-relaxed text-muted">
          A chronological record of roles, projects, and engineering evolution — from first paid code
          to technical leadership. Expand any node to see detail.
        </p>
      </div>

      <JourneyMap nodes={journey} />
    </main>
  );
}
