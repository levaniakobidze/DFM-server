# Backend Project Context

## Project Name
Dare Me For Money MVP

## Backend Goal
Build the backend for a web platform where users can:
- create safe paid dares
- browse dares
- accept dares
- upload proof submissions
- review outcomes
- manage wallet-related balances and transactions

The backend should support the MVP first, with clean structure and room for future growth.

---

## Backend Stack
- Node.js
- Express.js
- Prisma ORM
- Supabase PostgreSQL
- Supabase Storage may be used later for media uploads
- JavaScript

---

## Backend Priorities Right Now
We are currently focusing on:
- backend project setup
- clean architecture
- database schema planning
- API route structure
- validation
- error handling
- scalable organization

We are NOT focusing yet on:
- advanced optimization
- microservices
- heavy background jobs
- overengineering
- full payment integration
- complex real-time logic

---

## Main Product Concept
Users create safe paid dares.
Other users can accept them and submit proof.
The dare creator or the system can later review and approve/reject the submission.
The platform must remain safe, controlled, and moderation-friendly.

---

## Important Product Rules
Only safe dares are allowed.

The system must be designed around:
- no illegal dares
- no violent dares
- no sexual exploitation
- no self-harm content
- no dangerous behavior encouragement
- no harassment-based dares

Backend structure should make future moderation easy.

---

## MVP Core Backend Features
1. User auth support preparation
2. Create dare
3. Get dare feed
4. Get dare details
5. Accept dare
6. Submit proof
7. Review submission
8. Wallet/balance foundation
9. Report content foundation
10. Moderation-ready status logic

---

## Architecture Preferences
Use a clean and simple structure.

Suggested organization:
- routes
- controllers
- services
- middlewares
- validations
- prisma
- utils
- constants

Prefer feature clarity over fancy architecture.

---

## API Principles
- Keep endpoints REST-style
- Return consistent JSON responses
- Validate incoming data
- Use proper HTTP status codes
- Centralize error handling
- Avoid mixing business logic directly inside route files

---

## Database Principles
- Use Prisma with Supabase Postgres
- Keep schema readable
- Use enums where they make sense
- Add timestamps consistently
- Design statuses clearly
- Keep MVP tables practical, not overcomplicated

---

## Code Rules
- Keep files focused
- Use clear naming
- Avoid unrelated refactors
- Prefer simple logic first
- Keep controller/service responsibilities clear
- Add comments only where useful

---

## AI Instructions
When working on this backend:
- read the docs first
- keep implementation MVP-level
- do not change unrelated files
- prefer simple scalable solutions
- do not overengineer
- explain changed files at the end
- if something is unclear, make the safest reasonable assumption and continue

---

## Current Focus
Current focus is backend setup and core MVP architecture first.