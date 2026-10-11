export const profile = {
  name: "Muhammad Abdur Rehman",
  initials: "MAR",
  title: "AI Engineer",
  titlesByRole: {
    ai: "AI Engineer",
    backend: "Python Developer",
    projects: "Projects",
  },
  location: "Faisalabad, Pakistan",
  since: 2023,
  links: {
    github: "https://github.com/marehman-exe",
    linkedin: "https://linkedin.com/in/marehmandev",
    email: "abdurrehmanm778@gmail.com",
  },
  summaryByRole: {
    ai: "I build RAG systems and LLM applications in Python. Currently working as an AI Engineer while completing a CS degree.",
    backend: "Python developer comfortable with FastAPI, SQL, and data pipelines. I learn by building and testing real projects.",
    projects: "ML models, RAG systems, and AI agents — built as real projects, not tutorials. Each one is on GitHub.",
  },
  tagline: "I build AI applications that turn data into useful answers.",
  bio: [
    "I'm a final-year Computer Science student working full-time as an AI Engineer in Faisalabad. My work involves building predictive ML models, data pipelines, and AI applications using Python.",
    "Most of my recent projects are in RAG and LLM applications. LexBase is the main one — a multi-tenant RAG system for law firms with hybrid search and local embeddings. SightShield is my final year project: an assistive navigation belt for visually impaired users running on Raspberry Pi.",
    "I also completed LangChain Academy, where I built three agent projects: a conversational chef agent, a multi-agent wedding planner using MCP, and a production email agent with human-in-the-loop approval.",
    "Before AI engineering I worked in e-commerce operations and digital marketing, which is where I first got serious about data analysis and reporting.",
  ],
  philosophy: [
    "Build something before claiming you understand it.",
    "Measure retrieval quality before worrying about the LLM.",
    "Know why a step fails, not just that it does.",
    "Write down the decisions you made and why.",
  ],
  availability: "Currently working as an AI Engineer. Open to AI and Python development roles.",
  startedProfessionally: "Apr 2023",
} as const;

export type RoleKey = keyof typeof profile.titlesByRole;
export const ROLES: RoleKey[] = ["ai", "backend", "projects"];
export const DEFAULT_ROLE: RoleKey = "ai";
