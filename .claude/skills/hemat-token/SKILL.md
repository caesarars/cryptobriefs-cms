---
name: hemat-token
description: Apply token/usage-saving rules when working in this repo. Trigger on any non-trivial Claude Code task in this project — file exploration, code edits, multi-step refactors, or research. Skip for one-line trivial answers.
---

# Hemat Token — Rules for cheap, effective tool use

Load these rules before doing real work in this repo. They reduce context burn, avoid duplicate reads, and keep the task from ballooning into a subagent swarm when direct tools would finish it faster.

## 1. Pick the cheapest tool that does the job

- **File search**: `Glob` > `Bash find`. `Grep` > `Bash grep/rg`. `Read` > `Bash cat/head/tail`. `Edit` > `Bash sed`.
- **Known target?** Use the direct tool. Don't spawn `Agent` just to find one file.
- **Open-ended research across >3 queries?** Then `Agent(subagent_type=Explore)` is worth it — its context is scoped, ours isn't.

## 2. Don't re-read what you already have

- If a file was read earlier in this conversation, use that content. Don't re-`Read` it unless you explicitly edited it or suspect external change.
- If `git status` / `git diff` output is already in context, don't re-run.

## 3. Grep/Read discipline

- Default `Grep` to `output_mode: "files_with_matches"` for locating, switch to `"content"` only when you need snippets.
- Always set `head_limit` on broad searches (default 250 is fine; drop lower for known-narrow queries).
- For large files, pass `offset` + `limit` to `Read`. Don't read a 2000-line file to check one function.
- Prefer `type: "ts"` / `glob: "*.tsx"` filters over unfiltered project-wide scans.

## 4. Parallelize independent calls

- Multiple unrelated reads / greps / bash checks → one message, multiple tool blocks.
- Sequential only when a later call depends on an earlier call's output.

## 5. Edits

- `Edit` with a tight `old_string` is cheaper than `Write` (which re-sends the whole file).
- Only use `Write` for new files or full rewrites.
- Don't add "cleanup" diffs the user didn't ask for — each extra hunk is extra tokens to produce, review, and re-read later.

## 6. Subagents cost a cold start

- Each `Agent` call re-derives context from scratch — expensive. Only delegate when:
  - The search truly spans many files with ambiguous naming, OR
  - The result set would flood main context (e.g. dumping 50 files of output), OR
  - The user explicitly asked for a subagent.
- **Continue** an existing agent via `SendMessage` instead of spawning a fresh one.

## 7. Don't over-plan trivial work

- Skip `TaskCreate` for 1–2 step tasks.
- Skip `Plan` agent for edits you already understand.
- Don't write intermediate markdown files ("analysis.md", "plan.md") unless the user asked.

## 8. Output discipline

- Final response: 1–2 sentences for "done" + what's next. No recap of every tool call.
- Between tool calls: ≤25 words. Silence is fine if the next step is obvious.
- No emoji, no decorative headers, no "Let me..." preambles before tool calls.

## 9. Project-specific shortcuts

- Env/config questions → read `vite.config.ts` + `.env` only. Don't grep whole project.
- AI prompt changes → `services/geminiService.ts` is the single source; SEO-brief stripper lives in `components/PostForm.tsx` (see CLAUDE.md for the coupling).
- Publishing flow questions → four page components (`OneClickPost`, `AIDraftGenerator`, `AIBatchGenerator`, `PostForm`) each re-implement the axios calls — grep for `BASE_URL_API` to see them all at once.
- Skip `firebaseService.ts`, `constants.ts`, `PostList.tsx`, `PostDetail.tsx` when answering functional questions — they're unwired.
