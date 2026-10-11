export type JourneyKind = "role" | "project" | "education" | "milestone";
export type JourneyWeight = 1 | 2 | 3;
export type JourneyRole = "ai" | "backend" | "projects";

export interface JourneyNode {
  id: string;
  kind: JourneyKind;
  weight: JourneyWeight;
  start: string; // YYYY or YYYY-MM
  end?: string;
  title: string;
  org?: string;
  location?: string;
  summary: string;
  detail?: string[];
  stack?: string[];
  links?: { label: string; url: string }[];
  roles: JourneyRole[];
  draft?: boolean;
}

export const journey: JourneyNode[] = [
  {
    id: "lexbase-project",
    kind: "project",
    weight: 3,
    start: "2026-09",
    title: "LexBase — Multi-Tenant Legal RAG System",
    summary: "Production-grade multi-tenant RAG for law firms. Hybrid search (RRF), grounded AI summaries with citations, local embeddings (zero API cost), full RBAC across four roles.",
    stack: ["Python", "FastAPI", "PostgreSQL", "pgvector", "LangChain", "BAAI/bge-small-en-v1.5", "React", "TypeScript"],
    detail: [
      "HNSW vector index + GIN full-text index on PostgreSQL — hybrid RRF fusion for retrieval.",
      "Local embeddings via BAAI/bge-small-en-v1.5 — 384 dims, CPU-only, zero external API cost.",
      "JWT HS256 auth with revocable refresh tokens; RBAC enforced on every FastAPI endpoint.",
      "React 19 + TypeScript frontend with TanStack Query and silent JWT refresh.",
    ],
    roles: ["ai", "backend"],
    links: [{ label: "GitHub", url: "https://github.com/marehman-exe/Lexbase" }],
  },
  {
    id: "langchain-academy",
    kind: "milestone",
    weight: 3,
    start: "2026-10",
    title: "LangChain Academy — AI Agent Development",
    summary: "Completed a structured agent development course (LangChain Academy) — built three production-quality capstone projects covering ReAct agents, multi-agent systems, MCP integration, and production middleware patterns.",
    stack: ["Python", "LangChain", "LangGraph", "Groq", "Tavily", "MCP"],
    detail: [
      "Module 1: Built Personal Chef Agent — ReAct loop, tool use, InMemorySaver, custom state fields.",
      "Module 2: Built Wedding Planner Agent — multi-agent supervisor pattern, Kiwi MCP live flights, shared WeddingState.",
      "Module 3: Built Email Assistant Agent — dynamic tools, dynamic prompts, human-in-the-loop approval middleware.",
      "Additional: RAG from scratch with Ollama (local embeddings) and Groq — no OpenAI dependency.",
    ],
    roles: ["ai"],
  },
  {
    id: "ai-engineer",
    kind: "role",
    weight: 3,
    start: "2026-01",
    title: "Artificial Intelligence Engineer",
    location: "Faisalabad, Pakistan",
    summary: "Working part-time as an AI Engineer (remote) — building predictive ML models, automated data pipelines, end-to-end AI applications, and hardware-software integrations using Python and SQL.",
    stack: ["Python", "SQL", "Scikit-learn", "Pandas", "NumPy", "Raspberry Pi"],
    detail: [
      "Analyze complex datasets and build predictive ML models to drive actionable business insights.",
      "Design and maintain automated data processing pipelines covering EDA, cleaning, and feature engineering.",
      "Develop end-to-end AI applications, automation scripts, and hardware-software integrations.",
      "Create interactive reporting and data visualizations to communicate findings to stakeholders.",
    ],
    roles: ["ai", "backend"],
  },
  {
    id: "amtex",
    kind: "role",
    weight: 2,
    start: "2025-05",
    end: "2026-02", // Feb 2026 per PDF
    title: "E-commerce Brand Manager & Operations/Data Analyst",
    org: "Amtex Limited",
    location: "Faisalabad, Pakistan",
    summary: "Managed brand operations and analyzed sales performance across 8+ global marketplaces. Built weekly and monthly performance reports; monitored KPIs including sales, conversion rate, and advertising performance.",
    detail: [
      "Analyzed sales data across Amazon, Walmart, eBay, Etsy, TikTok Shop, Temu, and Alibaba.",
      "Prepared performance reports using Excel and data visualization for stakeholder decisions.",
      "Optimized product listings through keyword research and marketplace SEO.",
      "Planned and managed PPC and Meta Ads campaigns to maximize ROI.",
    ],
    roles: ["projects"],
  },
  {
    id: "ml-projects",
    kind: "milestone",
    weight: 2,
    start: "2026-09",
    end: "2026-09",
    title: "Machine Learning Project Series",
    summary: "Built and evaluated a series of supervised ML models as structured learning projects — churn prediction, classification, and tip prediction — each with production-realistic evaluation workflows.",
    stack: ["Python", "Scikit-learn", "XGBoost", "Pandas", "Matplotlib"],
    detail: [
      "Waze User Churn Prediction: Random Forest and XGBoost on ~15,000 records, recall-optimized for retention risk.",
      "TikTok Claim vs. Opinion Classifier: metadata-based classifier on ~19,400 video records.",
      "Automatidata Taxi Tip Prediction: leakage-aware binary target on ~22,700 NYC taxi records with GridSearchCV tuning.",
      "DeepMind Arabic Character-Level NLP: Unicode normalization, tokenization, n-gram generation, and transformer-ready sequence prep.",
    ],
    roles: ["ai", "projects"],
  },
  {
    id: "sightshield-project",
    kind: "project",
    weight: 3,
    start: "2026-08",
    title: "SightShield — Assistive Navigation Belt",
    summary: "Final year project. AI-powered wearable navigation belt for visually impaired users. Real-time object detection on Raspberry Pi combined with distance sensors and haptic/audio feedback.",
    stack: ["Python", "Raspberry Pi", "Object Detection", "OpenCV", "Hardware Sensors"],
    detail: [
      "On-device inference on Raspberry Pi — no cloud dependency for real-time latency requirements.",
      "Combined camera module, ultrasonic sensors, haptic motors, and audio output into a belt form factor.",
      "Designed the hardware-software integration layer synchronizing sensor readings with camera frames.",
    ],
    roles: ["ai", "projects"],
  },
  {
    id: "kenafstudio",
    kind: "role",
    weight: 1,
    start: "2024-08",
    end: "2025-12", // Aug 2024 – Dec 2025 per PDF
    title: "Graphic Designer & Digital Marketing Executive",
    org: "KENAFSTUDIO",
    location: "Faisalabad, Pakistan",
    summary: "Designed marketing assets and ran Meta Ads campaigns. Analyzed campaign performance metrics and supported data-driven marketing decisions.",
    detail: [
      "Designed social media and digital marketing assets using Adobe Photoshop.",
      "Planned, launched, and optimized Meta Ads campaigns; analyzed performance KPIs.",
      "Managed business social pages and collaborated with clients on brand strategy.",
    ],
    roles: ["projects"],
  },
  {
    id: "bscs",
    kind: "education",
    weight: 2,
    start: "2022-10",
    end: "2026-07", // Oct 2022 – Jul 2026 per PDF
    title: "Bachelor of Computer Science",
    org: "University of Education, Lahore (Faisalabad Campus)",
    location: "Faisalabad, Pakistan",
    summary: "Four-year Computer Science degree. Focus on algorithms, data structures, databases, and applied machine learning.",
    roles: ["ai", "backend", "projects"],
  },
  {
    id: "sellwised",
    kind: "role",
    weight: 1,
    start: "2023-04",
    end: "2023-10", // Apr 2023 – Oct 2023 per PDF
    title: "Amazon Account Manager & Sales/Marketing Intern",
    org: "SellWised",
    location: "Faisalabad, Pakistan",
    summary: "Day-to-day operations of Amazon seller accounts — listings, inventory, account maintenance, and SEO-driven keyword optimization. First exposure to data-driven performance reporting.",
    detail: [
      "Managed product listings, inventory updates, and seller account maintenance.",
      "Optimized listings through keyword research and marketplace SEO.",
      "Conducted competitor and marketplace research; prepared performance reports.",
    ],
    roles: ["projects"],
  },
  {
    id: "intermediate",
    kind: "education",
    weight: 1,
    start: "2020",
    end: "2022", // 2020 – 2022 per PDF
    title: "Intermediate, Computer Science",
    org: "Sandal College",
    location: "Faisalabad, Pakistan",
    summary: "Pre-university Computer Science track. Foundation in programming fundamentals, mathematics, and physics.",
    roles: ["ai", "backend", "projects"],
  },
  {
    id: "matric",
    kind: "education",
    weight: 1,
    start: "2018",
    end: "2020", // 2018 – 2020 per PDF
    title: "Matriculation",
    org: "Sheridan Cadet College",
    location: "Faisalabad, Pakistan",
    summary: "Secondary education at Sheridan Cadet College, Faisalabad.",
    roles: ["ai", "backend", "projects"],
  },
];
