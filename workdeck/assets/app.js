"use strict";

const groups = [
  {
    name: "Discovery & strategy",
    description: "Turn customer evidence into a product decision.",
    workflows: [
      {
        id: "discovery",
        name: "Customer discovery",
        description: "Summarize interview patterns and open questions.",
        prompt: "What did we learn about offline note-taking?",
        answer: "Six of nine interviewees copied notes to another app when they lost signal. Four mentioned losing track of the latest draft. Test draft recovery with occasional users before treating this as a broader pattern.",
        followUp: "Recruit three occasional offline users",
      },
      {
        id: "prioritization",
        name: "Prioritization",
        description: "Compare scope against the next milestone.",
        prompt: "What should we prioritize for the beta?",
        answer: "Prioritize offline drafts and recovery. They address the clearest interview signal and fit one sprint. Defer shared editing offline until the team tests conflict recovery.",
        followUp: "Record why shared editing is deferred",
      },
    ],
  },
  {
    name: "Delivery & measurement",
    description: "Plan the beta, decide whether to ship, and check results.",
    workflows: [
      {
        id: "sprint",
        name: "Sprint planning",
        description: "Clarify scope, owners, and acceptance criteria.",
        prompt: "What should the next sprint deliver?",
        answer: "Ship local draft save and recovery in the next sprint. A draft should reopen after force-quit in airplane mode. Keep simultaneous edits out of scope until conflict handling is designed.",
        followUp: "Add a force-quit recovery example",
      },
      {
        id: "launch-readiness",
        name: "Launch readiness",
        description: "Review release blockers and rollout guardrails.",
        prompt: "Are we ready to expand the offline-draft beta?",
        answer: "Keep the beta at 12 teams until QA passes the reconnect cases. Expand to 30 teams after two days without confirmed draft loss. Pause rollout on any confirmed draft loss.",
        followUp: "Schedule the 30-team rollout review",
      },
      {
        id: "metrics",
        name: "Metrics review",
        description: "Check adoption and draft recovery after launch.",
        prompt: "What does the first beta cohort tell us?",
        answer: "In the sample cohort, 19 of 46 participants saved an offline draft. Of 27 drafts opened again after reconnecting, 25 restored without intervention. Inspect the two remaining cases before drawing a reliability conclusion.",
        followUp: "Review the two unresolved recovery events",
      },
    ],
  },
];

const seed = {
  records: [
    { id: "pm-11", workflow: "discovery", title: "Tag interview evidence by use case", owner: "Imani", status: "Done" },
    { id: "pm-12", workflow: "discovery", title: "Validate draft recovery with occasional users", owner: "Jules", status: "Open" },
    { id: "pm-21", workflow: "prioritization", title: "Compare offline drafts with shared editing", owner: "Jules", status: "In review" },
    { id: "pm-22", workflow: "prioritization", title: "Estimate the cost of conflict recovery", owner: "Remy", status: "Open" },
    { id: "pm-31", workflow: "sprint", title: "Define draft recovery acceptance criteria", owner: "Jules", status: "In review" },
    { id: "pm-32", workflow: "sprint", title: "Build the local draft recovery path", owner: "Remy", status: "Open" },
    { id: "pm-41", workflow: "launch-readiness", title: "Verify drafts survive reconnecting", owner: "Imani", status: "In review" },
    { id: "pm-42", workflow: "launch-readiness", title: "Agree on beta rollout guardrails", owner: "Jules", status: "Open" },
    { id: "pm-51", workflow: "metrics", title: "Audit the draft restored event", owner: "Remy", status: "In review" },
    { id: "pm-52", workflow: "metrics", title: "Review first-cohort activation", owner: "Jules", status: "Open" },
  ],
  chats: groups.flatMap((group) => group.workflows.map((workflow) => ({
    id: `seed-${workflow.id}`,
    workflow: workflow.id,
    title: {
      discovery: "Interview synthesis",
      prioritization: "Beta scope decision",
      sprint: "Sprint scope and criteria",
      "launch-readiness": "Offline drafts beta review",
      metrics: "First cohort readout",
    }[workflow.id],
    messages: [
      { author: "user", text: workflow.prompt },
      { author: "demo", text: workflow.answer },
    ],
  }))),
};

const storageKey = "workdeck-pm-demo-v1";
const defaultWorkflowId = "launch-readiness";
const workflows = groups.flatMap((group) => group.workflows.map((workflow) => ({ ...workflow, group: group.name })));
const workflowById = new Map(workflows.map((workflow) => [workflow.id, workflow]));
const byId = (id) => document.getElementById(id);
const messageInput = byId("message");
const resetDialog = byId("reset-dialog");

