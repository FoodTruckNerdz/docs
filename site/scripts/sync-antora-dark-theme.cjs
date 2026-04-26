/* Copy selected files from the `antora-dark-theme` npm package into `site/supplemental-ui/`.
   Antora exposes one supplemental path; this pulls dark palette + shared VCS art from the package. */
const fs = require('node:fs/promises')
const path = require('node:path')

const siteRoot = path.join(__dirname, '..')
const repoRoot = path.join(__dirname, '..', '..')
const destRoot = path.join(siteRoot, 'supplemental-ui')
const src = path.join(repoRoot, 'node_modules', 'antora-dark-theme', 'supplemental-ui')

const files = [
  ['css', 'site-extra.css'],
  /* site-doc-layout.css, partials, site-dark-mode.js, site-adt-accordion.js: maintained in this repo
     (FoodTruckNerdz branding: header, footer, truck logo, sticky-footer block at top of
     site-doc-layout.css). The package is the debranded baseline; do not prebuild-overwrite the full
     tree from npm. When bumping antora-dark-theme, merge :root / layout token changes from the
     package’s supplemental-ui/css/site-doc-layout.css (e.g. --adt-mast-pad-h) into this copy. */
]

async function copyIfPresent (fromParts, toParts) {
  const from = path.join(src, ...fromParts)
  const to = path.join(destRoot, ...toParts)
  const buf = await fs.readFile(from)
  await fs.mkdir(path.dirname(to), { recursive: true })
  await fs.writeFile(to, buf)
  return to
}

async function copyDir (fromRel) {
  const from = path.join(src, fromRel)
  let entries
  try {
    entries = await fs.readdir(from, { withFileTypes: true })
  } catch (e) {
    if (e && e.code === 'ENOENT') {
      throw new Error(
        `antora-dark-theme is missing at ${from}. From repo root run: pnpm install`
      )
    }
    throw e
  }
  for (const ent of entries) {
    if (ent.isDirectory()) {
      await copyDir(path.join(fromRel, ent.name))
    } else {
      const rel = path.join(fromRel, ent.name)
      const buf = await fs.readFile(path.join(src, rel))
      const out = path.join(destRoot, rel)
      await fs.mkdir(path.dirname(out), { recursive: true })
      await fs.writeFile(out, buf)
    }
  }
}

async function main () {
  for (const [dir, f] of files) {
    await copyIfPresent([dir, f], [dir, f])
  }
  await copyDir('img')
  // eslint-disable-next-line no-console
  console.log('sync-antora-dark-theme: OK')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
