# Caelune plugins

Community plugins for [Caelune](https://caelune.org). One folder per plugin
under `plugins/`; every push to `main` rebuilds `index.json` + per-plugin
bundles and publishes them to the rolling `registry` release, which the app
browses at `/plugins`.

## Plugins

| Plugin | Icon | Category | Capabilities | What it does |
|--------|------|----------|--------------|--------------|
| [calendar](plugins/calendar) | `calendar-days` | productivity | `storage` | Interactive month grid with persistent events |
| [todo](plugins/todo) | `list-checks` | productivity | `storage` | Task list with a checkbox card you can tick off |
| [weather](plugins/weather) | `cloud-sun` | utilities | `network` | Live conditions + 4-day forecast via Open-Meteo |
| [currency](plugins/currency) | `arrow-right-left` | utilities | `network` | Converts amounts at ECB reference rates |
| [clock](plugins/clock) | `clock` | utilities | — | World clock card, live-ticking |
| [password](plugins/password) | `key-round` | utilities | — | Crypto-secure passwords with entropy readout |
| [qr-code](plugins/qr-code) | `qr-code` | utilities | — | Scannable QR for links and short text |
| [css-studio](plugins/css-studio) | `palette` | personalization | `settings.customCss` | Lets the model restyle the app's custom CSS |
| [dice-roller](plugins/dice-roller) | `dices` | fun | — | NdM dice with an animated result card |

## Layout

```
plugins/<slug>/
  SKILL.md            # frontmatter: name, description, version,
                      # category, icon, capabilities, tools, components
  tools/*.js          # caelune.tool('name', async (args, ctx) => {content, render?})
  components/*.{html,css,js}   # caelune.component('name', ({ui, props}) => …)
```

Optional frontmatter: `category` (productivity / utilities / personalization /
fun — shown as a tag on the community row) and `icon` — a lucide icon name
(`calendar-days`, `key-round`, `qr-code`, `dices`, …) shown in the plugin's
tile. Only names in the app's curated `PLUGIN_ICONS` map resolve; unknown
names fall back to the puzzle glyph. No emoji — icons are vectors.

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
