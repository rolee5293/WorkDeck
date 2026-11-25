---
name: local-workbench-demo
description: Run, walk through, or adapt the bundled browser-based workbench demo with categorized conversations, persistent local history, and reviewable simulated MCP changes. Use when the user asks to try this demo or adapt its workbench pattern.
---

# Local Workbench Demo

The working demo is in [assets/](assets/). It runs entirely in a browser using fictional records and scripted chat replies.

## Run the demo

1. Serve the skill's `assets/` directory on loopback. For example, from the skill folder run `python3 -m http.server 4387 --bind 127.0.0.1 --directory assets`. If that port is in use, choose another free local port.
2. Give the user the local URL. Open it with the available browser tools if asked to walk through the demo.
3. Choose a workflow and send `List tasks`. Use the history list to reopen the conversation. In **Launch checklist**, use one of the task action buttons to preview a create, update, or delete. Confirm or cancel it and check the task list.

The demo never calls Codex or an MCP server. Skill invocation launches or adapts the template. The chat and task changes in the browser are simulations. The browser stores demo state for the current origin. **Reset demo** restores the seed data for that origin.

## Adapt the template

Copy `assets/` into the destination workspace before editing. Edit the workflow and record definitions at the top of `assets/app.js`. Keep the same workflow ID for existing conversations when renaming a workflow. Use synthetic records in any public build or screenshot.

If the user requests a real integration, use the documented interface in a local backend. Keep credentials out of the frontend. Preserve a review step for state-changing operations that shows affected records and fields, and verify the applied result before reporting success.
