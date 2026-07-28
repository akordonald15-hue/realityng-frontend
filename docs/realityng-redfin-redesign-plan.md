# RealityNG Frontend Redesign Planning Report

Status: Planning only  
Scope: Frontend redesign strategy, IA, UX, dependencies, sprint plan  
Reference: RealityNG v2.0.0 frontend, RealityNG product strategy PDF, Redfin public website benchmark  
Constraint: No code changes, no implementation branch, no deployment, no tag changes

## 1. Executive Summary

RealityNG v2.0.0 is a working marketplace frontend connected to the live backend. It includes public property browsing, property details, authentication, favorites, inquiries, viewing requests, rental applications, verification workflows, admin verification review, dashboards, and a guided demo assistant.

The principal frontend problem is not missing functionality. The issue is product presentation and marketplace usability. The current experience still reads partly like a branded product launch page and partly like an internal workflow tool. It does not yet feel like a mature search-first property marketplace. Navigation is still company-oriented in places, search is not dominant enough, property cards do not surface enough trust and cost detail, and verification is present but not yet communicated with the clarity needed for a Nigerian trust-first marketplace.

The redesign goal is to keep all working v2.0.0 functionality while reshaping the frontend around a Redfin-inspired marketplace structure:

- Search-first homepage.
- Task-based navigation.
- Browsing before account creation.
- Rich property cards.
- Clear verification explanation.
- Nigerian location and property realities.
- Strong mobile discovery.
- Account prompts tied to meaningful value actions.

The recommended approach is incremental. Start with the shell, navigation, design tokens, and route audit, then move through homepage, search/results, property details, account gating, dashboards, trust pages, SEO, performance, and release hardening.

Highest-risk areas:

- Breaking working Sprint 6 verification and Sprint 7 assistant flows.
- Designing UI for data the backend does not yet provide.
- Over-copying Redfin instead of adapting it for Nigeria.
- Introducing mobile regressions.
- Making unsupported verification or legal claims.

Final recommendation: proceed with a phased redesign beginning with the responsive shell and design-system alignment.

## 2. Repository Audit

### Stack

- Framework: Next.js App Router, Next.js 15.
- Language: TypeScript.
- Runtime UI: React 19.
- Styling: Tailwind CSS.
- Data fetching: TanStack Query.
- API client: Axios.
- Forms: React Hook Form and Zod.
- Tests: Vitest, React Testing Library, jsdom.
- Formatting and linting: Prettier, ESLint.
- Deployment target: Vercel production frontend.
- API target: `https://api.realityng.com/api/v1`.
- Mock mode: controlled by `NEXT_PUBLIC_USE_MOCKS`.

### Routing System

Routes are implemented with the Next.js App Router under `src/app`.

Route groups:

- `(public)` for marketplace browsing.
- `(auth)` for authentication screens.
- `(dashboard)` for protected user workflows.
- `admin` for admin workflows.

### State and Data

- Server state is handled through TanStack Query.
- Auth state is handled in `AuthProvider`.
- Tokens are stored client-side and attached to Axios requests.
- Demo/mock mode switches service behavior through `NEXT_PUBLIC_USE_MOCKS`.
- Assistant provider mode is fetched from the backend and should not be decided by the frontend.

### API Structure

API modules live under `src/lib/api`.

Current modules include:

- `auth`
- `properties`
- `inquiries`
- `viewings`
- `applications`
- `dashboard`
- `workflow`
- `verification`
- `property-verification`
- `admin-verification`
- `assistant`
- `health`

The API client:

- Uses `NEXT_PUBLIC_API_BASE_URL`.
- Sends JSON requests.
- Sends `X-Request-ID`.
- Uses `withCredentials`.
- Adds bearer token when available.
- Attempts refresh token flow on authentication failure.

### Environment Variables

Frontend-safe variables:

- `NEXT_PUBLIC_USE_MOCKS`
- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_SITE_URL`
- Sentry public variables where configured.

Secrets must never be exposed through `NEXT_PUBLIC_`.

### Design System

Current theme is dark and brand-heavy:

- Primary: `#0F3D2E`
- Secondary: `#D4A017`
- Background: `#081C15`
- Surface: `#11241D`
- Text: `#FFFFFF`
- Muted text: `#C8C8C8`

Fonts:

- Headings: Playfair Display.
- Body: Inter.

Reusable components exist, but several pages still use page-specific composition and dense custom layouts.

### Image Handling

- Next Image is used.
- Unsplash domains are allowed.
- Production property media and backend media host support should be reviewed before redesign implementation.
- Current homepage uses external real estate slideshow imagery.

### SEO

Current SEO is basic:

- Root metadata exists.
- Manifest exists.
- Open Graph image exists.
- No confirmed route-specific metadata strategy.
- No confirmed `robots.ts` or `sitemap.ts`.
- Production metadata base must be set explicitly to avoid preview-domain social URLs.

### Loading, Error and Empty States

Existing loading and empty states are present on several routes, especially dashboard and listing flows. They are functional but not yet standardized across the whole product.

### Accessibility

The app uses semantic controls in many places, shared buttons, labels, and some accessible modal behavior. Full keyboard and responsive audits are still required, especially for the assistant, mobile nav, filters, upload controls, and admin review flows.

### Testing

Current testing setup supports:

- Unit/component tests.
- Auth flow tests.
- Property tests.
- Dashboard tests.
- Admin verification tests.
- Assistant widget tests.

The redesign should add route smoke tests, responsive interaction tests, and accessibility-focused checks.

## 3. Route Inventory

