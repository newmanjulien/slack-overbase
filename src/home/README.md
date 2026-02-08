# Home surface

This folder owns the Slack Home surface.

What goes here:

- Home-specific orchestration (section selection, data assembly, and publish flow).
- Home-specific view blocks (Slack block builders used only by Home).
- Home surface types (Home tab surface + Home sections, state used by Home views/composition).

Key files:

- `home.ts` defines the Home sections and shared Home types used by composition and views.
- `index.ts` wires all Home handlers into the Slack app.
- `publish.ts` loads Home data, builds the blocks, and publishes the Home view.

What does NOT go here:

- Reusable product features (templates, recurring, portal, etc.).
- Feature logic used across multiple surfaces (commands, modals, messages, etc.).
- Generic data access layers.
