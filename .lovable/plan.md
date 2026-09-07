# Clean one-page card printout

## What will change
- Print only the issued card, with its front side at the top and back side directly below.
- Remove customer details, status, dates, notes, dialog controls, and other page content from the printed result.
- Keep sensitive card details masked unless the existing reveal option is intentionally enabled.
- Size and space both sides so they fit cleanly on one portrait page without splitting.

## Technical details
- Update the admin card print preview to render dedicated front and back card faces in a single print area.
- Tighten print-only CSS with one-page dimensions, page-break protection, and hidden non-print elements.
- Verify the browser print preview produces one page.
