# RealityNG Sprint 9.6 - Governance and Moderation Frontend Report

## Executive Summary

Sprint 9.6 adds services marketplace governance screens for customers, providers, and admins. It introduces complaint submission/tracking, provider complaint visibility, suspension warnings, appeal submission, and admin moderation queues while preserving Sprint 9.1-9.5 public marketplace, provider profiles, portfolio, quote requests, reviews, operational dashboards, maps fallback, and assistant behavior.

## Frontend Routes

Customer:

- `/dashboard/services/complaints`
- `/dashboard/services/complaints/[id]`

Provider:

- `/dashboard/artisan/complaints`
- `/dashboard/artisan/complaints/[id]`
- `/dashboard/artisan/appeals`
- `/dashboard/artisan/appeals/[id]`

Admin:

- `/admin/services/complaints`
- `/admin/services/complaints/[id]`
- `/admin/services/appeals`
- `/admin/services/appeals/[id]`

Updated:

- `/dashboard/services`
- `/dashboard/artisan`
- `/admin/services`

## Components

Added:

- `ComplaintStatusBadge`
- `ComplaintCard`
- `SuspensionBanner`
- `AppealForm`
- `AppealList`
- `ComplaintDetail`
- `AppealDetail`

These live in `src/components/services/governance-widgets.tsx` and `src/components/services/governance-detail.tsx`, and reuse the existing RealityNG card, button, section-header, and dashboard visual patterns.

## API Client

Added typed API functions for:

- customer complaints
- provider complaints
- provider appeals
- admin complaints
- admin appeals
- admin provider warnings

All functions preserve the existing `NEXT_PUBLIC_USE_MOCKS` split. Real mode calls `/api/v1/services/...`; mock mode uses deterministic local data.

## UX Workflow

Customers can submit a complaint by providing a provider ID, category, subject, and description. Providers can view complaints tied to their profile and submit warning/suspension appeals. Admins can review complaint queues and appeal queues from services moderation pages.

Suspended providers see a prominent governance banner on the artisan dashboard with reason, suspension type, and expiry when available.

Complaint and appeal list items link to dedicated detail pages so customers, providers, and admins can inspect the moderation timeline, evidence captions, and decision state without exposing private backend-only fields.

## Security and Privacy

The frontend does not expose private moderation notes publicly. Admin routes remain wrapped with `ProtectedRoute requireAdmin`. Provider and customer pages depend on backend object-level permissions and do not assume visibility from client state.

## Mock Mode

Mock services now support:

- complaint listing and submission
- provider complaint listing
- appeal listing and submission
- admin complaint moderation
- admin appeal moderation
- admin provider warnings

## Tests

Added:

- `src/components/services/governance-pages.test.tsx`

Coverage includes:

- customer complaint form rendering/submission
- provider complaint and appeal surfaces
- admin complaint and appeal queues
- customer, provider, and admin governance detail pages

## Jira Breakdown

Suggested Jira tasks:

- Add customer complaint submission route
- Add provider complaint tracking route
- Add provider appeal submission route
- Add admin complaint moderation queue
- Add admin appeal moderation queue
- Add complaint and appeal detail routes
- Add suspension banner to provider dashboard
- Extend services API client for governance endpoints
- Extend mock services for governance mode
- Add governance route tests
- Update Sprint 9.6 documentation

## Known Limitations

- Complaint evidence upload UI is not yet exposed, though the backend endpoint exists.
- Detail pages can be expanded later for inline evidence upload and richer moderation history.
- Notification delivery is deferred.
- Real-time messaging is deferred.

## Sprint 9.7 Readiness

The frontend is ready for Sprint 9.7 work around deeper moderation reporting, governance analytics, or notification surfaces without redesigning the current governance routes.
