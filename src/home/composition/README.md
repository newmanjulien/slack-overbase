# Home composition

This folder builds the Home state and assembles section blocks.

What goes here:

- Load section data from the Home context.
- Build Slack blocks for each Home section.
- Combine section blocks into the full Home view.

What does NOT go here:

- Slack handlers or side effects.
- Feature logic shared across other surfaces.
- Generic data access.