| Route | Page purpose | User type | Current state | Main weakness | Recommended change | Dependency | Priority |
|---|---|---|---|---|---|---|---|
| `/` | Homepage and discovery | Public | Working, branded hero, search, categories, featured listings, stats, artisans, CTA | Not search-first enough; company/brand duplication; mock stats risk | Redesign around search-first marketplace value and verified inventory | Frontend plus existing API | P0 |
| `/properties` | Property search/results | Public | Working filters and grid | Limited Nigerian filters, no map/list option, weak URL persistence and pagination controls | Create Redfin-style results hierarchy adapted for Nigeria | Existing API plus API extensions | P0 |
| `/properties/[slug]` | Property detail | Public | Working gallery, facts, inquiry, viewing, application | Missing full cost, verification report, representative trust, freshness, fraud reporting | Rebuild detail hierarchy around trust and conversion | API extensions for richer data | P0 |
| `/auth/sign-in` | Login | Public | Working | Could better preserve action intent and explain value | Keep, improve intent return and messaging | Frontend | P1 |
| `/auth/sign-up` | Registration | Public | Working | Registration follows role query but could be more value-based | Keep, integrate with action prompts and role-specific copy | Frontend | P1 |
| `/auth/forgot-password` | Password reset request | Public | Present | Needs consistent design shell | Align visual system | Frontend | P2 |
| `/auth/reset-password` | Password reset | Public | Present | Needs consistent design shell | Align visual system | Frontend | P2 |
| `/onboarding/role-setup` | Role setup | Authenticated | Working | Separate from marketplace intent | Preserve but connect to post-auth return flow | Frontend plus auth flow | P1 |
| `/dashboard` | Transaction dashboard | Authenticated | Working multi-role dashboard | Dense, monolithic, not segmented by user goal | Split into clearer role-based transaction center | Existing API plus possible dashboard API refinements | P1 |
| `/properties/new` | Create listing | Authenticated owner/agent | Working | Wizard may not align with new IA and trust flow | Keep functionality, redesign as listing workflow | Frontend | P2 |
| `/saved-properties` | Saved properties | Authenticated | Working | Needs stronger save-search/alert relationship | Redesign with saved searches and alerts later | Existing API plus API extensions | P2 |
| `/apply/[propertyId]` | Rental application | Authenticated | Working | Needs clearer link from viewing/detail stage | Keep, refine conversion flow | Existing API | P1 |
| `/verification` | Verification center | Authenticated | Working | Needs clearer trust hierarchy and public explanation | Redesign as role-specific trust center | Existing API | P1 |
| `/verification/new` | User/professional verification | Authenticated | Working | Long form and unclear public benefit | Improve steps, copy, evidence guidance | Existing API | P1 |
| `/verification/property/[propertyId]/new` | Property verification | Owner/agent | Working | Needs stronger evidence and privacy cues | Improve upload UX and signed document trust copy | Existing API | P1 |
| `/admin` | Admin dashboard | Admin | Working | Operational view needs cleaner queue-first design | Keep functionality, improve layout | Existing API | P2 |
| `/admin/verifications` | Admin verification review | Admin | Working | Prompt-based notes and compact review UI | Replace prompt flows with proper review modals | Frontend | P1 |
| `/settings/profile` | Profile settings | Authenticated | Working | Needs role/account trust connection | Align with verification and representative profile | Existing API | P2 |
| Assistant widget | Guided assistant | Public/auth depending page | Working demo mode through backend | Must stay clearly limited in demo mode | Keep, improve contextual entry points | Existing API | P1 |
| Mobile navigation | Navigation shell | All | Working | Mobile logo/tagline behavior needs adjustment; IA not task-first | Compact logo only, task-first menu | Frontend | P0 |
| Footer | Company/trust navigation | All | Working but light | Missing complete trust/legal/footer IA | Expand footer with trust, help, company, legal | Content plus frontend | P1 |

## 4. Current UX Assessment

### Strengths

- Core marketplace workflows are already available.
- Verification, admin review, and assistant foundations exist.
- The frontend is connected to the real backend.
- Shared UI components exist.
- The brand palette is recognizable.
- Demo/mock boundaries are already part of the architecture.
- Property browsing does not require authentication.
- Important actions can be gated behind account creation.
- The app already has dashboards for buyer, owner/agent, and admin workflows.

### Weaknesses

- Homepage is not yet search-first enough for a marketplace.
- Navigation is partly company-oriented instead of task-oriented.
- Current desktop and mobile logo behavior does not fully match the latest direction.
- Property cards do not explain trust, freshness, fees, or representative accountability strongly enough.
- Property detail page does not yet answer all buyer confidence questions.
- Verification is implemented but not yet explained with public clarity.
- Nigerian location hierarchy is underdeveloped.
- Filters are limited compared with the target product strategy.
- Some stats and content may read as placeholder or unsupported.
- Admin verification UI needs a more professional review pattern.
- SEO strategy is incomplete.
- Mobile filter and search behavior needs redesign.

### Reusable Components

- `BrandLogo`
- `Navbar` as a starting point
- `Footer` as a starting point
- `Button`
- `Input`
- `Select`
- `Badge`
- `Card`
- `SectionHeader`
- `PropertyCard` as a structural base
- `FavoriteButton`
- `CompareButton`
- `ShowInterestButton`
- `ViewingRequestButton`
- `RoleSelectionModal`
- `ProtectedActionLink`
- `AssistantWidget`
- `VerificationStatusBadge`
- `WorkflowStatusBadge`

### Components Needing Redesign

- Navbar and mobile menu.
- Homepage hero and search module.
- Property filter panel.
- Property card.
- Property detail action area.
- Property detail verification section.
- Dashboard shell.
- Admin verification review actions.
- Footer.
- Account prompt and intent-preservation flow.

### Components to Retire or De-emphasize

