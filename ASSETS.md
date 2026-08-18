# EIM Brand & Email Assets Hub

Official documentation for all visual assets, logos, emblems, banners, and social media icons for the **Enterprise Infrastructure Management (EIM) Research Lab**.

All assets are hosted publicly via the web server / Cloudflare Pages CDN so they can be accessed online by email clients (**Gmail**, **Outlook**, **Apple Mail**, **Yahoo**), web applications, and backend integrations.

---

## Base URL Domain

All assets are accessible via the public URL:

```text
https://eimlab.org/assets/
```


---

## Email-Optimized Assets (`/assets/email/`)

Assets specifically designed and compressed for HTML emails, newsletters, registration confirmations, and email studio integrations.

| Asset File | Format | Resolution (@2x) | Size | Recommended Background | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `public/assets/email/logo.png` | PNG (Transparent) | 500 × 114 px | **8.4 KB** | Light / White | Main email header (horizontal version) |
| `public/assets/email/logo-white.png` | PNG (Transparent) | 500 × 114 px | **8.9 KB** | Dark / Navy | Dark Mode email header (white text) |
| `public/assets/email/logo-compact.png` | PNG (Transparent) | 500 × 172 px | **8.2 KB** | Light / White | Compact logo ("EIM Research Lab") |
| `public/assets/email/logo-compact-white.png` | PNG (Transparent) | 500 × 172 px | **8.2 KB** | Dark / Navy | Compact logo with white text for dark themes |
| `public/assets/email/logo-vertical.png` | PNG (Transparent) | 400 × 287 px | **9.6 KB** | Light / White | Classic vertical layout for footer/memo |
| `public/assets/email/logo-vertical-white.png` | PNG (Transparent) | 400 × 287 px | **11 KB** | Dark / Navy | Vertical layout with white text |
| `public/assets/email/logo-icon.png` | PNG (Transparent) | 256 × 256 px | **5.3 KB** | Any | 3D hexagonal emblem (Sender avatar) |
| `public/assets/email/banner-dark.png` | PNG | 600 × 140 px | **7.8 KB** | Dark Mode | 600px wide banner with navy & cyan gradient |
| `public/assets/email/banner-light.png` | PNG | 600 × 140 px | **7.7 KB** | Light Mode | 600px wide clean white gradient banner |

---

## Social & UI Icons (`/assets/email/icons/`)

Retina-ready navigation and social media icons (96x96 px @2x) for email footers:

| Icon File | Path | Size | Color |
| :--- | :--- | :--- | :--- |
| **Instagram** | `public/assets/email/icons/instagram.png` | 2.2 KB | Slate Gray (`#94a3b8`) |
| **LinkedIn** | `public/assets/email/icons/linkedin.png` | 1.6 KB | Slate Gray (`#94a3b8`) |
| **GitHub** | `public/assets/email/icons/github.png` | 2.2 KB | Slate Gray (`#94a3b8`) |
| **Website** | `public/assets/email/icons/website.png` | 3.0 KB | Slate Gray (`#94a3b8`) |
| **Email** | `public/assets/email/icons/email.png` | 1.5 KB | Slate Gray (`#94a3b8`) |
| **WhatsApp** | `public/assets/email/icons/whatsapp.png` | 2.6 KB | Emerald Green (`#34d399`) |

---

## Master Brand Assets (`/assets/brand/`)

Full resolution assets for publications, website, PDF documents, and presentation decks:

| Asset File | Format | Resolution | Size | Description |
| :--- | :--- | :--- | :--- | :--- |
| `public/assets/brand/eim-logo.png` | PNG | 1600 × 365 px | 33 KB | Standard horizontal master logo |
| `public/assets/brand/eim-logo-horizontal-white.png` | PNG | 1600 × 365 px | 31 KB | Master horizontal logo with white text |
| `public/assets/brand/eim-logo-compact.png` | PNG | 1000 × 344 px | 46 KB | Compact master logo EIM Research Lab |
| `public/assets/brand/eim-logo-compact-white.png` | PNG | 1000 × 344 px | 45 KB | Compact master logo with white text |
| `public/assets/brand/eim-logo-vertical.png` | PNG | 1200 × 862 px | 36 KB | Standard vertical master logo |
| `public/assets/brand/eim-logo-vertical-white.png` | PNG | 1200 × 862 px | 35 KB | Master vertical logo with white text |
| `public/assets/brand/eim-emblem.png` | PNG | 1686 × 1932 px | 105 KB | 3D hexagonal emblem master without text |
| `public/assets/brand/eim-logo-icon.png` | PNG | 512 × 512 px | 12 KB | Square emblem icon 512x512 |
| `public/assets/brand/eim-favicon.png` | PNG | 64 × 64 px | 4.6 KB | Web browser favicon |

---

## Usage Guide & Examples

### 1. Standard HTML Email (Inline Styles)

```html
<!-- Email Header Logo (Light Theme) -->
<table border="0" cellpadding="0" cellspacing="0" width="100%">
  <tr>
    <td align="center" style="padding: 24px 0;">
      <a href="https://eimresearchlab.com" target="_blank">
        <img 
          src="https://eimresearchlab.com/assets/email/logo.png" 
          alt="EIM Research Lab" 
          width="200" 
          style="display: block; width: 200px; max-width: 100%; height: auto; border: 0;"
        />
      </a>
    </td>
  </tr>
</table>
```

### 2. Dark Mode Email Header (Gmail / Outlook)

```html
<!-- Email Header Logo (Dark Theme) -->
<div style="background-color: #0f172a; padding: 25px; text-align: center; border-radius: 8px 8px 0 0;">
  <img 
    src="https://eimresearchlab.com/assets/email/logo-white.png" 
    alt="EIM Research Lab" 
    width="190" 
    style="display: inline-block; width: 190px; max-width: 100%; height: auto; border: 0;"
  />
</div>
```

### 3. Email Template Studio / React Email Preset

In project `email-template-eim` (e.g. in `src/presets/newsletter.ts` or `staffMemo.ts`):

```typescript
header: {
  showLogo: true,
  logoUrl: 'https://eimresearchlab.com/assets/email/logo.png', // or logo-white.png
  logoAlt: 'EIM Research Lab',
  logoWidth: 190,
}
```

### 4. Email Social Media Footer

```html
<!-- Social Links Footer -->
<div style="text-align: center; padding: 20px 0;">
  <a href="https://www.instagram.com/eimresearchlab/" style="margin: 0 8px; text-decoration: none;">
    <img src="https://eimresearchlab.com/assets/email/icons/instagram.png" width="20" height="20" alt="Instagram" style="vertical-align: middle; border: 0;" />
  </a>
  <a href="https://www.linkedin.com/company/keprofesian-enterprise-infrastructure-management-eim/" style="margin: 0 8px; text-decoration: none;">
    <img src="https://eimresearchlab.com/assets/email/icons/linkedin.png" width="20" height="20" alt="LinkedIn" style="vertical-align: middle; border: 0;" />
  </a>
  <a href="https://github.com/LABEIM" style="margin: 0 8px; text-decoration: none;">
    <img src="https://eimresearchlab.com/assets/email/icons/github.png" width="20" height="20" alt="GitHub" style="vertical-align: middle; border: 0;" />
  </a>
</div>
```

---

## Regenerate Assets

If there are updates to the master logo images, all assets can be automatically regenerated with a single command:

```bash
npm run generate:assets
```
