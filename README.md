# Caelune plugins

Community plugins for [Caelune](https://caelune.org). One folder per plugin
under `plugins/`; every push to `main` rebuilds `index.json` + per-plugin
bundles and publishes them to the rolling `registry` release, which the app
browses in Settings → Plugins → Community.

## Layout

```
plugins/<slug>/
  SKILL.md            # frontmatter: name, description, version, tools, components
  tools/*.js          # tool('name', async (input, ctx) => { content, render? })
  components/*.{html,css,js}   # component('name', (ui, props) => …)
```

- `SKILL.md` body is injected into the model's system prompt while the plugin
  is enabled.
- Plugin JS runs in a Web Worker — `fetch` works, no DOM access. Components
  paint through the `ui` bridge (`ui.text/html/attr`, `ui.on('event')`) into a
  sandboxed iframe; DOM events reach the worker via `data-emit` attributes.
- `scripts/build.mjs` validates frontmatter and file references; a broken
  plugin fails the release so the registry never goes inconsistent.

## Adding a plugin

1. `plugins/<slug>/SKILL.md` + your files, slug = lowercase kebab.
2. `node scripts/build.mjs` locally to validate.
3. PR to `main` — the release Action publishes automatically.
