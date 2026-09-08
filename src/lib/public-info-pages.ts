import type { PublicInfoPageProps } from "@/components/public-info/public-info-page";

export const aboutPage: PublicInfoPageProps = {
  eyebrow: "About RealityNG",
  title: "A trust-first Nigerian property marketplace for local and diaspora decisions.",
  description:
    "RealityNG helps people discover, verify, rent, buy, list, and manage Nigerian properties with clearer information and structured workflows.",
  badge: "Where Dreams Find an Address",
  highlights: [
    "Search-first discovery for homes, land, shortlets, apartment sharing, and commercial property.",
    "Structured workflows for inquiries, viewings, applications, verification, and dashboard tracking.",
    "Built for Nigerian realities, including agent accountability, ownership evidence, and diaspora confidence.",
  ],
  sections: [
    {
      title: "What RealityNG solves",
      body: "Property decisions in Nigeria often involve fragmented listings, unclear representatives, poor follow-up, and limited trust signals. RealityNG brings these steps into one platform.",
      bullets: [
        "Browse approved marketplace listings before creating an account.",
        "Create an account only when saving, inquiring, viewing, applying, listing, or verifying.",
        "Track each property transaction from interest to viewing and application.",
      ],
    },
    {
      title: "Who the platform serves",
      body: "RealityNG supports buyers, tenants, landlords, agents, artisans, developers, investors, and diaspora users through phased product experiences.",
      bullets: [
        "Buyers and tenants can search, save, inquire, view, and apply.",
        "Landlords and agents can list property and manage leads.",
        "Admins can review verification and marketplace trust workflows.",
      ],
    },
    {
      title: "Current product foundation",
      body: "The platform currently includes authentication, roles, property listings, media, favorites, inquiries, viewings, rental applications, verification workflows, and a guided assistant.",
    },
    {
      title: "Financial workflow boundary",
      body: "RealityNG can record and coordinate escrow and financing workflows, but it does not hold funds, underwrite credit, approve loans, or guarantee partner outcomes. Live partner activation remains disabled pending professional approval.",
    },
  ],
  cta: {
    label: "Explore approved properties",
    href: "/properties",
    body: "Browse first, then create an account when you are ready to save, inquire, request a viewing, apply, or list.",
  },
};

export const verificationStandardsPage: PublicInfoPageProps = {
  eyebrow: "Verification standards",
  title: "How RealityNG treats verification signals across users, listings, and documents.",
  description:
    "Verification is a trust layer, not a guarantee of legal title, future availability, or transaction outcome. RealityNG separates public trust signals from private review evidence.",
  badge: "Public confidence layer",
  highlights: [
    "Verification documents are handled through protected workflows.",
    "Approved badges should appear only where a verified status is active and valid.",
    "Pending, rejected, expired, or suspended records should not be presented as verified.",
  ],
  sections: [
    {
      title: "Identity and professional review",
      body: "Users may submit role-specific verification information for review. Admin approval controls whether verified status appears publicly.",
      bullets: [
        "Agent, landlord, artisan, and user verification flows are handled separately.",
        "Normal users cannot approve themselves or access admin decision routes.",
        "Verification status can change when evidence expires, is rejected, or is suspended.",
      ],
    },
    {
      title: "Property review",
      body: "Property verification focuses on ownership evidence, listing accountability, and admin review. It does not replace independent legal due diligence.",
      bullets: [
        "Property owners submit evidence through protected upload flows.",
        "Private evidence is not exposed as permanent public URLs.",
        "Public badges should remain separate from sponsored or featured treatment.",
      ],
    },
    {
      title: "Document privacy",
      body: "Verification documents are intended for private storage and controlled access. Public property media and private verification evidence should remain separate.",
    },
    {
      title: "What verification does not mean",
      body: "A verified badge does not promise that a listing is still available, that title is legally perfect, or that a transaction is risk-free.",
    },
  ],
  cta: {
    label: "Start verification",
    href: "/verification",
    body: "Authenticated users can open the verification centre to submit or review verification requests.",
  },
};

