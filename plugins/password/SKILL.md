---
name: Password Generator
description: Cryptographically secure random passwords — adjustable length, symbols, and strength readout
version: 1.0.1
category: utilities
icon: key-round
tools:
  - name: make_password
    description: Generate a secure random password; shows it in a card rather than echoing it in chat
    parameters: {"type":"object","properties":{"length":{"type":"number","description":"Characters, 6–64 (default 16)"},"symbols":{"type":"boolean","description":"Include punctuation symbols (default true)"}},"required":[]}
    run: tools/pass.js
components:
  - name: pass-card
    html: components/pass.html
    css: components/pass.css
    js: components/pass.js
---

When the user wants a password, passphrase seed, or random secret, call
`make_password`. The password is generated with `crypto.getRandomValues`
and rendered in a card — it is deliberately not repeated in the text
reply, so summarize length/entropy instead of quoting it.