- Full-screen branded splash if it delays first useful content.
- Company-first homepage messaging blocks above search.
- Unsupported or contradictory statistics.
- Prompt-based admin review notes.
- Repeated brand name in both navbar and hero.
- Any mock-only content visible when real mode is active.

### Placeholder or Mock Content to Remove or Replace

- Hard-coded marketplace statistics unless sourced from backend analytics.
- Generic unsupported claims about verified listing counts.
- Any remaining mock dashboard data in real mode.
- Generic foreign-looking property imagery where it weakens Nigerian authenticity.
- Public verification claims that do not state scope, date, source, and limitation.

## 5. Redfin Adaptation Matrix

| Redfin pattern | Why it works | RealityNG equivalent | Required adaptation | Dependency | Priority |
|---|---|---|---|---|---|
| Search-first homepage | Users immediately know how to start | Search Nigerian properties by goal and location | Use state, city/LGA, area, estate, landmark instead of ZIP/school | Frontend plus existing API | P0 |
| Task-based nav | Reduces decision friction | Buy, Rent, Shortlets, Land, Commercial, List Property | Include Nigerian property goals and trust links | Frontend | P0 |
| Desktop logo with secondary line | Adds brand context without crowding nav | RealityNG logo plus "Where Dreams Find an Address" | Hide tagline on mobile | Frontend | P0 |
| Browse before sign-in | Gives value before asking for account | Public search, filters, property details, verification report | Gate only saved/search/action workflows | Frontend | P0 |
| Search tabs | Makes user intent explicit | Buy, Rent, Shortlets, Sharing, Land, Commercial | Match backend listing types and property types | API extension for sharing/shortlet nuance | P0 |
| Save search | Creates account value at the right moment | Save Nigerian search and alert | Backend saved-search/alert support required | Requires API | P1 |
| Rich cards | Helps scanning and comparison | Price, facts, location, trust, freshness, representative | Need verification and freshness fields | API extension | P0 |
| Result count and sort | Gives search confidence | Count and sort by relevance, newest, price | Backend ordering support may need expansion | Existing API plus extensions | P1 |
| Mobile filter drawer | Keeps mobile results usable | Bottom sheet filters | Nigerian filters can be long, needs progressive disclosure | Frontend | P0 |
| Property detail hierarchy | Answers buying/renting questions | Media, price, facts, cost, trust, representative, actions | Add Nigerian cost and verification sections | API extensions | P0 |
| Account prompts tied to saves | High conversion without early pressure | Prompt on save, alert, viewing, inquiry, application | Preserve intent after auth | Frontend | P0 |
| Location pages and guides | SEO and discovery | Lagos, Abuja, Uyo, Lekki guides | Content required | Content plus frontend | P2 |
| Agent/professional pages | Builds marketplace trust | Verified agent, landlord, artisan profiles | Public representative profiles needed | API extension | P2 |
| Market trends | Adds confidence and SEO | Area-level local intelligence | Requires reliable data | Future | P3 |
| Schools and ZIP search | US-specific | Not a direct fit | Replace with landmarks, estates, LGAs, road access | Requires location data | P2 |
| Mortgage-first nav | US-specific | Not launch priority | Defer until finance/payment partnerships | Future decision | P3 |
| Automated valuations | Useful in mature datasets | Not reliable yet | Do not implement until enough verified data exists | Leadership/data decision | P3 |

## 6. Product Strategy Alignment

### Already Implemented

- Public property browsing.
- Property detail pages.
- Authentication and role setup.
- Favorites.
- Inquiries.
- Viewing requests.
- Rental applications.
- User and property verification backend/frontend foundation.
- Admin verification review foundation.
- Guided assistant foundation.
- Real backend integration.
- Value-gated actions in many places.

### Partially Implemented

- Search-first homepage.
- Task-based navigation.
- Property verification display.
- Agent/landlord accountability.
- Dashboard transaction center.
- Nigerian property categories.
- Mobile responsiveness.
- Assistant as guidance layer.
- Footer trust/company navigation.

### Not Implemented

- Saved searches.
- Search alerts.
- Full verification public report.
- Listing freshness and availability confirmation.
- Full cost breakdown.
- Representative public profiles.
- City/area SEO pages.
- Structured data per listing.
- Listing history.
- Fraud reporting.
- Approximate location disclosure.
- Map/list split view.

### Blocked by Backend or Data

- Nigerian location hierarchy.
- Land-specific title/survey fields.
- Verification dimensions by source and expiry.
- Major fees and total-cost breakdown.
- Saved searches and alerts.
- Listing history.
- Representative public profiles.
- Stale listing expiry.
- City/area market insights.

### Needs Leadership Decision

- How much exact location to reveal publicly.
- Verification wording and legal disclaimer.
- Whether WhatsApp is a primary CTA.
- Whether artisans remain visible in public nav before marketplace maturity.
- Sponsored listing rules and trust separation.
- Public display rules for rejected, expired, or suspended verification.

## 7. Target Information Architecture

### Desktop Public Navigation

Primary:

- Logo with tagline.
- Buy.
- Rent.
- Shortlets.
- Land.
- Commercial.
- List a Property.
- Saved.
- Sign In.
- More.

More menu:

- About RealityNG.
- How Verification Works.
- Verification Standards.
- Diaspora Services.
- Property Management.
- Artisans.
- Safety.
- Help.
- Contact.

### Tablet Navigation

- Logo with tagline when space allows.
- Buy, Rent, Shortlets, Land.
- More.
- Saved icon.
- Sign In.

### Mobile Navigation

- Compact RealityNG logo only.
- Search icon.
- Saved icon.
- Menu button.

Mobile menu:

