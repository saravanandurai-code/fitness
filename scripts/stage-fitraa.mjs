import { cp, readFile, rm, writeFile } from 'node:fs/promises'

/**
 * Copies the Fitraa web export into the Sarv Pages output and writes the
 * not-found fallbacks.
 *
 * Runs after `vite build`, which empties docs/, so the order in build:site
 * matters.
 *
 * Expo web uses history routing and GitHub Pages has no rewrite rules, so a
 * link like /fitness/fitraa/today would hard 404. Pages serves the site-root
 * 404.html for unknown paths, so that file sends visitors to the start screen
 * of whichever app the path belongs to. The per-directory copy is for hosts
 * that honour nested fallbacks (Netlify, Vercel), where the deep link resolves
 * exactly.
 */
const target = 'docs/fitraa'

await rm(target, { recursive: true, force: true })
await cp('fitraa/dist', target, { recursive: true })

const appHtml = await readFile(`${target}/index.html`, 'utf8')
await writeFile(`${target}/404.html`, appHtml)

const rootFallback = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Redirecting…</title>
    <meta name="robots" content="noindex" />
    <script>
      // Unknown path: send the visitor to the start of the app it belongs to.
      var base = '/fitness/'
      var target = location.pathname.indexOf(base + 'fitraa') === 0 ? base + 'fitraa/' : base
      location.replace(target)
    </script>
  </head>
  <body style="background:#08090c"></body>
</html>
`
await writeFile('docs/404.html', rootFallback)

console.log(`staged ${target}, ${target}/404.html and docs/404.html`)
