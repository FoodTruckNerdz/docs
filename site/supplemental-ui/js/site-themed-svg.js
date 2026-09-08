const THEMED_SVG_RUNTIME = 'https://cdn.jsdelivr.net/npm/@dev-centr/themed-svg@0.1.1/browser/themed-svg-element.js';

async function upgradeThemedDiagrams() {
  document.querySelectorAll('img.themed-svg, .themed-svg img').forEach((image) => {
    image.setAttribute('data-themed-svg', '');
  });
  const { upgradeThemedSvgImages } = await import(THEMED_SVG_RUNTIME);
  upgradeThemedSvgImages(document);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', upgradeThemedDiagrams, { once: true });
} else {
  upgradeThemedDiagrams();
}