- Buy.
- Rent.
- Shortlets.
- Land.
- Commercial.
- List a Property.
- Saved Properties.
- Sign In or account menu.
- Verification.
- Help.

### Authenticated Navigation

Primary marketplace nav remains available. Account menu should contain:

- Dashboard.
- Saved Properties.
- Saved Searches when implemented.
- Verification.
- Profile.
- Logout.

### Role-Based Dashboard Navigation

Buyer/renter:

- Overview.
- Saved Properties.
- Saved Searches.
- Inquiries.
- Viewings.
- Applications.
- Verification.
- Assistant History.

Landlord/agent:

- Overview.
- Listings.
- Drafts.
- Inquiries.
- Viewings.
- Applications.
- Verification.
- Performance.

Admin:

- Overview.
- Verification Queue.
- Listing Moderation.
- Users.
- Reports.
- Audit Logs.
- Platform Metrics.

### Current Navigation Changes

- Keep: Logo, Saved, Sign In, account menu.
- Promote: Buy, Rent, Shortlets, Land, Commercial.
- Move to More/footer: About, Products, Artisans, Verification Standards, Help.
- Move to dashboard: Profile management, listing inventory, user-specific workflows.
- Remove from public primary nav: company-first "Overview" and "Who we are" as top-level links.

## 8. Homepage Blueprint

### 1. Responsive Header

Purpose: Immediate marketplace navigation and brand trust.

Desktop:

- Left: RealityNG logo with slogan beneath.
- Center/right: task navigation.
- Far right: Saved, Sign In/account.

Mobile:

- Compact logo only.
- Search and menu controls.

Data: none.

Accessibility:

- Semantic `nav`.
- Current page state.
- Keyboard accessible menu.

Analytics:

- `nav_click`
- `mobile_menu_open`

### 2. Search-First Hero

Purpose: Let users immediately search for property.

Content:

- Headline: practical marketplace value, not duplicate branding.
- Search tabs: Buy, Rent, Shortlets, Apartment Share, Land, Commercial.
- Search input: city, area, estate, landmark.
- Optional quick chips: Lagos, Abuja, Uyo, Lekki, Port Harcourt.

Desktop:

- Large search panel near top.
- Background image should support, not overpower, search.

Mobile:

- Search field first.
- Tabs scroll or collapse cleanly.

API:

- Existing properties endpoint supports search, city, property type, listing type, price.
- Additional location hierarchy needs backend support.

Empty state:

- Show popular areas and categories.

Loading:

- Search suggestions skeleton.

CTA:

- Search.

Analytics:

- `homepage_search_submitted`
- `search_tab_changed`

### 3. Featured Verified Properties

Purpose: Show real inventory and trust.

Content:

- Verified or approved listings only.
- Card should state verification scope.

API:

- Existing public property endpoint can provide approved listings.
- Full verification dimensions may require backend extension.

CTA:

- View all verified listings.

### 4. Browse by Property Goal

Purpose: Help users who do not know what to type.

Categories:

- Hotels and shortlets.
- Apartment sharing.
- Apartments.
- Family homes.
- Land.
- Commercial properties.

Dependency:

- Apartment share needs consistent listing/category support across backend and frontend.

### 5. Browse by City or Area

Purpose: Nigerian discovery and SEO.

Cities:

- Lagos.
- Abuja.
- Port Harcourt.
- Uyo.
- Enugu.
- Ibadan.

Future:

- Area pages for Lekki, Victoria Island, Maitama, Wuse, GRA, etc.

### 6. Verification Explanation

Purpose: Explain what trust means without overclaiming.

Content:

- Identity checked.
- Company/CAC where applicable.
- Property evidence reviewed.
- Availability last confirmed.
- Verification limitations.

Dependency:

- Leadership-approved wording and legal review.

### 7. Trusted Professionals

Purpose: Introduce verified agents/landlords/artisans carefully.

Content:

- Verified representative profiles.
- Clear distinction between professionals and property verification.

Dependency:

- Public representative profile API.

### 8. Diaspora Support

Purpose: Differentiate RealityNG for diaspora users.

Content:

- Guided discovery.
- Verification.
- Viewing workflow.
- Remote decision support.

Avoid:

- Claims about legal or monitoring services not implemented.

### 9. Guides and Local Intelligence

Purpose: SEO and user education.

Content:

- How to rent in Lagos.
- How property verification works.
- Apartment sharing in Nigeria.
- Shortlet safety checklist.

Dependency:

- Content production.

### 10. Value-Based Account Section

Purpose: Ask for signup after value is clear.

CTA:

- Save your shortlist.
- Get alerts.
- Track viewings and applications.

Do not:

- Block browsing.

### 11. Complete Footer

Purpose: Trust, legal, company, help, SEO.

Sections:

- Explore.
- Property types.
- Verification and safety.
- Company.
- Help.
- Legal.

## 9. Search and Results Blueprint

### Initial Search Entry

Homepage search should write query parameters and navigate to `/properties`.

Recommended query parameters:

- `intent=buy|rent|shortlet|share|land|commercial`
- `state=`
- `city=`
- `lga=`
- `area=`
- `landmark=`
- `property_type=`
- `listing_type=`
- `price_min=`
- `price_max=`
- `bedrooms_min=`
- `bathrooms_min=`
- `verified=`
- `sort=`
- `page=`

### Nigerian Location Model

Target hierarchy:

- Country.
- State.
- City or LGA.
- Area.
- Estate.
- Landmark.
- Approximate location.

Current backend support:

- Country, state, city, address fields exist.
- Public filters currently support city, property type, listing type, and price range.

Required backend extensions:

- LGA.
- Area.
- Estate.
- Landmark.
- Approximate coordinates or location disclosure flag.

### Filters

Current supported or partially supported:

