# ADR-025: Frontend User Profiles Module Architecture

## Status
Accepted

## Context
The blog platform backend exposes two distinct profile-related endpoint spaces:
1. **Public Profiles**: `GET /api/users/{username}/profile/` returning non-sensitive public details (`username`, `bio`, `website`, `location`) serialized via `PublicProfileSerializer`.
2. **Authenticated Profiles**: `GET /api/profile/` and `PATCH /api/profile/` returning and updating the authenticated user's private profile details (`username`, `email`, `bio`, `website`, `location`, `date_of_birth`) serialized via `ProfileSerializer` and `ProfileUpdateSerializer`.

The frontend needed a cohesive, production-grade Profiles module providing:
- Public profile viewing for authors and content creators (`/users/:username`).
- Self-profile viewing and editing for authenticated users (`/profile`).
- Client-side usability validation alongside backend authoritative validation.
- Safe link rendering for website URLs, preventing malicious schemes (`javascript:`, `data:`, `file:`).
- Deterministic visual avatar representation without introducing unsupported backend APIs (since backend profile models lack file upload / avatar fields).
- Strict IDOR resistance (profile updates operate strictly against `/api/profile/` on the current session without taking user IDs or usernames).

## Decision

1. **Feature Module Structure**:
   All profile logic is contained in `frontend/src/features/profiles/`:
   - `api/profilesApi.js`: Centralized Axios API abstraction supporting `AbortSignal` cancellation.
   - `components/`: Modular presentation components including `ProfileAvatarPlaceholder`, `ProfileDetails`, `ProfileEditForm`, `ProfileField`, `ProfileRequestError`, and `ProfileSkeleton`.
   - `pages/`: Route handlers `PublicProfilePage` and `MyProfilePage`.
   - `utils/`: Tested utilities `getProfileInitials`, `getSafeProfileUrl`, `getChangedProfileFields`, `validateProfileForm`, and `normalizeProfileError`.

2. **Public vs. Private Privacy Boundary**:
   - `PublicProfilePage` fetches from `/api/users/:username/profile/` and only renders public fields (`username`, `bio`, `website`, `location`). Private attributes (`email`, `date_of_birth`) are neither requested nor displayed.
   - `MyProfilePage` fetches from `/api/profile/` and renders both identity (`username`, `email`) and editable profile attributes (`bio`, `website`, `location`, `date_of_birth`).

3. **IDOR Resistance and Writable Field Allowlisting**:
   - Profile updates send `PATCH` requests strictly to `/api/profile/`.
   - `getChangedProfileFields` filters form fields against an explicit allowlist: `['bio', 'website', 'location', 'date_of_birth']`. Read-only identity fields (`username`, `email`, `id`, `roles`) are ignored and excluded from update payloads.
   - Unchanged forms do not send network requests.

4. **Deterministic Initials-Based Avatar Placeholder**:
   - The backend `Profile` model has no `avatar` or image file upload field.
   - We implement `ProfileAvatarPlaceholder`, generating 1–2 clean uppercase initials from usernames or names, styled with accessible high-contrast gradient badges.

5. **Plain-Text Rendering & Safe Link Sanitization**:
   - Biography text is rendered strictly as plain text using safe CSS (`whitespace-pre-line`). `dangerouslySetInnerHTML` is forbidden.
   - Website links are validated via `getSafeProfileUrl()`. Only absolute `http://` and `https://` URLs are rendered as `<a>` tags with `target="_blank" rel="noopener noreferrer"`. Invalid or dangerous schemes (`javascript:`, `data:`) are not rendered as links.

6. **Request Cancellation and Stale-Response Protection**:
   - API calls accept an `AbortSignal` and trigger `controller.abort()` on unmount or route parameter changes.
   - Pages track `requestKey` (e.g., `${username}:${retryKey}`) to prevent race conditions from updating state after route transitions.

## Consequences

### Positive
- Fully maintains backend security authority and privacy boundaries.
- Resists IDOR and injection attacks.
- Enhances user experience with accessible loading skeletons, retry controls, and instant field validation feedback.
- Keeps component architecture modular and easy to test.

### Negative
- Users cannot upload custom avatar images until a backend avatar upload domain feature is implemented.
