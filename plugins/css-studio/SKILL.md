---
name: CSS Studio
description: Read and rewrite the app's Custom CSS to restyle the interface on request
version: 1.0.1
category: personalization
icon: 🎨
capabilities:
  - settings.customCss
tools:
  - name: get_custom_css
    description: Read the custom CSS currently applied to the app; returns the stylesheet text, or an empty result when none is set
    parameters: {"type":"object","properties":{}}
    run: tools/css.js
  - name: set_custom_css
    description: Replace the app's Custom CSS with the given stylesheet, applied immediately; pass an empty string to clear all custom styling
    parameters: {"type":"object","properties":{"css":{"type":"string","description":"Complete stylesheet text to apply; an empty string clears"}},"required":["css"]}
    run: tools/css.js
components:
  - name: css-card
    html: components/card.html
    css: components/card.css
    js: components/card.js
---

When the user wants to change how the app looks — colors, backgrounds, fonts,
spacing, rounded corners, hiding or restyling elements — beyond what the
preset settings offer, use these tools to edit the Custom CSS field in
personalization settings; changes apply to the live app immediately.

Call `get_custom_css` first when the user wants to *adjust* existing styling
so you amend rather than wipe it; writing directly is fine when they ask for
a fresh look. Write complete, valid CSS. Useful hooks: `.sidebar`,
`.conv-item`, `.msg`, `.msg .md`, `.composer-box`, `.send-btn`, `.msg-user`,
plus the theme custom properties `--background`, `--foreground`, `--primary`,
`--card`, `--border`, `--font-ui`, `--font-serif`, `--font-mono`. Keep rules
scoped and modest; reach for `!important` only to beat built-in defaults.
`set_custom_css` with an empty string removes all custom styling. After
applying, briefly say what you changed.