- City.
- Property type.
- Listing type.
- Price range.
- Ordering.
- Search by title.

Target filters:

- Buy, rent, shortlet, sharing.
- State.
- City or LGA.
- Area, estate, landmark.
- Property type.
- Price.
- Payment period.
- Bedrooms.
- Bathrooms.
- Furnished.
- Serviced.
- Power.
- Water.
- Security.
- Parking.
- Road access.
- Flood information.
- Verification level.
- Listing age.
- Owner, agent, or company.
- Land-specific filters.

### Results Layout

Desktop:

- Top search bar.
- Filter row.
- Result count and sort.
- Optional map/list split when supported.
- Card grid or list toggle.

Mobile:

- Sticky search bar.
- Filter bottom sheet.
- Sort bottom sheet.
- Save search prompt after results.

### Zero-Result Recovery

Show:

- Nearby areas.
- Remove filters.
- Lower price floor or increase price range.
- Browse city.
- Create alert when supported.

### State Preservation

- Persist search in URL.
- Preserve scroll and filters when returning from property detail.

## 10. Property Card Specification

### Required Fields

- Responsive image.
- Price and payment period.
- Title.
- Property type.
- Listing type.
- Location.
- Bedrooms and bathrooms.
- Land size or floor area.
- Key facts.
- Verification status.
- Last availability confirmation.
- Representative name and type.
- Identity/CAC status where available.
- Major fees where available.
- Save action.
- Image count.
- Sponsored status.
- Listing freshness.

### Variants

Desktop grid:

- Image top.
- Price and facts prominent.
- Trust row visible.

Desktop list:

- Image left.
- Details right.
- Actions aligned.

Mobile:

- Full-width image.
- Price and title immediately below.
- Trust and freshness compact.

Skeleton:

- Fixed image ratio.
- Placeholder lines for price, title, facts, trust.

Missing image:

- Branded placeholder with property type.

Expired/stale:

- De-emphasized card.
- Clear availability status.
- Do not show as verified-current if outdated.

Sponsored:

- Separate "Sponsored" label.
- Never combine sponsored treatment with verification.

## 11. Property Detail Specification

Target structure:

1. Media gallery.
2. Price and primary facts.
3. Availability status.
4. Main actions.
5. Full-cost breakdown.
6. Property description.
7. Amenities and utilities.
8. Verification report.
9. Representative profile.
10. Location and landmarks.
11. Viewing workflow.
12. Secure inquiry.
13. Call and WhatsApp.
14. Listing history.
15. Similar properties.
16. Fraud reporting.
17. Verification limitations.

### Desktop

- Media gallery at top.
- Main details in content column.
- Sticky action panel on right.

### Mobile

- Swipe gallery.
- Price/facts first.
- Sticky bottom action bar.
- Collapsible trust and fees sections.

### Anonymous User Behavior

Allowed:

- View details.
- View verification report.
- View representative public profile.

Prompted:

- Save.
- Request viewing.
- Send structured inquiry.
- Apply.
- Contact directly if policy requires accountability.

### Authenticated User Behavior

- Preserve action intent.
- Open relevant modal or route after authentication.
- Do not redirect to generic dashboard unless the action started there.

### Backend Data Requirements

Existing:

- Core property fields.
- Media/gallery.
- Favorites.
- Inquiry/viewing/application workflows.

Needed:

- Verification dimensions.
- Full cost breakdown.
- Availability confirmation date.
- Listing history.
- Representative profile.
- Approximate location and landmarks.
- Similar listings.
- Fraud report endpoint.

## 12. Authentication-Gating Policy

### Public Without Authentication

- Homepage.
- Search.
- Filters.
- Property cards.
- Property details.
- Public verification reports.
- Public representative profiles.
- Public guides.
- Public trust pages.

### Authentication Required

- Save property.
- Save search.
- Create alert.
- Request viewing.
- Send structured inquiry.
- Submit application.
- Access conversations.
- List property.
- Begin account verification.
- Begin property verification.
- Use dashboards.

### Prompt Strategy

Each protected action should explain the value:

- Save property: "Create an account to save this property and return to it later."
- Save search: "Create an account to get alerts when matching listings appear."
- Request viewing: "Create an account so the owner can confirm your viewing safely."
- Inquiry: "Create an account to send a secure inquiry and track responses."
- Application: "Create an account to submit and track your application."
- List property: "Create an account to manage listings and verification."
- Dashboard: "Sign in to view your saved properties, viewings, applications, and verification."

### Intent Preservation

Use `next` and `intent` parameters or equivalent state:

- Preserve originating route.
- Preserve action type.
- Reopen modal or route after login.
- Avoid generic dashboard redirects unless intentional.

## 13. Dashboard Plan

### Buyer/Renter Dashboard

Existing:

- Saved properties.
- Interests.
- Viewings.
- Applications.
- Activity.

Target:

- Transaction center by property.
- Saved searches and alerts.
- Recently viewed.
- Assistant history.
- Verification status if needed.

### Landlord/Agent Dashboard

Existing:

- Listings.
- Leads.
- Viewings.
- Applications.
- Performance summary.

Target:

- Listing health.
- Drafts.
- Approval status.
- Stale listing reminders.
- Availability confirmations.
- Inquiry queue.
- Viewing schedule.
- Application review.
- Verification status.
- Representative accountability profile.

### Admin Dashboard

Existing:

- Admin overview.
- Verification queue.

Target:

- Verification queue.
- Listing moderation.
- Reported listings.
- Stale listings.
- Duplicate review.
- User/company verification.
- Audit history.
- Complaints.
- Operational metrics.

### Backend Dependencies

