Here’s the clean phased execution outline so we can start without disturbing the working `v2.0.0` product.

**Phase 1: Design System and Responsive Shell**

Goal: Fix the global structure first.

Do:
- Update desktop logo to show tagline under RealityNG.
- Show compact logo only on mobile.
- Replace current nav with task-based nav: `Buy`, `Rent`, `Shortlets`, `Land`, `Commercial`, `List a Property`, `Saved`, `Sign In`, `More`.
- Rework mobile menu.
- Clean up footer navigation.
- Align colors, spacing, typography, buttons, cards, badges, inputs.
- Keep all current routes working.

Validation:
- Navbar works desktop/mobile.
- No route is broken.
- Existing auth and dashboard links still work.
- Run lint, typecheck, tests, build.

**Phase 2: Homepage and Discovery**

Goal: Make the homepage search-first like a real marketplace.

Do:
- Redesign hero around property search, not brand repetition.
- Add search tabs: Buy, Rent, Shortlets, Apartment Share, Land, Commercial.
- Add city/area search entry.
- Add featured verified listings.
- Add browse-by-goal section.
- Add browse-by-city/area section.
- Add verification explanation.
- Add diaspora support and trust sections.
- Remove unsupported stats or mock-looking claims.

Validation:
- Public user can search without logging in.
- Homepage routes search correctly to `/properties`.
- Featured listings come from approved property data.
- Mobile search is usable.

**Phase 3: Search Results and Property Cards**

Goal: Make browsing strong, fast, and clear.

Do:
- Redesign `/properties`.
- Add better filter layout.
- Add mobile filter drawer.
- Persist filters in the URL.
- Improve sorting and result count.
- Redesign property cards with:
  - price,
  - location,
  - property facts,
  - image count,
  - listing type,
  - verification state,
  - availability/freshness if available,
  - save action.
- Separate sponsored status from verification status.

Backend dependency:
- Current backend supports city, property type, listing type, price range, search, ordering.
- Advanced filters like LGA, estate, landmark, fees, flood info, road access need backend work later.

**Phase 4: Property Detail and Conversion**

Goal: Make the property page answer trust and action questions.

Do:
- Improve gallery.
- Improve price and facts hierarchy.
- Add clear action area.
- Add verification report section.
- Add representative/agent profile area.
- Add cost breakdown placeholder only if backend supports it.
- Improve Show Interest, Viewing, Application flow.
- Add sticky mobile action bar.
- Add fraud/safety reporting placeholder only if approved.

Validation:
- Anonymous users can inspect property details.
- Auth required only for value actions.
- Returning after login preserves intent.
- Mobile layout is clean.

**Phase 5: Authentication and Dashboards**

Goal: Make account creation happen at the right moment.

Do:
- Remove premature signup pressure.
- Gate only meaningful actions:
  - save property,
  - save search,
  - request viewing,
  - send inquiry,
  - apply,
  - list property,
  - dashboard,
  - verification.
- Improve post-login return flow.
- Redesign buyer dashboard as transaction center.
- Redesign landlord/agent dashboard around listings, leads, viewings, applications.
- Improve admin dashboard layout.

Backend dependency:
- Saved searches and alerts need backend support if included.

**Phase 6: Trust, Verification, Legal and Public Confidence**

Goal: Make RealityNG’s trust layer clear and credible.

Do:
- Add public pages:
  - How Verification Works,
  - Verification Standards,
  - Safety,
  - Help,
  - Contact,
  - About RealityNG,
  - Terms,
  - Privacy.
- Improve verification wording.
- Explain what verification means and does not mean.
- Improve verification badges.
- Improve public trust sections.

Needs leadership/legal approval:
- Exact verification claims.
- Liability/disclaimer wording.
- Public document/privacy wording.

**Phase 7: SEO, Performance and Release Hardening**

Goal: Prepare redesigned frontend for production growth.

Do:
- Add/verify `robots.txt`.
- Add/verify `sitemap.xml`.
- Improve metadata per page.
- Add canonical URLs.
- Add listing/page Open Graph metadata.
- Add city/location SEO pages if data is ready.
- Optimize images.
- Remove slow splash behavior if it hurts load speed.
- Run accessibility pass.
- Run mobile/browser QA.
- Add analytics events for search, save, inquiry, viewing, application.

Validation:
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- Browser tests across mobile/tablet/desktop.

**Recommended Starting Point**

Start with **Phase 1: Design System and Responsive Shell**.

It is the safest first move because it:
- fixes the boss’s logo/navigation direction,
- does not need backend changes,
- improves the whole app immediately,
- creates the foundation for the Redfin-style marketplace redesign,
- preserves the working v2.0.0 workflows.