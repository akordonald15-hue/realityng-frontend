# RealityNG Sprint 10 Frontend Inspection Experience

## Routes Added

- `/properties/[slug]/request-inspection`
- `/dashboard/inspections`
- `/dashboard/inspections/[id]`
- `/dashboard/inspector`
- `/dashboard/inspector/assignments`
- `/dashboard/inspector/assignments/[id]`
- `/dashboard/properties/[propertyId]/walkthroughs`
- `/admin/inspections`
- `/admin/inspections/requests`
- `/admin/inspections/walkthroughs`
- `/admin/inspections/reports`
- `/admin/inspections/inspectors`

## Components Added

- `InspectionStatusBadge`
- `InspectionRequestCard`
- `WalkthroughVideoPlayer`
- `InspectionTimeline`
- `EvidenceList`
- `InspectionReportCard`
- `AssignmentCard`
- `WalkthroughModerationCard`

## API Client

`src/lib/api/inspections.ts` mirrors the backend `/api/v1/inspections/` endpoints and preserves mock/real API separation through `NEXT_PUBLIC_USE_MOCKS`.

## Product Behavior

- Public property detail displays only approved walkthrough videos.
- Inspection requests require authentication and preserve the existing protected-action pattern.
- Owner walkthrough uploads remain private until admin approval.
- Inspector report evidence is shown only when the backend authorizes signed access.
- Admin surfaces are wrapped by `ProtectedRoute requireAdmin`.

## Production Notes

- No Google Maps key is required for inspection pages.
- No Anthropic key is exposed or used.
- No heavy media processing runs in the browser.
