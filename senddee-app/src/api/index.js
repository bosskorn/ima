// Mock API layer for the SendDee counter/staff app. Every function is async and returns plain objects,
// so replacing this file with real fetch() calls to the SendDee backend won't touch the views.
import { CARRIERS, STATUS_FLOW, MAX_WEIGHT_KG, COD_RATE, PROFIT_MARGIN } from '../data/constants'
import { isToday } from '../utils/format'

const KEY = 'senddee.staff.orders.v3'
const TXKEY = 'senddee.staff.tx.v1'
const SKEY = 'senddee.staff.senders.v1'
const IKEY = 'senddee.staff.issues.v1'
const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms))
const now = () => new Date().toISOString()
const ago = (h) => new Date(Date.now() - h * 3600e3).toISOString()
const readJson = (k, d = []) => { try { return JSON.parse(localStorage.getItem(k) || 'null') ?? d } catch { return d } }
const writeJson = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} }

const EVT = {
  received: 'ร้านรับพัสดุจากลูกค้า รอส่งมอบให้ขนส่ง',
  received_home: 'พนักงานรับพัสดุที่บ้านลูกค้า รอส่งมอบให้ขนส่ง',
  handed_over: 'ส่งมอบพัสดุให้ขนส่งแล้ว',
  in_transit: 'พัสดุถึงศูนย์กระจายสินค้า',
  out_for_delivery: 'พนักงานกำลังนำส่งพัสดุให้ผู้รับ',
  delivered: 'ผู้รับได้รับพัสดุเรียบร้อยแล้ว',
}
const STAFF = { id: 'S001', name: 'น้องฟ้า' }

// ---------- pricing ----------
export function calcFee({ weight, carrier = 'flash', cod = 0 }) {
  const w = Number(weight) || 0
  const c = CARRIERS.find((x) => x.id === carrier) || CARRIERS[0]
  let shipping = 0
  if (w > 0) {
    const tier = c.tiers.find(([max]) => w <= max)
    shipping = tier ? tier[1] : c.tiers[c.tiers.length - 1][1]
  }
  const codFee = cod > 0 ? Math.round(cod * COD_RATE) : 0 // 3% of the COD amount
  return { shipping, codFee, total: shipping + codFee }
}

// ---------- seed ----------
function seedSenders() {
  return [
    { phone: '0812345678', name: 'คุณสมชาย ใจดี', address: '88 ซ.ลาดพร้าว 71 กรุงเทพมหานคร', lastAt: ago(30), credit: 1000,
      bank: { bank: 'กสิกรไทย', number: '1234567890', name: 'สมชาย ใจดี' } },
    { phone: '0861112233', name: 'ร้านมาลีสบู่สมุนไพร', address: '12/3 ถ.เพชรเกษม นครปฐม', lastAt: ago(60), credit: 40, bank: null },
  ]
}
function seed() {
  const mk = (no, status, hours, over = {}) => {
    const upto = STATUS_FLOW.indexOf(status)
    const events = STATUS_FLOW.slice(0, upto + 1).map((s, i) => ({ status: s, text: EVT[s], at: ago(Math.max(0.1, hours - i * (hours / (upto + 1)))) }))
    const weight = over.weight ?? 1.2, carrier = over.carrier ?? 'flash', cod = over.cod ?? 0
    const f = calcFee({ weight, carrier, cod })
    return {
      id: no, trackingNo: no, status, createdAt: ago(hours), events, pickup: 'shop',
      sender: { name: 'ลูกค้าหน้าร้าน', phone: '0899990000', address: '' },
      receiver: { name: 'คุณสมชาย ใจดี', phone: '0898765432', address: '12 ม.3 ต.ในเมือง อ.เมือง', province: 'ขอนแก่น', postcode: '40000' },
      parcel: { weight, dims: { w: 20, l: 25, h: 10 }, type: 'เสื้อผ้า / แฟชั่น', note: '' },
      carrier, cod, fee: f.shipping, codFee: f.codFee,
      charge: f.total, receivedBy: STAFF, ...over.rest,
    }
  }
  const R = (name, phone, prov, pc) => ({ receiver: { name, phone, address: '45/1 ถ.หลัก ต.กลาง อ.เมือง', province: prov, postcode: pc } })
  return [
    mk('SD260001008TH', 'received', 0.4, { weight: 0.8, carrier: 'spx', rest: R('คุณพิมพ์ใจ ดีเลิศ', '0861112233', 'นครราชสีมา', '30000') }),
    mk('SD260001007TH', 'received', 1.5, { weight: 2.0, cod: 1290, rest: R('คุณธนา มั่งมี', '0934445566', 'ชลบุรี', '20000') }),
    mk('SD260001006TH', 'received', 3, { weight: 4.5, carrier: 'spx', rest: R('คุณมาลี สุขสันต์', '0825556677', 'เชียงใหม่', '50200') }),
    mk('SD260001005TH', 'received', 29, { weight: 1.0, rest: R('คุณวิชัย แสงทอง', '0812223344', 'สงขลา', '90110') }),
    mk('SD260001004TH', 'handed_over', 5, { weight: 6, rest: { handoverId: 'HO-0001', ...R('คุณนภา รุ่งเรือง', '0899998888', 'ภูเก็ต', '83000') } }),
    mk('SD260001003TH', 'in_transit', 22, { weight: 1.2, cod: 590, carrier: 'spx', rest: R('คุณสมศรี เจริญ', '0867778899', 'อุดรธานี', '41000') }),
    mk('SD260001002TH', 'out_for_delivery', 40, { weight: 3 }),
    mk('SD260001001TH', 'delivered', 70, { weight: 1.5, carrier: 'spx' }),
  ]
}
function load() {
  const raw = readJson(KEY, null); if (raw) return raw
  const s = seed(); save(s); if (!readJson(SKEY, null)) writeJson(SKEY, seedSenders()); return s
}
function save(list) { writeJson(KEY, list) }
const loadSenders = () => { const s = readJson(SKEY, null); if (s) return s; const d = seedSenders(); writeJson(SKEY, d); return d }

