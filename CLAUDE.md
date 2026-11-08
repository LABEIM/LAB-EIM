# CLAUDE.md

@AGENTS.md

**All project rules live in [`AGENTS.md`](AGENTS.md)** — the single source of truth for every AI
assistant (architecture, conventions, testing, quality gates, git workflow, and development
standards). Read it in full; do not re-add project rules here. Everything below applies ONLY
to Claude Code — operational refinements of rules already defined in `AGENTS.md`.

## Cross-session safety — Claude Code specifics

Operational guidelines governing parallel sessions and multi-agent coordination:

- **Replicate the `git stash` ban verbatim in the prompt of every subagent that touches git**
  (Agent tool / Workflow scripts) — subagents do not inherit this file, and unexpected stashes can lead to lost work across parallel sessions.
- Before merging or pushing to any PR you did not create _this session_, run `git worktree list`
  and re-check `gh pr view <N> --json state,headRefOid`.
- End every session with the main checkout on the branch it started on.

## Superpowers / planning artifacts — path overrides

The `_tasks/` convention is defined for durable planning and research artifacts. The
superpowers skills ship with defaults that point at `docs/…` — those defaults are **overridden
here**. When a superpowers skill announces a path like "saved to `docs/superpowers/plans/…`",
rewrite it to the `_tasks/…` equivalent before writing:

| Artifact (skill)                   | Default (do NOT use)      | Save here instead                                             |
| ---------------------------------- | ------------------------- | ------------------------------------------------------------- |
| Plans (`writing-plans`)            | `docs/superpowers/plans/` | `_tasks/superpowers/plans/YYYY-MM-DD-<feature>.md`            |
| Specs / design (`brainstorming`)   | `docs/superpowers/specs/` | `_tasks/superpowers/specs/YYYY-MM-DD-<topic>-design.md`       |
| Research (`deep-research`, ad-hoc) | `docs/research/`          | `_tasks/research/…`                                           |
| Hand-offs (`/handoff`)             | —                         | `_tasks/hands-off/<YYYY-MM-DD>_<branch>_v<version>_sess-<id>/` |

## Scratch / temporary files — use `_artifacts/`, not `/tmp`

This project overrides the harness's default session scratchpad (`/tmp/claude-*/…`). Write
temporary/working files — generated assets, HTML previews, screenshots, downloaded archives, and
experiment scripts — to `./_artifacts/` instead. Do not write them to `/tmp` or anywhere else
outside `./_artifacts/`, and do not commit them.
