/* Sync ONLY `img/` from the `antora-dark-theme` npm package into `site/supplemental-ui/img/`.
   Never copy CSS, partials, or JS — those are maintained in this repo (CI must not clobber styles). */
const fs = require('node:fs/promises')
const path = require('node:path')

const siteRoot = path.join(__dirname, '..')
const repoRoot = path.join(__dirname, '..', '..')
const destRoot = path.join(siteRoot, 'supplemental-ui')
const srcRoot = path.join(repoRoot, 'node_modules', 'antora-dark-theme', 'supplemental-ui')
const IMG_ONLY = 'img'

async function copyDir (fromRel) {
  const from = path.join(srcRoot, fromRel)
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
      const buf = await fs.readFile(path.join(srcRoot, rel))
      const out = path.join(destRoot, rel)
      await fs.mkdir(path.dirname(out), { recursive: true })
      await fs.writeFile(out, buf)
    }
  }
}

async function main () {
  await copyDir(IMG_ONLY)
  // eslint-disable-next-line no-console
  console.log('sync-antora-dark-theme: synced supplemental-ui/img only (styles untouched)')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
