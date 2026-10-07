---
name: QR Code
description: Render a scannable QR code for any link or short text — links, Wi-Fi strings, contacts
version: 1.0.1
category: utilities
icon: qr-code
tools:
  - name: make_qr
    description: Render a QR code for a URL or text (up to 500 chars) — the card image is scannable
    parameters: {"type":"object","properties":{"text":{"type":"string","description":"URL or text to encode"},"size":{"type":"number","description":"Edge pixels 128–512 (default 256)"}},"required":["text"]}
    run: tools/qr.js
components:
  - name: qr-card
    html: components/qr.html
    css: components/qr.css
    js: components/qr.js
---

When the user wants a QR code for a link, Wi-Fi credential string
(`WIFI:T:WPA;S:name;P:pass;;`), contact card, or any short text, call
`make_qr`. The card renders a scannable image via the api.qrserver.com
renderer.
