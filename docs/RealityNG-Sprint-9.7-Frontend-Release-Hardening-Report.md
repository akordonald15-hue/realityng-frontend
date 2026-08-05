# RealityNG Sprint 9.7 - Frontend Release Hardening Report

## Executive Summary

Sprint 9.7 validates the completed services marketplace frontend after Sprint 9.6 governance was merged into `main`. No new marketplace feature was introduced. The frontend work for this sprint is documentation and release-readiness validation against the complete Sprint 9.1-9.6 route surface.

Covered frontend areas:

- public services marketplace
- public provider profile
- quote request modal
- customer services dashboard
- provider/artisan dashboard
- provider profile editor
- portfolio manager
- provider quote requests
- customer/provider review routes
- admin services dashboard
- admin provider moderation
- admin quote/review moderation
- complaints
- appeals
- governance detail pages

## Sprint 9.6 Mainline Closure

- Previous frontend `main`: `664e4782cdae847c1679c9b7f2c02d2d25875800`
- Sprint 9.6 merged commit: `f40fdafeff9cfb1cc5d6d3e67fd55eaf680843b0`
- Merge method: fast-forward
- Push result: pushed to `origin/main`

## Services Routes Validated by Build

Public:

- `/services`
- `/services/providers/[slug]`

Customer:

- `/dashboard/services`
- `/dashboard/services/complaints`
- `/dashboard/services/complaints/[id]`
- `/dashboard/services/reviews`
- `/dashboard/services/bookings/[bookingId]/review`

Provider:

- `/dashboard/artisan`
- `/dashboard/artisan/profile`
- `/dashboard/artisan/portfolio`
- `/dashboard/artisan/quote-requests`
- `/dashboard/artisan/reviews`
- `/dashboard/artisan/complaints`
- `/dashboard/artisan/complaints/[id]`
- `/dashboard/artisan/appeals`
- `/dashboard/artisan/appeals/[id]`

Admin:

- `/admin/services`
- `/admin/services/providers`
- `/admin/services/providers/[id]`
- `/admin/services/quote-requests`
- `/admin/services/reviews`
- `/admin/services/reviews/[id]`
- `/admin/services/complaints`
- `/admin/services/complaints/[id]`
- `/admin/services/appeals`
- `/admin/services/appeals/[id]`

## Functional QA Coverage

Automated tests cover:

- services listing and filtering
- public provider profile rendering
- quote request submission
- dashboard summaries
- provider profile form
- portfolio manager
- review card and review form
- quote requests list
- governance pages
- governance detail pages
- admin verification and admin route wrappers
- assistant and existing property marketplace smoke coverage

Manual browser QA remains required before public beta because this sprint was not deployed and did not run Playwright/browser automation.

## Mock/Real Mode Boundary

The services frontend continues to use the existing API split:

- `NEXT_PUBLIC_USE_MOCKS=true` uses deterministic mock services.
- `NEXT_PUBLIC_USE_MOCKS=false` uses `NEXT_PUBLIC_API_BASE_URL`.

Sprint 9.7 did not add any frontend provider-mode decisions, backend secrets, Anthropic credentials, database URLs, Redis URLs, MinIO credentials, or other server-only values to the frontend.

## Responsive QA Notes

Build and component tests validate route compilation and core interactions. Manual viewport checks should still be completed on:

- `320 x 568`
- `360 x 640`
- `375 x 667`
- `390 x 844`
- `430 x 932`
- `768 x 1024`
- `1024 x 768`
- `1366 x 768`
- `1440 x 900`

High-priority responsive surfaces:

- provider profile editor
- portfolio upload manager
- review forms
- complaint form
- admin moderation tables/lists
- appeal detail pages
- dashboard summary cards
- service provider profile gallery

## Accessibility Notes

Existing components use semantic buttons, labels, cards, section headers, and protected-route wrappers. Areas needing manual assistive-technology verification:

- star rating keyboard behavior
- complaint and appeal detail focus order
- modal focus behavior in quote requests
- upload-control labels
- admin moderation action grouping
- long status badge wrapping on mobile

No high-impact accessibility defect was identified by static validation during this sprint.

## Performance Notes

Production build output keeps the shared first-load JavaScript around `102 kB`, with services routes split by page. New Sprint 9.6 governance detail routes are dynamic and do not block static generation of the rest of the app.

Potential future improvements:

- introduce Playwright smoke coverage for services journeys
- lazy-load heavier admin-only moderation components if route bundles grow
- add frontend query de-duplication checks around dashboard screens
- add image-loading audits for provider portfolio galleries

## Release Follow-Ups

- run browser QA against a preview deployment connected to the staging/live API
- verify admin route protection with real user roles
- verify form error rendering from live backend validation
- verify mock and real API modes in the deployment environment
- confirm no production environment uses `NEXT_PUBLIC_USE_MOCKS=true`

## Jira-Ready Task Breakdown

- Validate services public browse and provider profile routes
- Validate customer quote/review/complaint routes
- Validate provider profile, portfolio, quote, review, complaint, and appeal routes
- Validate admin provider, quote, review, complaint, and appeal moderation routes
- Run responsive QA matrix
- Run accessibility checklist
- Run production build in mock and real modes
- Document release follow-ups

## Release Recommendation

Frontend Sprint 9.7 is ready for PR review and staging/browser QA. Public beta should wait for manual cross-browser and responsive validation on a deployed preview.
