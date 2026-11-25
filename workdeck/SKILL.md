---
name: workdeck
description: Run or adapt the WorkDeck product manager simulation with five product workflows, categorized conversation history, and previewable simulated MCP changes. Use when a user asks to launch WorkDeck or try its product manager walkthrough.
---

# WorkDeck

The browser demo is in [assets/](assets/). It uses a fictional product called Fern Notes and runs entirely in the browser.

## Launch and demonstrate

1. Serve the skill's `assets/` directory on loopback. From the skill folder run `python3 -m http.server 4387 --bind 127.0.0.1 --directory assets`. Choose another local port if 4387 is already in use.
2. Share the local URL. In the demo, open **Launch readiness** and choose **Use sample prompt**, then **Send**. Select **History** on the overview to reopen a seeded product decision.
3. In **Product tasks**, preview a create, update, or delete. Compare the preview with the current sample record. Confirm or cancel, then check the task list.

WorkDeck uses scripted answers and simulated task changes. The browser stores the demo state for the current origin. **Reset demo** restores the seed records and conversations.

## Adapt the template

Copy `assets/` into the destination workspace before editing. Update the product scenario, workflow prompts, and seed records together in `assets/app.js`. Keep workflow IDs stable across label changes when existing conversations should remain available. Use fictional people, records, and conversations in public demos.

For an explicitly requested live integration, use the documented service interface in a local backend. Keep credentials out of the frontend. Before applying a change, show the affected record and fields. Verify the result after applying it.
