---
name: Weather
description: Live weather lookup for any city — current conditions plus a 4-day forecast card
version: 1.0.1
category: utilities
icon: cloud-sun
capabilities:
  - network
tools:
  - name: get_weather
    description: Get current conditions and a 4-day forecast for a city by name (any language); reports temperature, weather, humidity, wind
    parameters: {"type":"object","properties":{"city":{"type":"string","description":"City name like Tokyo, London, or 北京"}},"required":["city"]}
    run: tools/weather.js
components:
  - name: weather-card
    html: components/weather.html
    css: components/weather.css
    js: components/weather.js
---

When the user asks about weather anywhere in the world, call `get_weather`
with the city name. The tool resolves the location itself — never ask for
coordinates. Results come from Open-Meteo; the card shows current
conditions and the next four days.
