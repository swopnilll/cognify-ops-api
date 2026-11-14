# Notes

How the API works today, written from the code. Each folder is one topic.

| Folder | Notes |
|---|---|
| [authentication](authentication) | [01 – Sign up](authentication/01-sign-up.md) · [02 – Sign in](authentication/02-sign-in.md) · [03 – Present implementation](authentication/03-present-implementation.md) |
| [database](database) | [01 – Tables and relations](database/01-relations.md) |
| [projects](projects) | [01 – Projects](projects/01-projects.md) |
| [tasks](tasks) | [01 – Tasks (tickets)](tasks/01-tasks.md) |
| [ai](ai) | [01 – Embedding](ai/01-embedding.md) · [02 – Asking questions](ai/02-asking-questions.md) |

## The layers every request passes through

```
routes/        which URL, which middleware
controllers/   read the request, send the response
services/      the rules (validation, hashing, queue messages)
repositories/  Prisma queries
```

All routes are mounted under `/api` ([`src/app.ts`](../src/app.ts)). Everything
except `/api/health`, `/api/auth/login` and `/api/auth/signup` needs a
`Authorization: Bearer <token>` header ([`src/routes/routes.ts`](../src/routes/routes.ts)).

A "task" in the UI and in the AI code is a **`Ticket`** in the database and in
the API routes. The notes use "ticket" when naming tables and endpoints.
