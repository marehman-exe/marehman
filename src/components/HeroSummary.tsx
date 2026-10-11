"use client";

import { useRole } from "@/context/RoleContext";
import { profile } from "@/data/profile";

export function HeroSummary() {
  const { role } = useRole();
  return (
    <p className="mt-5 max-w-2xl font-body text-lg leading-relaxed text-muted">
      {profile.summaryByRole[role]}
    </p>
  );
}
