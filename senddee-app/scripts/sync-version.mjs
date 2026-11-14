// Keeps the Android versionName/versionCode in step with package.json so the app shows the same version everywhere.
import { readFileSync, writeFileSync } from 'node:fs'
const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
const [maj, min, pat] = version.split('.').map((n) => parseInt(n, 10) || 0)
const code = maj * 10000 + min * 100 + pat
const f = new URL('../android/app/build.gradle', import.meta.url)
let s = readFileSync(f, 'utf8')
s = s.replace(/versionCode\s+\d+/, `versionCode ${code}`).replace(/versionName\s+"[^"]*"/, `versionName "${version}"`)
writeFileSync(f, s)
console.log(`android version -> ${version} (code ${code})`)