export const listingStandardsPage: PublicInfoPageProps = {
  eyebrow: "Listing standards",
  title: "Clear marketplace rules for property information, media, pricing, and availability.",
  description:
    "RealityNG listings should help users decide whether a property is suitable, current, and represented by the right person.",
  badge: "Marketplace quality",
  highlights: [
    "Listings should identify purpose, type, location, price, and representative clearly.",
    "Public browsing should show approved listings only.",
    "Image galleries should represent the actual property or clearly state when media is unavailable.",
  ],
  sections: [
    {
      title: "Required listing clarity",
      body: "Every listing should provide enough information for a user to understand the property before contacting anyone.",
      bullets: [
        "Title, description, sale or rent purpose, property type, price, and location.",
        "Bedrooms, bathrooms, parking, land size, floor area, and relevant amenities where applicable.",
        "Representative name, role, and verification context when available.",
      ],
    },
    {
      title: "Media expectations",
      body: "Property images should be clear, relevant, and organized. Cover images and gallery ordering help users scan listings quickly.",
      bullets: [
        "Avoid unrelated stock images where real inspection media is expected.",
        "Keep public property media separate from private verification evidence.",
        "Do not use verification documents as listing gallery assets.",
      ],
    },
    {
      title: "Availability and freshness",
      body: "Listings should be refreshed over time so users do not act on stale information. Deeper stale-listing automation belongs to future backend work.",
    },
    {
      title: "Sponsored and trust signals",
      body: "Sponsored placement, featured treatment, and verification status should be visually and semantically separate.",
    },
  ],
  cta: {
    label: "List a property",
    href: "/properties/new",
    body: "Create an account to start a draft listing, add property information, and submit for review.",
  },
};

export const safetyPage: PublicInfoPageProps = {
  eyebrow: "Safety",
  title: "Safer property decisions start with clear signals and cautious next steps.",
  description:
    "RealityNG helps users make better decisions, but property transactions still require careful review, documented agreements, and independent judgment.",
  badge: "User safety guidance",
  highlights: [
    "Do not make payments outside a trusted, documented process.",
    "Verify who you are dealing with before sharing sensitive information.",
    "Treat urgent payment pressure, inconsistent documents, and unclear representatives as risk signals.",
  ],
  sections: [
    {
      title: "Before you engage",
      body: "Review the listing, representative profile, verification notes, photos, and stated location before contacting anyone.",
      bullets: [
        "Compare listing details across title, description, price, media, and location.",
        "Ask for clear next steps and written confirmation of any viewing or application process.",
        "Use structured inquiry and viewing workflows where available.",
      ],
    },
    {
      title: "Before you pay",
      body: "RealityNG does not replace professional legal, financial, inspection, or title advice. Do not pay without appropriate due diligence.",
      bullets: [
        "Confirm ownership, authority to transact, and payment recipient.",
        "Avoid cash pressure or account changes that cannot be verified.",
        "Keep records of communication, documents, agreements, and receipts.",
      ],
    },
    {
      title: "Report suspicious activity",
      body: "Users should report misleading listings, impersonation, suspicious payment requests, or unsafe viewing arrangements.",
    },
    {
      title: "Diaspora caution",
      body: "Diaspora users should be especially careful when delegating inspections, sending funds, or relying on third-party representatives.",
    },
  ],
  cta: {
    label: "Contact support",
    href: "/contact",
    body: "If something looks wrong, contact the RealityNG team before moving forward.",
  },
};

export const helpPage: PublicInfoPageProps = {
  eyebrow: "Help",
  title: "Find the right RealityNG workflow for what you want to do next.",
  description:
    "Use this guide to understand which parts of the platform are public and which require an account for privacy or transaction safety.",
  highlights: [
    "Public users can browse, search, filter, and open property details.",
    "Accounts are required for saved properties, inquiries, viewings, applications, listings, dashboards, and verification.",
    "The guided assistant can answer supported navigation and workflow questions.",
  ],
  sections: [
    {
      title: "Searching for property",
      body: "Start from the homepage search or the properties page. Filter by listing purpose, city, property type, and price where supported by the current API.",
    },
    {
      title: "Showing interest",
      body: "Open a property and use Show Interest when you want the owner or agent to follow up. This requires an account so the inquiry can be tracked.",
    },
    {
      title: "Requesting a viewing",
      body: "Viewing requests are connected to inquiries. After interest is created, users can request a physical or virtual viewing where the workflow is available.",
    },
    {
      title: "Applying for a rental",
      body: "Rental applications are submitted after the user is ready to provide application details for owner or agent review.",
    },
  ],
  cta: {
    label: "Browse properties",
    href: "/properties",
    body: "You can receive value first by browsing approved listings before creating an account.",
  },
};

export const contactPage: PublicInfoPageProps = {
  eyebrow: "Contact",
  title: "Reach RealityNG for support, partnerships, listing questions, or safety concerns.",
  description:
    "Use the appropriate channel for product support, marketplace trust, partnerships, or future service categories.",
  badge: "Support routing",
  highlights: [
    "Use structured platform workflows for property inquiries and viewings.",
    "Use support contact for platform issues, suspicious activity, or account questions.",
    "Do not share passwords, private keys, or sensitive payment details in public channels.",
  ],
  sections: [
    {
      title: "Marketplace support",
      body: "Contact the team if you have trouble with saved properties, inquiries, viewings, rental applications, dashboards, or listing workflows.",
      bullets: ["Email: support@realityng.com", "Website: realityng.com"],
    },
    {
      title: "Trust and safety",
      body: "Report suspicious listings, impersonation, payment pressure, or unsafe viewing arrangements before taking the next step.",
      bullets: ["Email: safety@realityng.com", "Include property URL, screenshots, and a short summary."],
    },
    {
      title: "Partnerships",
      body: "For verified agent, landlord, developer, artisan, or diaspora service partnerships, contact the team with your organization details.",
      bullets: ["Email: partnerships@realityng.com"],
    },
    {
      title: "Response expectations",
      body: "Support workflows will become more automated in later sprints. Current contact pages provide routing and public guidance.",
    },
  ],
};

