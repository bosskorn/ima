// Prints exactly one element on its own page(s). The element is cloned into #print-root while the rest of the app is
// hidden, so nothing else (background, sheets, nav bars) reaches the printer and nothing repeats on extra pages.
export function printEl(el) {
  if (!el) return
  let root = document.getElementById('print-root')
  if (!root) { root = document.createElement('div'); root.id = 'print-root'; document.body.appendChild(root) }
  root.innerHTML = ''
  root.appendChild(el.cloneNode(true))
  document.body.classList.add('printing')
  const done = () => { document.body.classList.remove('printing'); root.innerHTML = ''; window.removeEventListener('afterprint', done) }
  window.addEventListener('afterprint', done)
  setTimeout(() => window.print(), 50)
  setTimeout(done, 60000) // safety net if afterprint never fires
}
// The topmost printable on screen (sheets are teleported to the end of <body>, so the last one wins).
export function printVisible() {
  const all = document.querySelectorAll('.printable')
  printEl(all[all.length - 1])
}
