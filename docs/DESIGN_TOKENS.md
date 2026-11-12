# Design Tokens

`src/styles/variables.css` is the single source of truth for color, spacing, type,
motion, radius, shadow, and stacking order. It is imported once from
`src/styles/globals.css`, so every token below is global.

The file has three `:root` blocks: the base palette and aliases, the value-named
`--space-*`/`--text-*` scales, and the `--z-*` ladder. `body.has-announcement-banner`
adds one override (`--site-header-height: 122px`).

250 custom properties are defined. This page documents them as they exist; it is a
reference, not a proposal.

## Layer model

Three layers, consumed in one direction only.

| Layer | Tokens | Holds |
| --- | --- | --- |
| Primitives | `--brand-*`, `--eim-*`, `--legacy-*`, `--neutral-*`, `--white`, `--black` | Raw values: hexes, font stacks, motion curves, radius. No roles, no context. |
| Semantic | `--color-*`, `--space-*`, `--text-*`, `--z-*`, `--radius-*`, `--ease-*`, `--dur-*`, `--shadow-*` | A role or a documented scale step. Value is inline or an alias of a primitive. |
| Consumers | `src/styles/base.css`, `globals.css`, `components/`, `pages/`, `Layout.astro` | Read tokens. Never define them, except page-scoped `--reg-*` in `registration-eim.css`. |

Dependency direction:

```
primitives  ->  semantic  ->  consumers
```

Rules enforced by the current file:

- A primitive never references another token. `--brand-cyan` is a hex, not an alias.
- A semantic token may alias a primitive (`--color-brand: var(--eim-brand)`) or carry a
  literal when no primitive matches (`--color-danger-base: #ef4444`).
- Consumers never reach past the semantic layer. If you need a new role, add the semantic
  token.
- Aliases are not chained more than one hop (`--text-primary` -> `--legacy-ink` ends there).

## Naming rules

- Primitives are named for their **value or origin**: brand guideline names
  (`--brand-dark-azure`), palette position (`--neutral-400`), source palette
  (`--legacy-*`, `--eim-*`).
- Semantic tokens are named for their **role**: `--color-danger-ink`, `--radius-card`,
  `--z-modal`. The name says where it is used, not what it contains.
- Value-named scales encode the rendered size in the suffix: the number is **px at a
  16px root**, stored in **rem**. Decimal points become dashes, negatives use `neg`:

| Token | Suffix reads as | Stored value | Renders as |
| --- | --- | --- | --- |
| `--space-5-6` | 5.6 | `0.35rem` | 5.6px |
| `--text-14-4` | 14.4 | `0.9rem` | 14.4px |
| `--text-18-4` | 18.4 | `1.15rem` | 18.4px |
| `--space-neg-10` | -10 | `-0.625rem` | -10px |

The suffix is a name, not a unit. Never write `--text-14-4: 14.4px`; use rem so browser
font scaling keeps working. `--space-4-8` (4.8px) and `--text-14-08` (14.08px) follow the
same rule with the trailing zero dropped.

## Preferred subsets

New work uses only these steps. Anything else in the scale stays supported for existing
markup but is not a choice for new code.

Spacing (`--space-*`), 4px grid: `--space-4`, `--space-8`, `--space-12`, `--space-16`,
`--space-20`, `--space-24`, `--space-32`, `--space-40`.

Type (`--text-*`): `--text-12`, `--text-14`, `--text-16`, `--text-18-4`, `--text-20`,
`--text-24`, `--text-32`, `--text-40`, `--text-48`.

## Token index

Values are reproduced as written in `variables.css`; aliases appear as `var(--…)`.

### Primitives

