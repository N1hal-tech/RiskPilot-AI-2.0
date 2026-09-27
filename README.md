# RiskPilot AI

**Loan risk assessment platform that uses a trained RL agent — not a static rules engine — to make lending decisions.**

Built as a full-stack system: React frontend → Spring Boot API → Q-Learning microservice (Python/FastAPI), all backed by MongoDB Atlas with vector search for a RAG-powered financial assistant.

> **TL;DR** — A borrower fills out a loan application. An RL agent evaluates it in real-time, computes a default probability, picks an interest rate tier, and decides whether to approve, reject, or escalate. Low-confidence decisions get flagged for human review. Loan officers and admins see everything through role-specific dashboards.

---

## What It Actually Does

### For Borrowers
- Apply for loans — the RL agent evaluates and responds in seconds
- **"What-If" simulator** — tweak income, debt, loan amount and see how risk changes before committing
- **AI financial assistant** — ask questions about lending, credit, interest rates (RAG pipeline backed by Atlas Vector Search + Gemini)
- Track application status, get notifications on decisions

### For Loan Officers
- Review queue for applications flagged by the RL agent as low-confidence
- Add internal comments and notes on applications
- Approve/reject with full audit trail

### For Admins
- Portfolio analytics dashboard — default rates, approval rates, risk exposure, average interest rates
- Full audit log of every action in the system
- User management across all roles

---

## Architecture

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  React SPA   │────▶│  Spring Boot API  │────▶│  FastAPI (Python) │
│  :3000       │     │  :8080            │     │  :8000            │
│              │     │                   │     │                   │
│ Google OAuth │     │ Spring Security   │     │ Q-Learning Agent  │
│ Light/Dark   │     │ MongoDB Repos     │     │ Trained RL Model  │
│ Role-based   │     │ Gemini API Client │     │ Risk Environment  │
│ dashboards   │     │ Audit Service     │     │ State Discretizer │
└──────────────┘     └────────┬──────────┘     └───────────────────┘
                              │
                    ┌─────────▼──────────┐
                    │   MongoDB Atlas     │
                    │                     │
                    │ • 10 collections    │
                    │ • Compound indexes  │
                    │ • Vector Search     │
                    │   (768-dim Gemini   │
                    │    embeddings)      │
                    └─────────────────────┘
```

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, CSS3 design tokens (light/dark), Google OAuth 2.0 |
| Backend | Java 17, Spring Boot 3.2, Spring Data MongoDB, Spring Security |
| ML Service | Python 3.11, FastAPI, NumPy (tabular Q-learning agent) |
| Database | MongoDB Atlas — document store + vector search engine |
| AI/LLM | Google Gemini (`gemini-2.5-flash` for generation, `gemini-embedding-001` for 768-dim vectors) |
| Infra | Docker Compose (3 containers, health checks, dependency ordering) |

---

## The RL Agent — How It Works

Not a classifier. Not a scoring model. It's a **Q-learning agent** trained via reinforcement learning on a simulated lending environment.

**State space:** Applicant features (income, loan amount, debt, employment years) get discretized into buckets and combined into a state tuple. The agent looks up Q-values for that state.

**Action space (5 actions):**

| Action | What happens |
|--------|-------------|
| `REJECT` | Application denied |
| `APPROVE_STANDARD` | Approved at 8% interest |
| `APPROVE_MODERATE` | Approved at 12% interest |
| `APPROVE_HIGH` | Approved at 16% interest |
| `MANUAL_REVIEW` | Flagged for human officer review |

**Reward function:** Balances interest income against default risk penalties. The agent learns to price risk — not just accept/reject.

**Confidence gating:** When Q-values are too close together (the agent is uncertain), the application gets auto-flagged as `needsAdminReview = true` for a human to decide.

---

## RAG Pipeline (AI Financial Assistant)

Users can ask financial questions. Instead of hallucinating, the assistant retrieves relevant context first:

```
User question
    → Gemini Embedding API (768-dim vector)
    → MongoDB Atlas $vectorSearch on 'knowledge' collection
    → Top 3 matches returned as context
    → Gemini LLM generates answer grounded in retrieved docs
    → Response + conversation history persisted to MongoDB
