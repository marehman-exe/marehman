export interface SkillGroup {
  id: string;
  label: string;
  roles: string[];
  skills: { name: string; note?: string }[];
}

export const skillGroups: SkillGroup[] = [
  {
    id: "agents",
    label: "AI Agents & Orchestration",
    roles: ["ai"],
    skills: [
      { name: "LangChain" },
      { name: "LangGraph" },
      { name: "ReAct pattern" },
      { name: "Multi-agent systems" },
      { name: "Tool calling" },
      { name: "Human-in-the-loop" },
      { name: "MCP (Model Context Protocol)" },
      { name: "InMemorySaver / checkpointing" },
    ],
  },
  {
    id: "ai-rag",
    label: "RAG & Retrieval",
    roles: ["ai"],
    skills: [
      { name: "RAG pipelines" },
      { name: "LLM applications" },
      { name: "Claude API" },
      { name: "Groq" },
      { name: "Prompt engineering" },
      { name: "pgvector" },
      { name: "Hybrid search (RRF)" },
      { name: "Document chunking" },
      { name: "Local embeddings (BAAI/bge)" },
    ],
  },
  {
    id: "ml",
    label: "Machine Learning",
    roles: ["ai", "projects"],
    skills: [
      { name: "Scikit-learn" },
      { name: "XGBoost" },
      { name: "Random Forest" },
      { name: "Classification & prediction" },
      { name: "Cross-validation" },
      { name: "GridSearchCV" },
      { name: "Model evaluation (precision/recall/F1)" },
      { name: "TensorFlow / Keras", note: "exposure" },
    ],
  },
  {
    id: "python-data",
    label: "Python & Data",
    roles: ["ai", "backend"],
    skills: [
      { name: "Python" },
      { name: "SQL" },
      { name: "Pandas" },
      { name: "NumPy" },
      { name: "Matplotlib" },
      { name: "Seaborn" },
      { name: "FastAPI" },
      { name: "Feature engineering" },
      { name: "EDA" },
    ],
  },
  {
    id: "nlp",
    label: "NLP",
    roles: ["ai"],
    skills: [
      { name: "Character-level language modeling" },
      { name: "Unicode normalization" },
      { name: "Tokenization" },
      { name: "n-gram generation" },
      { name: "Transformer-ready sequence prep" },
    ],
  },
  {
    id: "databases",
    label: "Data & Storage",
    roles: ["ai", "backend"],
    skills: [
      { name: "PostgreSQL" },
      { name: "pgvector" },
      { name: "Supabase" },
      { name: "SQL" },
      { name: "Docker" },
      { name: "Power BI" },
      { name: "Excel" },
    ],
  },
  {
    id: "hardware",
    label: "Hardware & Integration",
    roles: ["projects"],
    skills: [
      { name: "Raspberry Pi" },
      { name: "Hardware-software integration" },
      { name: "OpenCV" },
      { name: "Edge inference" },
      { name: "Sensor integration" },
    ],
  },
  {
    id: "workflow",
    label: "Engineering Workflow",
    roles: ["ai", "backend", "projects"],
    skills: [
      { name: "Git / GitHub" },
      { name: "VS Code" },
      { name: "Jupyter Notebook" },
      { name: "Data visualization" },
      { name: "KPI reporting" },
    ],
  },
];

export const experience = [
  {
    id: "ai-engineer",
    kind: "role" as const,
    title: "Artificial Intelligence Engineer (Full-time, Remote)",
    org: undefined as string | undefined,
    start: "2026-01",
    summary:
      "Building RAG and LLM applications, predictive ML models, automated data pipelines, and hardware-software integrations using Python, SQL, and vector databases.",
    detail: [
      "Build RAG and LLM applications in Python using vector databases (Docker, Supabase) with techniques to reduce hallucinations.",
      "Develop predictive machine learning models with Python, SQL, and Scikit-learn to turn complex datasets into business insights.",
      "Design automated data pipelines covering EDA, cleaning, and feature engineering; present findings through clear visualizations and reports.",
      "Deliver end-to-end AI applications and automation scripts, including Raspberry Pi hardware-software integrations, using version-controlled code.",
    ],
  },
  {
    id: "amtex",
    kind: "role" as const,
    title: "E-commerce Brand Manager & Operations/Data Analyst",
    org: "Amtex Limited",
    start: "2025-05",
    end: "2026-02",
    summary:
      "Managed brand operations and analyzed sales performance across 8+ global marketplaces. Built weekly and monthly KPI reports using Excel and data visualization.",
    detail: [
      "Analyzed sales data across Amazon, Walmart, eBay, Etsy, TikTok Shop, Temu, and Alibaba.",
      "Prepared performance reports and monitored KPIs including sales, conversion rate, and ad performance.",
      "Optimized product listings through keyword research and marketplace SEO.",
    ],
  },
  {
    id: "kenafstudio",
    kind: "role" as const,
    title: "Graphic Designer & Digital Marketing Executive",
    org: "KENAFSTUDIO",
    start: "2024-08",
    end: "2025-12",
    summary:
      "Designed marketing assets and ran Meta Ads campaigns. Analyzed campaign performance metrics and supported data-driven marketing decisions.",
  },
  {
    id: "sellwised",
    kind: "role" as const,
    title: "Amazon Account Manager & Sales/Marketing Intern",
    org: "SellWised",
    start: "2023-04",
    end: "2023-10",
    summary:
      "Managed Amazon seller accounts — product listings, inventory, and account maintenance. Conducted competitor research and prepared performance reports.",
  },
];

export const education = [
  {
    id: "bscs",
    title: "Bachelor of Computer Science",
    org: "University of Education, Lahore (Faisalabad Campus)",
    start: "2022",
    end: "2026",
    note: "Graduated",
  },
  {
    id: "intermediate",
    title: "Intermediate, Computer Science",
    org: "Sandal College",
    start: "2020",
    end: "2022",
  },
  {
    id: "matric",
    title: "Matriculation",
    org: "Sheridan Cadet College",
    start: "2018",
    end: "2020",
  },
];

export const certifications = [
  { id: "intro-langchain", title: "Introduction to LangChain by LangChain" },
  { id: "nuts-bolts-ml", title: "The Nuts and Bolts of Machine Learning" },
  { id: "azure-ml-pipelines", title: "Machine Learning Pipelines with Azure ML Studio" },
  { id: "python-analytics", title: "Python Data Analytics" },
  { id: "intro-llm", title: "Introduction to Large Language Models" },
  { id: "claude-api", title: "Building with the Claude API" },
];