export const privacyPage: PublicInfoPageProps = {
  eyebrow: "Privacy",
  title: "How RealityNG thinks about personal data, verification evidence, and account privacy.",
  description:
    "This page summarizes product privacy principles for the current platform. Formal legal review may refine this policy before broader launch.",
  badge: "Policy draft",
  highlights: [
    "Collect only data needed for accounts, marketplace workflows, verification, and platform safety.",
    "Keep private verification evidence separate from public listing media.",
    "Do not expose secrets or provider credentials in frontend code.",
  ],
  sections: [
    {
      title: "Information users provide",
      body: "Users may provide account details, profile information, property listing data, inquiry messages, viewing requests, rental applications, and verification evidence.",
    },
    {
      title: "How data is used",
      body: "Data supports authentication, dashboards, marketplace workflows, admin review, fraud prevention, verification decisions, and product support.",
    },
    {
      title: "Private documents",
      body: "Verification documents should remain private and accessible only through approved backend flows, signed access, and authorization checks.",
    },
    {
      title: "Retention and deletion",
      body: "Data retention and deletion workflows should follow operational, legal, fraud-prevention, and audit requirements. Users can review the data deletion page for request guidance.",
    },
  ],
  cta: {
    label: "Request data help",
    href: "/data-deletion",
    body: "Review how to request account or data deletion support.",
  },
};

export const termsPage: PublicInfoPageProps = {
  eyebrow: "Terms",
  title: "RealityNG platform terms and responsible-use expectations.",
  description:
    "These terms summarize acceptable use and marketplace expectations. Formal legal review may refine them before broad public launch.",
  badge: "Terms draft",
  highlights: [
    "Users are responsible for accurate account, listing, inquiry, and application information.",
    "RealityNG workflows do not replace legal, financial, inspection, or title advice.",
    "Misleading listings, impersonation, abuse, or unauthorized data access are not allowed.",
  ],
  sections: [
    {
      title: "Using the marketplace",
      body: "Users may browse public listings and must create an account for private or transactional actions such as saving, inquiring, applying, listing, or verifying.",
    },
    {
      title: "Listing responsibility",
      body: "Landlords, agents, and other representatives are responsible for the accuracy of listing details, media, pricing, authority, and availability.",
    },
    {
      title: "Verification limitations",
      body: "Verification badges represent platform review status. They do not guarantee legal title, payment safety, future availability, or transaction success.",
    },
    {
      title: "Financial workflow limitations",
      body: "RealityNG is not a bank, lender, underwriter, credit bureau, escrow custodian, insurer, investment platform, or legal adviser. External partners own custody, underwriting, pricing, contracting, disbursement, and repayment decisions.",
    },
    {
      title: "Prohibited behavior",
      body: "Users must not misuse accounts, scrape private data, impersonate others, upload harmful files, bypass permissions, or pressure users into unsafe payments.",
    },
  ],
};

export const dataDeletionPage: PublicInfoPageProps = {
  eyebrow: "Data deletion",
  title: "How users can request account or personal-data support.",
  description:
    "RealityNG should support clear data requests while preserving lawful audit, fraud-prevention, security, and transaction records where required.",
  badge: "Privacy support",
  highlights: [
    "Request deletion from the email tied to your account.",
    "Some records may need to be retained for security, audit, dispute, or legal reasons.",
    "Private verification documents should not be exposed publicly during request handling.",
  ],
  sections: [
    {
      title: "How to request deletion",
      body: "Send a request from the email address associated with your RealityNG account and include your name, account email, and the request type.",
      bullets: ["Email: privacy@realityng.com", "Subject: Data deletion request"],
    },
    {
      title: "What may be deleted",
      body: "Depending on account status and workflow history, profile details, saved property data, or uploaded evidence may be eligible for deletion or anonymization.",
    },
    {
      title: "What may be retained",
      body: "Audit logs, fraud-prevention records, transaction records, verification decisions, and legally required records may need to be retained.",
    },
    {
      title: "Identity checks",
      body: "RealityNG may need to verify the requester before changing or deleting account-linked data.",
    },
  ],
};

