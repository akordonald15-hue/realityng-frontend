# RealityNG Frontend Handover - v2.6.0

Status: active handover pointer  
Frontend baseline: `db409f06d3b0878d22f41ead537cd9cba3e0d5e4`  
Release tag: `v2.6.0`

## Summary

The RealityNG frontend is complete through Sprint 14.2 and deployed as part of the combined financial release. It includes public property discovery, dashboards, services marketplace, inspection workflows, construction tracking, messaging/realtime UI, transaction tracking, escrow surfaces, and property financing workflows.

The full engineering handover and PRD/product documents are maintained in the backend repository under:

```text
docs/RealityNG-Engineering-Handover-v2.6.0.md
docs/product/
docs/launch-readiness/
```

## Current Frontend Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- TanStack React Query
- Axios
- React Hook Form
- Zod
- Vitest
- Vercel deployment

## Current Important Routes

Public:

- `/`
- `/properties`
- `/properties/[slug]`
- `/services`
- `/services/providers/[slug]`
- legal/trust/help pages

Dashboards:

- `/dashboard`
- `/dashboard/leads`
- `/dashboard/services`
- `/dashboard/artisan`
- `/dashboard/inspections`
- `/dashboard/construction`
- `/dashboard/messages`
- `/dashboard/notifications`
- `/dashboard/transactions`
- `/dashboard/transactions/[id]`
- `/dashboard/transactions/[id]/escrow`
- `/dashboard/transactions/[id]/financing`
- `/dashboard/financing`
- `/dashboard/financing/apply`
- `/dashboard/financing/[id]`

Admin:

- `/admin`
- `/admin/services`
- `/admin/inspections`
- `/admin/construction`
- `/admin/payments`
- `/admin/payments/escrow`
- `/admin/financing`
- `/admin/financing/[id]`

## Environment

Local/prod-like frontend variables:

```env
NEXT_PUBLIC_USE_MOCKS=false
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
NEXT_PUBLIC_SENTRY_DSN=
NEXT_PUBLIC_SENTRY_ENVIRONMENT=local
```

Production must keep:

```env
NEXT_PUBLIC_USE_MOCKS=false
NEXT_PUBLIC_API_BASE_URL=https://api.realityng.com/api/v1
```

Do not put secrets in `NEXT_PUBLIC_*` variables.

## Validation Commands

```powershell
npm install
npm run lint
npm run typecheck
npm run test
$env:NEXT_PUBLIC_USE_MOCKS="true"; npm run build
$env:NEXT_PUBLIC_USE_MOCKS="false"; $env:NEXT_PUBLIC_API_BASE_URL="https://api.realityng.com/api/v1"; npm run build
```

Latest known v2.6.0 validation:

- lint passed;
- typecheck passed;
- `46` frontend test files / `91` tests passed;
- mock build passed;
- real API build passed.

## Immediate Next Work

Do not start new frontend features yet. The next work is Sprint 15 launch readiness:

- browser QA;
- responsive/mobile QA;
- persona E2E journeys;
- frontend security and route-protection review;
- private document UI audit;
- financial wording audit;
- no mock/demo leakage in production;
- production content and placeholder audit.

