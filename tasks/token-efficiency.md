# Token Efficiency Rules — NON-NEGOTIABLE

> Be surgical. Be fast. Be minimal.

---

## Core Rules

1. **Grep/Glob first** — Find the exact file and line before reading anything. Never read a full file speculatively.
2. **Read only what's relevant** — Use line offsets and limits. Never read the whole file if you only need one function.
3. **No preamble or filler** — Responses go straight to the point. No "Great question!", no restating the task, no trailing summaries.
4. **Fix only what's broken** — Don't touch unrelated code. Surgical edits only.
5. **Stop when done** — No extra sweeps, no unsolicited summaries after task completion.
6. **One subagent, one task** — Don't overload subagents. Focused execution > broad exploration.
7. **No redundant tool calls** — Don't read a file you already read. Don't search for something you already found.

---

## Anti-Patterns to Avoid

- Reading an entire file when only 10 lines matter
- Summarizing what you just did at the end of every response
- Running broad searches when a targeted grep would work
- Asking clarifying questions that could be answered by reading the code
- Making multiple tool calls that return the same information

---

## When in Doubt

Ask: "Is this tool call necessary, or am I just being thorough for its own sake?"
If it's the latter — skip it.
