# CLAUDE.md — Portfolio

## Stack

- **Framework:** React 18 + Vite
- **Routing:** React Router v6
- **Styling:** CSS Modules (`.module.css`) — no Tailwind, no CSS-in-JS
- **Language:** TypeScript
- **Blog backend:** Neon (Postgres) + Hasura GraphQL

---

## Design System — Wabi-Sabi

The visual identity is dark, minimal, textured — inspired by Japanese wabi-sabi aesthetics.
Imperfection is intentional. Avoid anything that looks generic/corporate/AI-generated.

### Moodboard Direction

All design decisions should reference the moodboard aesthetic (saved in conversation history as attached images). Key traits:

- **Dark, industrial, raw textures** — gritty, not polished
- **Cyberpunk & Japanese typography influences** — sharp, intentional
- **High contrast monochrome** with selective warm accent (ochre)
- **Sharp geometry** — no rounded corners on interactive elements (buttons, cards, inputs)
- **Brutalist minimalism** — strip away decoration, let typography and negative space do the work
- **Organic imperfection** — stone, grain, weathered surfaces over clean gradients

When in doubt, choose the rawer, more stripped-down option. If it looks like it could be on a SaaS landing page, it's wrong.

### Colors

| Token          | Value                          | Usage                        |
|----------------|--------------------------------|------------------------------|
| `--ink`        | `#0d0d0b`                      | Page background              |
| `--paper`      | `#141410`                      | Card / surface background    |
| `--aged-white` | `#e8e4dc`                      | Primary text                 |
| `--ochre`      | `#b48c64`                      | Accent, primary buttons, CTA |
| `--ochre-hover`| `#c49b72`                      | Ochre hover state            |
| `--stone`      | `#8a8070`                      | Secondary text               |
| `--faded`      | `rgba(232, 228, 220, 0.35)`   | Tertiary text, labels        |
| `--whisper`    | `rgba(232, 228, 220, 0.15)`   | Meta text, timestamps        |
| `--border`     | `rgba(255, 255, 255, 0.04)`   | Subtle dividers              |

### Typography

| Token            | Font Stack                                  | Usage                                      |
|------------------|---------------------------------------------|--------------------------------------------|
| `--font-serif`   | `'Sinistre', 'Noto Serif JP', serif`        | Display headings: name, page titles, blog/contact links |
| `--font-heading` | `'MF Tahadath', 'Inter', sans-serif`        | Blog post titles, section headings, article titles |
| `--font-sans`    | `'Inter', sans-serif`                       | Body text, UI labels, role subtitle, buttons |
| `--font-mono`    | `'Space Mono', monospace`                   | Meta info (location, dates, code snippets) |

**Key rule:** `--font-serif` (Sinistre) is for display/branding text (name, nav links like "Blog", "Let's talk"). `--font-heading` (MF Tahadath) is for content headings (blog post titles, article section headings). Never swap them.

### Font Files

Located in `public/fonts/`:
- `SinistreVF.woff2` — variable weight 100–900
- `Sinistre-Regular.woff2`, `Sinistre-Bold.woff2` — static fallbacks
- `MF-Tahadath-Bold.otf` — bold only

### Logo Assets

Located in `src/assets/`:
- `logo-white.png` — for dark backgrounds (used on Home hero)
- `logo-black.png` — for light backgrounds
- `logo-white-nagative.png` — white negative variant

Logo on Home page: positioned absolute, right side, rotated 90°, opacity 9–14%, `pointer-events: none`.

### Buttons

- **Primary:** `background: var(--ochre)`, `color: var(--ink)`, `font-weight: 600`, `border-radius: 0`, `padding: 14px 36px`
- **Secondary:** no border except `border-bottom: 1px solid rgba(232, 228, 220, 0.3)`, `color: var(--aged-white)`, transparent bg, `padding: 12px 0`
- **Shared:** `text-transform: uppercase`, `letter-spacing: 2.5px`, `border-radius: 0`
- **Mobile nav:** buttons stack vertically, full-width, `padding: 16px 0`
- **Style rule:** No rounded corners on buttons — sharp, brutalist geometry per moodboard

### Layout Patterns

- **Home:** Bottom-anchored layout — name/role at top, buttons pinned to bottom of viewport
- **Brush mark:** Vertical gradient line (`3px × 80px`) used as a decorative element above the name
- **Spacing:** generous — `80px` top padding desktop, `60px` mobile
- **Breakpoint:** `768px` for mobile

### Animation

- Transitions: `0.3s` for color, border, background changes
- Keep animations subtle — no bouncing, no aggressive spring physics

---

## File Structure

```
src/
  assets/         — logos, images
  pages/          — route-level components (Home, Blog, Contact, etc.)
    *.module.css  — co-located CSS Modules
  index.css       — global styles, CSS variables, @font-face declarations
public/
  fonts/          — self-hosted font files
```

---

## Code Conventions

- Functional components only
- CSS Modules for all styling — class composition via template literals when combining
- `aria-hidden="true"` on decorative images
- Semantic HTML (`nav`, `h1`, `main`, etc.)
