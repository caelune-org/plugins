---
name: World Clock
description: Show the current time in any IANA timezone on a live ticking card
version: 1.0.0
tools:
  - name: current_time
    description: Get the current date and time, optionally in an IANA timezone like Asia/Shanghai or Europe/London; omit timezone for the viewer's local time
    parameters: {"type":"object","properties":{"timezone":{"type":"string","description":"IANA timezone name, e.g. Asia/Tokyo. Omit for the viewer's local time"}}}
    run: tools/clock.js
components:
  - name: clock-card
    html: components/clock.html
    css: components/clock.css
    js: components/clock.js
---

When the user asks what time it is, needs a timestamp, or asks about the time
in another city or timezone, call `current_time` and report what the card
shows. The card keeps ticking — quote it once and let it run.
