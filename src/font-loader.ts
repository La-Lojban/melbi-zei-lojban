const fontCache = new Set<string>();
const inflight = new Map<string, Promise<void>>();

type FaceSpec = {
  family: string;
  weight?: string;
  style?: string;
  file: () => Promise<{ default: string }>;
};

/** Each import() is a separate asset. Nothing downloads until that family is drawn. */
const FACE_FILES: Record<string, FaceSpec[]> = {
  emoji: [{ family: 'emoji', file: () => import('./fonts/NotoColorEmoji.ttf?url') }],
  crisa: [
    { family: 'crisa', weight: '400', file: () => import('./fonts/crisa-regular.otf?url') },
    { family: 'crisa', weight: '200', file: () => import('./fonts/crisa-light.otf?url') },
  ],
  'crisa-light': [{ family: 'crisa-light', file: () => import('./fonts/crisa-light.otf?url') }],
  'crisa-regular': [{ family: 'crisa-regular', file: () => import('./fonts/crisa-regular.otf?url') }],
  'vrude-regular': [
    { family: 'vrude-regular', style: 'normal', file: () => import('./fonts/vrude-regular.otf?url') },
    { family: 'vrude-regular', style: 'italic', file: () => import('./fonts/vrude-italic-regular.otf?url') },
  ],
  'ritli-regular': [{ family: 'ritli-regular', file: () => import('./fonts/ritli-regular.otf?url') }],
  'primihi-regular': [{ family: 'primihi-regular', file: () => import('./fonts/primihi-regular.otf?url') }],
  'balvi-regular': [{ family: 'balvi-regular', file: () => import('./fonts/balvi-regular.otf?url') }],
  'dunda-regular': [{ family: 'dunda-regular', file: () => import('./fonts/dunda-regular.otf?url') }],
  'nerfopi-regular': [{ family: 'nerfopi-regular', file: () => import('./fonts/nerfopi-regular.otf?url') }],
  'tanbo-regular': [{ family: 'tanbo-regular', file: () => import('./fonts/tanbo-regular.otf?url') }],
  'fira-code-zlm': [{ family: 'fira-code-zlm', file: () => import('./fonts/fira-code-zlm.otf?url') }],
  manri: [{ family: 'manri', file: () => import('./fonts/unicode-manri.otf?url') }],
  drakono: [{ family: 'drakono', file: () => import('./fonts/unicode-drakono.otf?url') }],
  'piper-karot': [{ family: 'piper-karot', file: () => import('./fonts/piper-karot.otf?url') }],
  'tisna-bold': [{ family: 'tisna-bold', weight: 'bold', file: () => import('./fonts/tisna-bold.otf?url') }],
  'mv-randhoo': [{ family: 'mv-randhoo', file: () => import('./fonts/mv-randhoo-regular.ttf?url') }],
  sundanese: [
    {
      family: 'sundanese',
      file: () => import('./fonts/noto-sans-sundanese-regular.ttf?url'),
    },
  ],
  tibetan: [
    {
      family: 'tibetan',
      file: () => import('./fonts/tibetan-modern-a.ttf?url'),
    },
  ],
};

const SYSTEM_FAMILIES = new Set([
  'Arial',
  'sans-serif',
  'serif',
  'monospace',
  'krulermorna-greek',
  'krulermorna-cyrillic',
  'coptic',
  'brolermorna',
]);

async function registerFileFaces(specs: FaceSpec[]): Promise<void> {
  await Promise.all(
    specs.map(async (spec) => {
      const mod = await spec.file();
      const face = new FontFace(spec.family, `url(${mod.default})`, {
        weight: spec.weight ?? 'normal',
        style: spec.style ?? 'normal',
        display: 'swap',
      });
      await face.load();
      document.fonts.add(face);
    })
  );
}

function startLoad(fontFamily: string): Promise<void> {
  const existing = inflight.get(fontFamily);
  if (existing) return existing;

  const pending = (async () => {
    const specs = FACE_FILES[fontFamily];
    if (specs) {
      await registerFileFaces(specs);
    } else {
      await document.fonts.load(`1em "${fontFamily}"`);
    }
    fontCache.add(fontFamily);
  })().catch((error) => {
    console.error(`Failed to load font: ${fontFamily}`, error);
  });

  inflight.set(fontFamily, pending);
  return pending;
}

export async function loadFont(fontFamily: string): Promise<void> {
  if (fontCache.has(fontFamily) || SYSTEM_FAMILIES.has(fontFamily)) {
    return;
  }

  const spinner = document.getElementById('loading-spinner');
  spinner?.classList.remove('hidden');
  try {
    await startLoad(fontFamily);
  } finally {
    spinner?.classList.add('hidden');
  }
}

/** Fetch file faces one at a time after the page is up. No spinner. */
export function preloadFontsInBackground(first?: string): void {
  const families = Object.keys(FACE_FILES);
  if (first && families.includes(first)) {
    families.splice(families.indexOf(first), 1);
    families.unshift(first);
  }

  const run = async () => {
    for (const family of families) {
      if (fontCache.has(family)) continue;
      await startLoad(family);
    }
  };

  requestIdleCallback(() => void run());
}

export function isFontLoaded(fontFamily: string): boolean {
  return fontCache.has(fontFamily);
}
