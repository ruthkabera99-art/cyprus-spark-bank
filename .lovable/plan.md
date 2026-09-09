# High-quality card print and PDF

## What will change
- Keep the printed card at the ISO/IEC 7810 bank-card size: 85.60 × 53.98 mm.
- Print one front above one back on a single A4 page, with full card number, holder, expiry, and CVV visible.
- Use a dedicated print rendering mode so browser scaling cannot clip or shrink card details.
- Improve text sizing, spacing, and color preservation for crisp PDF and physical printing.

## Technical details
- Add print-specific card classes rather than relying on screen-responsive text sizing.
- Remove transforms and 3D effects from printable faces while preserving backgrounds and exact dimensions.
- Prevent wrapping and clipping of the card number and validate the result in Chromium print emulation.
