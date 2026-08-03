# RealityNG Sprint 9.2 Provider Profiles, Portfolio and Service Areas

## Executive Summary

Sprint 9.2 adds the authenticated provider-management experience for the verified services marketplace. Artisans and eligible providers can create and manage a profile, select trades, define service areas, upload portfolio samples, and submit for moderation. Admins can review, approve, reject, request more information, suspend, or reactivate provider profiles.

## Frontend Routes

Provider:

```text
/dashboard/artisan
/dashboard/artisan/profile
/dashboard/artisan/portfolio
```

Admin:

```text
/admin/services/providers
/admin/services/providers/[id]
```

Public:

```text
/services/providers/[slug]
```

The public provider detail page now renders approved portfolio images when available and keeps Request Quote disabled as a future Sprint 9 phase.

## Components Added

- `ProviderStatusBadge`
- `ProviderCompletenessChecklist`
- `ArtisanProfileForm`
- `PortfolioManager`
- `AdminProviderDecisionForm`

## API Client Updates

The services API client now supports:

- Provider profile create/get/update/submit/deactivate.
- Provider trade CRUD.
- Service-area CRUD.
- Portfolio upload, metadata update, delete, cover selection, and reorder.
- Admin provider list/detail/moderation actions.

Mock mode mirrors the same API surface while remaining isolated from real mode.

## UX Rules

- Draft profiles are private.
- Pending review profiles show status and cannot be public.
- Needs-more-information and rejected profiles guide the provider back to editing.
- Active profiles can link to the public provider page.
- Suspended profiles show status and must use support/admin resolution.
- Admin moderation uses form controls, not browser prompts.

## Security and Privacy

- Frontend does not render private verification documents or internal moderation notes publicly.
- Private addresses remain owner/admin-only.
- Public profile renders only public-safe service areas, trades, badges, and portfolio data.
- Quote, booking, review, payment, complaint, and portfolio-management-for-other-users flows were not added.

## Testing

Focused frontend validation:

```text
3 test files passed
6 tests passed
```

Validation commands run during implementation:

```text
npm run lint
npm run typecheck
npm run test -- --run src/components/services/artisan-profile-form.test.tsx src/components/services/portfolio-manager.test.tsx src/app/(public)/services/providers/[slug]/service-provider-profile-page.test.tsx
```

## Known Limitations

- Service-area editing uses textual Nigerian location inputs and does not depend on Google Maps.
- Portfolio reorder is supported by the API client and mock service, but the first UI pass focuses on upload, cover selection, and delete.
- Request Quote remains a non-functional placeholder for Sprint 9.3.

## Sprint 9.3 Readiness

The UI now has active approved public providers, portfolio galleries, profile status, and moderation foundations. Sprint 9.3 can introduce quote requests without reworking the profile lifecycle.
