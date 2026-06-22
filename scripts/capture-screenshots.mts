import { chromium } from 'playwright'
import path from 'node:path'

const baseUrl = process.env.BASE_URL ?? 'http://127.0.0.1:3000'
const outDir = path.join(process.cwd(), 'public', 'screenshots')

const shots = [
  { url: `${baseUrl}/demo/dashboard`, file: 'dashboard.png' },
  { url: `${baseUrl}/demo/wrapped`, file: 'wrapped.png' },
]

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

for (const shot of shots) {
  console.log(`Capturing ${shot.url}`)
  await page.goto(shot.url, { waitUntil: 'networkidle', timeout: 60_000 })
  await page.waitForTimeout(1500)
  await page.screenshot({
    path: path.join(outDir, shot.file),
    fullPage: true,
  })
  console.log(`Saved ${shot.file}`)
}

await browser.close()
console.log('Done')
