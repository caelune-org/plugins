---
name: Dice Roller
description: Roll dice in standard notation and show an interactive result card
version: 1.0.0
tools:
  - name: roll_dice
    description: Roll dice using standard notation like 2d6 or 1d20; returns the total and each roll
    parameters: {"type":"object","properties":{"notation":{"type":"string","description":"Dice notation like 2d6 or 1d20"}},"required":["notation"]}
    run: tools/roll.js
components:
  - name: dice-card
    html: components/dice.html
    css: components/dice.css
    js: components/dice.js
---

When the user asks to roll dice, flip odds, or needs a random number in dice
notation, call the `roll_dice` tool — never invent rolls yourself. Report the
result the tool returns and mention each individual roll.
