# RealityNG Sprint 13 - Communication Experience

## Executive Summary

Sprint 13 completes the frontend communication experience for notifications and messaging. The
existing HTTP notification and message pages remain intact, while authenticated WebSocket hooks now
provide realtime notification and message updates when the backend supports upgrade routing.

The implementation is progressive: if WebSockets are unavailable, users continue to use the
existing HTTP list, send, mark-read, and notification flows.

## Frontend Changes

- Added realtime socket utilities in `src/lib/realtime/socket.ts`.
- Added authenticated WebSocket subprotocol support using the existing stored access token.
- Added notification realtime hook:
  - receives `notification.created`
  - deduplicates notifications by ID
  - updates the notification bell unread count
- Added message realtime hook:
  - receives `message.created`
  - sends `message.send` when connected
  - falls back to HTTP send when disconnected
  - deduplicates messages by ID
  - cleans up sockets and reconnect timers
- Added notification preferences API functions.
- Added `/settings/notifications` for user-controlled notification preferences.
- Linked notification settings from the notification bell and notifications page.
- Added message unread-count API support.

## Security and Privacy

- The frontend does not decide notification provider mode or delivery channels independently.
- Access tokens are sent as WebSocket subprotocols rather than URL query parameters.
- No backend secrets or provider credentials are exposed through frontend environment variables.
- Realtime is limited to authenticated users because socket creation requires a stored access
  token.

## Validation

- `npm.cmd run lint`: passed.
- `npm.cmd run typecheck`: passed.
- Focused API/realtime tests: 3 files, 10 tests passed.

## Production Notes

- The frontend uses `NEXT_PUBLIC_API_BASE_URL` to derive the WebSocket host.
- Production reverse proxy / hosting must support WebSocket upgrade requests to the backend ASGI
  application.
- No new frontend environment variable is required.

## Known Follow-ups

- Browser QA should verify reconnect behavior over the production proxy once WebSocket upgrade
  routing is enabled.
- Additional UI polish can be added later for richer connection-state indicators, but this sprint
  intentionally preserves the current dashboard layout.
