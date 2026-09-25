# RiskPilot AI — Enterprise Risk Assessment Platform

An intelligent loan risk assessment platform powered by Reinforcement Learning, MongoDB Atlas, and Google Gemini AI. Features real-time decision making, role-based analytics, and a Retrieval-Augmented Generation (RAG) conversational assistant powered by MongoDB Atlas Vector Search.

---

## 🎯 Overview

RiskPilot AI leverages a trained RL (Reinforcement Learning) agent to evaluate loan applications with precision and transparency. The platform provides:

- **Automated Risk Assessment**: RL agent evaluates applications, calculates default probabilities, and recommends lending decisions with interest rate tiers.
- **MongoDB-Native Document Storage**: Built on MongoDB Atlas as the primary high-throughput document store with zero relational JOIN overhead.
- **Atlas Vector Search RAG**: AI Financial Guide assistant utilizing MongoDB Atlas Vector Search and Google Gemini 768-dimensional embeddings.
- **Multi-Role Support**: Tailored portals and dashboards for Borrowers, Loan Officers, and Administrators.
- **Real-Time Portfolio Analytics**: MongoDB Aggregation Pipeline engine for instant default rate, approval rate, and risk exposure analytics.
- **"What-If" Risk Simulation**: Interactive financial scenario calculator for borrowers to model risk impact before applying.
- **Compliance & Audit Logging**: Immutable compound-indexed audit trail for governance and administrative review.

---

## 🏗️ Tech Stack & Architecture

### Core Tech Stack

- **Primary Database**: **MongoDB 7.0+ / MongoDB Atlas** (NoSQL Document Store & Vector Search Engine)
- **Backend Framework**: Java 17 + Spring Boot 3.2 + Spring Data MongoDB + Spring Security
- **AI & Vector Embeddings**: Google Gemini API (`gemini-2.5-flash` LLM + `gemini-embedding-001` 768-dim embeddings)
- **Machine Learning Service**: FastAPI + Python 3.11 (Q-Learning Reinforcement Learning Agent)
- **Frontend SPA**: React 18 + CSS3 with Design Tokens (Light/Dark Theme) + Google OAuth 2.0
- **Containerization**: Docker & Docker Compose

---

## 🍃 MongoDB Features & Usage in RiskPilot AI

MongoDB is the **exclusive, primary database engine** powering RiskPilot AI. Below is the comprehensive breakdown of every MongoDB feature implemented in the project and its exact purpose:

### 1. Document-Oriented Data Store (Primary Database)
- **Implementation**: Managed via Spring Data MongoDB (`MongoRepository<T, String>` & `MongoTemplate`).
- **Purpose**: Replaced traditional relational database structures with high-performance JSON/BSON document representations. Loan risk models involve dynamic states, nested financial profiles, Q-value lists, and AI metadata that fit naturally into flexible schema documents.

### 2. Embedded Sub-Documents (Denormalization & Atomic Reads)
- **Implementation**: `FinancialProfile` and `RiskResultDoc` classes embedded directly inside `Assessment` and `Simulation` parent documents.
- **Purpose**: Eliminates multi-table SQL `JOIN` operations. Complete risk assessments and scenario simulations can be retrieved or written in a single atomic database operation, reducing query latency to sub-millisecond levels.

