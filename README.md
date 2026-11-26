# melbi-zei-lojban

A modern, high-performance renderer for Lojban alternative orthographies. This project converts Lojban text into beautiful scripts (like Zbalermorna) and renders them as images using a canvas.

## Features

- **Alternative Orthographies**: Supports Zbalermorna, Emoji, and other experimental Lojban scripts.
- **Dynamic Rendering**: Real-time rendering to canvas with image export functionality.
- **Custom Fonts**: Includes 16+ custom Lojban fonts.
- **Premium UX**: Smooth transitions, font loading spinners, and browser caching for fonts.
- **Light/Dark Mode**: Full support for both themes, persisted in local storage.
- **Mobile Responsive**: Optimized for both desktop and mobile devices.

## Tech Stack

- **Core**: Vanilla TypeScript
- **Styling**: TailwindCSS
- **Build Tool**: Vite
- **Package Manager**: pnpm

## Development

To start the development server:

```bash
pnpm install
pnpm dev
```

To build for production:

```bash
pnpm build
```

The production build will be available in the `dist/` directory, which is automatically deployed to GitHub Pages via GitHub Actions.

## Project Structure

- `src/`: Core TypeScript source files.
- `public/`: Static assets, including fonts and icons.
- `index.html`: Main entry point.
- `tailwind.config.js`: Styling configuration.
- `vite.config.ts`: Build and server configuration.
## Mongolian transcription

The Mongolian option uses traditional Mongolian Unicode letters in vertical,
top-to-bottom columns, ordered left to right. Its phonemic letter assignments
are a project-specific convention: the chart linked from the historical
[Lojban proposal](https://mw.lojban.org/papri/Mongolian) is unavailable. The
conversion preserves original spelling exactly, including explicit stress,
pauses, whitespace, and literal Mongolian text. Copied text uses `~U` before
an uppercase letter, `~L` before a literal Mongolian letter, and `~~` for a
literal tilde; `mongolianToLatin` decodes these escapes. The bundled Noto Sans
Mongolian font is distributed under the accompanying SIL Open Font License.
