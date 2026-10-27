# Service conversation rollout

The authenticated customer and assigned provider can open an existing quote conversation from their request lists. Anonymous requests have no action. The backend, not the browser, chooses participants and authorizes access. The shared inbox supports property and service context.

NEXT_PUBLIC_SERVICE_CONVERSATIONS_ENABLED defaults to false. Deploy reader compatibility first, then deploy the reviewed backend migration/API and explicitly approve backend SERVICE_CONVERSATIONS_ENABLED before enabling frontend entry points. This PR does not activate the feature or deploy backend code.

Realtime rejection/interruption keeps message text available for retry with the same client-message ID. REST retry does not clear a separately typed draft. Reconnection drains paginated catch-up results; existing property messaging uses the same recovery path.

No service checkout, registration fees, publication rights or verification promises are introduced. The exact required production dependency audit passes with zero vulnerabilities. A broader audit reports nine inherited development-tooling findings; track their remediation separately without changing this feature lockfile.
