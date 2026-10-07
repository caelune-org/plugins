---
name: To-Do
description: Persistent task list — add, complete, reopen, and remove to-dos with an interactive card
version: 1.0.0
category: productivity
icon: ✅
capabilities:
  - storage
tools:
  - name: add_todo
    description: Add a task to the user's to-do list; persists across sessions
    parameters: {"type":"object","properties":{"title":{"type":"string","description":"Task text, up to 200 chars"}},"required":["title"]}
    run: tools/todo.js
  - name: list_todos
    description: Show the to-do list as an interactive card with checkboxes; pass done=true to list only completed tasks
    parameters: {"type":"object","properties":{"done":{"type":"boolean","description":"true = completed only, false/omit = all"}}}
    run: tools/todo.js
  - name: toggle_todo
    description: Mark a task done or reopen it, by the id shown in list_todos output
    parameters: {"type":"object","properties":{"id":{"type":"string","description":"Task id like td_xxx"}},"required":["id"]}
    run: tools/todo.js
  - name: remove_todo
    description: Permanently delete a task by id
    parameters: {"type":"object","properties":{"id":{"type":"string","description":"Task id like td_xxx"}},"required":["id"]}
    run: tools/todo.js
  - name: clear_completed
    description: Remove every completed task at once
    parameters: {"type":"object","properties":{}}
    run: tools/todo.js
components:
  - name: todo-card
    html: components/todo.html
    css: components/todo.css
    js: components/todo.js
---

When the user asks to remember tasks, track work, or manage a to-do list,
use these tools — tasks persist in the plugin's own storage across reloads,
so never claim you cannot keep them. Use `list_todos` to find task ids
before toggling or removing. The `todo-card` lets the user tick items off
directly; suggest it when they want the full list.