export const refundsPage: PublicInfoPageProps = {
  eyebrow: "Refunds and cancellations",
  title: "Refund and cancellation responsibility depends on the underlying provider or counterparty agreement.",
  description:
    "RealityNG does not currently run production payment, escrow, lease-payment, or booking-payment workflows. Future payment features will need dedicated terms.",
  badge: "Payment features pending",
  highlights: [
    "Do not treat external payments as RealityNG-protected payments.",
    "RealityNG may record disputes and partner-reported statuses but does not hold funds or guarantee refunds.",
    "Use caution before sending money outside the platform.",
  ],
  sections: [
    {
      title: "Current payment status",
      body: "RealityNG includes transaction and escrow-orchestration records, but live custody providers remain disabled pending professional and partner approval.",
    },
    {
      title: "External payments",
      body: "If a user pays a third party outside RealityNG, that payment is not processed, held, or protected by RealityNG.",
    },
    {
      title: "Recorded financial workflows",
      body: "A status, proof, dispute, release, or refund record in RealityNG is workflow evidence, not a guarantee that money was received, released, recovered, or refunded.",
    },
    {
      title: "Cancellation guidance",
      body: "Viewing requests and applications can follow their own workflow statuses. Financial cancellation policies should be confirmed directly with the counterparty until in-platform payments exist.",
    },
  ],
  cta: {
    label: "Read safety guidance",
    href: "/safety",
    body: "Review payment safety guidance before taking any transaction step outside RealityNG.",
  },
};

export const escrowDisclosurePage: PublicInfoPageProps = {
  eyebrow: "Escrow disclosure",
  title: "RealityNG records partner escrow workflows but does not hold or control money.",
  badge: "Live activation disabled",
  description: "Any future live custody relationship is between transaction participants and an approved escrow provider under the provider's approved terms.",
  highlights: [
    "RealityNG does not control a provider bank account or guarantee release or refund.",
    "Displayed statuses depend on authenticated partner or authorized operational records.",
    "Do not send funds based only on a screen, message, or unverified payment instruction.",
  ],
  sections: [
    { title: "RealityNG's role", body: "The platform can record expected amounts, conditions, events, disputes, reconciliation and partner references as an orchestration and record layer." },
    { title: "Provider's role", body: "An approved external provider would own custody, settlement execution and provider-specific obligations. Partner terms require professional approval." },
    { title: "No guarantee", body: "RealityNG does not guarantee transaction completion, funding, release, counterparty conduct, recovery or refund." },
  ],
  cta: { label: "Report a concern", href: "/fraud-reporting", body: "Stop and report inconsistent instructions or suspected impersonation before taking another financial step." },
};

export const financingDisclosurePage: PublicInfoPageProps = {
  eyebrow: "Financing disclosure",
  title: "Financing decisions belong to the financing partner, not RealityNG.",
  badge: "Partner submission disabled",
  description: "RealityNG can collect a draft application, record consent and display partner-owned responses only after the relevant approvals and activation gate.",
  highlights: [
    "RealityNG does not approve or reject loans, underwrite, score credit, set final terms, disburse funds or collect repayments.",
    "Submitting information does not guarantee eligibility, an offer, timing or funding.",
    "Private documents must be shared only through authorized platform routes.",
  ],
  sections: [
    { title: "Consent and sharing", body: "Specific, versioned consent is required before application data can be sent to a financing partner. Account acceptance is not financing consent." },
    { title: "Partner responsibility", body: "The partner owns assessment, any credit checks, pricing, contracting, approval, rejection, disbursement and repayment administration." },
    { title: "Withdrawal and records", body: "Ask support to stop future sharing where possible. Prior disclosures and records may remain subject to approved contractual, dispute, fraud and legal requirements." },
  ],
  cta: { label: "Read privacy information", href: "/privacy", body: "Review how RealityNG describes personal and private-document handling." },
};

export const fraudReportingPage: PublicInfoPageProps = {
  eyebrow: "Fraud and abuse reporting",
  title: "Pause the workflow and report suspected fraud, impersonation, abuse, or unsafe payment instructions.",
  badge: "Trust and safety",
  description: "Send only the minimum evidence needed for RealityNG to identify and preserve the relevant platform records.",
  highlights: [
    "Email safety@realityng.com with the listing, profile, transaction, escrow or financing reference.",
    "Include dates and controlled screenshots; never send passwords, recovery codes or full card details.",
    "For immediate danger, contact the appropriate emergency authority before platform support.",
  ],
  sections: [
    { title: "What to report", body: "Suspicious listings or providers, identity abuse, verification abuse, payment redirection, escrow or financing impersonation, harassment, and unauthorized document access." },
    { title: "What happens next", body: "Trust and Safety triages the report, preserves relevant evidence, restricts platform access where justified, and routes financial, privacy or security incidents to the accountable owner." },
    { title: "Outcome and appeal", body: "RealityNG records the decision and provides an appropriate status. Affected users may request review through the support channel, subject to privacy and security limits." },
  ],
};
