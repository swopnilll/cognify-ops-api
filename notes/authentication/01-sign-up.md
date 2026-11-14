# 01 – Sign up

[← Back to the notes index](../README.md)

`POST /api/auth/signup` creates a row in the `User` table. It does **not** log
the user in: no token is returned, the client calls
[sign in](02-sign-in.md) next.

Code: [`authRoutes.ts`](../../src/routes/auth/authRoutes.ts) →
[`authController.ts`](../../src/controllers/auth/authController.ts) →
[`authService.ts`](../../src/services/auth/authService.ts) →
[`authRepository.ts`](../../src/repositories/auth/authRepository.ts)

---

## 1. Request and response

```http
POST /api/auth/signup
Content-Type: application/json

{ "email": "Sam@Example.com", "password": "at-least-8-chars", "fullName": "Sam Lee" }
```

`201 Created`

```json
{
  "user": {
    "user_id": "3f0c…-uuid",
    "email": "sam@example.com",
    "name": "Sam Lee",
    "nickname": "sam",
    "picture": "",
    "user_metadata": { "fullName": "Sam Lee" },
    "created_at": "2026-11-14T02:10:00.000Z",
    "last_login": null
  }
}
```

| Status | When | Body |
|---|---|---|
| 400 | email missing or not shaped like `a@b.c` | `{ "error": "A valid email is required" }` |
| 400 | password is not a string or shorter than 8 | `{ "error": "Password must be at least 8 characters" }` |
| 409 | email already used | `{ "error": "An account with this email already exists" }` |
| 500 | anything else (e.g. database down) | `{ "error": "<message>" }` |

## 2. What happens, step by step

1. **Validate the email.** Must match `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`. It is then
   trimmed and lower-cased, so `Sam@Example.com` and `sam@example.com` are the
   same account.
2. **Validate the password.** A string of at least 8 characters. No other rule
   (no upper limit, no complexity check).
3. **Check the email is free.** `findUnique` on `User.email`. If found → 409.
4. **Hash the password** with scrypt ([`utils/password.ts`](../../src/utils/password.ts)):
   - a new random 16-byte salt per password
   - 64-byte key, Node's default scrypt cost (N = 16384, r = 8, p = 1)
   - stored as one string: `scrypt$<salt hex>$<hash hex>`
5. **Insert the user.**

   | Column | Value |
   |---|---|
   | `user_id` | `crypto.randomUUID()` |
   | `email` | normalized email |
   | `password_hash` | the scrypt string |
   | `full_name` | `fullName` trimmed, or `""` if it was not a string |
   | `created_at` | `now()` (database default) |
   | `picture`, `last_login` | `NULL` |

6. **Return the profile.** `toUserProfile` builds the response and never
   includes `password_hash`.

## 3. Things to know

- The email check (step 3) and the insert (step 5) are two queries. Two
  sign-ups with the same email at the same moment both pass the check; the
  second insert then fails on the unique index and comes back as a **500**, not
  a 409.
- `name` in the response is `full_name`, or the email when `full_name` is
  empty. `nickname` is the part of the email before `@`. Neither is stored.
- A new user belongs to no project and has no role. Roles are per project and
  are given when a project is created or the user is added to one
  (see [Projects](../projects/01-projects.md)).
- There is no email verification and no rate limit.
