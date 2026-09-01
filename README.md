<div align="center">

# 🏛️ Digital Subsidy & Grant Administration Platform

### *Next-Generation Governance Infrastructure for Staged Disbursement, Multi-Level Workflow Verification, and Real-Time Auditability*

[![Java 17](https://img.shields.io/badge/Java-17%2B-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://www.oracle.com/java/)
[![Spring Boot 3.x](https://img.shields.io/badge/Spring_Boot-3.x-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Spring Security](https://img.shields.io/badge/Spring_Security-JWT_RBAC-6DB33F?style=for-the-badge&logo=springsecurity&logoColor=white)](https://spring.io/projects/spring-security)
[![MySQL 8.0](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![React 18](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

---

</div>

## 📌 Executive Summary

Manual grant distribution and legacy subsidy frameworks suffer from extended verification latency, opaque approval pipelines, and high risks of fraudulent claims. 

The **Digital Subsidy & Grant Administration Platform** is an enterprise governance platform engineered to automate multi-tiered beneficiary verification, calculate automated eligibility and fraud-risk scoring, enforce strict state-machine grant transitions, and manage milestone-driven staged fund releases across national, state, district, and field levels.

---

## 🏛️ System Architecture & Workflow Topology

The system uses a layered, event-driven micro-monolith structure to separate edge security, state orchestration, domain persistence, and interactive user interfaces:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   CLIENT LAYER                                         │
│        [ Field Officers ]        [ District Officers ]        [ Finance Approvers ]    │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ REST APIs / HTTPS
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              SPRING CLOUD API GATEWAY                                  │
│             Rate Limiting | OAuth2 & JWT Authentication | Dynamic Routing             │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                           BUSINESS SERVICES LAYER (CORE)                               │
│  ┌───────────────────────┐   ┌──────────────────────┐   ┌───────────────────────────┐  │
│  │   Beneficiary Module  │   │   Eligibility Engine │   │   Spring State Machine    │  │
│  │ (Profile & Doc Vault) │   │ (Risk Scoring Engine)│   │  (Workflow Lifecycle)   │  │
│  └───────────────────────┘   └──────────────────────┘   └───────────────────────────┘  │
│  ┌───────────────────────┐   ┌──────────────────────┐   ┌───────────────────────────┐  │
│  │  Verification Module  │   │  Disbursement Engine │   │   Reporting & Audit Service│  │
│  │(Field➔District➔Finance)│   │ (Staged Milestone) │   │  (Envers Trail Logger)    │  │
│  └───────────────────────┘   └──────────────────────┘   └───────────────────────────┘  │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ JPA / Hibernate ORM
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   PERSISTENCE LAYER                                    │
│                     MySQL 8.0 (Audited Tables & Optimistic Locks)                      │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## ⚡ Key Enterprise Engineering Features

* **⚙️ Declarative State Machine Engine:** Application transitions (`SUBMITTED` ➔ `FIELD_VERIFIED` ➔ `DISTRICT_APPROVED` ➔ `DISBURSED`) are strictly governed via **Spring State Machine** to prevent illegal state mutations or unauthorized status updates.
* **🛡️ Compliance-Grade Auditing (Hibernate Envers):** Full historical change logging for regulatory compliance. Every entity mutation records `@CreatedBy`, `@LastModifiedDate`, and `@Version` tags to support anti-corruption audits.
* **🔒 Fine-Grained RBAC & Security:** Secured via Spring Security and JWT tokens. Access rights strictly isolate `ROLE_FIELD_OFFICER`, `ROLE_DISTRICT_OFFICER`, and `ROLE_FINANCE_APPROVER` actions.
* **📊 Risk & Eligibility Scoring Module:** Evaluates incoming applications dynamically against scheme criteria, calculating a dual **Eligibility Rating** and **Fraud Risk Index**.
* **💸 Staged Disbursement Engine:** Funds are released incrementally across defined operational milestones (e.g., Stage 1: Initial Approval, Stage 2: Field Verification, Stage 3: Utilization Proof).

---

## 🛠️ Technology Stack Breakdown

| Layer | Framework / Tool | Version | Responsibility |
|---|---|---|---|
| **Backend Core** | Java JDK | `17 LTS` | Enterprise Server Environment |
| **Application Framework** | Spring Boot | `3.2.x` | Core REST API and Application Execution |
| **Workflow Management** | Spring State Machine | `3.2.0` | Orchestrating State Transitions and Guards |
| **Database & ORM** | MySQL + Hibernate Envers | `8.0` / `6.x` | Transactional Storage and Immutable Audit Logs |
| **Security Layer** | Spring Security + Nimbus JWT | `6.x` | Stateful Authorization and Stateless JWT Validation |
| **Frontend Platform** | React + TypeScript | `18.x` / `5.x` | Dynamic Role Dashboards & Audit Visualizer |
| **State Management** | TanStack Query (React Query) | `v5` | Async Server-State Sync & Optimistic Caching |
| **Documentation & Error Handling**| OpenAPI 3.0 + RFC 7807 | `2.x` | Swagger Interactive UI & ProblemDetail Responses |

---

## 👥 Engineering Team & Contributions

| Contributor | Module Ownership | Key Architectural Contributions |
|---|---|---|
| **Vikky Kumar Gupta** | **Environment & Database Infrastructure** | Designed MySQL Schema, JPA Audit Infrastructure, Docker Containerization, Hibernate Envers Setup. |
| **Lakshmi Priya** | **Workflow Engine & Eligibility Scoring** | Configured Spring State Machine, Guards, Multi-level Verification Rules, and Fraud Risk Engine. |
| **Vikas S M** | **Frontend & Beneficiary Portal** | Built Beneficiary Dashboard, Interactive Verification Audit Timeline, TanStack Query Integration, Dynamic Role-Based UI Controls. |

---

## 📂 Project Structure

```text
digital-subsidy-grant-platform/
├── backend/
│   ├── src/main/java/com/infosys/subsidy/
│   │   ├── config/          # Security, State Machine, OpenAPI Configs
│   │   ├── controller/      # REST Controllers (RFC 7807 Exception Handlers)
│   │   ├── dto/             # Request/Response Validation DTOs
│   │   ├── entity/          # JPA Entities with Auditing & Versioning
│   │   ├── repository/      # Spring Data JPA Repositories
│   │   ├── service/         # Business Logic, Eligibility Scoring & State Guards
│   │   └── statemachine/    # States, Events, Transitions & Action Listeners
│   └── src/test/java/       # JUnit 5 & Testcontainers Integration Tests
├── frontend/
│   ├── src/
│   │   ├── components/      # Audit Trail Visualizer, Dynamic Modals
│   │   ├── hooks/           # TanStack Query API Hooks
│   │   ├── pages/           # Role-specific Dashboards (Field, District, Finance)
│   │   └── types/           # TypeScript API Interface Contracts
└── docker-compose.yml       # Production-ready Multi-container Orchestration
```

---

## 🚀 Quick Start Guide

### Prerequisites

* **Java Development Kit (JDK):** Version 17 or higher
* **Node.js:** Version 18.x or higher
* **Docker & Docker Compose:** Installed and running

### 1. Clone & Setup Environment

```bash
git clone https://github.com/vikassm0007-arch/digital-subsidy-grant-platform.git
cd digital-subsidy-grant-platform
```

### 2. Run Application via Docker Compose

To launch the Spring Boot Backend, MySQL Database, and React Frontend in isolated containers:

```bash
docker-compose up --build -d
```

### 3. Manual Local Development Setup (Alternative)

**Backend Setup:**

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

**Frontend Setup:**

```bash
cd frontend
npm install
npm run dev
```

---

## 📡 Core API Specification

| Endpoint | Method | Role Access | Description |
| --- | --- | --- | --- |
| `/api/v1/beneficiaries` | `POST` | `ROLE_FIELD_OFFICER` | Register a new beneficiary profile |
| `/api/v1/applications` | `POST` | Public / Beneficiary | Submit a new grant application |
| `/api/v1/verify/field` | `POST` | `ROLE_FIELD_OFFICER` | Submit ground check verification report |
| `/api/v1/verify/district` | `POST` | `ROLE_DISTRICT_OFFICER` | Approve regional allocation and budget check |
| `/api/v1/disburse/release` | `POST` | `ROLE_FINANCE_APPROVER` | Execute staged fund release milestone |

*Interactive Swagger UI Documentation available at:* `http://localhost:8080/swagger-ui.html`

---

## 🧪 Testing & Code Quality

Execute unit and integration test suites using **JUnit 5**, **Mockito**, and **Testcontainers** (spinning up isolated MySQL containers for tests):

```bash
# Run backend test suite with code coverage check
cd backend
mvn clean test
```

---

## 📜 License & Acknowledgments

Distributed under the MIT License. Developed as an enterprise capstone initiative for the **Infosys Springboard Internship Program**.
