# Backend Current State

## Status
Backend planning / setup stage.

## What exists right now
- Frontend is already prepared separately
- Backend will be created in its own folder/project
- We will use Node.js + Express + Prisma + Supabase PostgreSQL
- JavaScript is preferred for the backend setup

## Current backend focus
- initialize backend structure
- configure Express
- configure Prisma
- connect to Supabase Postgres
- create scalable folder structure
- define base API conventions
- prepare for MVP feature implementation

## What is not finalized yet
- exact auth flow
- payment system integration
- final moderation workflow
- file upload implementation
- admin dashboard behavior
- transaction settlement rules

## Assumptions for now
- MVP first
- no overengineering
- backend should support frontend needs cleanly
- API-ready structure matters more than feature completeness right now

## Next Recommended Step
1. initialize backend app
2. add Prisma and DATABASE_URL setup
3. add health route
4. define first database schema draft
5. implement core feature routes one by one

## Notes for AI
If asked to implement backend work:
- keep structure clean
- avoid unnecessary abstractions
- prefer simple controllers/services
- keep future moderation and wallet logic in mind