| Family | Tokens and values |
| --- | --- |
| `--legacy-*` — **this site only, do not copy** | `--legacy-bg` `#ffffff` · `--legacy-bg-secondary` `#f8f9fa` · `--legacy-ink` `#1a202c` · `--legacy-ink-secondary` `#4a5568` · `--legacy-ink-muted` `#718096` · `--legacy-accent` `#0E555F` · `--legacy-accent-hover` `#1AACAD` · `--legacy-accent-gradient` `linear-gradient(135deg, #0E555F 0%, #072a2f 100%)` · `--legacy-line` `rgba(14, 85, 95, 0.08)` · `--legacy-line-hover` `rgba(14, 85, 95, 0.15)` · `--legacy-card` `rgba(14, 85, 95, 0.03)` · `--legacy-card-hover` `rgba(14, 85, 95, 0.06)` · `--legacy-bg-secondary-rgb` `248, 249, 250` |
| `--brand-*` | `--brand-dark-azure` `#0E555F` · `--brand-dark-azure-rgb` `14, 85, 95` · `--brand-cyan` `#11B4BD` · `--brand-cyan-rgb` `17, 180, 189` · `--brand-cyan-light` `#1AACAD` · `--brand-cyan-light-rgb` `26, 172, 173` · `--brand-gray-azure` `#4E8A92` · `--brand-gray-azure-rgb` `78, 138, 146` |
| Neutrals | `--white` `#ffffff` · `--black` `#000000` · `--black-rgb` `0, 0, 0` · `--neutral-50` `#f8fafc` · `--neutral-100` `#f1f5f9` · `--neutral-200` `#e2e8f0` · `--neutral-300` `#cbd5e1` · `--neutral-400` `#94a3b8` · `--neutral-400-rgb` `148, 163, 184` · `--neutral-600` `#475569` · `--neutral-700` `#334155` · `--neutral-800` `#1e293b` · `--neutral-900` `#0f172a` · `--neutral-900-rgb` `15, 23, 42` |
| `--eim-*` color | `--eim-background` `#FAFCFC` · `--eim-foreground` `#0B1F22` · `--eim-surface` `#F0F4F4` · `--eim-surface-strong` `#E4EDED` · `--eim-line` `#D9E3E4` · `--eim-muted-ink` `#52686B` · `--eim-brand` `#0C535D` · `--eim-brand-bright` `#11B4BD` · `--eim-brand-soft` `#E2F3F4` · `--eim-black` `#050B0D` · `--eim-black-rgb` `5, 11, 13` |
| `--eim-*` font, motion, radius | `--eim-font-display` `'Instrument Serif', Georgia, serif` · `--eim-font-body` `'IBM Plex Sans', system-ui, -apple-system, sans-serif` · `--eim-font-mono` `'IBM Plex Mono', ui-monospace, SFMono-Regular, monospace` · `--eim-ease` `cubic-bezier(0.22, 1, 0.36, 1)` · `--eim-ease-inout` `cubic-bezier(0.65, 0, 0.35, 1)` · `--eim-dur-control` `220ms` · `--eim-dur-reveal` `700ms` · `--eim-radius-pill` `999px` · `--eim-radius-card` `16px` · `--eim-radius-media` `24px` |
| Exact values — measured, distinct, do not merge with near matches | `--color-brand-deep` `#093f47` · `--color-surface-deep` `#091b1e` · `--color-surface-muted` `#f9f9f9` · `--color-ink-deep` `#070913` · `--color-scrim-rgb` `7, 26, 30` · `--color-danger-alt` `#e53e3e` · `--color-danger-alt-rgb` `229, 62, 62` |

### Semantic