let state = load();
let workflowId = defaultWorkflowId;
let chatId = null;
let proposal = null;
let proposalTrigger = null;

function load() {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey));
    if (Array.isArray(stored?.records) && Array.isArray(stored?.chats)) return stored;
  } catch {
    // The demo can run in memory when browser storage is unavailable.
  }
  return structuredClone(seed);
}

function save() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

function announce(text) {
  byId("status").textContent = text;
}

function make(tag, text, className) {
  const node = document.createElement(tag);
  if (text) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function button(text, className, action) {
  const node = make("button", text, className);
  node.type = "button";
  node.addEventListener("click", action);
  return node;
}

function currentChat() {
  return state.chats.find((chat) => chat.id === chatId && chat.workflow === workflowId);
}

function getChat(title) {
  const existing = currentChat();
  if (existing) return existing;
  const chat = { id: crypto.randomUUID(), workflow: workflowId, title, messages: [] };
  state.chats.unshift(chat);
  chatId = chat.id;
  return chat;
}

function latestChat(id) {
  return state.chats.find((chat) => chat.workflow === id)?.id ?? null;
}

function clearProposal() {
  proposal = null;
  proposalTrigger = null;
  renderProposal();
}

function openConversation(id, selectedChat = null) {
  workflowId = id;
  chatId = selectedChat;
  clearProposal();
  messageInput.value = "";
  renderConversation();
  byId("overview").hidden = true;
  byId("conversation").hidden = false;
  byId("overview-nav").removeAttribute("aria-current");
  byId("chat-nav").setAttribute("aria-current", "page");
  byId("chat-heading").focus();
  scrollThread();
}

function renderOverview() {
  const cards = groups.map((group) => {
    const card = make("article", null, "workflow-card");
    const header = make("header");
    header.append(make("h2", group.name), make("p", group.description));
    const list = make("ul");
    for (const workflow of group.workflows) {
      const row = make("li");
      const start = button("", "button subtle", () => openConversation(workflow.id));
      start.append(make("strong", workflow.name), make("span", workflow.description));
      const count = state.chats.filter((chat) => chat.workflow === workflow.id).length;
      const history = button(`History (${count})`, "button history-button", () => openConversation(workflow.id, latestChat(workflow.id)));
      history.setAttribute("aria-label", `${workflow.name} history (${count})`);
      row.append(start, history);
      list.append(row);
    }
    card.append(header, list);
    return card;
  });
  byId("workflows").replaceChildren(...cards);
}

function renderConversation() {
  const workflow = workflowById.get(workflowId);
  const chat = currentChat();
  byId("scope").textContent = workflow.group;
  byId("chat-heading").textContent = workflow.name;
  byId("workflow-picker").value = workflowId;
  messageInput.placeholder = workflow.prompt;
  byId("empty-chat").hidden = Boolean(chat?.messages.length);
  byId("messages").replaceChildren(...(chat?.messages ?? []).map((message) => {
    const isUser = message.author === "user";
    const item = make("li", null, isUser ? "msg user" : "msg");
    item.append(make("strong", isUser ? "You" : "Demo assistant"), make("p", message.text));
    return item;
  }));
  const history = byId("history-list");
  history.replaceChildren();
  for (const saved of state.chats.filter((item) => item.workflow === workflowId)) {
    const row = make("li");
    const link = button(saved.title, "history-item", () => openConversation(workflowId, saved.id));
    if (saved.id === chatId) link.setAttribute("aria-current", "true");
    row.append(link);
    history.append(row);
  }
  if (!history.children.length) history.append(make("li", "No saved conversations yet.", "note"));
  renderRecords();
}

function visibleRecords() {
  return state.records.filter((record) => record.workflow === workflowId);
}

function renderRecords() {
  const list = byId("records-list");
  const records = visibleRecords();
  list.replaceChildren();
  for (const record of records) {
    const row = make("li");
    row.append(make("strong", record.title), make("span", `${record.owner} · ${record.status}`));
    list.append(row);
  }
  if (!records.length) list.append(make("li", "No tasks in this workflow.", "note"));

  const actions = byId("record-actions");
  actions.replaceChildren(button("Preview create", "button", (event) => stage("create", event.currentTarget)));
  if (records.length) {
    actions.append(
      button("Preview update", "button", (event) => stage("update", event.currentTarget)),
      button("Preview delete", "button", (event) => stage("delete", event.currentTarget)),
    );
  }
}

function renderProposal() {
  const panel = byId("proposal");
  panel.hidden = !proposal;
  if (!proposal) return;
  const { kind, record, nextStatus } = proposal;
  byId("proposal-heading").textContent = `Review simulated ${kind}`;
  const fields = [
    ["Task", record.title],
    ["Owner", record.owner],
    ["Status", kind === "update" ? `${record.status} → ${nextStatus}` : record.status],
  ];
  byId("changes").replaceChildren(...fields.flatMap(([label, value]) => [make("dt", label), make("dd", value)]));
}

function stage(kind, trigger) {
  const existing = visibleRecords()[0];
  const record = kind === "create"
    ? { id: crypto.randomUUID(), workflow: workflowId, title: workflowById.get(workflowId).followUp, owner: "Jules", status: "Open" }
    : existing;
  if (!record) return;
  proposal = { kind, record, nextStatus: record.status === "Done" ? "In review" : "Done" };
  proposalTrigger = trigger;
  renderProposal();
  scrollThread();
  byId("proposal-heading").focus();
}

function scrollThread() {
  const thread = byId("thread");
  thread.scrollTop = thread.scrollHeight;
}

function reply(text) {
  const normalize = (value) => value.toLowerCase().replace(/[.!?]+$/, "").trim();
  const workflow = workflowById.get(workflowId);
  const command = normalize(text);
  if (command === normalize(workflow.prompt)) return workflow.answer;
  if (command !== "list tasks") return `Try “${workflow.prompt}” or “List tasks”. Use Product tasks to preview a change.`;
  const records = visibleRecords();
  if (!records.length) return "This workflow has no sample tasks.";
  return records.map((record) => `• ${record.title} — ${record.owner}, ${record.status}`).join("\n");
}

for (const workflow of workflows) {
  const option = make("option", workflow.name);
  option.value = workflow.id;
  byId("workflow-picker").append(option);
}

function openOverview() {
  clearProposal();
  renderOverview();
  byId("conversation").hidden = true;
  byId("overview").hidden = false;
  byId("chat-nav").removeAttribute("aria-current");
  byId("overview-nav").setAttribute("aria-current", "page");
  byId("overview-title").focus();
}

byId("overview-nav").addEventListener("click", openOverview);
byId("chat-nav").addEventListener("click", () => openConversation(workflowId, chatId ?? latestChat(workflowId)));
byId("new-chat").addEventListener("click", () => openConversation(workflowId));
byId("workflow-picker").addEventListener("change", (event) => {
  const id = event.currentTarget.value;
  openConversation(id, latestChat(id));
});
byId("suggestion").addEventListener("click", () => {
  messageInput.value = workflowById.get(workflowId).prompt;
  messageInput.focus();
});
byId("composer").addEventListener("submit", (event) => {
  event.preventDefault();
  const text = messageInput.value.trim();
  if (!text) return;
  const chat = getChat(text.slice(0, 76));
  chat.messages.push({ author: "user", text }, { author: "demo", text: reply(text) });
  const saved = save();
  messageInput.value = "";
  clearProposal();
  renderConversation();
  messageInput.focus();
  scrollThread();
  announce(saved ? "Demo reply ready." : "Demo reply ready. Browser storage is unavailable.");
});
byId("cancel").addEventListener("click", () => {
  const trigger = proposalTrigger;
  clearProposal();
  trigger?.focus();
  announce("Change canceled. Sample tasks are unchanged.");
});
byId("approve").addEventListener("click", () => {
  if (!proposal) return;
  const { kind, record, nextStatus } = proposal;
  clearProposal();
  if (kind === "create") state.records.push(record);
  if (kind === "update") record.status = nextStatus;
  if (kind === "delete") state.records = state.records.filter((item) => item.id !== record.id);
  getChat("Task changes").messages.push({ author: "demo", text: `Simulated ${kind} applied to “${record.title}”.` });
  const saved = save();
  renderConversation();
  scrollThread();
  byId("record-actions").querySelector("button").focus();
  announce(saved ? "Simulated change applied." : "Simulated change applied for this visit. Browser storage is unavailable.");
});
byId("reset").addEventListener("click", () => {
  resetDialog.returnValue = "";
  resetDialog.showModal();
});
resetDialog.addEventListener("close", () => {
  if (resetDialog.returnValue !== "reset") return;
  state = structuredClone(seed);
  workflowId = defaultWorkflowId;
  chatId = null;
  const saved = save();
  openOverview();
  announce(saved ? "Demo reset." : "Demo reset for this visit. Browser storage is unavailable.");
});

renderOverview();
