# Caelune plugins

Community plugins for [Caelune](https://caelune.org). One folder per plugin
under `plugins/`; every push to `main` rebuilds `index.json` + per-plugin
bundles and publishes them to the rolling `registry` release, which the app
browses at `/plugins`.

## Layout

```
plugins/<slug>/
  SKILL.md            # frontmatter: name, description, version,
                      # capabilities, tools, components
  tools/*.js          # caelune.tool('name', async (args, ctx) => {content, render?})
  components/*.{html,css,js}   # caelune.component('name', ({ui, props}) => …)
```

- `SKILL.md` body is injected into the model's system prompt while the plugin
  is enabled — write it for the model, not the user.
- Plugin JS runs in a Web Worker — no DOM access, `fetch` works. Components
  paint through the `ui` bridge (`ui.text/html/attr`, `ui.on('event')`) into a
  sandboxed iframe; DOM events reach the worker via `data-emit` attributes.
- `scripts/build.mjs` validates frontmatter and file references; a broken
  plugin fails the release so the registry never goes inconsistent.

## The `caelune` API

One namespace, injected before plugin code. Full types:
[`api.d.ts`](./api.d.ts) (also at `https://caelune.org/plugin-api.d.ts`).

```js
// registration — always available
caelune.tool('roll_dice', async (args) => ({ content: '…', render: {...} }));
caelune.component('dice-card', ({ ui, props }) => { … });
caelune.log / .warn / .error;

// declared capabilities → members appear only when declared in SKILL.md
caelune.storage.get/set/del/keys    // capabilities: storage — per-plugin KV
caelune.settings.get/set(key, v)    // capabilities: settings.<key> — whitelisted keys
caelune.fetch(url, init)            // capabilities: network
```

Tools return `{content, render}` — `content` is what the model reads;
`render` mounts a component card (`{component, props}`) or inline
`{html, css}` in the reply. Components get a per-instance `ui` bridge and
`ui.on('unmount')` fires on teardown.

### Compatibility

v1 surface still works: `tool()`/`component()` globals, `caelune.store`,
`caelune.get/setCustomCss`, `(ui, props)` mounts, and the `pluginStorage` /
`customCss` capability names are all honored — canonical form is the
`caelune.*` API above.

## Adding a plugin

1. `plugins/<slug>/SKILL.md` + your files, slug = lowercase kebab.
2. `node scripts/build.mjs` locally to validate.
3. PR to `main` — the release Action publishes automatically.
