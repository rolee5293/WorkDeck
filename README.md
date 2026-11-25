# Codex Workbench Demo

A local workbench for repeatable projects. Start a conversation from a workflow, reopen its history, and review task changes before applying them.

![Fieldnotes demo showing workflow history, a conversation, and a simulated task update](preview.png)

## Run the demo

Clone the repo and serve the bundled assets with Python 3.

```bash
git clone https://github.com/rolee5293/codex-workbench-demo.git
cd codex-workbench-demo
python3 -m http.server 4387 --bind 127.0.0.1 --directory local-workbench-demo/assets
```

Open [localhost:4387](http://127.0.0.1:4387). Select **Launch checklist** and send **List tasks**. Use **History** to reopen a conversation. Try **Preview update**, then apply or cancel it.

All records are fictional. The browser uses scripted replies and simulated task operations. It stores state in local storage for this origin. **Reset demo** restores the starting records. The demo needs Python 3 and a modern browser. It requires no account, API key, or network service.

## Use it as a Codex skill

Copy the `local-workbench-demo` directory into your project's `.agents/skills` folder.

```bash
mkdir -p .agents/skills
cp -R local-workbench-demo .agents/skills/
```

Open Codex in that project and ask: “Use `$local-workbench-demo` to launch the demo and show me how a task update is reviewed.” The skill can also help adapt a copy of the template. [Codex Skills documentation](https://developers.openai.com/codex/skills)

## What to adapt

- Edit workflow names, sample records, and scripted replies in [app.js](local-workbench-demo/assets/app.js).
- Edit the token values and component styles in [style.css](local-workbench-demo/assets/style.css).
- Use a local backend for any real account integration, and keep the review step for proposed changes.

[MIT License](LICENSE)