| Family | Tokens and values |
| --- | --- |
| Legacy surface, border, text — **this site only, do not copy** | `--bg-dark` `var(--legacy-bg)` · `--bg-dark-secondary` `var(--legacy-bg-secondary)` · `--bg-card` `var(--legacy-card)` · `--bg-card-hover` `var(--legacy-card-hover)` · `--border-color` `var(--legacy-line)` · `--border-color-hover` `var(--legacy-line-hover)` · `--text-primary` `var(--legacy-ink)` · `--text-secondary` `var(--legacy-ink-secondary)` · `--text-muted` `var(--legacy-ink-muted)` · `--site-header-height` `80px`, `122px` under `body.has-announcement-banner` |
| Theme accents | `--accent-red` `var(--legacy-accent)` · `--accent-red-rgb` `14, 85, 95` · `--accent-red-hover` `var(--legacy-accent-hover)` · `--accent-red-gradient` `var(--legacy-accent-gradient)` · `--accent-cyan` `var(--brand-cyan)` · `--accent-cyan-rgb` `var(--brand-cyan-rgb)` · `--accent-cyan-hover` `var(--brand-cyan-light)` · `--accent-cyan-gradient` `linear-gradient(135deg, var(--brand-cyan) 0%, var(--brand-cyan-light) 100%)` |
| Surface and brand mapping | `--color-background` `var(--eim-background)` · `--color-foreground` `var(--eim-foreground)` · `--color-surface` `var(--eim-surface)` · `--color-surface-strong` `var(--eim-surface-strong)` · `--color-line` `var(--eim-line)` · `--color-muted-ink` `var(--eim-muted-ink)` · `--color-brand` `var(--eim-brand)` · `--color-brand-bright` `var(--eim-brand-bright)` · `--color-brand-soft` `var(--eim-brand-soft)` |
| Font, motion, radius aliases | `--font-mono` `var(--eim-font-mono)` · `--ease` `var(--eim-ease)` · `--ease-inout` `var(--eim-ease-inout)` · `--dur-control` `var(--eim-dur-control)` · `--dur-reveal` `var(--eim-dur-reveal)` · `--radius-pill` `var(--eim-radius-pill)` · `--radius-card` `var(--eim-radius-card)` · `--radius-media` `var(--eim-radius-media)` |
| Typography | `--font-heading` `'Poppins', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif` · `--font-body` `'Montserrat', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif` · `--font-display` `'Instrument Serif', Georgia, serif` · `--font-ui` `'IBM Plex Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif` · `--max-width` `1200px` |
| Layout, motion, shadow | `--border-radius-sm` `8px` · `--border-radius-md` `16px` · `--border-radius-lg` `24px` · `--transition-fast` `0.15s ease-out` · `--transition-normal` `0.25s ease-out` · `--transition-slow` `0.4s ease-out` · `--shadow-sm` `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)` · `--shadow-md` `0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)` · `--glow-cyan` `0 0 20px rgba(var(--accent-cyan-rgb), 0.15)` · `--glow-red` `0 0 20px rgba(var(--accent-red-rgb), 0.15)` · `--glow-cyan-intense` `0 0 30px rgba(var(--accent-cyan-rgb), 0.3)` · `--glow-red-intense` `0 0 30px rgba(var(--accent-red-rgb), 0.3)` |

### Spacing scale

| Token | Value | Token | Value | Token | Value |
| --- | --- | --- | --- | --- | --- |
| `--space-neg-36` | `-2.25rem` | `--space-neg-32` | `-2rem` | `--space-neg-10` | `-0.625rem` |
| `--space-neg-8` | `-0.5rem` | `--space-1-6` | `0.1rem` | `--space-2` | `0.125rem` |
| `--space-2-4` | `0.15rem` | `--space-3` | `0.1875rem` | `--space-3-2` | `0.2rem` |
| `--space-4` | `0.25rem` | `--space-4-8` | `0.3rem` | `--space-5` | `0.3125rem` |
| `--space-5-6` | `0.35rem` | `--space-6` | `0.375rem` | `--space-6-4` | `0.4rem` |
| `--space-7-2` | `0.45rem` | `--space-8` | `0.5rem` | `--space-8-8` | `0.55rem` |
| `--space-9` | `0.5625rem` | `--space-9-6` | `0.6rem` | `--space-10` | `0.625rem` |
| `--space-10-4` | `0.65rem` | `--space-11-2` | `0.7rem` | `--space-12` | `0.75rem` |
| `--space-12-8` | `0.8rem` | `--space-13-6` | `0.85rem` | `--space-14` | `0.875rem` |
| `--space-14-4` | `0.9rem` | `--space-15` | `0.9375rem` | `--space-15-2` | `0.95rem` |
| `--space-16` | `1rem` | `--space-16-8` | `1.05rem` | `--space-17-6` | `1.1rem` |
| `--space-18` | `1.125rem` | `--space-20` | `1.25rem` | `--space-22` | `1.375rem` |
| `--space-24` | `1.5rem` | `--space-28` | `1.75rem` | `--space-30` | `1.875rem` |
| `--space-30-4` | `1.9rem` | `--space-32` | `2rem` | `--space-36` | `2.25rem` |
| `--space-40` | `2.5rem` | `--space-44` | `2.75rem` | `--space-50` | `3.125rem` |
| `--space-60` | `3.75rem` | `--space-80` | `5rem` | `--space-100` | `6.25rem` |

### Type scale

