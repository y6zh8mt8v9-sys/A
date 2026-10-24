---
name: lenis
description: When and how to use Lenis (darkroom.engineering's smooth-scroll library) in this project. Use when someone asks for smooth scrolling, scroll-linked animation, or mentions Lenis.
---

# Lenis smooth scroll

Lenis (MIT, github.com/darkroomengineering/lenis) smooths wheel scrolling by easing the
page toward the scroll target every frame. Touch scrolling stays native unless `syncTouch` is on.

## Decide first: does this screen need it?

Smoothing adds a small delay between the wheel and the page. On a long marketing page that
reads as polish; in a game menu full of tables and nested scroll areas it reads as lag.
In Gridiron 27 the rule is:

- Do not attach Lenis to the main app pages, modals, tables, the Team Builder or Game Day.
  They have nested scroll areas and players use them like tools.
- It is acceptable only on a long, single-column page where nothing else scrolls inside it
  (for example a future web landing page), and only on desktop (`window.matchMedia('(pointer:fine)')`).

## If you do use it

```js
const lenis = new Lenis({ autoRaf: true, lerp: 0.12, anchors: true });
```

- Keep `lerp` at 0.1 or above; lower values feel floaty and laggy.
- Leave `syncTouch` off. Native touch scrolling is faster and works on every iOS version.
- Mark any inner scroll area with `data-lenis-prevent` (cheaper than `allowNestedScroll`, which
  walks the DOM on every scroll event).
- Lenis already respects `prefers-reduced-motion` (smoothing turns off); do not override it.
- With GSAP ScrollTrigger, drive both from one loop: `lenis.on('scroll', ScrollTrigger.update)`
  and `gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0)`.
- Load the exact pinned build (no `@latest`), and inline it if the page must work offline
  like the game does.
