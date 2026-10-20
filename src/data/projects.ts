export type ProjectStatus = "live" | "in-progress" | "archived" | "experiment";
export type ProjectRole = "ai" | "backend" | "projects";

export interface Project {
  id: string;
  slug: string;
  name: string;
  status: ProjectStatus;
  period: string;
  start: string;
  end?: string;
  oneLiner: string;
  description: string;
  weight: 1 | 2 | 3; // 3 = flagship
  roles: ProjectRole[];
  stack: string[];
  githubUrl?: string;
  demoUrl?: string;
  caseStudy?: CaseStudy;
}

export interface CaseStudy {
  problem: string;
  context: string;
  system: string;
  architecture: string[];
  decisions: { title: string; body: string }[];
  challenges: string[];
  results: string[];
  lessons: string[];
}

export const projects: Project[] = [
  // ── Flagship ─────────────────────────────────────────────────────────────
  {
    id: "lexbase",
    slug: "lexbase-legal-rag",
    name: "LexBase",
    status: "in-progress",
    period: "Sep 2026 → present",
    start: "2026-09",
    oneLiner: "Multi-tenant RAG for law firms — hybrid search, grounded answers, local embeddings, RBAC.",
    description:
      "Multi-tenant RAG system for law firms. Each firm's documents are isolated by tenant. Hybrid search (vector + BM25 via RRF). Answers include numbered source citations. Embeddings run locally using BAAI/bge-small-en-v1.5 — no external API cost. Four roles: Super Admin, Lawyer, Associate, Paralegal.",
    weight: 3,
    roles: ["ai", "backend"],
    stack: ["Python", "FastAPI", "PostgreSQL", "pgvector", "LangChain", "BAAI/bge-small-en-v1.5", "React", "TypeScript"],
    githubUrl: "https://github.com/marehman-exe/Lexbase",
    caseStudy: {
      problem:
        "Law firms have years of case documents and contracts that are hard to search semantically. Keyword search misses intent. Generic LLMs make up jurisdiction-specific details.",
      context:
        "Personal project. Each firm needs its own isolated document space. Answers need citations. No OpenAI embedding dependency.",
      system:
        "FastAPI backend. PDFs chunked with tiktoken (400 tokens, 60 overlap), embedded locally with BAAI/bge-small-en-v1.5, stored in PostgreSQL via pgvector. Hybrid search fuses vector cosine and BM25 via RRF. LLM responses include numbered citations — user text never goes into the system prompt.",
      architecture: [
        "firm_id from JWT enforced on every query — no cross-tenant retrieval possible",
        "HNSW vector index + GIN full-text index on the same PostgreSQL instance",
        "RRF fusion over dense cosine and sparse BM25 candidate sets",
        "Local embeddings via BAAI/bge-small-en-v1.5, 384 dims, CPU-only",
        "Pluggable LLM: Groq / OpenRouter / Ollama, switchable from the UI",
        "JWT HS256, 15-min access tokens, 7-day refresh tokens (SHA-256 hashed, revocable)",
        "RBAC via FastAPI dependency on every protected endpoint",
        "React 19 + TypeScript frontend, TanStack Query, silent refresh queue",
      ],
      decisions: [
        {
          title: "Local embeddings",
          body: "BAAI/bge-small-en-v1.5 runs on CPU. Removes the OpenAI embedding API dependency and its per-document cost. 384 dims is enough for this chunk size.",
        },
        {
          title: "Hybrid search over pure vector",
          body: "Legal queries contain exact terms — statute numbers, case names, defined clauses. Pure vector search misses these. BM25 catches exact matches; vector handles semantic queries. RRF fusion outperforms either alone on the test set.",
        },
        {
          title: "Citations required",
          body: "Legal answers need to be traceable. Every response includes numbered source references. If retrieval finds nothing relevant, the system says so rather than generating an answer from model weights.",
        },
        {
          title: "Backend enforces security, not the frontend",
          body: "Frontend role guards are for UX. Every endpoint has a FastAPI require_role dependency. firm_id and role are re-validated from the JWT on every request.",
        },
      ],
      challenges: [
        "Legal documents have nested clause structures — fixed-length splitting loses context. Recursive splitting with overlap works better.",
        "Testing tenant isolation — verifying no cross-tenant documents appear under any retrieval path.",
        "Silent JWT refresh — multiple concurrent 401s need to queue behind a single refresh, not each trigger one.",
      ],
      results: [
        "Tenant isolation verified across multiple firms with separate corpora — firm_id enforced at the query layer, no cross-tenant results observed.",
        "Hybrid search (vector + BM25 via RRF) returns relevant results for exact-term and semantic queries.",
        "Zero external embedding API cost — BAAI/bge-small-en-v1.5 runs locally, CPU-only.",
        "JWT auth with revocable refresh tokens and RBAC enforced on every endpoint — security enforced server-side, not by the frontend.",
        "In active development — retrieval pipeline and auth complete; frontend role-switching in progress.",
      ],
      lessons: [
        "Build the isolation model before adding retrieval. Retrofitting it is harder.",
        "Chunking strategy matters more than model choice for retrieval quality.",
        "Local embeddings are viable for this scale. The savings are real.",
      ],
    },
  },
  {
    id: "sightshield",
    slug: "sightshield-navigation-belt",
    name: "SightShield",
    status: "in-progress",
    period: "Aug 2026 → present",
    start: "2026-08",
    oneLiner: "Wearable navigation belt for visually impaired users — object detection on Raspberry Pi, no cloud dependency.",
    description:
      "Final year project. A belt-form wearable that runs object detection on Raspberry Pi and gives directional feedback via haptic motors and audio. Camera module, ultrasonic sensors, and an on-device detection model — no internet required.",
    weight: 3,
    roles: ["ai", "projects"],
    stack: ["Python", "Raspberry Pi", "OpenCV", "Object Detection", "Hardware Sensors"],
    githubUrl: "https://github.com/marehman-exe/SightShield",
    caseStudy: {
      problem:
        "Canes and GPS don't solve real-time obstacle detection in unfamiliar environments. The device needs to work offline — no connectivity assumption for a wearable.",
      context:
        "Final year university project. Full ownership of hardware and software. Constraint: inference must run on-device on Raspberry Pi.",
      system:
        "Raspberry Pi running Python. Camera feeds frames into the detection pipeline. Ultrasonic sensors give range data. A decision layer combines both into haptic (direction) and audio (object type) cues.",
      architecture: [
        "Raspberry Pi 4 — inference runs locally, no network required",
        "Camera + OpenCV for frame capture and preprocessing",
        "Lightweight detection model for edge deployment",
        "Ultrasonic sensors for close-range ranging",
        "Haptic motors + audio output for user feedback",
      ],
      decisions: [
        {
          title: "On-device inference",
          body: "Cloud inference adds latency and a connectivity dependency. Neither is acceptable for a real-time navigation aid. Edge deployment on Raspberry Pi keeps response time within a usable range.",
        },
        {
          title: "Haptic + audio combined",
          body: "Audio-only feedback competes with the user's environmental awareness. Haptic cues handle direction; audio handles object identification. Two separate channels.",
        },
      ],
      challenges: [
        "Detection frame rate on Raspberry Pi's constrained compute.",
        "False positives that would give misleading feedback.",
        "Synchronising ultrasonic sensor readings with camera frames.",
      ],
      results: [
        "Working prototype with on-device detection and haptic feedback.",
        "In active development as final year submission.",
      ],
      lessons: [
        "Edge inference constraints are different from server inference. Model size and latency come first.",
        "Hardware integration has failure modes pure software projects don't. Sensor timing matters.",
      ],
    },
  },
  {
    id: "personal-chef-agent",
    slug: "personal-chef-agent",
    name: "Personal Chef Agent",
    status: "live",
    period: "Oct 2026",
    start: "2026-10",
    end: "2026-10",
    oneLiner: "Conversational cooking agent — searches the web for recipes from your leftovers and remembers the full conversation.",
    description:
      "LangGraph agent built with LangChain, Groq, and Tavily. You describe what's in your fridge; it searches the web for matching recipes and holds a multi-turn conversation. Custom state fields keep ingredient memory separate from message history so the agent doesn't confuse your ingredients with recipe suggestions.",
    weight: 3,
    roles: ["ai"],
    stack: ["Python", "LangChain", "LangGraph", "Groq", "Tavily"],
    githubUrl: "https://github.com/marehman-exe/personal-chef-agent",
    caseStudy: {
      problem:
        "A conversational agent that searches the web for recipes, holds multi-turn memory, and correctly distinguishes user-stated ingredients from recipe-suggested ones.",
      context:
        "Capstone for LangChain Academy Module 1. Goal: implement ReAct, tool use, multi-turn memory, and custom state in one working project.",
      system:
        "create_agent() with Groq LLM and three tools: web_search (Tavily), remember_ingredients, recall_ingredients. InMemorySaver checkpoints state after every turn by thread_id. ChefState extends AgentState with a user_ingredients field — written via Command.update, read via ToolRuntime.",
      architecture: [
        "ReAct loop: Reason → Act (tool call) → Observe (ToolMessage) → Respond",
        "InMemorySaver — state snapshot after every turn, keyed by thread_id",
        "ChefState — custom field user_ingredients, separate from message history",
        "Command(update={}) in remember_ingredients — writes to state from inside a tool",
        "ToolRuntime in recall_ingredients — reads state directly, not from message text",
      ],
      decisions: [
        {
          title: "Dedicated state field for ingredients",
          body: "Without it, the model sometimes includes recipe-suggested ingredients in its answer when asked what the user has. The dedicated field is written once when the user states ingredients and read directly — it never picks up suggestions from the conversation.",
        },
        {
          title: "Tavily for recipe search",
          body: "Model knowledge cuts off. Tavily returns current web results. The agent calls it automatically from the tool docstring description alone.",
        },
      ],
      challenges: [
        "Ingredient confusion — solved by the dedicated state field.",
        "Understanding the empty AIMessage content with tool_calls — the ReAct decision step.",
      ],
      results: [
        "Agent correctly recalls user-stated ingredients across 3+ turns.",
        "CLI chat loop and Jupyter notebook both working with documented outputs.",
      ],
      lessons: [
        "The tool docstring is the model's only instruction for when to call it. Write it precisely.",
        "Custom state fields solve problems that message history alone can't.",
      ],
    },
  },
  // ── Weight 2 ─────────────────────────────────────────────────────────────
  {
    id: "wedding-planner-agent",
    slug: "wedding-planner-agent",
    name: "Wedding Planner Agent",
    status: "live",
    period: "Oct 2026",
    start: "2026-10",
    end: "2026-10",
    oneLiner: "Multi-agent planner — live flights via Kiwi MCP, venues via Tavily, playlist from SQL — coordinated by one supervisor.",
    description:
      "LangGraph multi-agent system. A coordinator agent delegates to three sub-agents: Travel (Kiwi MCP for live flights), Venue (Tavily web search), Playlist (SQL on Chinook DB). Sub-agents read shared state written by the coordinator via Command.update.",
    weight: 2,
    roles: ["ai"],
    stack: ["Python", "LangChain", "LangGraph", "Groq", "Tavily", "MCP", "SQLite"],
    githubUrl: "https://github.com/marehman-exe/wedding-planner-agent",
  },
  {
    id: "email-assistant-agent",
    slug: "email-assistant-agent",
    name: "Email Assistant Agent",
    status: "live",
    period: "Oct 2026",
    start: "2026-10",
    end: "2026-10",
    oneLiner: "AI email agent with dynamic tools, dynamic prompts, and human-in-the-loop approval before any email sends.",
    description:
      "LangGraph email agent demonstrating three middleware patterns: dynamic tools (tool list changes based on auth state), dynamic prompts (system prompt updates at runtime), and HITL approval (agent pauses before sending, user approves, rejects with feedback, or rewrites). LangChain Academy Module 3.",
    weight: 2,
    roles: ["ai"],
    stack: ["Python", "LangChain", "LangGraph", "Groq", "HITL"],
    githubUrl: "https://github.com/marehman-exe/email-assistant-agent",
  },
  {
    id: "waze-churn",
    slug: "waze-churn-prediction",
    name: "Waze Churn Prediction",
    status: "experiment",
    period: "Sep 2026",
    start: "2026-09",
    end: "2026-09",
    oneLiner: "Random Forest and XGBoost churn models on ~15,000 records, optimised for recall.",
    description:
      "Classification models to predict user churn on a Waze dataset (~15,000 records). Framed as a retention problem — recall matters more than precision here. Random Forest and XGBoost compared on identical preprocessing with GridSearchCV tuning.",
    weight: 2,
    roles: ["ai", "projects"],
    stack: ["Python", "Scikit-learn", "XGBoost", "Pandas", "Matplotlib"],
    githubUrl: "https://github.com/marehman-exe/Waze---User-Churn-Prediction",
    caseStudy: {
      problem:
        "Predict which users are likely to stop using Waze so retention efforts can be targeted before they leave.",
      context:
        "~15,000 user activity records. Goal: a realistic evaluation workflow, not just a high accuracy number.",
      system:
        "Python pipeline: clean → engineer features → stratified split → train → tune threshold → evaluate. Both models run through identical preprocessing.",
      architecture: [
        "EDA and data cleaning with Pandas",
        "Feature engineering from raw usage fields",
        "Stratified train/val/test split to preserve class balance",
        "GridSearchCV hyperparameter tuning on both models",
        "Threshold tuning to maximise recall for the churn class",
      ],
      decisions: [
        {
          title: "Recall over accuracy",
          body: "Missing a churner (false negative) costs more than a false alarm (false positive). The threshold is set to catch more churners even at the cost of some false positives.",
        },
        {
          title: "Identical pipelines for both models",
          body: "Running both models through the same preprocessing makes the comparison meaningful. Any difference in results reflects the model, not the data handling.",
        },
      ],
      challenges: [
        "Class imbalance — stratified splits prevent misleading accuracy.",
        "Threshold selection — there is no single right answer, it depends on the retention budget.",
        "Feature leakage risk — some fields needed to be excluded.",
      ],
      results: [
        "XGBoost outperformed Random Forest on recall after threshold tuning.",
        "Top features: days since last activity, session frequency, engagement ratio.",
      ],
      lessons: [
        "Metric choice is a business decision, not a technical one.",
        "Check every derived feature for leakage before trusting the results.",
      ],
    },
  },
  // ── Weight 1 ─────────────────────────────────────────────────────────────
  {
    id: "langchain-rag",
    slug: "langchain-rag-from-scratch",
    name: "LangChain RAG from Scratch",
    status: "experiment",
    period: "Oct 2026",
    start: "2026-10",
    oneLiner: "RAG pipeline with Ollama (local embeddings) and Groq — no OpenAI required.",
    description:
      "Complete RAG pipeline built from scratch: indexing, retrieval, generation. Ollama for local embeddings, Groq for the LLM. No OpenAI or LangSmith dependency. Documented step by step in notebooks.",
    weight: 1,
    roles: ["ai"],
    stack: ["Python", "LangChain", "Ollama", "Groq"],
    githubUrl: "https://github.com/marehman-exe/LangChain",
  },
  {
    id: "ptcg-engine",
    slug: "ptcg-deck-intelligence",
    name: "PTCG Deck Intelligence Engine",
    status: "experiment",
    period: "Aug 2026",
    start: "2026-08",
    oneLiner: "AI deck analysis and strategy engine for Pokémon TCG.",
    description:
      "AI-powered deck analysis tool for Pokémon Trading Card Game. Analyses deck composition and suggests strategy adjustments.",
    weight: 1,
    roles: ["ai", "projects"],
    stack: ["Python", "Jupyter Notebook"],
    githubUrl: "https://github.com/marehman-exe/PTCG-AI-Deck-Intelligence-Strategy-Engine",
  },
  {
    id: "tiktok-classifier",
    slug: "tiktok-claim-classifier",
    name: "TikTok Claim Classifier",
    status: "experiment",
    period: "Sep 2026",
    start: "2026-09",
    end: "2026-09",
    oneLiner: "Classifier on ~19,400 TikTok video records to separate factual claims from opinions.",
    description:
      "Metadata-based classifier on ~19,400 TikTok video records. Distinguishes factual claims from opinion content. Framed as a review-prioritisation tool — surfaces likely-claim videos for human review rather than auto-moderating.",
    weight: 1,
    roles: ["ai", "projects"],
    stack: ["Python", "Scikit-learn", "Pandas", "NumPy"],
    githubUrl: "https://github.com/marehman-exe/Tiktok---Claim-and-Opinion-Classification",
  },
  {
    id: "taxi-tip",
    slug: "automatidata-taxi-tip",
    name: "Taxi Tip Prediction",
    status: "experiment",
    period: "Sep 2026",
    start: "2026-09",
    end: "2026-09",
    oneLiner: "Leakage-aware binary tip predictor on ~22,700 NYC taxi trips.",
    description:
      "Binary classification model predicting whether a NYC taxi trip will receive a generous tip (≥20%). Feature selection excludes any field that encodes the tip amount. Tuned with GridSearchCV.",
    weight: 1,
    roles: ["ai", "projects"],
    stack: ["Python", "Scikit-learn", "XGBoost", "Pandas"],
    githubUrl: "https://github.com/marehman-exe/Automatidata---Generous-Tip-Prediction",
  },
  {
    id: "arabic-nlp",
    slug: "arabic-character-nlp",
    name: "Arabic Character-Level NLP",
    status: "experiment",
    period: "Sep 2026",
    start: "2026-09",
    end: "2026-09",
    oneLiner: "Character-level NLP pipeline for Arabic — tokenisation, n-grams, transformer-ready sequences.",
    description:
      "Character-level NLP pipeline for Arabic text: Unicode normalisation, character tokenisation, n-gram generation, and sequence preparation for transformer input. Built for the Google DeepMind challenge lab.",
    weight: 1,
    roles: ["ai", "projects"],
    stack: ["Python", "NLP", "Unicode", "Transformers"],
    githubUrl: "https://github.com/marehman-exe/Google-DeepMind---Train-A-Small-Language-Model",
  },
];

export const flagshipProjects = projects.filter((p) => p.weight === 3);
export const secondaryProjects = projects.filter((p) => p.weight < 3);
