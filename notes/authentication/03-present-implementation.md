# 03 – Present implementation

[← Back to the notes index](../README.md)

Where authentication stands today: what it is built from, what it guarantees,
and what it does not do yet.

---

## 1. In one paragraph

Local email + password accounts stored in our own Postgres `User` table.
Passwords are scrypt hashes. Sign in returns one HS256 JWT valid for 7 days.
The API is stateless: it trusts any token whose signature and expiry are valid
and never looks the user up again. There is no third-party identity provider.

## 2. History

The first version used Auth0: the `User` table held only `user_id` (the Auth0
ID) and Auth0 kept the email and password. Migration
`20261114010000_local_auth` added `email`, `password_hash`, `full_name`,
`picture`, `last_login` and `created_at` to `User`, and the API now issues its
own tokens. Leftovers of the old design:

- Schema comments still say `created_by` is an "Auth0 user_id". It is now a
  UUID made by the API.
- `email` and `password_hash` are nullable, because rows from the Auth0 time
  had neither. Such a row cannot sign in (login needs a `password_hash`).
- The profile shape (`sub`, `nickname`, `user_metadata.fullName`) copies
  Auth0's, so the frontend did not have to change.

## 3. The pieces

| Piece | File | Job |
|---|---|---|
| Routes | [`routes/auth/authRoutes.ts`](../../src/routes/auth/authRoutes.ts) | `/login`, `/signup`, `/update-profile` |
| Guard | [`routes/routes.ts`](../../src/routes/routes.ts) | `router.use(passport.authenticate('jwt'))` protects everything below it |
| Strategy | [`middleware/passportMiddleware.ts`](../../src/middleware/passportMiddleware.ts) | verifies the token, sets `req.user` |
| Config | [`config/auth.ts`](../../src/config/auth.ts) | reads `JWT_SECRET`, `JWT_EXPIRES_IN` |
| Rules | [`services/auth/authService.ts`](../../src/services/auth/authService.ts) | validation, sign up, sign in, profile update |
| Hashing | [`utils/password.ts`](../../src/utils/password.ts) | scrypt hash and verify |
| Queries | [`repositories/auth/authRepository.ts`](../../src/repositories/auth/authRepository.ts) | `User` table access, `toUserProfile` |

Environment:

| Variable | Meaning |
|---|---|
| `JWT_SECRET` | Signing key. Must be at least 32 characters or the API refuses to start (`openssl rand -hex 32`). |
| `JWT_EXPIRES_IN` | Token lifetime, default `7d`. |

## 4. What is solid

- Passwords are never stored or returned in plain text; each has its own salt.
- Password comparison is constant-time.
- Login gives one error for every failure, so emails cannot be probed there.
- The token's algorithm and issuer are pinned on both sign and verify.
- Emails are normalized, and unique in the database.
- Profile updates use the user ID from the token.

## 5. What is missing

**Authentication is done; authorization is not.** A valid token proves who you
are, but no endpoint checks what you are allowed to touch.

| Gap | Effect today |
|---|---|
| No per-project permission check | Any signed-in user can list every project (`GET /projects`), read, edit or delete any ticket, and add users to any project. `User_Role` is stored but never enforced. |
| Identity taken from the request body | `POST /projects` uses `user_id` from the body and `POST /tickets` uses `created_by` from the body, not `req.user.sub`. A caller can create things in another user's name. |
| `GET /projects/:userId` | Returns the projects of whichever user ID is in the URL. |
| No token revocation | No logout endpoint, no refresh token, no token version. A stolen token works until it expires (up to 7 days). A password change or a deleted user does not cancel it, because the guard never reads the database. |
| No rate limiting | Login and sign up can be tried without limit. |
| Sign up reveals used emails | The 409 on sign up tells a caller the email has an account. |
| No email verification, no password reset | A forgotten password cannot be recovered through the API. |
| Token in `localStorage` | Readable by any script on the page, so an XSS bug would leak it. |
| `cors()` with no options | Requests are accepted from every origin. |

## 6. Suggested order to close the gaps

1. Take `user_id` / `created_by` from `req.user.sub` on create.
2. Add a "is this user a member of this project?" middleware (reads
   `Project_User`) on project and ticket routes; use `User_Role` for
   admin-only actions.
3. Rate limit `/auth/login` and `/auth/signup`.
4. Shorter access token plus a refresh token, or a `token_version` column on
   `User` checked by the guard, so tokens can be cancelled.
5. Password reset by email.
