# marehman.me — Portfolio

Personal portfolio built with Next.js, TypeScript, and Tailwind CSS.

## Stack

- **Framework** — Next.js 16 (App Router)
- **Language** — TypeScript
- **Styling** — Tailwind CSS v4
- **Fonts** — Space Grotesk, Instrument Sans, IBM Plex Mono
- **Deployment** — Vercel

## Routes

| Route | Page |
|---|---|
| `/` | Home — hero, profile switcher, journey map, projects |
| `/journey` | Career and project timeline |
| `/projects` | Full project catalogue |
| `/projects/[slug]` | Individual case study |
| `/about` | Background, skills, experience, education |
| `/cv` | CV with print / PDF support |

## Project structure

```
src/
  app/                  # Next.js App Router pages
    page.tsx            # Homepage
    journey/page.tsx
    projects/page.tsx
    projects/[slug]/page.tsx
    about/page.tsx
    cv/page.tsx
    globals.css         # Design tokens, base styles
    layout.tsx          # Root layout, fonts, metadata
  components/           # Shared UI components
  context/              # RoleContext (profile switcher state)
  data/                 # All content — projects, journey, skills, profile
    profile.ts
    projects.ts
    journey.ts
    skills.ts
```

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
```

## Content

All content lives in `src/data/`. To update projects, add an entry to `projects.ts`. To update the timeline, edit `journey.ts`. No CMS required.

## Deployment

Deployed on Vercel. Push to `main` triggers a production deploy automatically.
