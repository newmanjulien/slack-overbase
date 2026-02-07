# Features

This folder owns reusable product features that can appear across multiple surfaces.

What goes here:

- Feature-specific logic and UI that is reused (modals, shared block builders, helpers).
- Integrations or cross-surface utilities (e.g., portal links).
- Domain logic that is not tied to a single Slack surface.

What does NOT go here:

- Home-only orchestration or Home-only views.
- Surface-specific wiring (e.g., app_home_opened handlers).
- Data access layers (unless they are part of a feature API).