async function adjustCredit(phone, delta) {
  const list = loadSenders(); const x = list.find((s) => s.phone === phone)
  if (x) { x.credit = (x.credit || 0) + delta; writeJson(SKEY, list) }
}

export async function listOrders() { await delay(); return load() }

// ---------- senders (customer directory; the real API will sync this, incl. the COD bank account) ----------
export async function findSender(phone) { await delay(250); return loadSenders().find((s) => s.phone === phone) || null }
export async function upsertSender(s) {
  const list = loadSenders(); const i = list.findIndex((x) => x.phone === s.phone)
  const rec = { ...(i >= 0 ? list[i] : {}), ...s, lastAt: now() }
  if (i >= 0) list[i] = rec; else list.unshift(rec)
  writeJson(SKEY, list); return rec
}

// ---------- receipts (one per customer visit; may hold many parcels) ----------
export async function getTx(id) { await delay(100); return readJson(TXKEY).find((t) => t.id === id) || null }
function newTx(sender, staff) {
  const list = readJson(TXKEY)
  const tx = { id: 'RC' + String(260001 + list.length), at: now(), sender: { name: sender.name, phone: sender.phone }, orderIds: [], by: staff.name }
  list.unshift(tx); writeJson(TXKEY, list); return tx
}
export async function createOrder(input, staff) {
  await delay(450)
  const w = Number(input.parcel.weight)
  if (!(w > 0) || w > MAX_WEIGHT_KG) throw new Error(`น้ำหนักต้องมากกว่า 0 และไม่เกิน ${MAX_WEIGHT_KG} กก.`)
  const list = load()
  const max = list.reduce((m, o) => Math.max(m, parseInt(o.trackingNo.slice(2, 11), 10) || 0), 260001000)
  const no = `SD${max + 1}TH`
  const f = calcFee({ weight: w, carrier: input.carrier, cod: input.cod })
  // The sender pays from the credit they topped up with the franchise; this app never handles money.
  const senders = loadSenders(); const si = senders.findIndex((x) => x.phone === input.sender.phone)
  const credit = si >= 0 ? senders[si].credit || 0 : 0
  if (credit < f.total) throw new Error(`เครดิตผู้ส่งไม่เพียงพอ (คงเหลือ ${credit.toLocaleString('th-TH')} บาท ต้องใช้ ${f.total.toLocaleString('th-TH')} บาท) — ให้ลูกค้าเติมเครดิตกับแฟรนไชส์ก่อน`)
  let txs = readJson(TXKEY), tx = input.txId ? txs.find((t) => t.id === input.txId) : null
  if (!tx) tx = newTx(input.sender, staff)
  txs = readJson(TXKEY); tx = txs.find((t) => t.id === tx.id)
  const order = {
    id: no, trackingNo: no, status: 'received', createdAt: now(), txId: tx.id,
    pickup: input.pickup === 'home' ? 'home' : 'shop',
    sender: input.sender, receiver: input.receiver, parcel: { ...input.parcel, weight: w },
    carrier: input.carrier, cod: input.cod || 0, fee: f.shipping, codFee: f.codFee,
    charge: f.total, // deducted from the sender's credit
    receivedBy: { id: staff.id, name: staff.name },
    events: [{ status: 'received', text: input.pickup === 'home' ? EVT.received_home : EVT.received, at: now() }],
  }
  list.unshift(order); save(list)
  tx.orderIds.push(no); writeJson(TXKEY, txs)
  await upsertSender({ phone: input.sender.phone, name: input.sender.name, address: input.sender.address || undefined, credit: credit - f.total, ...(input.sender.bank ? { bank: input.sender.bank } : {}) })
  return order
}

