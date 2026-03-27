# Backend Task List

## Phase 1 — Backend Foundation ✅
- [x] Initialize Node.js project
- [x] Install and configure Express.js
- [x] Install and configure Prisma ORM
- [x] Connect Prisma to Supabase PostgreSQL
- [x] Create base folder structure
- [x] Create Express app entry files
- [x] Add environment variable setup
- [x] Add .env.example
- [x] Add health check route
- [x] Add centralized error handling
- [x] Add 404 not found handling
- [x] Add request validation structure
- [x] Add basic response helper pattern

## Phase 2 — Database Schema Design ✅
- [x] Define core Prisma models
- [x] Add enums for statuses and categories where appropriate
- [x] Add timestamps to core entities
- [x] Add migration files
- [x] Seed basic mock categories or initial data if needed

## Phase 3 — Dares API ✅
- [x] Create dare model logic
- [x] Build create dare endpoint
- [x] Build get dare feed endpoint
- [x] Build get single dare endpoint
- [x] Add filtering and sorting support
- [x] Add validation for dare creation
- [x] Add safe status flow for dares

## Phase 4 — Accept Dare Flow
- [ ] Build accept dare endpoint
- [ ] Prevent invalid accept flows
- [ ] Add accepted dare relation logic
- [ ] Prevent duplicate acceptance if needed
- [ ] Define acceptance status behavior

## Phase 5 — Submission Flow
- [ ] Build create submission endpoint
- [ ] Define submission statuses
- [ ] Add proof metadata support
- [ ] Add validation for submission creation
- [ ] Build get submission details endpoint
- [ ] Build list my submissions endpoint

## Phase 6 — Review & Moderation Foundation
- [ ] Build approve submission endpoint
- [ ] Build reject submission endpoint
- [ ] Add moderation-safe status transitions
- [ ] Add report model
- [ ] Build report dare endpoint
- [ ] Build report submission endpoint
- [ ] Add basic moderation queue foundation

## Phase 7 — Wallet Foundation
- [ ] Design balance-related models
- [ ] Add transaction model
- [ ] Add wallet summary endpoint
- [ ] Add transaction history endpoint
- [ ] Add pending vs available balance logic foundation

## Phase 8 — Authentication (Supabase + Google)
- [ ] Setup Supabase Auth in project
- [ ] Enable Google OAuth provider in Supabase dashboard
- [ ] Configure redirect URLs
- [ ] Integrate Supabase Auth in frontend (login/logout)
- [ ] Handle session persistence in frontend
- [ ] Extract user session in backend from requests
- [ ] Create auth middleware in Express
- [ ] Attach current user to request (req.user)
- [ ] Protect routes (create dare, accept dare, submission, etc.)
- [ ] Create user profile on first login (sync Supabase user → DB)
- [ ] Handle unauthorized access responses — Storage Preparation
- [ ] Plan proof upload flow
- [ ] Add upload metadata support
- [ ] Add Supabase Storage integration preparation
- [ ] Define file validation rules
- [ ] Prepare secure upload flow design

## Phase 10 — API Quality & Security
- [ ] Add rate limiting
- [ ] Add helmet / basic security middleware
- [ ] Add request logging middleware
- [ ] Add input sanitization strategy
- [ ] Improve validation coverage
- [ ] Add safer error responses

## Phase 11 — Testing & QA
- [ ] Add API testing structure
- [ ] Add test setup for core routes
- [ ] Test major error cases
- [ ] Test status transition edge cases
- [ ] Test invalid request handling

## Phase 12 — Launch Preparation
- [ ] Clean up route naming consistency
- [ ] Clean up response shape consistency
- [ ] Review env variables
- [ ] Review migration safety
- [ ] Prepare backend for deployment
- [ ] Create deployment checklist

## Current Priority
- [x] initialize clean backend architecture
- [x] connect Prisma to Supabase
- [x] prepare schema and route structure
- [ ] implement MVP feature APIs step by step