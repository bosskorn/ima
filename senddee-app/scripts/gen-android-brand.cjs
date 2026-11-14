// Regenerates the Android launcher icons and splash images from brand/logo-icon.svg.
// One-off tool (needs `playwright` available globally):  NODE_PATH=$(npm root -g) node scripts/gen-android-brand.cjs
const { chromium } = require('playwright')
const fs = require('fs'), path = require('path')
const RES = path.join(__dirname, '../android/app/src/main/res')
const MARK = (stroke, chev) => `<g fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<path d="M21 16.5C21 16.88 20.79 17.21 20.47 17.38L12.57 21.82C12.41 21.91 12.21 21.97 12 21.97C11.79 21.97 11.59 21.91 11.43 21.82L3.53 17.38C3.21 17.21 3 16.88 3 16.5V7.5C3 7.12 3.21 6.79 3.53 6.62L11.43 2.18C11.59 2.09 11.79 2.03 12 2.03C12.21 2.03 12.41 2.09 12.57 2.18L20.47 6.62C20.79 6.79 21 7.12 21 7.5V16.5Z"/>
<path d="M12 22V12"/><path d="M12 12L20.5 7.5"/><path d="M12 12L3.5 7.5"/><path d="M7 10.5L12 13.5L17 10.5" stroke="${chev}" stroke-width="2.2"/></g>`
const GRAD = '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0066FF"/><stop offset="1" stop-color="#0044CC"/></linearGradient></defs>'
// full icon (rounded square or circle) with gradient + mark; viewBox 48
const icon = (rx) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">${GRAD}<rect width="48" height="48" rx="${rx}" fill="url(#g)"/><g transform="translate(10 10) scale(1.1667)">${MARK('#fff', '#00E5FF')}</g></svg>`
// adaptive foreground: 108dp canvas, mark ~46dp in the safe zone, transparent
const fg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 108"><g transform="translate(31 31) scale(2.0833)">${MARK('#fff', '#00E5FF')}</g></svg>`
const splash = (w, h) => {
  const s = Math.round(Math.min(w, h) * 0.26)
  return `<html><body style="margin:0;width:${w}px;height:${h}px;background:#0066FF;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:${Math.round(s * 0.18)}px">
  <svg width="${s}" height="${s}" viewBox="0 0 48 48"><rect width="48" height="48" rx="13" fill="#fff"/><g transform="translate(10 10) scale(1.1667)">${MARK('#0066FF', '#00B8E6')}</g></svg>
  <div style="font:500 ${Math.round(s * 0.34)}px Arial,sans-serif;color:#fff;letter-spacing:-1px">Send<span style="color:#7FEEFF">Dee</span></div></body></html>`
}
;(async () => {
  const b = await chromium.launch(); const pg = await b.newPage()
  const render = async (html, w, h, out, transparent = false) => {
    await pg.setViewportSize({ width: w, height: h }); await pg.setContent(html)
    fs.mkdirSync(path.dirname(out), { recursive: true }); await pg.screenshot({ path: out, omitBackground: transparent })
  }
  const wrap = (svg, w, h) => `<html><body style="margin:0;background:transparent">${svg.replace('<svg ', `<svg width="${w}" height="${h}" `)}</body></html>`
  const D = { mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 }
  for (const [d, px] of Object.entries(D)) {
    await render(wrap(icon(13), px, px), px, px, `${RES}/mipmap-${d}/ic_launcher.png`, true)
    await render(wrap(icon(24), px, px), px, px, `${RES}/mipmap-${d}/ic_launcher_round.png`, true)
    const f = Math.round(px * 108 / 48)
    await render(wrap(fg, f, f), f, f, `${RES}/mipmap-${d}/ic_launcher_foreground.png`, true)
  }
  const S = [['drawable', 480, 320], ['drawable-land-mdpi', 480, 320], ['drawable-land-hdpi', 800, 480], ['drawable-land-xhdpi', 1280, 720], ['drawable-land-xxhdpi', 1600, 960], ['drawable-land-xxxhdpi', 1920, 1280],
    ['drawable-port-mdpi', 320, 480], ['drawable-port-hdpi', 480, 800], ['drawable-port-xhdpi', 720, 1280], ['drawable-port-xxhdpi', 960, 1600], ['drawable-port-xxxhdpi', 1280, 1920]]
  for (const [d, w, h] of S) await render(splash(w, h), w, h, `${RES}/${d}/splash.png`)
  await render(wrap(icon(13), 512, 512), 512, 512, path.join(__dirname, '../brand/app-icon-512.png'), true)
  await b.close(); console.log('brand assets generated')
})()
