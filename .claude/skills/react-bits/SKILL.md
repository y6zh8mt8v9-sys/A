---
name: react-bits
description: How to use React Bits (reactbits.dev, animated React components) for Gridiron 27, which is not a React app. Use when someone asks for React Bits effects, animated text, fancy backgrounds or micro-interactions.
---

# React Bits

React Bits (github.com/DavidHDev/react-bits, MIT + Commons Clause) is a catalogue of animated
React components: text animations, hover effects, cards, buttons and backgrounds. Components are
added with the shadcn CLI (`npx shadcn@latest add @react-bits/<Name>-JS-CSS`) or copied by hand.
The Commons Clause means the components themselves may not be sold; using them inside a free
game is fine. Keep the license notice with any copied code.

## In this project

Gridiron 27 is a single vanilla-JS page with no React, so React Bits components cannot be
dropped in. Pulling React in for an effect would add hundreds of KB and a second render system.

What to do instead:

1. Pick the effect on reactbits.dev and read its source to see the technique
   (most are a CSS transform/opacity animation, a canvas loop, or a GSAP timeline).
2. Re-create the technique in plain CSS or GSAP inside the existing code, credited in a comment.
3. Hold it to the same bar as the rest of the UI:
   - transforms and opacity only (no layout-changing animation),
   - one orchestrated moment per screen at most, never looping decoration behind tables,
   - respect `prefers-reduced-motion`,
   - no shader or particle backgrounds behind menus (they cost GPU time on low-end PCs and phones).

Good fits: a short stagger when a screen first appears, a button press response, a count-up on a
big number, a reveal on a trophy or award popup. Poor fits: animated backgrounds, cursor trails,
anything that runs while the player is reading a table.
