# RealityNG Sprint 9.5 Operational Dashboards

## Executive Summary

Sprint 9.5 turns the services marketplace features from Sprint 9.1 through Sprint 9.4 into polished dashboard experiences. Customers can track service quotes and reviews, providers can manage operational priorities from one page, and admins can monitor services marketplace queues from a dedicated operations dashboard.

This sprint does not add new marketplace workflows.

## Routes

Customer:

- `/dashboard/services`

Provider:

- `/dashboard/artisan`

Admin:

- `/admin/services`

Existing routes remain available:

- `/dashboard/artisan/profile`
- `/dashboard/artisan/portfolio`
- `/dashboard/artisan/quote-requests`
- `/dashboard/artisan/reviews`
- `/dashboard/services/reviews`
- `/dashboard/services/bookings/[bookingId]/review`
- `/admin/services/providers`
- `/admin/services/quote-requests`
- `/admin/services/reviews`

## Components

Shared dashboard components:

- `DashboardStatCard`
- `DashboardStatGrid`
- `DashboardSection`
- `ActivityTimeline`
- `EmptyDashboardState`
- `QuickActionGrid`
- `BreakdownList`

Existing components reused:

- `ProviderCard`
- `QuoteRequestStatusBadge`
- `ReviewCard`
- `ReviewStatusBadge`
- `ProviderStatusBadge`
- `ProviderCompletenessChecklist`
- `ReviewModerationList`

## Customer Dashboard Widgets

- Recent quote requests.
- Latest quote statuses.
- Submitted reviews.
- Eligible reviews waiting.
- Recommended providers.
- Quick actions.
- Recent activity timeline.
- Empty, loading, and error states.

## Provider Dashboard Widgets

- Profile status.
- Profile completion.
- Verification/profile readiness summary.
- Average rating.
- Quote request counts.
- Latest quote requests.
- Latest reviews.
- Response reminders.
- Portfolio count.
- Coverage and trade summary.
- Quick actions.
- Recent activity timeline.

## Admin Dashboard Widgets

- Pending provider approvals.
- Pending reviews.
- Flagged reviews.
- Open quote requests.
- Provider statistics.
- Review and quote status counts.
- Service category breakdown.
- Geographic coverage breakdown.
- Quick moderation shortcuts.
- Recent moderation activity.

## API Client Updates

Added:

- `getCustomerServicesDashboard`
- `getProviderServicesDashboard`
- `getAdminServicesDashboard`

Added response types:

- `CustomerServicesDashboard`
- `ProviderServicesDashboard`
- `AdminServicesDashboard`
- `DashboardStat`
- `DashboardActivityItem`
- `DashboardBreakdownItem`

## Mock Mode

`NEXT_PUBLIC_USE_MOCKS=true` remains supported. Mock dashboard summaries are generated from the existing service marketplace mock providers, quote requests, reviews, and completed booking examples.

## UX Notes

- Dashboards are responsive grid layouts.
- Widgets summarize operational priorities before detailed lists.
- Detailed management routes remain available through quick actions.
- Empty states explain what will appear once marketplace activity exists.
- No new chart library was introduced; simple responsive breakdown bars are used.

## Validation

Focused validation during implementation:

- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run test -- src/components/services/services-dashboard-pages.test.tsx`: passed, 3 tests.

Final full validation and build results are recorded in the Sprint 9.5 closure report.

## Jira-Ready Task Breakdown

- Frontend: add customer services dashboard route.
- Frontend: redesign provider artisan dashboard as an operations center.
- Frontend: add admin services operations dashboard route.
- Frontend: add shared stat, section, activity, quick-action, empty-state, and breakdown components.
- Frontend: extend services API client with dashboard summary calls.
- Frontend: extend mock services with customer/provider/admin dashboard summaries.
- Frontend: add dashboard rendering tests.
- Documentation: create Sprint 9.5 operational dashboard report.

## Future Improvements

- Add richer analytics once more production usage data exists.
- Add notification center integration in the approved notification sprint.
- Add response-rate trends after quote response SLAs are defined.
- Add booking and scheduling dashboards only after the future booking sprint.

## Scope Confirmation

Sprint 9.5 did not implement bookings, payments, messaging improvements, notification delivery, calendar scheduling, featured providers, subscriptions, AI recommendations, inspections, construction workflows, or Sprint 9.6 functionality.

