---
paths:
  - 'resources/js/**'
---

# Js

## Apple-style UI system: motion + glass + naming
Frontend follows Apple Design principles (see apple-design skill): motion uses motion/react springs (bounce 0 for default UI, tiny bounce only for momentum gestures); navigate/reposition via springs animated from current value; use `transform`/`opacity` only. Glass materials via `.glass`/`.glass-strong`/`.hairline` CSS classes; rare inset `hadow-inset`. Theme dark/light uses `theme-transition` class added in ThemeContext. Refined shadows: `shadow-soft`/`shadow-lifted`/`shadow-elevated`/`shadow-float` in @theme. Reuse the UI primitives in components/ui (Button/Card/Modal/Input) rather than re-styling inline; Card accepts `hover` prop for hover-lift. Headings use negative tracking (`.02em`/`.01em`). All UI text is Indonesian.
