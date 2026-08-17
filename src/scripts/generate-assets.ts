import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

export async function generateAssets() {
  const rootDir = process.cwd();
  const brandDir = path.join(rootDir, 'public/assets/brand');
  const emailDir = path.join(rootDir, 'public/assets/email');
  const emailIconsDir = path.join(rootDir, 'public/assets/email/icons');

  fs.mkdirSync(brandDir, { recursive: true });
  fs.mkdirSync(emailDir, { recursive: true });
  fs.mkdirSync(emailIconsDir, { recursive: true });

  console.log('Generating EIM Brand & Email Assets...');

  // 1. Extract Emblem (Trimmed)
  const emblemBuffer = await sharp('public/image/eim/EIM.png')
    .extract({ left: 1148, top: 3, width: 1686, height: 1932 })
    .toBuffer();

  // 2. Extract Text (Dark Teal)
  const textDarkBuffer = await sharp('public/image/eim/EIM.png')
    .extract({ left: 0, top: 2159, width: 4046, height: 747 })
    .toBuffer();

  // 3. Create White Text Buffer
  const textRaw = await sharp(textDarkBuffer).raw().toBuffer({ resolveWithObject: true });
  const whiteTextData = Buffer.from(textRaw.data);
  for (let i = 0; i < whiteTextData.length; i += 4) {
    if (whiteTextData[i + 3] > 0) {
      whiteTextData[i] = 255;     // R
      whiteTextData[i + 1] = 255; // G
      whiteTextData[i + 2] = 255; // B
    }
  }
  const textWhiteBuffer = await sharp(whiteTextData, {
    raw: { width: textRaw.info.width, height: textRaw.info.height, channels: 4 }
  }).png().toBuffer();

  // 4. Save Master Emblem & Icons
  await sharp(emblemBuffer)
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(path.join(brandDir, 'eim-emblem.png'));
  
  await sharp(emblemBuffer)
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ quality: 95 })
    .toFile(path.join(brandDir, 'eim-logo-icon.png'));

  await sharp(emblemBuffer)
    .resize(64, 64, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(brandDir, 'eim-favicon.png'));

  // 5. Vertical Logos
  await sharp('public/image/eim/EIM.png')
    .resize(1200)
    .png({ quality: 95 })
    .toFile(path.join(brandDir, 'eim-logo-vertical.png'));

  const verticalWhiteComposite = await sharp({
    create: {
      width: 4046,
      height: 2906,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
  .composite([
    { input: emblemBuffer, top: 3, left: 1148 },
    { input: textWhiteBuffer, top: 2159, left: 0 }
  ])
  .png()
  .toBuffer();

  await sharp(verticalWhiteComposite)
    .resize(1200)
    .png({ quality: 95 })
    .toFile(path.join(brandDir, 'eim-logo-vertical-white.png'));

  // 6. Horizontal Full Logos
  const targetTextHeight = 747;
  const scaledEmblemHeight = 850;
  const scaledEmblem = await sharp(emblemBuffer)
    .resize({ height: scaledEmblemHeight })
    .toBuffer({ resolveWithObject: true });

  const gap = 240;
  const horizCanvasWidth = scaledEmblem.info.width + gap + 4046;
  const horizCanvasHeight = Math.max(scaledEmblemHeight, targetTextHeight) + 60;

  const emblemTop = Math.round((horizCanvasHeight - scaledEmblemHeight) / 2);
  const textTop = Math.round((horizCanvasHeight - targetTextHeight) / 2);

  // Horizontal Dark
  const horizDark = await sharp({
    create: {
      width: horizCanvasWidth,
      height: horizCanvasHeight,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
  .composite([
    { input: scaledEmblem.data, top: emblemTop, left: 0 },
    { input: textDarkBuffer, top: textTop, left: scaledEmblem.info.width + gap }
  ])
  .png()
  .toBuffer();

  await sharp(horizDark)
    .resize(1600)
    .png({ quality: 95 })
    .toFile(path.join(brandDir, 'eim-logo-horizontal.png'));

  // Horizontal White
  const horizWhite = await sharp({
    create: {
      width: horizCanvasWidth,
      height: horizCanvasHeight,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
  .composite([
    { input: scaledEmblem.data, top: emblemTop, left: 0 },
    { input: textWhiteBuffer, top: textTop, left: scaledEmblem.info.width + gap }
  ])
  .png()
  .toBuffer();

  await sharp(horizWhite)
    .resize(1600)
    .png({ quality: 95 })
    .toFile(path.join(brandDir, 'eim-logo-horizontal-white.png'));

  // Primary logo default
  fs.copyFileSync(path.join(brandDir, 'eim-logo-horizontal.png'), path.join(brandDir, 'eim-logo.png'));

  // 7. Compact "EIM RESEARCH LAB" Lockup
  const compactEmblem = await sharp(emblemBuffer)
    .resize(300, 344)
    .toBuffer({ resolveWithObject: true });

  const svgTextDark = `
    <svg width="650" height="344" viewBox="0 0 650 344" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="200" font-family="'Montserrat', 'Segoe UI', Arial, sans-serif" font-size="160" font-weight="900" fill="#0c535d" letter-spacing="2">EIM</text>
      <text x="5" y="270" font-family="'Montserrat', 'Segoe UI', Arial, sans-serif" font-size="48" font-weight="700" fill="#06b6d4" letter-spacing="6">RESEARCH LAB</text>
      <text x="6" y="320" font-family="'Montserrat', 'Segoe UI', Arial, sans-serif" font-size="28" font-weight="500" fill="#64748b" letter-spacing="3">TELKOM UNIVERSITY</text>
    </svg>
  `;

  const svgTextWhite = `
    <svg width="650" height="344" viewBox="0 0 650 344" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="200" font-family="'Montserrat', 'Segoe UI', Arial, sans-serif" font-size="160" font-weight="900" fill="#ffffff" letter-spacing="2">EIM</text>
      <text x="5" y="270" font-family="'Montserrat', 'Segoe UI', Arial, sans-serif" font-size="48" font-weight="700" fill="#38bdf8" letter-spacing="6">RESEARCH LAB</text>
      <text x="6" y="320" font-family="'Montserrat', 'Segoe UI', Arial, sans-serif" font-size="28" font-weight="500" fill="#94a3b8" letter-spacing="3">TELKOM UNIVERSITY</text>
    </svg>
  `;

  const textCompactDark = await sharp(Buffer.from(svgTextDark)).png().toBuffer();
  const textCompactWhite = await sharp(Buffer.from(svgTextWhite)).png().toBuffer();

  const compactTotalWidth = 300 + 50 + 650;
  const compactDark = await sharp({
    create: { width: compactTotalWidth, height: 344, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } }
  })
  .composite([
    { input: compactEmblem.data, left: 0, top: 0 },
    { input: textCompactDark, left: 350, top: 0 }
  ])
  .png()
  .toBuffer();

  const compactWhite = await sharp({
    create: { width: compactTotalWidth, height: 344, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } }
  })
  .composite([
    { input: compactEmblem.data, left: 0, top: 0 },
    { input: textCompactWhite, left: 350, top: 0 }
  ])
  .png()
  .toBuffer();

  await sharp(compactDark).resize(1000).png().toFile(path.join(brandDir, 'eim-logo-compact.png'));
  await sharp(compactWhite).resize(1000).png().toFile(path.join(brandDir, 'eim-logo-compact-white.png'));

  // ==========================================
  // 8. EMAIL-OPTIMIZED ASSETS (public/assets/email/)
  // ==========================================

  // A. Primary Email Header Logo (Horizontal Full, 500px @2x)
  await sharp(horizDark)
    .resize(500)
    .png({ quality: 90, compressionLevel: 9 })
    .toFile(path.join(emailDir, 'logo.png'));

  await sharp(horizWhite)
    .resize(500)
    .png({ quality: 90, compressionLevel: 9 })
    .toFile(path.join(emailDir, 'logo-white.png'));

  // B. Email Compact Logo
  await sharp(compactDark)
    .resize(500)
    .png({ quality: 90, compressionLevel: 9 })
    .toFile(path.join(emailDir, 'logo-compact.png'));

  await sharp(compactWhite)
    .resize(500)
    .png({ quality: 90, compressionLevel: 9 })
    .toFile(path.join(emailDir, 'logo-compact-white.png'));

  // C. Vertical Logo (400px @2x)
  await sharp('public/image/eim/EIM.png')
    .resize(400)
    .png({ quality: 90, compressionLevel: 9 })
    .toFile(path.join(emailDir, 'logo-vertical.png'));

  await sharp(verticalWhiteComposite)
    .resize(400)
    .png({ quality: 90, compressionLevel: 9 })
    .toFile(path.join(emailDir, 'logo-vertical-white.png'));

  // D. Square Email Icon (256px @2x, 128px, 64px)
  await sharp(emblemBuffer)
    .resize(256, 256, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ quality: 90, compressionLevel: 9 })
    .toFile(path.join(emailDir, 'logo-icon.png'));

  await sharp(emblemBuffer)
    .resize(128, 128, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ quality: 90 })
    .toFile(path.join(emailDir, 'logo-icon-128.png'));

  await sharp(emblemBuffer)
    .resize(64, 64, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ quality: 90 })
    .toFile(path.join(emailDir, 'logo-icon-64.png'));

  // E. Email Header Banners (600px width standard email max-width)
  // Dark Banner (600 x 140)
  const bannerLogoWhite = await sharp(horizWhite).resize({ width: 380 }).toBuffer({ resolveWithObject: true });
  const darkBannerSvg = `
    <svg width="600" height="140" viewBox="0 0 600 140" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0b1120" />
          <stop offset="50%" stop-color="#0f172a" />
          <stop offset="100%" stop-color="#1e293b" />
        </linearGradient>
        <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#06b6d4" stop-opacity="0" />
          <stop offset="50%" stop-color="#06b6d4" stop-opacity="1" />
          <stop offset="100%" stop-color="#3b82f6" stop-opacity="0" />
        </linearGradient>
        <linearGradient id="bottomBorder" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#06b6d4" />
          <stop offset="100%" stop-color="#3b82f6" />
        </linearGradient>
      </defs>
      <rect width="600" height="140" fill="url(#bgGrad)" />
      <circle cx="300" cy="70" r="180" fill="#06b6d4" opacity="0.04" />
      <line x1="100" y1="139" x2="500" y2="139" stroke="url(#accentGrad)" stroke-width="2" />
      <rect x="0" y="137" width="600" height="3" fill="url(#bottomBorder)" />
    </svg>
  `;
  const darkBannerBg = await sharp(Buffer.from(darkBannerSvg)).png().toBuffer();
  await sharp(darkBannerBg)
    .composite([
      {
        input: bannerLogoWhite.data,
        top: Math.round((137 - bannerLogoWhite.info.height) / 2),
        left: Math.round((600 - bannerLogoWhite.info.width) / 2)
      }
    ])
    .png({ quality: 92 })
    .toFile(path.join(emailDir, 'banner-dark.png'));

  // Light Banner (600 x 140)
  const bannerLogoDark = await sharp(horizDark).resize({ width: 380 }).toBuffer({ resolveWithObject: true });
  const lightBannerSvg = `
    <svg width="600" height="140" viewBox="0 0 600 140" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgLightGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="100%" stop-color="#f1f5f9" />
        </linearGradient>
        <linearGradient id="lightBottom" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#0d9488" />
          <stop offset="100%" stop-color="#0284c7" />
        </linearGradient>
      </defs>
      <rect width="600" height="140" fill="url(#bgLightGrad)" />
      <rect x="0" y="137" width="600" height="3" fill="url(#lightBottom)" />
    </svg>
  `;
  const lightBannerBg = await sharp(Buffer.from(lightBannerSvg)).png().toBuffer();
  await sharp(lightBannerBg)
    .composite([
      {
        input: bannerLogoDark.data,
        top: Math.round((137 - bannerLogoDark.info.height) / 2),
        left: Math.round((600 - bannerLogoDark.info.width) / 2)
      }
    ])
    .png({ quality: 92 })
    .toFile(path.join(emailDir, 'banner-light.png'));

  // ==========================================
  // 9. SOCIAL & UI ICONS (public/assets/email/icons/)
  // ==========================================
  const icons = [
    {
      name: 'instagram',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>`
    },
    {
      name: 'linkedin',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>`
    },
    {
      name: 'github',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>`
    },
    {
      name: 'website',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>`
    },
    {
      name: 'email',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`
    },
    {
      name: 'whatsapp',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"/><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"/></svg>`
    }
  ];

  for (const icon of icons) {
    await sharp(Buffer.from(icon.svg))
      .png()
      .toFile(path.join(emailIconsDir, `${icon.name}.png`));
  }

  console.log('Asset generation completed successfully!');
}

// Run directly if invoked from command line
if (import.meta.url.endsWith(process.argv[1]) || process.argv[1]?.includes('generate-assets')) {
  generateAssets().catch(err => {
    console.error('Error generating assets:', err);
    process.exit(1);
  });
}