- Saved searches and alerts.
- Listing freshness.
- Availability confirmations.
- Public representative profiles.
- Reported listings.
- Audit search.
- Complaint/report workflow.

## 14. Design-System Proposal

### Palette

Use the product strategy palette:

- Primary green: `#0B3B2E`
- Dark green: `#06271F`
- Accent gold: `#C99A3D`
- Light gold: `#E5C477`
- Warm background: `#F7F6F1`
- Main text: `#17201D`
- Verification green: `#178A58`
- Warning: `#B76A18`

### Color Roles

- Primary actions: Primary green.
- Premium/accent actions: Accent gold.
- Public page background: Warm background.
- Dark brand sections: Dark green.
- Trust badges: Verification green.
- Warnings and stale listings: Warning.
- Text: Main text on light backgrounds, white on dark backgrounds.

### Typography

- Headings: Playfair Display for hero and editorial headings only.
- Body/UI: Inter.
- Avoid viewport-scaled fonts.
- Keep letter spacing restrained.

### Spacing

Suggested scale:

- 4, 8, 12, 16, 24, 32, 48, 64, 96.

### Breakpoints

- 320 small mobile.
- 360/375 standard mobile.
- 430 large mobile.
- 768 tablet.
- 1024 laptop/tablet landscape.
- 1366 desktop.
- 1440 desktop.

### Components

Buttons:

- Primary.
- Secondary.
- Ghost.
- Destructive.
- Icon.
- Save.

Inputs:

- Search.
- Text.
- Select.
- Currency.
- Date/time.

Badges:

- Verification.
- Status.
- Sponsored.
- Listing freshness.
- Role.

Cards:

- Property.
- Professional.
- Guide.
- Dashboard metric.
- Verification item.

Drawers/sheets:

- Mobile filters.
- Mobile nav.
- Account prompt.

States:

- Loading skeletons.
- Empty states.
- Error states.
- Offline/API unavailable.

Motion:

- Subtle transitions only.
- Respect reduced motion.

Icon usage:

- Use existing icon library.
- Prefer icons for save, compare, filters, search, phone, WhatsApp, gallery, verification.

Image ratios:

- Property card: 4:3 or 16:10.
- Detail hero gallery: responsive, stable aspect ratio.
- Professional avatar: square/circle consistent.

## 15. SEO, Performance and Accessibility Plan

### SEO

Required:

- `robots.txt`.
- `sitemap.xml`.
- Canonical URLs.
- Route-specific page titles.
- Route-specific descriptions.
- Production Open Graph image URLs.
- Listing metadata.
- City and area landing pages.
- Breadcrumbs.
- Structured data for listings where accurate.
- Expired-listing strategy.
- Public rendering strategy for crawlable marketplace pages.

### Performance

Priorities:

- Reduce or remove full-screen splash before first useful content.
- Prioritize search field and first listings.
- Use responsive images.
- Lazy-load below-fold sections.
- Compress images.
- Avoid build-time live API dependence unless intentional.
- Keep route-level bundles small.
- Preserve search state without excessive refetching.
- Optimize low-bandwidth mobile behavior.

### Accessibility

Required:

- Semantic navigation.
- Keyboard support.
- Visible focus states.
- Adequate contrast.
- Labels for forms.
- Error announcements.
- Screen-reader labels for icon buttons.
- 44px touch targets.
- Modal focus trapping.
- Mobile menu accessibility.
- Reduced motion support.
- Descriptive image alt text.

## 16. Backend and Data Dependency Matrix

| Feature | Current support | Frontend work | Backend work | Data migration | Risk | Recommended sprint |
|---|---|---|---|---|---|---|
| Responsive logo | Supported assets/components | Update desktop/mobile behavior | None | No | Low | Sprint 1 |
| Homepage redesign | Partially supported | Rebuild homepage sections | Featured listing query may need tuning | No | Medium | Sprint 2 |
| Featured listings | Existing approved listings | Display verified/featured set | Add richer featured/verified fields if needed | Maybe | Medium | Sprint 2 |
| Verification dimensions | Partial | Public trust UI | Expose structured dimensions | Maybe | High | Sprint 4/6 |
| Listing freshness | Not clear | Card/detail freshness UI | Availability confirmation fields/process | Yes | Medium | Sprint 3 |
| Property fees | Not supported | Cost breakdown UI | Add fee fields | Yes | High | Sprint 4 |
| Representative profiles | Partial owner data | Public profile cards | Public representative endpoint | Maybe | Medium | Sprint 4 |
| Total-cost breakdown | Not supported | Detail cost module | Add cost model/fields | Yes | High | Sprint 4 |
| Location hierarchy | Partial city/state | UI and URL params | LGA/area/estate/landmark filters | Yes | High | Sprint 3 |
| Land-specific fields | Partial land size | Land card/detail UI | Add title/survey/road/access fields | Yes | High | Sprint 3/4 |
| Saved searches | Not implemented | Save search prompt/page | SavedSearch API/model | Yes | Medium | Sprint 5 |
| Alerts | Not implemented | Alert CTA/settings | Notification/scheduled process later | Yes | High | Future |
| Listing history | Not implemented | Detail history section | History model/events | Yes | Medium | Sprint 4 |
| Approximate location | Not supported | Detail location module | Approximate location fields/rules | Yes | Medium | Sprint 4 |
| Stale-listing expiry | Not supported | Stale badge/UI | Scheduled job and timestamps | Yes | Medium | Sprint 6 |
| Public verification report | Partial | Report UI | Public verification endpoint | Maybe | High | Sprint 4/6 |
| City pages | Not implemented | Static/dynamic pages | Optional stats endpoints | Maybe | Medium | Sprint 7 |
| Analytics events | Not implemented | Event instrumentation | Analytics endpoint/provider | Maybe | Medium | Sprint 7 |

