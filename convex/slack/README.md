# Convex Slack functions

This folder defines Convex functions (queries/mutations) for Slack-related persistence.

What goes here:

- Convex queries/mutations that read/write Slack-related data.
- Argument validation and DB access logic.

What does NOT go here:

- App-side orchestration or view composition.
- Slack Web API calls or event handlers (those live in the app).
- Client-side wrappers (those live in /src/data).

Note:
- This folder is only for the main Slack app’s Convex functions.
- Cross-app relay and responder functions live in /convex/responder.
