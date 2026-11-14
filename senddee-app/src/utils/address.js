import { PROVINCES } from '../data/provinces'

// Splits a pasted blob like "คุณสมหญิง 081-234-5678 99/1 ม.2 ต.บางพลี อ.บางพลี จ.สมุทรปราการ 10540"
// into name / phone / address / province / postcode. Best-effort: the staff can edit every field afterwards.
export function parseAddress(raw) {
  let text = String(raw || '').replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim()
  const out = { name: '', phone: '', address: '', province: '', postcode: '' }
  if (!text) return out

  const ph = text.match(/(?<!\d)0\d(?:[- ]?\d){7}(?:[- ]?\d)?(?!\d)/)
  if (ph) {
    const digits = ph[0].replace(/\D/g, '')
    if (digits.length >= 9 && digits.length <= 10) { out.phone = digits; text = text.replace(ph[0], ' ') }
  }
  const pc = text.match(/(?<!\d)\d{5}(?!\d)/)
  if (pc) { out.postcode = pc[0]; text = text.replace(pc[0], ' ') }

  const norm = text.replace(/กทม\.?|กรุงเทพฯ?(?!มหานคร)/g, 'กรุงเทพมหานคร')
  const prov = [...PROVINCES].sort((a, b) => b.length - a.length).find((p) => norm.includes(p))
  if (prov) {
    out.province = prov
    text = norm.replace(new RegExp(`(จังหวัด|จ\\.)?\\s*${prov}`), ' ')
  }
  text = text.replace(/\s+/g, ' ').trim()

  // Name = leading text before the first digit or address marker (บ้านเลขที่ / ม. / ต. / อ. / ซ. / ถ.)
  const m = text.match(/^(.*?)(?=\s(?:\d|ม\.|หมู่|ต\.|อ\.|ซ\.|ซอย|ถ\.|ถนน|แขวง|เขต|บ้านเลขที่)|$)/)
  const name = (m?.[1] || '').trim()
  if (name && name.length <= 40 && !/^\d/.test(name)) {
    out.name = name
    out.address = text.slice(name.length).trim()
  } else {
    out.address = text
  }
  return out
}
