# Writing a Caelune plugin

A plugin is a folder: one `SKILL.md` plus any mix of `.js` / `.css` / `.html`
files. No build step, no dependencies — the app concatenates your JS into a
Web Worker at install time.

## Frontmatter

```yaml
---
name: My Plugin                    # shown in the plugin list (required)
description: One line for humans   # community row (required)
version: 1.0.0                     # semver-ish; bump to trigger Update buttons
category: utilities                # productivity | utilities | personalization | fun
icon: qr-code                      # a lucide name — no emoji; unknown names
                                   # fall back to the puzzle tile
capabilities:                      # omit entirely if none needed
  - storage                        #   caelune.storage.*  (per-plugin KV, 64KB)
  - settings.customCss             #   caelune.settings.get/set('customCss')
  - network                        #   caelune.fetch
tools:
  - name: my_tool                  # [a-zA-Z0-9_-]{1,64} — the model's function name
    description: what the model sees — write it to steer when it gets called
    parameters: {"type":"object","properties":{"x":{"type":"string"}},"required":["x"]}
    run: tools/main.js
components:
  - name: my-card                  # the card a tool's `render` can mount
    html: components/card.html
    css: components/card.css
    js: components/card.js
---
```

Everything below the frontmatter is injected verbatim into the model's
system prompt. Tell the model *when* to call each tool and *how* to
interpret results — that text is your UX for model behavior.

## Runtime

- Tool code: `caelune.tool('my_tool', async (args, ctx) => ({content, render}))`
  — `content` is the text the model reads back; `render` is optional and
  mounts a card: `{component:'my-card', props:{…}}` or inline `{html, css}`.
- Component mounts: `caelune.component('my-card', ({ui, props}) => …)` — the
  mount runs in the *worker*, painting the sandboxed iframe through
  `ui.text(sel)`, `ui.html(sel)`, `ui.attr(sel, name, val)`.
- Iframe → worker events: put `data-emit="name" data-value="…"` on elements;
  clicks (and form submits) arrive as `ui.on('name', cb)`. Clean up timers
  in `ui.on('unmount', …)` — they leak otherwise.
- Keep secrets out of `content` if the model shouldn't echo them — return
  them via `render.props` and summarize instead (see `password`).
- No emoji anywhere — plugin workers can't import lucide-react, so embed
  the icon's SVG path data as strings in your component JS (see `weather`'s
  `P` map for the pattern).

## Capabilities

Declare the minimum set. The host re-checks declarations on every call —
undeclared access fails with `capability not granted`. Capability chips are
visible to users on `/plugins`, so sparse is a feature.

## Checklist

1. `plugins/<slug>/` — lowercase kebab slug.
2. `node scripts/build.mjs` passes (validates frontmatter + file refs).
3. Tools degrade gracefully: bad args → `{content:'helpful error'}`, never
   an unhandled throw (it becomes a tool-run error in chat).
4. Long strings in `content` get truncated ~50 items; components poll
   `caelune.storage` rather than assuming one writer.
5. PR to `main`; the release workflow publishes automatically.
