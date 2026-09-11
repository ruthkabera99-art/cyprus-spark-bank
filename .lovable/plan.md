# Finish Stripe Issuing admin wiring

## What will change
- Add a clear Stripe connection banner showing live, test, unavailable, or account-not-enabled status.
- Make Stripe issuance the primary admin action when Stripe Issuing is available.
- Keep generated cards as an explicit **Demo card** path only; label them non-spendable throughout the dialog and card list.
- Store and show only Stripe’s safe card reference, brand, expiry, and last four digits; do not persist or print Stripe PAN/CVC values.
- Prevent duplicate live cards by making Stripe issue requests idempotent and returning an existing issued card when appropriate.
- Add clear errors for incomplete cardholder details and unsupported requested brands.

## Technical details
- Harden the `stripe-issuing` function with validated actions, admin authentication, Stripe idempotency keys, safe provider error responses, and server-owned cardholder address data.
- Update the Stripe hooks to preserve useful function error messages and return complete issuance metadata.
- Refactor the admin card dialog into Live Stripe and Demo modes, with mode-specific controls and confirmations.
- Keep printing available for demo cards; Stripe cards will display masked last-four details because sensitive card data is not stored.
- Verify the function, current build, and both visible admin states that can be tested without creating a chargeable live card.

## Connection requirement
- Stripe is not currently connected. The completed panel will automatically expose live issuance after a valid `STRIPE_SECRET_KEY` is securely added and Stripe Issuing is enabled on that account; until then, admins get the clearly labeled demo path.
