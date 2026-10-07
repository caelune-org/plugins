---
name: Calendar
description: Month calendar view with persistent events — add, list, and remove dated events
version: 1.0.2
category: productivity
icon: 📅
capabilities:
  - storage
tools:
  - name: month_calendar
    description: Show an interactive calendar card for a given month; omit month/year for the current month
    parameters: {"type":"object","properties":{"month":{"type":"number","description":"Month 1-12"},"year":{"type":"number","description":"Full year, e.g. 2026"}}}
    run: tools/calendar.js
  - name: add_event
    description: Add an event on a date; date must be ISO YYYY-MM-DD, optional time is 24h HH:MM
    parameters: {"type":"object","properties":{"date":{"type":"string","description":"ISO date YYYY-MM-DD"},"title":{"type":"string","description":"Event title"},"time":{"type":"string","description":"Optional 24h time HH:MM"}},"required":["date","title"]}
    run: tools/calendar.js
  - name: list_events
    description: List stored events; optional month/year filters, otherwise everything upcoming — each entry carries an id usable with remove_event
    parameters: {"type":"object","properties":{"month":{"type":"number"},"year":{"type":"number"}}}
    run: tools/calendar.js
  - name: remove_event
    description: Remove an event by the id shown in list_events output
    parameters: {"type":"object","properties":{"id":{"type":"string","description":"Event id like ev_xxx"}},"required":["id"]}
    run: tools/calendar.js
components:
  - name: cal-card
    html: components/cal.html
    css: components/cal.css
    js: components/cal.js
---

When the user asks to see a calendar, plan dates, remember something on a
date, or manage events, use these tools — events are saved in the plugin's
own storage and survive reloads, so never claim you cannot keep them.
Resolve "today"/"tomorrow"/"next Friday" into an ISO date before calling
`add_event`; use `list_events` to find ids before removing or when the user
asks what's scheduled. `month_calendar` paints a clickable month grid —
days with events get a dot; suggest it when the user wants the big picture.
