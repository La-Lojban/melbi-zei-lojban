import { defineConfig, type Plugin } from 'vite'

const OPTIONAL_PARSER = '\0lojban-optional-parser'

/**
 * lojban@2.0.48 lazily require()s ilmentufa/loglytufa grammars from the
 * package root. Those files are not in the published tarball. This app only
 * uses `modzi`, which never calls them. Stub the missing ids so Rolldown can
 * pre-bundle the package.
 */
function stubUnpublishedLojbanParsers(): Plugin {
  return {
    name: 'stub-unpublished-lojban-parsers',
    resolveId(id) {
      if (
        id.includes('/libs/ilmentufa/') ||
        id.includes('/libs/loglytufa/') ||
        id.includes('libs/ilmentufa/') ||
        id.includes('libs/loglytufa/')
      ) {
        return OPTIONAL_PARSER
      }
    },
    load(id) {
      if (id !== OPTIONAL_PARSER) return
      return `
        export function parse() {
          throw new Error('ilmentufa/loglytufa parsers are not included in the lojban npm package')
        }
        export function postprocessing() {
          throw new Error('ilmentufa/loglytufa parsers are not included in the lojban npm package')
        }
        export default { parse, postprocessing }
      `
    },
  }
}

export default defineConfig({
  base: '/melbi-zei-lojban/',
  plugins: [stubUnpublishedLojbanParsers()],
  optimizeDeps: {
    rolldownOptions: {
      plugins: [stubUnpublishedLojbanParsers()],
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  server: {
    open: true,
  },
})
