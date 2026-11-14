# 02 – Sign in

[← Back to the notes index](../README.md)

`POST /api/auth/login` checks an email and password and returns a signed JWT.
The client sends that token on every later request.

Code: [`authService.ts`](../../src/services/auth/authService.ts) (`login`),
[`passportMiddleware.ts`](../../src/middleware/passportMiddleware.ts),
[`config/auth.ts`](../../src/config/auth.ts)

---

## 1. Request and response

```http
POST /api/auth/login
Content-Type: application/json

{ "email": "sam@example.com", "password": "at-least-8-chars" }
```

`200 OK`

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs…",
  "user": {
    "sub": "3f0c…-uuid",
    "email": "sam@example.com",
    "name": "Sam Lee",
    "nickname": "sam",
    "picture": ""
  }
}
```

Any failure — unknown email, wrong password, missing field — gives the same
answer, so the response does not reveal which emails have accounts:

`401` `{ "error": "Wrong email or password" }`

## 2. What happens, step by step

1. **Type check.** `email` and `password` must both be strings, else 401.
2. **Find the user** by normalized (trimmed, lower-cased) email. No user, or a
   user with no `password_hash` → 401.
3. **Verify the password.** Split the stored `scrypt$salt$hash`, hash the
   submitted password with the same salt, compare with `timingSafeEqual`.
4. **Record the login.** `User.last_login = now()`.
5. **Sign the token.**

   | Part | Value |
   |---|---|
   | Algorithm | HS256 (one shared secret, `JWT_SECRET`) |
   | `sub` | `user_id` |
   | `email` | the user's email |
   | `iss` | `cognify-ops-api` |
   | `exp` | now + `JWT_EXPIRES_IN` (default `7d`) |
   | `iat` | now (added by the library) |

6. **Return** the token plus a small `user` object for the UI.

## 3. How the token is used afterwards

```http
GET /api/projects
Authorization: Bearer eyJhbGciOiJIUzI1NiIs…
```

`passport-jwt` runs on every protected route:

1. Reads the token from the `Authorization: Bearer` header.
2. Verifies the signature with `JWT_SECRET`, the issuer `cognify-ops-api`, the
   algorithm HS256, and that it has not expired.
3. On success sets **`req.user` to the token payload**:
   `{ sub, email, iat, exp, iss }`. The database is **not** read.
4. On failure answers `401 Unauthorized` (plain text body) and the controller
   never runs.

Which routes are protected ([`routes.ts`](../../src/routes/routes.ts)):

| Route | Token needed |
|---|---|
| `GET /api/health` | no |
| `POST /api/auth/login`, `POST /api/auth/signup` | no |
| `PATCH /api/auth/update-profile` | yes |
| `GET /api/` (returns `req.user`, i.e. the token payload) | yes |
| everything else (`/roles`, `/projects`, `/status`, `/tickets`, `/openai`) | yes |

## 4. Update profile

`PATCH /api/auth/update-profile` with any of `email`, `password`, `fullName`,
`picture`. The user ID is taken from the token (`req.user.sub`), never from the
body, so a user can only change their own profile. Email and password go
through the same validation as sign up; a taken email gives 409. Returns the
updated profile.

Changing the password does **not** cancel tokens that were already issued.

## 5. On the frontend

The frontend keeps the token in `localStorage` and adds the header in an axios
interceptor (`cognify-ops-fe/src/axios/tokenCRUD.ts`). "Logging out" is the
frontend deleting the token; the API has no logout endpoint.