### 3. MongoDB Aggregation Framework (`MongoTemplate` Aggregation Pipelines)
- **Implementation**: Utilized in [`AnalyticsService.java`](file:///c:/Projects/RiskPilot-AI/backend/src/main/java/com/loanguard/service/AnalyticsService.java) to compute real-time system analytics.
- **Pipeline Stages & Operators**:
  - `$match`: Filters loan documents based on status (e.g., `status: APPROVED`) or field existence (`exists(true)`).
  - `$group`: Groups matching documents to calculate portfolio aggregates using `$avg` and `$sum`.
- **Purpose**: Calculates portfolio default probabilities, average interest rates, total approved loan volume, and RL reward averages directly within MongoDB's native C++ engine without pulling raw records into backend application memory.

### 4. MongoDB Atlas Vector Search (`$vectorSearch`)
- **Implementation**: Implemented in [`KnowledgeService.java`](file:///c:/Projects/RiskPilot-AI/backend/src/main/java/com/loanguard/service/KnowledgeService.java) using a custom `MongoTemplate` pipeline stage targeting the `knowledge` collection.
- **Vector Search Index Specs**:
  - Index Name: `knowledge_vector_index`
  - Field: `embedding` (768-dimensional float array from Google Gemini text-embedding model)
  - Similarity Metric: Cosine / K-Nearest Neighbors (KNN)
  - Candidates: `numCandidates: 20`, `limit: 3`
- **Purpose**: Enables Retrieval-Augmented Generation (RAG) for the AI Chat Assistant. When a user asks a financial question, MongoDB Atlas performs a high-speed vector similarity match across embedded financial topics to retrieve relevant context before passing it to Gemini for answer synthesis.

### 5. Single Field & Unique Secondary Indexing
- **Implementation**: Spring Data `@Indexed(unique = true)` annotations on `User.email` and `LoanApplication.applicationRef`.
- **Purpose**: Enforces unique business constraints at the database level and ensures fast $O(1)$ lookups for user authentication and application reference tracking.

### 6. Compound Indexing for High-Speed Sorting & Pagination
- **Implementation**: `@CompoundIndex` annotations applied to 6 major MongoDB collections:
  - `LoanApplication`: `{'userId': 1, 'createdAt': -1}`
  - `Assessment`: `{'userId': 1, 'createdAt': -1}`
  - `Simulation`: `{'userId': 1, 'createdAt': -1}`
  - `ChatMessage`: `{'sessionId': 1, 'createdAt': 1}`
  - `Notification`: `{'userId': 1, 'createdAt': -1}`
  - `AuditLog`: `{'userId': 1, 'createdAt': -1}`
- **Purpose**: Prevents in-memory sorting operations (`SORT_KEY_GENERATED` overhead) by maintaining B-Tree index ordering on user ownership and timestamp fields. Enables instant rendering of user histories and chronological chat sessions.

### 7. BSON ObjectIds & String Id Mapping
- **Implementation**: All MongoDB models use `@Id private String id;` mapped to native MongoDB 12-byte BSON ObjectIds (`_id`).
- **Purpose**: Provides globally unique ID generation across distributed services without auto-increment lock contention.

### 8. Dynamic Schema Initialization & Knowledge Seeding
- **Implementation**: Automated database initialization via [`DataInitializer.java`](file:///c:/Projects/RiskPilot-AI/backend/src/main/java/com/loanguard/config/DataInitializer.java) and `KnowledgeService.seedIfEmpty()`.
- **Purpose**: On application boot, automatically verifies collection states, seeds default administrative roles, populates reference datasets, and inserts vector-embedded financial education documents.

---

## 🗄️ Database Collections & Schema Architecture

RiskPilot AI organizes data across **10 dedicated MongoDB collections**:

| Collection | Model Class | Key Fields & Embeddings | Primary Indexes & Features | Purpose |
|------------|-------------|-------------------------|----------------------------|---------|
| `users` | [`User`](file:///c:/Projects/RiskPilot-AI/backend/src/main/java/com/loanguard/model/User.java) | `fullName`, `email`, `authProvider`, `role`, `isActive` | Unique Index on `email` | Manages user accounts, OAuth authentication profiles, and roles (`USER`, `LOAN_OFFICER`, `ADMIN`). |
| `loan_applications` | [`LoanApplication`](file:///c:/Projects/RiskPilot-AI/backend/src/main/java/com/loanguard/model/LoanApplication.java) | `applicationRef`, `loanAmount`, `qValues`, `defaultProbability`, `riskLevel` | Unique on `applicationRef`, Compound on `{userId:1, createdAt:-1}` | Core loan application documents tracking applicant financials, RL model outputs, and admin decisions. |
| `assessments` | [`Assessment`](file:///c:/Projects/RiskPilot-AI/backend/src/main/java/com/loanguard/model/Assessment.java) | Embedded `FinancialProfile`, Embedded `RiskResultDoc` | Compound Index on `{userId:1, createdAt:-1}` | Historical record of every evaluated loan application for risk intelligence analytics. |
| `simulations` | [`Simulation`](file:///c:/Projects/RiskPilot-AI/backend/src/main/java/com/loanguard/model/Simulation.java) | Embedded `FinancialProfile` scenario, Embedded `RiskResultDoc` result | Compound Index on `{userId:1, createdAt:-1}` | Stores "What-If" hypothetical financial simulations run by borrowers. |
| `chat_messages` | [`ChatMessage`](file:///c:/Projects/RiskPilot-AI/backend/src/main/java/com/loanguard/model/ChatMessage.java) | `sessionId`, `userId`, `role`, `content` | Compound Index on `{sessionId:1, createdAt:1}` | Stores conversation messages between users and the AI Assistant. |
| `audit_logs` | [`AuditLog`](file:///c:/Projects/RiskPilot-AI/backend/src/main/java/com/loanguard/model/AuditLog.java) | `userId`, `action`, `entityType`, `entityId`, `details`, `ipAddress` | Compound Index on `{userId:1, createdAt:-1}` | Immutable security and system activity logs for administrative compliance. |
| `loan_comments` | [`LoanComment`](file:///c:/Projects/RiskPilot-AI/backend/src/main/java/com/loanguard/model/LoanComment.java) | `loanId`, `authorId`, `commentText` | Index on `loanId` | Internal review comments and notes posted by Loan Officers on applications. |
| `loan_documents` | [`LoanDocument`](file:///c:/Projects/RiskPilot-AI/backend/src/main/java/com/loanguard/model/LoanDocument.java) | `loanId`, `fileName`, `fileType`, `fileUrl` | Index on `loanId` | Metadata records for supporting documents uploaded with loan requests. |
| `notifications` | [`Notification`](file:///c:/Projects/RiskPilot-AI/backend/src/main/java/com/loanguard/model/Notification.java) | `userId`, `title`, `message`, `type`, `isRead` | Compound Index on `{userId:1, createdAt:-1}` | In-app user notifications for status changes and decision alerts. |
| `knowledge` | [`KnowledgeEntry`](file:///c:/Projects/RiskPilot-AI/backend/src/main/java/com/loanguard/model/KnowledgeEntry.java) | `title`, `category`, `content`, `embedding` (768-dim vector) | Atlas Vector Search Index (`knowledge_vector_index`) | Financial education knowledge base used for RAG context retrieval in the AI assistant. |

---

## 📁 Project Structure

```
.
├── backend/              # Spring Boot REST API & MongoDB Service
│   ├── src/main/java/com/loanguard/
│   │   ├── config/       # WebConfig, DataInitializer, Security
│   │   ├── controller/   # REST Controllers (Auth, Loan, Chat, Analytics, Simulation)
│   │   ├── dto/          # Data Transfer Objects
│   │   ├── model/        # Spring Data MongoDB Documents & Embedded Classes
│   │   ├── repository/   # Spring Data MongoDB Repositories
│   │   ├── service/      # Business Logic, Analytics Aggregations, Gemini Vector Search
│   │   └── security/     # Token & OAuth Filters
│   ├── src/main/resources/
│   │   └── application.yml  # MongoDB URI & Model Configurations
│   ├── pom.xml           # Spring Data MongoDB dependencies
│   └── Dockerfile
├── frontend/             # React 18 SPA
│   ├── src/
│   │   ├── components/   # Reusable UI components & Theme Toggle
│   │   ├── pages/        # Dashboard, Loan Application, Chat Assistant, Admin Portal
│   │   ├── context/      # AuthContext, ThemeContext
│   │   └── services/     # Axios API Client
│   └── Dockerfile
├── ml-service/           # FastAPI Reinforcement Learning Microservice
│   ├── main.py           # FastAPI REST Server
│   ├── rl_agent.py       # Q-Learning Agent Implementation
│   ├── environment.py    # Loan Risk Environment Simulator
│   ├── train_agent.py    # Model Training Script
│   └── Dockerfile
├── docker-compose.yml    # Full-Stack Orchestration (Backend + ML + Frontend)
└── README.md             # Project Documentation
```

---

## 🚀 Quick Start

### Prerequisites

- **Docker & Docker Compose** (Recommended)
- **MongoDB Atlas Account** or local **MongoDB 7.0+** instance
- **Google Gemini API Key** (from Google AI Studio)

---

### Environment Setup

Create a `.env` file in the root directory:

```env
# MongoDB Atlas Connection URI
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/riskpilot?retryWrites=true&w=majority

# Google Gemini API Key (for LLM & Vector Embeddings)
GEMINI_API_KEY=your_gemini_api_key_here

# Google OAuth Client ID (Frontend)
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
REACT_APP_API_BASE=http://localhost:8080/api
```

---

### Using Docker Compose

```bash
# Build and run all services in detached mode
docker-compose up --build -d

# Check running container logs
docker-compose logs -f backend
```

Once running, services are accessible at:
- **Frontend SPA**: `http://localhost:3000`
- **Spring Boot Backend**: `http://localhost:8080/api`
- **FastAPI ML Service**: `http://localhost:8000`

---

## 🔌 API Endpoints

### 🔐 Authentication (`/api/auth`)
- `POST /api/auth/social` — Authenticate via Google OAuth token
- `POST /api/auth/logout` — Invalidate user session

### 📄 Loan Applications (`/api/loans`)
- `POST /api/loans/apply` — Submit new loan application (triggers RL evaluation + MongoDB persistence)
- `GET /api/loans/{id}` — Fetch specific application document details
- `GET /api/loans/my-loans` — Retrieve user application history (MongoDB compound index optimized)
- `POST /api/loans/{id}/review` — Submit Loan Officer decision & notes

### 🤖 AI Financial Assistant & RAG (`/api/chat`)
- `POST /api/chat/ask` — Query AI assistant (triggers Atlas Vector Search + Gemini synthesis)
- `GET /api/chat/history/{sessionId}` — Retrieve full chat conversation history

### 🧮 What-If Risk Simulation (`/api/simulation`)
- `POST /api/simulation/run` — Run hypothetical financial scenario against RL model & persist to MongoDB

### 📊 Admin & Analytics (`/api/admin`)
- `GET /api/admin/analytics` — Get system analytics (MongoDB Aggregation Pipeline driven)
- `GET /api/admin/review-queue` — Fetch applications flagged `needsAdminReview = true`
- `GET /api/admin/audit-logs` — Retrieve system audit log documents

---

## 🧠 Reinforcement Learning (RL) Agent Logic

The `ml-service` implements a **Q-Learning Reinforcement Learning Agent**:

- **State Space**: Normalized vector composed of income, loan amount, existing debt, employment duration, and calculated Debt-to-Income (DTI) & Loan-to-Income (LTI) ratios.
- **Action Space**:
  1. `REJECT`
  2. `APPROVE_LOW_RATE` (8% interest)
  3. `APPROVE_MEDIUM_RATE` (12% interest)
  4. `APPROVE_HIGH_RATE` (16% interest)
  5. `MANUAL_REVIEW` (Escalate to Admin Queue)
- **Reward Function**: Balances interest yield income against penalty risks for default events.
- **Confidence Scoring**: High-uncertainty predictions automatically set `needsAdminReview = true` in MongoDB for human officer verification.

---

## 🤖 AI Assistant RAG Pipeline

```
[User Question]
       │
       ▼
[Gemini Embedding API] ──► (Generates 768-dim Float Vector)
       │
       ▼
[MongoDB Atlas Vector Search] ──► ($vectorSearch stage on 'knowledge' collection)
       │
       ▼
[Relevant Financial Context]
       │
       ▼
[Gemini LLM System Prompt] ──► (Synthesizes personalized response with Rupee ₹ formatting)
       │
       ▼
[User UI Output & MongoDB 'chat_messages' Persistence]
```

---

## 📝 License

Proprietary — All rights reserved.

---

**Version**: 3.2.0  
**Primary Database**: MongoDB Atlas  
**AI Engine**: Google Gemini + RL Microservice  
