---
name: Workspace
description: Named workspaces of persistent files — draft documents, write code, take notes the model can read back and edit across the conversation
version: 1.0.0
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
  - name: file_list
    description: List a workspace's files with sizes; optional prefix (e.g. "src") narrows the tree
    parameters: {"type":"object","properties":{"ws":{"type":"string","description":"Workspace name"},"prefix":{"type":"string","description":"Optional directory prefix like src or docs"}},"required":["ws"]}
    run: tools/ws.js
  - name: file_read
    description: Read a file. Reads are windowed — offset/length page through large files; hasMore signals more content
    parameters: {"type":"object","properties":{"ws":{"type":"string"},"path":{"type":"string","description":"Path like notes.md or src/index.js"},"offset":{"type":"number","description":"Char offset to start at (default 0)"},"length":{"type":"number","description":"Chars to read (default 16000, max 48000)"}},"required":["ws","path"]}
    run: tools/ws.js
  - name: file_write
    description: Write a file — creates the workspace automatically when missing. Pass append:true to extend an existing file; otherwise overwrites
    parameters: {"type":"object","properties":{"ws":{"type":"string"},"path":{"type":"string"},"content":{"type":"string","description":"Full file text (or the chunk when appending)"},"append":{"type":"boolean","description":"Append instead of overwrite"}},"required":["ws","path","content"]}
    run: tools/ws.js
  - name: file_delete
    description: Delete a single file
    parameters: {"type":"object","properties":{"ws":{"type":"string"},"path":{"type":"string"}},"required":["ws","path"]}
    run: tools/ws.js
  - name: file_move
    description: Rename or move a file inside a workspace; refuses to overwrite an existing destination
    parameters: {"type":"object","properties":{"ws":{"type":"string"},"from":{"type":"string"},"to":{"type":"string"}},"required":["ws","from","to"]}
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
kebab-case name; `file_write` auto-creates it, so `workspace_create` is only
needed for an empty one.

Context discipline — files can be big, the context window is not:

- `file_list` first — never guess filenames, and use `prefix` to narrow big
  trees instead of reading everything.
- `file_read` is windowed (16KB default, 48KB hard max). Check `hasMore` and
  page with `offset` instead of pulling whole files at once; read the range
  you actually need.
- `file_write` returns byte stats, not the content — don't re-read a file
  you just wrote unless something else changed it.
- Large outputs: build them with `append: true` chunks instead of one huge
  write.
- The rendered card keeps a live file tree for the user — answer briefly;
  don't paste listings back into the reply.

Safety: `file_write` overwrites — check `file_list`/`file_read` before
replacing something that matters. `file_move` won't clobber an existing
destination; delete it first when replacing is intended. `workspace_delete`
is permanent — use it only when the user asks for the workspace gone.