## 17. Execution Roadmap

### Sprint 0: Audit and Foundation

Objective:

- Freeze current route, component, API, auth-gate, performance, and accessibility baseline.

Included routes:

- All public, auth, dashboard, admin, verification, assistant routes.

Included components:

- Shell, nav, footer, cards, filters, modals, dashboard widgets.

Backend dependencies:

- None.

Acceptance criteria:

- Route inventory complete.
- Component inventory complete.
- API capability map complete.
- Current screenshots captured at target breakpoints.
- Known placeholders listed.

Tests:

- Existing frontend test suite.
- Build baseline.

Deployment:

- No deployment required.

Rollback:

- No product changes.

Complexity:

- Small to Medium.

Key risks:

- Missing hidden flows.

### Sprint 1: Design System and Responsive Shell

Objective:

- Establish the visual foundation and Redfin-inspired task shell without changing business behavior.

Included routes:

- Global layout, homepage, properties, auth, dashboards, admin shell.

Included components:

- Logo lockup, navbar, mobile menu, footer, typography, buttons, forms, tabs, badges, cards, skeletons.

Backend dependencies:

- None.

Acceptance criteria:

- Desktop shows logo plus tagline.
- Mobile shows compact logo only.
- Task-based nav implemented.
- Footer IA updated.
- Existing flows still route correctly.

Tests:

- Navbar tests.
- Mobile menu tests.
- Accessibility smoke.
- Full build.

Deployment:

- Preview first, then production.

Rollback:

- Revert shell commit if navigation regression appears.

Complexity:

- Medium.

Key risks:

- Breaking auth navigation or mobile header.

### Sprint 2: Homepage and Discovery

Objective:

- Convert homepage into a search-first marketplace landing page.

Included routes:

- `/`
- `/properties` entry from search.

Included components:

- Hero search, tabs, category goals, city browse, verified listings, trust explanation, professionals, diaspora, guides, account CTA.

Backend dependencies:

- Existing public properties endpoint.
- Optional featured/verified query improvements.

Acceptance criteria:

- User can search without login.
- Categories route to filtered results.
- Featured approved listings render.
- No unsupported stats are shown.

Tests:

- Homepage route smoke.
- Search form tests.
- Responsive tests.

Deployment:

- Preview with production API.

Rollback:

- Restore prior homepage only.

Complexity:

- Medium to Large.

Key risks:

- Search parameter mismatch.

### Sprint 3: Search Results and Property Cards

Objective:

- Make browsing feel like a mature marketplace.

Included routes:

- `/properties`

Included components:

- Search bar, filters, sort, mobile filter drawer, property cards, save prompt, empty states.

Backend dependencies:

- Existing filters for city, property type, listing type, price.
- API extensions needed for full Nigerian filters.

Acceptance criteria:

- Filters persist in URL.
- Mobile filters are usable.
- Cards show trust and freshness where data exists.
- Unsupported filters are not shown as functional.

Tests:

- Filter tests.
- Card tests.
- Empty/loading states.

Deployment:

- Feature preview with real API.

Rollback:

- Keep old results page available behind commit rollback.

Complexity:

- Large.

Key risks:

- Frontend/backend contract mismatch.

### Sprint 4: Property Details and Conversion

Objective:

- Make property detail answer suitability, cost, trust, representative, and next action.

Included routes:

- `/properties/[slug]`

Included components:

- Gallery, price/facts, costs, verification report, representative card, sticky actions, similar properties, report listing.

Backend dependencies:

- Existing detail, media, inquiry, viewing, application APIs.
- Extensions for costs, verification report, listing history, similar properties, public representative profile.

Acceptance criteria:

- Public users can evaluate trust before signup.
- Value actions preserve intent through auth.
- Mobile sticky actions work.

Tests:

- Detail page smoke.
- Protected action tests.
- Responsive tests.

Deployment:

- Preview, then production.

Rollback:

- Revert detail route/component.

Complexity:

- Large.

Key risks:

- Overclaiming verification.

### Sprint 5: Authentication and Dashboards

Objective:

- Improve value-triggered authentication and clarify dashboards by role.

Included routes:

- Auth routes, `/dashboard`, `/saved-properties`, `/apply/[propertyId]`.

Included components:

- Auth prompts, dashboard navigation, transaction cards, activity feed, saved properties.

Backend dependencies:

- Existing auth, workflow, dashboard APIs.
- Saved searches and alerts require backend work.

Acceptance criteria:

- Browsing remains public.
- Protected actions preserve intent.
- Dashboards are role-clear.
- No cross-user cache leakage.

Tests:

- Auth flow tests.
- Intent preservation tests.
- Dashboard tests.

Deployment:

- Preview with test accounts.

Rollback:

- Roll back auth prompt/dashboard changes.

Complexity:

- Medium to Large.

Key risks:

- Regression in login/session behavior.

### Sprint 6: Trust, Legal and Public Confidence

Objective:

- Build public confidence pages and verification clarity.

Included routes:

- Verification public pages, help, safety, about, legal pages.

Included components:

- Verification methodology, standards, safety content, complaint/report content.

Backend dependencies:

- Public verification report endpoints if dynamic.

Acceptance criteria:

- Users understand what verification means and does not mean.
- Legal/trust pages are crawlable.
- No unsupported legal claims.

Tests:

- Route smoke.
- SEO metadata.
- Accessibility.

Deployment:

- Preview.

Rollback:

- Content route rollback.

Complexity:

- Medium.

Key risks:

- Legal wording requires approval.

### Sprint 7: SEO, Performance and Release Hardening

Objective:

- Prepare redesigned frontend for production growth.

Included routes:

