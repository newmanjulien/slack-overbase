# Data layer

This folder owns persistence-facing modules and domain repositories.

What goes here:
- Domain repositories that wrap persistence calls (Convex queries/mutations).
- Persistence helpers that are specific to storing or retrieving data.

What does NOT go here:
- Home/feature orchestration or UI composition.
- Slack event handlers or surface-specific wiring.
- Cross-surface business logic that doesn't touch persistence.

Why:
- Keeps persistence access in one place.
- Encourages thin, testable data wrappers around Convex functions.
- Lets Home/Features consume data without knowing how it is stored.

How this relates to /convex/slack:
- /convex/slack defines server-side Convex functions (queries/mutations) that access the DB.
- /data wraps those functions on the app side, providing typed, domain-focused helpers.