export async function voidOrder(id, reason) {
  await delay(250)
  const list = load(); const o = list.find((x) => x.id === id)
  if (!o) throw new Error('ไม่พบพัสดุ')
  if (o.status !== 'received') throw new Error('ยกเลิกได้เฉพาะพัสดุที่ยังไม่ส่งมอบขนส่ง')
  o.status = 'cancelled'; o.voidReason = reason || ''
  o.events.push({ status: 'cancelled', text: `ยกเลิกโดยร้าน${reason ? ': ' + reason : ''} (คืนเครดิต ฿${o.charge} เข้าบัญชีผู้ส่ง)`, at: now() })
  save(list); await adjustCredit(o.sender.phone, o.charge); return o
}

// Fix a parcel before it is handed to the courier. Re-prices it and reports the amount difference.
export async function editOrder(id, patch) {
  await delay(300)
  const list = load(); const o = list.find((x) => x.id === id)
  if (!o) throw new Error('ไม่พบพัสดุ')
  if (o.status !== 'received') throw new Error('แก้ไขได้เฉพาะพัสดุที่ยังไม่ส่งมอบขนส่ง')
  const w = Number(patch.parcel.weight)
  if (!(w > 0) || w > MAX_WEIGHT_KG) throw new Error(`น้ำหนักต้องมากกว่า 0 และไม่เกิน ${MAX_WEIGHT_KG} กก.`)
  const f = calcFee({ weight: w, carrier: patch.carrier, cod: o.cod })
  const diff = f.total - o.charge
  if (diff > 0) { const cur = loadSenders().find((x) => x.phone === o.sender.phone)?.credit || 0; if (cur < diff) throw new Error(`เครดิตผู้ส่งไม่พอสำหรับค่าบริการที่เพิ่ม ${diff} บาท (คงเหลือ ${cur} บาท)`) }
  o.receiver = { ...patch.receiver }; o.parcel = { ...o.parcel, ...patch.parcel, weight: w }
  o.carrier = patch.carrier; o.fee = f.shipping; o.codFee = f.codFee; o.charge = f.total
  o.events.push({ status: 'received', text: `แก้ไขข้อมูลพัสดุ${diff ? ` (${diff > 0 ? 'หักเครดิตเพิ่ม' : 'คืนเครดิต'} ฿${Math.abs(diff)})` : ''}`, at: now() })
  save(list); await adjustCredit(o.sender.phone, -diff); return { order: o, diff }
}

export async function handOver(ids) {
  await delay(400)
  const list = load()
  const n = parseInt(localStorage.getItem('senddee.ho.seq') || '1', 10) + 1
  try { localStorage.setItem('senddee.ho.seq', String(n)) } catch {}
  const hid = `HO-${String(n).padStart(4, '0')}`
  let count = 0
  for (const o of list) {
    if (ids.includes(o.id) && o.status === 'received') {
      o.status = 'handed_over'; o.handoverId = hid
      o.events.push({ status: 'handed_over', text: `${EVT.handed_over} (ใบส่งมอบ ${hid})`, at: now() })
      count++
    }
  }
  save(list); return { handoverId: hid, count }
}

// Demo helper: advance a parcel as the courier network would.
export async function advanceOrder(id) {
  await delay(150)
  const list = load(); const o = list.find((x) => x.id === id)
  if (!o) throw new Error('ไม่พบพัสดุ')
  const i = STATUS_FLOW.indexOf(o.status)
  if (i < 1 || i === STATUS_FLOW.length - 1) return o
  const next = STATUS_FLOW[i + 1]
  o.status = next; o.events.push({ status: next, text: EVT[next], at: now() })
  save(list); return o
}

// Totals for the Settings overview. Revenue = what was charged to senders' credit; profit uses PROFIT_MARGIN (placeholder).
export function summarize(list, day = isToday) {
  const live = list.filter((o) => day(o.createdAt) && o.status !== 'cancelled')
  const revenue = live.reduce((a, o) => a + o.charge, 0)
  return { count: live.length, voided: list.filter((o) => day(o.createdAt) && o.status === 'cancelled').length,
    weight: live.reduce((a, o) => a + o.parcel.weight, 0), revenue, profit: Math.round(revenue * PROFIT_MARGIN) }
}
export const isThisMonth = (iso) => { const d = new Date(iso), n = new Date(); return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear() }

// ---- issue reports & cash closing (mock, stored on device) ----
export async function listIssues() { await delay(100); return readJson(IKEY) }
export async function createIssue(issue, staff) {
  await delay(250)
  const list = readJson(IKEY)
  const it = { id: 'IS' + String(list.length + 1).padStart(4, '0'), at: now(), status: 'open', by: staff.name, ...issue }
  list.unshift(it); writeJson(IKEY, list); return it
}
export async function resolveIssue(id) {
  await delay(150)
  const list = readJson(IKEY); const it = list.find((x) => x.id === id)
  if (it) { it.status = 'resolved'; it.resolvedAt = now(); writeJson(IKEY, list) }
  return list
}
export async function resetDemo() {
  ;[KEY, TXKEY, SKEY, IKEY, 'senddee.ho.seq', 'senddee.receive.draft'].forEach((k) => localStorage.removeItem(k))
  return load()
}
