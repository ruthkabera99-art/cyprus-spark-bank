# Card request follow-up statuses

## What will change
- Add status summary counters and a status filter for pending, approved, issued, and rejected requests.
- Keep the existing card-type filter so administrators can combine both views.
- Replace instant rejection with a confirmation form requiring a reason category and explanation.
- Include “Incorrect or misleading information” as a rejection reason, plus incomplete documents, identity verification, duplicate request, and other.
- Record the review time and show the rejection explanation in the admin list and the customer’s card-request history.
- Keep rejected requests from being issued unless an administrator approves them again.

## Technical details
- Add rejection category and rejection reason fields to card requests.
- Update request status writes to record review timestamps and clear stale rejection details after approval.
- Add compact status controls, rejection dialog validation, and visible follow-up details.
- Verify status transitions and the current build.