| Token | Value | Token | Value | Token | Value |
| --- | --- | --- | --- | --- | --- |
| `--text-10` | `0.625rem` | `--text-10-4` | `0.65rem` | `--text-10-8` | `0.675rem` |
| `--text-11` | `0.6875rem` | `--text-11-52` | `0.72rem` | `--text-11-6` | `0.725rem` |
| `--text-12` | `0.75rem` | `--text-12-8` | `0.8rem` | `--text-13` | `0.8125rem` |
| `--text-13-12` | `0.82rem` | `--text-13-6` | `0.85rem` | `--text-14` | `0.875rem` |
| `--text-14-08` | `0.88rem` | `--text-14-4` | `0.9rem` | `--text-14-72` | `0.92rem` |
| `--text-15` | `0.9375rem` | `--text-15-2` | `0.95rem` | `--text-16` | `1rem` |
| `--text-16-8` | `1.05rem` | `--text-17-6` | `1.1rem` | `--text-18-4` | `1.15rem` |
| `--text-19-2` | `1.2rem` | `--text-20` | `1.25rem` | `--text-20-8` | `1.3rem` |
| `--text-21-6` | `1.35rem` | `--text-22-4` | `1.4rem` | `--text-24` | `1.5rem` |
| `--text-24-8` | `1.55rem` | `--text-27-2` | `1.7rem` | `--text-28` | `1.75rem` |
| `--text-28-8` | `1.8rem` | `--text-32` | `2rem` | `--text-35-2` | `2.2rem` |
| `--text-36` | `2.25rem` | `--text-40` | `2.5rem` | `--text-48` | `3rem` |
| `--text-56` | `3.5rem` | | | | |

### Status families

Danger, success, info, and campaign share a slot vocabulary. Not every family defines
every slot.

| Slot | Meaning |
| --- | --- |
| `-base` | The accent color. |
| `-strong` | Hover or emphasized variant of `-base`. |
| `-light` | Lighter accent for text or fills. |
| `-rgb` | Channel triplet for `rgba(var(--…-rgb), α)`. |
| `-bar`, `-bar-mid` | Banner background gradient stops. |
| `-ink` | Text color used on the accent or banner. |
| `-deep`, `-soft`, `-line`, `-lighter`, `-alt` | Border, surface, and text pairings used by registration states. |

| Family | Tokens and values |
| --- | --- |
| Danger | `--color-danger-base` `#ef4444` · `--color-danger-rgb` `239, 68, 68` · `--color-danger-strong` `#dc2626` · `--color-danger-light` `#f87171` · `--color-danger-bar` `#450a0a` · `--color-danger-bar-mid` `#7f1d1d` · `--color-danger-ink` `var(--white)` · `--color-danger-deep` `#b42318` · `--color-danger-soft` `#fdf1f0` · `--color-danger-line` `#f0bdb8` · `--color-danger-lighter` `#fca5a5` |
| Warning — `-ink` is the banner text itself, not text on an accent | `--color-warning-soft` `#fdf6e7` · `--color-warning-line` `#f0d49a` · `--color-warning-ink` `#92400e` |
| Success | `--color-success-base` `#10b981` · `--color-success-rgb` `16, 185, 129` · `--color-success-strong` `#059669` · `--color-success-light` `#34d399` · `--color-success-light-rgb` `52, 211, 153` · `--color-success-bar` `#064e3b` · `--color-success-bar-mid` `#065f46` · `--color-success-ink` `#064e3b` |
| Info | `--color-info-base` `#06b6d4` · `--color-info-rgb` `6, 182, 212` · `--color-info-strong` `#0891b2` · `--color-info-light` `#22d3ee` · `--color-info-bar` `var(--neutral-900)` · `--color-info-bar-mid` `var(--neutral-800)` · `--color-info-ink` `var(--neutral-900)` |
| Campaign — recruitment banner, plum bar with gold accent; not a generic status | `--color-campaign-base` `#eab308` · `--color-campaign-rgb` `234, 179, 8` · `--color-campaign-strong` `#ca8a04` · `--color-campaign-light` `#fde047` · `--color-campaign-bar` `#1e1b4b` · `--color-campaign-bar-mid` `#31103f` · `--color-campaign-ink` `var(--neutral-900)` |
| Toolbar — dev-only registration simulator | `--color-toolbar-base` `#6366f1` · `--color-toolbar-rgb` `99, 102, 241` · `--color-toolbar-strong` `#4f46e5` · `--color-toolbar-light` `#a5b4fc` |

Registration aliases are page-scoped on `body.home-skin` in `pages/registration-eim.css`
because the modals are teleported to `<body>`. They live outside `variables.css`:

| Alias | Points at | Alias | Points at |
| --- | --- | --- | --- |
| `--reg-danger` | `--color-danger-deep` | `--reg-danger-soft` | `--color-danger-soft` |
| `--reg-danger-line` | `--color-danger-line` | `--reg-warn` | `--color-warning-ink` |
| `--reg-warn-soft` | `--color-warning-soft` | `--reg-warn-line` | `--color-warning-line` |

