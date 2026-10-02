# RealityNG Sprint E6 — Admin and Operations Audit

## Route classification

All current custom staff routes are engineer-designed/internal operational surfaces. No dedicated admin Figma source exists.

| Area | Routes | E6 disposition |
| --- | --- | --- |
| Overview | `/admin` | Shared operations shell, explicit loading/error state |
| Verification | `/admin/verifications` | Paginated business/property queues; decision confirmation retained |
| Inspections | `/admin/inspections`, `/requests`, `/walkthroughs`, `/reports`, `/inspectors` | Shared navigation; paginated review queues; accessible filters/errors |
| Provider moderation | `/admin/services` plus providers, reviews, complaints, appeals and quote requests | Shared navigation; page-one truncation removed from supported paginated queues |
| Payments | `/admin/payments`, `/admin/payments/escrow` | Light-surface contrast and keyboard focus corrected |
| Financing | `/admin/financing`, `/admin/financing/[id]` | Financial values/status remain prominent; error contrast corrected |
| Construction | `/admin/construction` | Shared navigation and accessible failure state |

## Boundaries and remaining product debt

- There is no custom user-management, role-approval, property-listing moderation, audit-log, applications, viewings, or leads admin route in this frontend. Staff dependency on Django Admin or backend operations must be documented before beta; E6 does not invent unsupported APIs.
- Financing and escrow API adapters flatten paginated backend responses to arrays. They render the returned collection safely but cannot expose server pagination without a contract change.
- The inspector directory adapter also flattens its paginated response and therefore has no page controls.
- Admin inspection dashboard links to request detail URLs for which no custom frontend route exists. This is a beta operational gap and must be resolved by adding the supported detail contract or removing the deep link.
- Verification decisions currently collect operational notes through native prompts. The action is functional and keyboard accessible, but a structured, validated review dialog with visible consequences remains E7/product debt.
- No bulk moderation actions are implemented. This is post-beta unless queue volume demonstrates an operational need.

## E6 design decisions

- A single protected admin layout now supplies role identity, global navigation, active section state, a compact horizontal mobile navigation region, and the approved canvas/surface rhythm.
- Native semantic links, buttons, navigation landmarks, status text, and named filter/pagination controls are retained. No heavy data-grid dependency was added.
- High-impact verification, complaint, and appeal state changes require an explicit confirmation or reason.
- Private document URLs, role/capability checks, API paths, financial contracts, and signed-URL behavior are unchanged.
