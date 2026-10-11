import type { Metadata } from "next";
import { profile, ROLES, DEFAULT_ROLE, type RoleKey } from "@/data/profile";
import { skillGroups, experience, education } from "@/data/skills";
import { projects } from "@/data/projects";
import { CvClient } from "./CvClient";

export const metadata: Metadata = {
  title: "CV",
  description: `Curriculum vitae of ${profile.name} — ${profile.title}.`,
};

export default function CvPage() {
  return <CvClient />;
}
