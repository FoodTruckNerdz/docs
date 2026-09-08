import { spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { prepareThemedMermaidSvgDualOutput } from '@dev-centr/mermaid-svg-css-vars'

const check = process.argv.includes('--check')
const migrate = process.argv.includes('--migrate')
const root = resolve('docs/modules/ROOT/images/diagrams')
const temp = mkdtempSync(join(tmpdir(), 'ftn-diagrams-'))
const chromeCandidates = [
  process.env.PUPPETEER_EXECUTABLE_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
].filter(Boolean)

const diagrams = [
  ['troubleshooting-flowchart', 'Antora build error diagnosis', 'Decision flow for routing common Antora build errors to the relevant troubleshooting section.'],
  ['multi-repo-sync', 'Multi-repository synchronization', 'An Antora playbook fetches three repositories; the ftn-site fetch fails because local documentation was not pushed.'],
  ['github-actions-antora-flow', 'GitHub Actions Antora build flow', 'Sequence from a developer push through authenticated content fetching, Antora build, and GitHub Pages deployment.'],
  ['checkout-flow', 'Checkout action flow', 'A shallow git clone copies the GitHub repository into the runner workspace.'],
  ['cache-benefit', 'Package cache benefit', 'Comparison of uncached and cached pnpm installation time and behavior.'],
  ['upload-artifact-flow', 'GitHub Pages artifact flow', 'Build output is packaged, uploaded as a GitHub artifact, then downloaded by the deployment step.'],
  ['complete-workflow', 'Complete GitHub Actions workflow', 'Build-job actions lead from checkout through Antora packaging, followed by the GitHub Pages deploy job.'],
]

const configPath = join(temp, 'mermaid-config.json')
writeFileSync(configPath, JSON.stringify({
  htmlLabels: false,
  flowchart: { htmlLabels: false, curve: 'basis' },
  securityLevel: 'strict',
  theme: 'default',
}))
const puppeteerConfigPath = join(temp, 'puppeteer-config.json')
writeFileSync(puppeteerConfigPath, JSON.stringify({
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
}))

let stale = false
for (const [name, title, description] of diagrams) {
  const directory = join(root, name)
  const canonicalSource = join(directory, `${name}.mmd`)
  const alternateSource = join(root, `${name}.mmd`)
  if (migrate && existsSync(alternateSource)) {
    // The initial flat migration drafts retain more of the inline PlantUML
    // labels and branches. Promote that content before removing the duplicate.
    writeFileSync(canonicalSource, readFileSync(alternateSource, 'utf8'))
    rmSync(alternateSource)
  }
  if (migrate) rmSync(join(root, `${name}.raw.svg`), { force: true })
  const raw = join(temp, `${name}.raw.svg`)
  const command = process.execPath
  const env = { ...process.env }
  if (!env.PUPPETEER_EXECUTABLE_PATH) {
    env.PUPPETEER_EXECUTABLE_PATH = chromeCandidates.find((path) => existsSync(path))
  }
  const rendered = spawnSync(command, [
    resolve('node_modules/@mermaid-js/mermaid-cli/src/cli.js'),
    '-i', canonicalSource,
    '-o', raw,
    '-b', 'transparent',
    '-c', configPath,
    ...(process.env.CI ? ['-p', puppeteerConfigPath] : []),
  ], { encoding: 'utf8', env })
  if (rendered.status !== 0) throw new Error(rendered.stderr || rendered.stdout)

  const manifest = JSON.parse(readFileSync(join(directory, `${name}.theme.json`), 'utf8'))
  const result = prepareThemedMermaidSvgDualOutput(readFileSync(raw, 'utf8'), manifest, {
    metadata: { role: 'img', title, description },
  })
  const errors = result.diagnostics.filter(({ severity }) => severity === 'error')
  if (errors.length || !result.standaloneSvg || !result.hostSvg) {
    throw new Error(`${name}: ${JSON.stringify(errors, null, 2)}`)
  }

  const outputs = [
    [`${name}.svg`, `${result.standaloneSvg}\n`],
    [`${name}.host.svg`, `${result.hostSvg}\n`],
  ]
  for (const [file, content] of outputs) {
    const path = join(directory, file)
    if (check) {
      let current
      try { current = readFileSync(path, 'utf8') } catch { current = undefined }
      if (current !== content) {
        console.error(`stale: ${path}`)
        stale = true
      }
    } else {
      writeFileSync(path, content)
    }
  }
}
rmSync(temp, { recursive: true, force: true })
if (stale) process.exitCode = 1
