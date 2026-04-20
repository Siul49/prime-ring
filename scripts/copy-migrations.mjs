import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const src = path.join(root, 'electron', 'db', 'migrations')
const dest = path.join(root, 'dist-electron', 'db', 'migrations')

fs.mkdirSync(dest, { recursive: true })
for (const file of fs.readdirSync(src)) {
    if (file.endsWith('.sql')) {
        fs.copyFileSync(path.join(src, file), path.join(dest, file))
    }
}
console.log(`Copied migrations to ${dest}`)
