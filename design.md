# Snip Design System

Visual language inspired by a bright, AI-first product landing aesthetic:
a warm off-white canvas, a vivid blue → magenta → orange hero gradient,
crisp near-black controls, and large soft-rounded floating cards.
Aesthetic only — no logos, brand names, proprietary fonts, or marketing copy are reused.

---

## Color Tokens

| Token | Value | Usage |
|---|---|---|
| `--bg` | `#fafafa` | Page base background (warm off-white) |
| `--surface` | `#ffffff` | Card / panel backgrounds |
| `--surface-muted` | `#f6f5f2` | Subtle fills, table header row |
| `--border` | `#eceae4` | Warm light borders on cards, inputs, tables |
| `--text` | `#1c1c1c` | Primary text and headings |
| `--text-strong` | `#030303` | Highest-contrast text |
| `--muted` | `#5f5f5d` | Placeholders, subtitles, table headers |
| `--control` | `#0a0a0a` | Primary button background (near-black) |
| `--control-text` | `#fafafa` | Primary button label |
| `--accent-blue` | `#7c9bff` | Gradient stop — cool top |
| `--accent-pink` | `#e5379b` | Gradient stop / primary accent — magenta |
| `--accent-orange` | `#ff7a3d` | Gradient stop — warm bottom |
| `--success` | `#0f9d6b` | Success notice text / links |
| `--success-bg` | `rgba(15,157,107,0.08)` | Success notice background |
| `--error` | `#dc2626` | Error notice text |
| `--error-bg` | `rgba(220,38,38,0.07)` | Error notice background |

### Hero gradient
A vivid vertical wash from cool blue through magenta to warm orange,
fading out of the off-white canvas at the top.
```css
background: linear-gradient(
  180deg,
  #fafafa 0%,
  #a8bcf7 26%,
  #e5379b 62%,
  #ff7a3d 100%
);
```

### Accent gradient (links, highlights)
```css
background: linear-gradient(90deg, var(--accent-pink), var(--accent-orange));
```

---

## Typography

**Font stack**: `'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif`
(a clean neutral grotesque used in place of the source's proprietary variable font).

| Token | Size | Weight | Usage |
|---|---|---|---|
| `--fs-hero` | `3rem` (48px) | 600 | Hero title |
| `--fs-sub` | `1.25rem` (20px) | 400 | Hero subtitle |
| `--fs-body` | `0.95rem` | 400 | Body text, notices |
| `--fs-sm` | `0.82rem` | 500 | Table cells / headers |
| `--fs-btn` | `0.9rem` | 600 | Button label |

Line heights: `1.0`–`1.1` on the hero title, `1.6` on body.
Letter spacing: `-0.02em` on the hero title, `0` elsewhere.

---

## Spacing

Base unit: `8px` (`0.5rem`).

| Token | Value |
|---|---|
| `--sp-xs` | `0.5rem` |
| `--sp-sm` | `0.75rem` |
| `--sp-md` | `1rem` |
| `--sp-lg` | `1.5rem` |
| `--sp-xl` | `2rem` |
| `--sp-2xl` | `3rem` |
| `--sp-3xl` | `5rem` |

---

## Border Radii

| Token | Value | Usage |
|---|---|---|
| `--radius-card` | `24px` | Large floating cards (shorten panel) |
| `--radius-panel` | `16px` | Links table panel |
| `--radius-control` | `10px` | Inputs and primary button |
| `--radius-notice` | `12px` | Success / error notices |

---

## Borders, Shadows & Focus

| Role | Value |
|---|---|
| Card border | `1px solid var(--border)` |
| Floating card shadow | `0 18px 50px -24px rgba(20,20,40,0.35)` |
| Panel shadow | `0 2px 10px rgba(20,20,40,0.05)` |
| Input focus ring | `0 0 0 3px rgba(229,55,155,0.20)` |
| Button hover | subtle lift + `0 8px 24px -10px rgba(0,0,0,0.5)` |

---

## Snip Element → Design Mapping

| Snip element | Design treatment |
|---|---|
| `<main>` page shell | Warm `--bg`; a vivid hero gradient band paints the top behind the hero |
| Hero title `Snip` | `--fs-hero`, weight 600, centered, `--text`, `letter-spacing: -0.02em` |
| Hero subtitle | `--muted`, `--fs-sub`, centered, `max-width: 40ch` |
| Shorten panel | White `--surface` floating card, `--radius-card`, soft floating shadow, sits over the gradient |
| URL input | `--surface` fill, `--border`, `--radius-control`, pink focus ring |
| Shorten button | Near-black `--control`, `--control-text`, `--radius-control`, hover lift |
| Success notice | `--success-bg` background, `--success` text, `--radius-notice` |
| Error notice | `--error-bg` background, `--error` text, `--radius-notice` |
| Links table panel | White `--surface`, `--radius-panel`, `--border`, subtle panel shadow |
| Table header row | `--surface-muted` fill, `--muted` text, `--fs-sm`, uppercase |
| Code column link | `--accent-pink` color, no underline until hover |
| Hits column | Centered, `--muted` |