```

The knowledge base is auto-seeded on first boot with financial education content, each entry embedded as a 768-dimensional vector.

---

## MongoDB — What's Actually Used

MongoDB isn't just "the database" here. Specific features that matter:

- **Embedded sub-documents** — `FinancialProfile` and `RiskResultDoc` are nested inside parent documents. One read = complete risk assessment. No JOINs.
- **Aggregation pipelines** — Portfolio analytics (default rates, approval rates, avg interest) computed server-side in MongoDB's engine, not in Java.
- **Atlas Vector Search** — `$vectorSearch` stage with cosine similarity over 768-dim embeddings for the RAG assistant.
- **Compound indexes** on 6 collections — `{userId: 1, createdAt: -1}` pattern for instant user-scoped history queries.
- **Unique indexes** — enforced at DB level on `User.email` and `LoanApplication.applicationRef`.
- **Dynamic seeding** — `DataInitializer` checks collection state on boot, seeds admin roles and vector-embedded knowledge base entries.

10 collections total: `users`, `loan_applications`, `assessments`, `simulations`, `chat_messages`, `audit_logs`, `loan_comments`, `loan_documents`, `notifications`, `knowledge`.

---

## Project Structure

```
├── backend/                  # Spring Boot API
│   └── src/main/java/com/loanguard/
│       ├── config/           # Security, CORS, data initialization
│       ├── controller/       # 7 REST controllers
│       ├── dto/              # Request/response objects
│       ├── model/            # MongoDB document classes (10 collections)
│       ├── repository/       # Spring Data MongoDB repos
│       ├── service/          # 15 service classes (analytics, chat, RL client, audit...)
│       └── security/         # JWT + OAuth filters
├── frontend/                 # React 18 SPA
│   └── src/
│       ├── pages/            # 18 page components (role-specific dashboards)
│       ├── components/       # Shared UI (chatbot, navbar, forms, auth)
│       ├── context/          # Auth + Theme context providers
│       └── services/         # Axios API client
├── ml-service/               # FastAPI + RL agent
│   ├── rl_agent.py           # Q-learning implementation
│   ├── environment.py        # Loan risk environment simulator
│   ├── train_agent.py        # Training script
│   └── main.py               # FastAPI endpoints
└── docker-compose.yml        # Orchestrates all 3 services
```

---

## Running It

### Prerequisites
- Docker & Docker Compose
- MongoDB Atlas cluster (free tier works)
- Google Gemini API key ([Google AI Studio](https://aistudio.google.com))

### Setup

```bash
# 1. Create .env in project root
cat > .env << EOF
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/riskpilot?retryWrites=true&w=majority
GEMINI_API_KEY=your_key_here
REACT_APP_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
REACT_APP_API_BASE=http://localhost:8080/api
EOF

# 2. Build and run
docker-compose up --build -d

# 3. Check logs
docker-compose logs -f backend
```

**Services:**
- Frontend → `http://localhost:3000`
- Backend API → `http://localhost:8080/api`
- ML Service → `http://localhost:8000`

---

## Key API Routes

| Method | Route | What it does |
|--------|-------|-------------|
| `POST` | `/api/auth/social` | Google OAuth authentication |
| `POST` | `/api/loans/apply` | Submit loan → triggers RL evaluation |
| `GET` | `/api/loans/my-loans` | User's application history |
| `POST` | `/api/loans/{id}/review` | Officer decision on application |
| `POST` | `/api/chat/ask` | AI assistant (Vector Search + Gemini) |
| `POST` | `/api/simulation/run` | "What-If" risk simulation |
| `GET` | `/api/admin/analytics` | Portfolio analytics (aggregation pipeline) |
| `GET` | `/api/admin/audit-logs` | System audit trail |

---

## What's Next

This is a working system, but there's a lot I want to push further:

**Smarter risk models** — The Q-learning agent works, but I want to experiment with deep Q-networks and compare them against the tabular approach. Also looking into adding credit history and repayment behavior as training signals instead of relying purely on application-time features.

**Better RAG** — The vector search pipeline retrieves relevant context, but the knowledge base is still relatively small. I plan to expand it significantly, improve chunking strategies, and explore re-ranking retrieved results before passing them to Gemini.

**Fine-tuned financial LLM** — Right now the assistant uses Gemini out of the box with RAG context. I want to explore fine-tuning an open-source model (Mistral or Llama) specifically on financial advisory data so the responses are more domain-aware.

**Richer analytics** — The current aggregation pipelines cover the basics. I want to add risk trend tracking over time, cohort analysis, and predictive portfolio health metrics.

**Production hardening** — Better auth flows (refresh tokens, session management), rate limiting, proper CI/CD pipeline, and moving from Docker Compose to something like Kubernetes for real scalability.

**Testing** — More coverage across the board. Unit tests for the RL agent's edge cases, integration tests for the MongoDB pipelines, and end-to-end tests for critical user flows.

> This project is under active development. The above reflects where I'm headed — not a wishlist, but actual next steps I'm working toward.

---

**Built with** Java 17 · Spring Boot 3.2 · React 18 · Python 3.11 · FastAPI · MongoDB Atlas · Google Gemini · Docker
