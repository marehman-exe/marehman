import { MetadataRoute } from "next";
import { projects } from "@/data/projects";

const baseUrl = "https://marehman.me";

export default function sitemap(): MetadataRoute.Sitemap {
  const caseStudySlugs = projects
    .filter((p) => !!p.caseStudy)
    .map((p) => ({
      url: `${baseUrl}/projects/${p.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

  return [
    { url: baseUrl,                   lastModified: new Date(), changeFrequency: "monthly", priority: 1.0 },
    { url: `${baseUrl}/journey`,      lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/projects`,     lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/about`,        lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/cv`,           lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    ...caseStudySlugs,
  ];
}
