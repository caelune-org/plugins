---
name: Workspace
description: Named workspaces of persistent files — draft documents, write code, take notes the model can read back, search, and surgically edit across the conversation
version: 1.1.0
category: productivity
icon: folder-kanban
capabilities:
  - files
tools:
  - name: workspace_list
    description: List all workspaces with their file counts and sizes
    parameters: {"type":"object","properties":{}}
    run: tools/ws.js
  - name: workspace_create
    description: Create a new named workspace (names are short kebab-case, e.g. "docs" or "web-app")
    parameters: {"type":"object","properties":{"name":{"type":"string","description":"1-40 chars: letters, digits, _ or -"}},"required":["name"]}
    run: tools/ws.js
  - name: workspace_delete
    description: Permanently delete a workspace and every file in it
    parameters: {"type":"object","properties":{"name":{"type":"string"}},"required":["name"]}
    run: tools/ws.js
  - name: workspace_rename
    description: Rename a workspace — every file moves with it
    parameters: {"type":"object","properties":{"from":{"type":"string"},"to":{"type":"string"}},"required":["from","to"]}
    run: tools/ws.js
  - name: file_list
    description: List a workspace's files with sizes; optional prefix (e.g. "src") narrows the tree
    parameters: {"type":"object","properties":{"ws":{"type":"string","description":"Workspace name — omit to reuse the last workspace used"},"prefix":{"type":"string","description":"Optional directory prefix like src or docs"}}}
    run: tools/ws.js
  - name: file_read
    description: Read a file — char mode (offset/length) or line mode (line/count, 1-based). Reads are windowed; hasMore signals more content
    parameters: {"type":"object","properties":{"ws":{"type":"string","description":"Workspace — omit to reuse the last one"},"path":{"type":"string","description":"Path like notes.md or src/index.js"},"offset":{"type":"number","description":"Char offset to start at"},"length":{"type":"number","description":"Chars to read (default 16000, max 48000)"},"line":{"type":"number","description":"First line to read, 1-based — line mode"},"count":{"type":"number","description":"Lines to read (default 120, max 400)"}},"required":["path"]}
    run: tools/ws.js
  - name: file_write
    description: Write a file — creates the workspace automatically when missing. Pass append:true to extend; otherwise overwrites
    parameters: {"type":"object","properties":{"ws":{"type":"string","description":"Workspace — omit to reuse the last one"},"path":{"type":"string"},"content":{"type":"string","description":"Full file text (or the chunk when appending)"},"append":{"type":"boolean","description":"Append instead of overwrite"}},"required":["path","content"]}
    run: tools/ws.js
  - name: file_edit
    description: Surgically replace exact text in a file — the `old` span must match once (pass all:true to replace every occurrence). Prefer this over rewriting whole files
    parameters: {"type":"object","properties":{"ws":{"type":"string","description":"Workspace — omit to reuse the last one"},"path":{"type":"string"},"old":{"type":"string","description":"Exact text to replace, whitespace included"},"new":{"type":"string","description":"Replacement text"},"all":{"type":"boolean","description":"Replace every occurrence"}},"required":["path","old","new"]}
    run: tools/ws.js
  - name: file_search
    description: Search file contents across a workspace — returns path:line hits; optional prefix and ci (case-insensitive)
    parameters: {"type":"object","properties":{"ws":{"type":"string","description":"Workspace — omit to reuse the last one"},"query":{"type":"string","description":"Text to find"},"prefix":{"type":"string","description":"Limit to a directory prefix"},"ci":{"type":"boolean","description":"Case-insensitive"},"max":{"type":"number","description":"Max hits (default 40)"}},"required":["query"]}
    run: tools/ws.js
  - name: file_delete
    description: Delete a single file
    parameters: {"type":"object","properties":{"ws":{"type":"string","description":"Workspace — omit to reuse the last one"},"path":{"type":"string"}},"required":["path"]}
    run: tools/ws.js
  - name: file_move
    description: Rename or move a file inside a workspace; refuses to overwrite an existing destination
    parameters: {"type":"object","properties":{"ws":{"type":"string","description":"Workspace — omit to reuse the last one"},"from":{"type":"string"},"to":{"type":"string"}},"required":["from","to"]}
    run: tools/ws.js
  - name: file_download
    description: Save a file to the user's downloads folder (real browser download)
    parameters: {"type":"object","properties":{"ws":{"type":"string","description":"Workspace — omit to reuse the last one"},"path":{"type":"string"}},"required":["path"]}
    run: tools/ws.js
components:
  - name: ws-card
    html: components/ws-card.html
    css: components/ws-card.css
    js: components/ws-card.js
---

Workspaces hold real files that persist across messages and reloads — use
them whenever the user wants a document drafted, code scaffolded, notes
kept, or anything meant to outlive one reply. Files live per-project: make
a workspace per effort ("notes", "landing-page", "api-docs") with a short
kebab-case name; `file_write` auto-creates it.

The `ws` argument remembers the last workspace you touched — omit it once a
workspace is in play and the tools stay on it; pass it explicitly to
switch. User-attached files (pasted or dropped into chat) can be saved into
a workspace with `file_write`.

Context discipline — files can be big, the context window is not:

- `file_list` / `file_search` before reading — never guess paths, and
  search for a name instead of reading everything to find it.
- `file_read` is windowed. For code, line mode (`line`/`count`) is the
  natural unit — search results hand you line numbers directly. Check
  `hasMore` and page instead of pulling whole files.
- Prefer `file_edit` for changes — it replaces an exact span and reports
  what it replaced. Rewrite with `file_write` only for new files or true
  overhauls; `old` must match once (it's refused when ambiguous) so copy it
  from a `file_read`, whitespace included.
- `file_write` returns byte stats, not the content — don't re-read a file
  you just wrote.
- The rendered card keeps a live file tree for the user — answer briefly;
  don't paste listings back into the reply.

Safety: `file_write` overwrites — check the file first when replacing
something that matters. `file_move` won't clobber an existing destination.
`workspace_delete` is permanent — only when the user asks for the workspace
gone. `file_download` saves to the user's downloads folder.
