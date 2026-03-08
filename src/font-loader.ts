const fontCache = new Set<string>();

export async function loadFont(fontFamily: string): Promise<void> {
  if (fontCache.has(fontFamily)) {
    return;
  }

  // Handle standard fonts that don't need loading
  if (['Arial', 'sans-serif', 'serif', 'monospace'].includes(fontFamily)) {
    return;
  }

  const spinner = document.getElementById('loading-spinner');
  
  try {
    if (spinner) spinner.classList.remove('hidden');
    
    // Attempt to load the font using the FontFaceSet API
    // We use a sample text to trigger the load of the specific font-family
    await document.fonts.load(`1em "${fontFamily}"`);
    
    fontCache.add(fontFamily);
  } catch (error) {
    console.error(`Failed to load font: ${fontFamily}`, error);
  } finally {
    if (spinner) spinner.classList.add('hidden');
  }
}

export function isFontLoaded(fontFamily: string): boolean {
  return fontCache.has(fontFamily);
}
