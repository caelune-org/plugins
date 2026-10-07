---
name: Currency
description: Convert amounts between currencies at live ECB reference rates — 30+ ISO currencies
version: 1.0.1
category: utilities
icon: arrow-right-left
capabilities:
  - network
tools:
  - name: convert_currency
    description: Convert an amount between two ISO 4217 currency codes (USD, EUR, JPY, CNY, GBP…) at the latest reference rate
    parameters: {"type":"object","properties":{"amount":{"type":"number","description":"Amount to convert"},"from":{"type":"string","description":"Source ISO code, e.g. USD"},"to":{"type":"string","description":"Target ISO code, e.g. EUR"}},"required":["amount","from","to"]}
    run: tools/fx.js
components:
  - name: fx-card
    html: components/fx.html
    css: components/fx.css
    js: components/fx.js
---

When the user asks to convert money between currencies, call
`convert_currency` with ISO 4217 codes. Rates come from the Frankfurter
API (European Central Bank reference rates, updated daily); same-currency
requests short-circuit without a fetch.