- Public pages, listing pages, city pages.

Included components:

- Metadata, sitemap, robots, structured data, image optimization, analytics events.

Backend dependencies:

- City/area data.
- Analytics provider or endpoint if required.

Acceptance criteria:

- Valid robots and sitemap.
- Production canonical URLs.
- Core pages have metadata.
- Performance and accessibility checks pass.

Tests:

- Production build.
- Lighthouse/manual performance.
- Accessibility checks.
- Cross-device browser smoke.

Deployment:

- Production release.

Rollback:

- Revert metadata/performance commits if crawl or rendering issue appears.

Complexity:

- Medium.

Key risks:

- SEO regressions from wrong canonical or hidden pages.

## 18. Risk Register

| Risk | Likelihood | Impact | Mitigation | Detection method | Rollback approach |
|---|---:|---:|---|---|---|
| Breaking v2.0.0 workflows | Medium | High | Phase changes, regression tests | Browser smoke and test suite | Revert affected sprint commit |
| Inconsistent design systems | Medium | Medium | Centralize tokens/components first | Visual audit | Revert shell tokens |
| API contract mismatch | High | High | Dependency matrix before implementation | Typecheck, API smoke | Hide unsupported UI |
| Redesigning too many routes at once | Medium | High | Sprint-based delivery | PR scope review | Merge smaller PRs |
| Insufficient live property data | High | Medium | Use empty states and content plan | Production API smoke | Fallback to browse categories |
| Placeholder content remains | Medium | Medium | Placeholder audit | Content QA | Remove section |
| Slow property images | Medium | High | Responsive images and CDN rules | Lighthouse/network | Revert image strategy |
| Mobile regressions | Medium | High | Breakpoint test matrix | Browser device checks | Revert responsive shell |
| Auth-flow regressions | Medium | High | Intent-preservation tests | Auth E2E | Revert auth prompt changes |
| Inaccurate verification claims | Medium | High | Use approved wording and limitations | Product/legal review | Remove claim copy |
| Unsupported filter fields | High | Medium | Show only supported filters | API tests | Feature flag filters |
| SEO regressions | Medium | Medium | Validate metadata/canonicals | Crawl checks | Revert SEO changes |
| Dashboard role regressions | Medium | High | Role-specific tests | E2E with test accounts | Revert dashboard changes |
| Redfin over-copying | Low | Medium | Adopt principles only | Design review | Rework UI copy/layout |
| Scope expands into artisans too early | Medium | Medium | Keep artisans secondary until roadmap | Sprint review | Move to footer/future |

## 19. Testing Strategy

### Automated Tests

- Unit tests for utility functions and API-client mapping.
- Component tests for navbar, search, filters, cards, modals, dashboard widgets.
- Hook tests for auth state, protected action intent, search state.
- API-client tests for query parameters and error handling.
- Authentication tests for login, logout, registration, refresh, protected routes.
- Responsive interaction tests for mobile menu and filter drawer.
- Accessibility tests for labels, focus, modals, keyboard navigation.
- Route smoke tests for all public and protected routes.
- Integration tests for search -> detail -> save -> auth -> return.
- Production build with real API env values.

### Browser Breakpoints

Test at minimum:

- 320 x 568.
- 360 x 640.
- 375 x 667.
- 390 x 844.
- 430 x 932.
- 768 x 1024.
- 1024 x 768.
- 1366 x 768.
- 1440 x 900.

### Critical Journeys

- Anonymous property search.
- Filtering.
- Opening property detail.
- Reading verification information.
- Saving property.
- Sign-in with intent preservation.
- Viewing request.
- Inquiry.
- Rental application.
- Listing submission.
- Verification submission.
- Admin verification review.
- Responsive navigation.
- Assistant access.
- Logout.
- Error recovery.

## 20. Open Questions

1. Should WhatsApp be a primary public CTA, or should it require sign-in for accountability?
2. What exact public wording is approved for "verified" versus "reviewed" versus "approved"?
3. How much property location detail should be public before inquiry or viewing?
4. Should artisans remain in top navigation now, or move under More/footer until the artisan marketplace sprint?
5. Should shortlets and hotels share one category, or become separate transaction tabs?
6. What data source will be used for Nigerian state/LGA/area/estate/landmark normalization?
7. Should sponsored listings be allowed before verification dimensions are publicly mature?
8. Which legal/trust pages require lawyer or leadership approval before release?

## 21. Recommended First Implementation Sprint

Start with Sprint 1: Design System and Responsive Shell.

Reason:

- It is mostly frontend-only.
- It directly addresses the boss's logo and navigation direction.
- It reduces future redesign churn.
- It can be shipped without new backend work.
- It protects v2.0.0 workflows by changing the shell before changing transaction pages.

Immediate Sprint 1 scope:

- Desktop logo with slogan beneath.
- Mobile compact logo only.
- Task-based navigation.
- Improved mobile menu.
- Footer IA cleanup.
- Token alignment to strategy palette.
- Shared button/input/card/badge audit.
- Cross-device screenshot baseline.

Acceptance:

- All existing routes remain reachable.
- Public browsing still works without login.
- Protected actions still gate correctly.
- Lint, typecheck, tests, and build pass.

## 22. Final Verdict

✅ REDESIGN PLAN READY FOR APPROVAL

## Sources Reviewed

- RealityNG product strategy PDF: `C:\Users\akord\Downloads\RealityNG_vs_Redfin_Product_Strategy.pdf`
- RealityNG frontend repository: `C:\Users\akord\Downloads\Realityng\frontend`
- Redfin homepage benchmark: `https://www.redfin.com/`
- Redfin search/results benchmark: `https://www.redfin.com/city/11203/CA/Los-Angeles`
