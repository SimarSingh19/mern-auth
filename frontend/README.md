# Auth frontend — React + TypeScript

Matches the supplied backend and the reference project's pages/components/schema/services/store/types layout.

## Run locally

1. Use a current Node LTS supported by Vite (Node 22.12+ or Node 24 recommended).
2. Start your backend at `http://localhost:3000`.
3. In this folder run `npm ci`, then `npm run dev`.
4. Open `http://localhost:5173` (use localhost consistently, not 127.0.0.1).
5. `npm run build` checks TypeScript and creates production assets.

Dependencies were resolved from npm's latest tag when this project was created; the included package-lock.json records the versions. Use npm ci to reproduce them. Bootstrap is installed directly, not react-bootstrap. Zod and @hookform/resolvers follow your reference's form validation approach.

## Pages

- /register: username, email, password, confirmation
- /verify-email: registered email and a string OTP
- /login: verified accounts only
- /dashboard: protected profile, refresh profile, sign out, sign out everywhere

No resend OTP or password-reset UI is included because those APIs are not implemented in the supplied backend.

## API mapping

| Action | Method | Endpoint |
| --- | --- | --- |
| Register | POST | /api/auth/register |
| Verify email | POST | /api/auth/verify-email |
| Login | POST | /api/auth/login |
| Profile | GET | /api/auth/get-me |
| Refresh | POST | /api/auth/refresh-token |
| Logout | POST | /api/auth/logout |
| Logout all | POST | /api/auth/logout-all |

The development proxy sends /api to port 3000, so local development does not need backend CORS changes. Production must serve the frontend and /api under the same origin (with SPA fallback for frontend routes), or you must configure CORS/cookies and an API URL explicitly. Vite preview does not supply the development API proxy; use npm run dev for this local integration.

## Authentication flow

Access token stays in module memory, never localStorage. The HttpOnly refresh cookie is managed by the backend/browser. On reload, the app calls refresh-token then get-me. A get-me 401 triggers one refresh and one retry. Concurrent refreshes in one tab share one promise. Redux holds user/session state and typed async thunks. Form-only actions use service functions directly, as in the reference.

Cross-tab refresh coordination is not implemented: simultaneous refreshes in separate tabs can race with the backend's single-use rotation. A tab may need to sign in again. Avoid treating this as a fully production-hardened auth client.

## Backend checks still needed

- database.js must propagate connection errors to server.js.
- verifyEmail must validate string email and a six-digit string OTP.
- Rate limits and per-OTP attempt caps remain backend work before public deployment.
- Resend OTP is deferred: expired codes or failed delivery currently cannot be recovered in the UI.
- Accounts stored with old SHA-256 password hashes need reset/migration before bcrypt login works.

## Validation performed

TypeScript (strict) and Vite production build passed. Axios adapter checks passed for shared concurrent refresh, automatic 401 retry, and session expiration after failed refresh. These are mocked checks, not live backend or email tests.

## Manual integration check

1. Register a fresh account; verify the email arrives and the verification page is prefilled.
2. Submit a wrong OTP, then the real OTP. Verify errors and successful redirect to login.
3. Log in; confirm the dashboard shows the account without a password/hash.
4. Reload the dashboard; confirm cookie-based restoration.
5. Let the access token expire, then refresh profile; confirm automatic refresh/retry.
6. Sign out; confirm /dashboard redirects to login, including after reload.
7. Log in on two browsers; sign out everywhere and confirm the other browser loses access on its next protected request.
8. Stop the backend and reload; confirm the connection-error view and retry action.

## Files

Start reading main.tsx → App.tsx → pages → services → store/slices/authSlice.ts. Custom styles and CSS :root variables are all in src/index.css.