### Z-index ladder

Twelve layers, ascending. Use the lowest layer that works; never hand-pick a number.

| Token | Value | Use for |
| --- | --- | --- |
| `--z-below` | `-1` | Decorative layers behind their own stacking context only. |
| `--z-base` | `0` | Default flow content. |
| `--z-raised` | `1` | Card hover state, sticky element inside a card. |
| `--z-layer` | `10` | Local overlays inside a section (image captions, scrims). |
| `--z-elevated` | `30` | Dropdowns and popovers owned by page content. |
| `--z-nav` | `999` | In-page navigation and filter bars. |
| `--z-header` | `1000` | Site header bar. |
| `--z-header-popover` | `1001` | Header dropdown menu. |
| `--z-header-overlay` | `1002` | Full-screen header menu, above the header and its popover. |
| `--z-modal` | `9999` | Dialogs and poster modals. |
| `--z-toolbar` | `99990` | Dev-only registration toolbar. |
| `--z-top` | `99999` | Announcement banner and anything that must beat every page layer. |

## Why the tokens are not projected into Tailwind `@theme`

`pages/home-eim.css` declares `@theme static` with an `--eim-*` -> `--color-*` mapping.
The rest of `variables.css` is deliberately not projected:

1. **Same-named keys self-reference.** Tailwind emits theme keys as custom properties.
   Writing `--text-13: var(--text-13)` inside `@theme` resolves to itself and is invalid
   at computed-value time, so every scale would need a second, renamed set of keys.
2. **A literal projection duplicates the source of truth.** Copying values into `@theme`
   creates two places to edit and two ways for them to drift.
3. **Tailwind already ships usable type and spacing utilities.** Its default scale covers
   ordinary layout; the token scales exist for the fine-grained 1-2px adjustments the
   design actually uses.
4. **`@theme` is site-wide.** The Tailwind entry point is imported by the homepage-family
   pages, not globally. Elevating the tokens there would change every page that loads the
   stylesheet, which is a visual change, not a refactor.

The existing `--eim-*` -> `--color-*` mapping is safe because the names differ: the theme
key is `--color-brand`, the source is `--eim-brand`, so no key references itself.

## Exceptions

These stay literal on purpose. Do not tokenize them:

- **`em` lengths.** `letter-spacing` (`0.08em`, `-0.01em`) and the `3em` icon size must
  track the element's own font size, which a px token cannot do.
- **`clamp()` and `calc()`.** Fluid values such as `clamp(1.5rem, 4vw, 3rem)` are
  expressions, not steps. They compose tokens where a token fits.
- **`rgba(255, 255, 255, α)` overlays.** 18 white-alpha overlays tint whatever sits
  beneath them on dark surfaces; a named token would not make them clearer.
- **Third-party marks.** Brand-colored SVG fills in `src/components/Footer.astro`
  (e.g. `#007EBB`) belong to their owners and must not be restyled with our palette.
- **Dead files.** `pages/events.css`, `pages/organization.css`, and `pages/contact.css`
  are still imported by `globals.css` but no page renders the markup they style
  (`contact.astro` uses `contact-eim.css`). They were migrated to tokens for
  consistency, not because they are live.

## Start a new lab site

1. Copy `src/styles/variables.css` as-is. Keep the `@theme static` mapping of `--eim-*`
   to `--color-*` in the new site's Tailwind entry point; it projects different names and
   is safe.
2. Override about ten primitives only: `--eim-background`, `--eim-foreground`,
   `--eim-surface`, `--eim-surface-strong`, `--eim-line`, `--eim-muted-ink`,
   `--eim-brand`, `--eim-brand-bright`, `--eim-brand-soft`, `--eim-black`. Everything
   semantic follows through the aliases.
3. Use the preferred spacing and type subsets. If a design needs a step that is missing,
   add a token with the same naming rule rather than a literal in the component.
4. Do not copy the `--legacy-*` block or the `--bg-dark`/`--text-primary` aliases. They
   exist only to keep this site's pre-Antigravity pages unchanged. Drop `--legacy-*`,
   `--accent-red*`, `--accent-cyan*`, and the legacy surface/text aliases; keep the
   `--color-*` layer and the Antigravity primitives.
