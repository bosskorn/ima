// Mock API layer for the Senddee counter/staff app. Every function is async and returns plain objects,
// so replacing this file with real fetch() calls to the Senddee backend won't touch the views.
import { SERVICES, STATUS_FLOW, MAX_WEIGHT_KG } from '../data/constants'
import { isToday } from '../utils/format'

const KEY = 'senddee.staff.orders.v2'
const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms))
const now = () => new Date().toISOString()
const ago = (h) => new Date(Date.now() - h * 3600e3).toISOString()

const EVT = {
  received: 'ร้านรับพัสดุจากลูกค้า รอส่งมอบให้ขนส่ง',
  handed_over: 'ส่งมอบพัสดุให้ขนส่งแล้ว',
  in_transit: 'พัสดุถึงศูนย์กระจายสินค้า',
  out_for_delivery: 'พนักงานกำลังนำส่งพัสดุให้ผู้รับ',
  delivered: 'ผู้รับได้รับพัสดุเรียบร้อยแล้ว',
}
const STAFF = { id: 'S001', name: 'น้องฟ้า' }

function seed() {
  const mk = (no, status, hours, over = {}) => {
    const upto = STATUS_FLOW.indexOf(status)
    const events = STATUS_FLOW.slice(0, upto + 1).map((s, i) => ({
      status: s, text: EVT[s], at: ago(Math.max(0.1, hours - i * (hours / (upto + 1)))),
    }))
    const weight = over.weight ?? 1.2
    const service = over.service ?? 'standard'
    const f = calcFee({ weight, service, cod: over.cod ?? 0 })
    return {
      id: no, trackingNo: no, status, createdAt: ago(hours), events,
      sender: { name: 'ลูกค้าหน้าร้าน', phone: '' },
      receiver: { name: 'คุณสมชาย ใจดี', phone: '0898765432', address: '12 ม.3 ต.ในเมือง อ.เมือง', province: 'ขอนแก่น', postcode: '40000' },
      parcel: { weight, type: 'เสื้อผ้า', note: '' },
      service, cod: over.cod ?? 0, fee: f.shipping, codFee: f.codFee,
      payment: { method: over.pay ?? 'cash', amount: f.shipping },
      receivedBy: STAFF,
      ...over.rest,
    }
  }
  const R = (name, phone, prov, pc) => ({ receiver: { name, phone, address: '45/1 ถ.หลัก ต.กลาง อ.เมือง', province: prov, postcode: pc } })
  return [
    mk('SD260001008TH', 'received', 0.4, { weight: 0.8, rest: R('คุณพิมพ์ใจ ดีเลิศ', '0861112233', 'นครราชสีมา', '30000') }),
    mk('SD260001007TH', 'received', 1.5, { weight: 2.0, cod: 1290, pay: 'promptpay', rest: R('คุณธนา มั่งมี', '0934445566', 'ชลบุรี', '20000') }),
    mk('SD260001006TH', 'received', 3, { weight: 4.5, service: 'express', rest: R('คุณมาลี สุขสันต์', '0825556677', 'เชียงใหม่', '50200') }),
    mk('SD260001005TH', 'received', 29, { weight: 1.0, pay: 'transfer', rest: R('คุณวิชัย แสงทอง', '0812223344', 'สงขลา', '90110') }),
    mk('SD260001004TH', 'handed_over', 5, { weight: 6, rest: { handoverId: 'HO-0001', ...R('คุณนภา รุ่งเรือง', '0899998888', 'ภูเก็ต', '83000') } }),
    mk('SD260001003TH', 'in_transit', 22, { weight: 1.2, cod: 590, rest: R('คุณสมศรี เจริญ', '0867778899', 'อุดรธานี', '41000') }),
    mk('SD260001002TH', 'out_for_delivery', 40, { weight: 3, service: 'express' }),
    mk('SD260001001TH', 'delivered', 70, { weight: 1.5 }),
  ]
}

function load() {
  try { const raw = localStorage.getItem(KEY); if (raw) return JSON.parse(raw) } catch {}
  const s = seed(); save(s); return s
}
function save(list) { try { localStorage.setItem(KEY, JSON.stringify(list)) } catch {} }

export function calcFee({ weight, service = 'standard', cod = 0 }) {
  const w = Number(weight) || 0
  let base
  if (w <= 0) base = 0
  else if (w <= 1) base = 35
  else if (w <= 3) base = 55
  else if (w <= 5) base = 75
  else if (w <= 10) base = 120
  else if (w <= 20) base = 200
  else base = 200 + Math.ceil(w - 20) * 10
  const s = SERVICES.find((x) => x.id === service) || SERVICES[0]
  const shipping = base ? Math.round(base * s.mult + s.extra) : 0
  const codFee = cod > 0 ? Math.max(15, Math.round(cod * 0.03)) : 0
  return { shipping, codFee } // shipping is paid at the counter; codFee is deducted from the COD remittance
}

export async function listOrders() { await delay(); return load() }

export async function createOrder(input, staff) {
  await delay(450)
  const w = Number(input.parcel.weight)
  if (!(w > 0) || w > MAX_WEIGHT_KG) throw new Error(`น้ำหนักต้องมากกว่า 0 และไม่เกิน ${MAX_WEIGHT_KG} กก.`)
  const list = load()
  let no = (input.trackingNo || '').trim().toUpperCase()
  if (no && list.some((o) => o.trackingNo === no)) throw new Error('เลขพัสดุนี้ถูกใช้แล้ว')
  if (!no) {
    const max = list.reduce((m, o) => Math.max(m, parseInt(o.trackingNo.slice(2, 11), 10) || 0), 260001000)
    no = `SD${max + 1}TH`
  }
  const f = calcFee({ weight: w, service: input.service, cod: input.cod })
  const order = {
    id: no, trackingNo: no, status: 'received', createdAt: now(),
    sender: input.sender, receiver: input.receiver, parcel: { ...input.parcel, weight: w },
    service: input.service, cod: input.cod || 0, fee: f.shipping, codFee: f.codFee,
    payment: { method: input.payment, amount: f.shipping },
    receivedBy: { id: staff.id, name: staff.name },
    events: [{ status: 'received', text: EVT.received, at: now() }],
  }
  list.unshift(order); save(list)
  return order
}

export async function voidOrder(id, reason) {
  await delay(250)
  const list = load(); const o = list.find((x) => x.id === id)
  if (!o) throw new Error('ไม่พบพัสดุ')
  if (o.status !== 'received') throw new Error('ยกเลิกได้เฉพาะพัสดุที่ยังไม่ส่งมอบขนส่ง')
  o.status = 'cancelled'; o.voidReason = reason || ''
  o.events.push({ status: 'cancelled', text: `ยกเลิกโดยร้าน${reason ? ': ' + reason : ''} (คืนเงินค่าบริการให้ลูกค้า)`, at: now() })
  save(list); return o
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
  if (i < 1 || i === STATUS_FLOW.length - 1) return o // pending-handover stays under staff control
  const next = STATUS_FLOW[i + 1]
  o.status = next; o.events.push({ status: next, text: EVT[next], at: now() })
  save(list); return o
}

export function summarize(list, day = isToday) {
  const mine = list.filter((o) => day(o.createdAt))
  const live = mine.filter((o) => o.status !== 'cancelled')
  const byPay = { cash: 0, promptpay: 0, transfer: 0 }
  const bySvc = {}
  let revenue = 0, weight = 0, codCount = 0
  for (const o of live) {
    byPay[o.payment.method] = (byPay[o.payment.method] || 0) + o.payment.amount
    revenue += o.payment.amount; weight += o.parcel.weight
    bySvc[o.service] = (bySvc[o.service] || 0) + 1
    if (o.cod) codCount++
  }
  return {
    count: live.length, voided: mine.length - live.length, revenue, weight, codCount, byPay, bySvc,
  }
}

export async function resetDemo() { ['senddee.ho.seq','senddee.staff.issues.v1','senddee.staff.closings.v1'].forEach((k) => localStorage.removeItem(k)); localStorage.removeItem(KEY); return load() }

// ---- issue reports & cash closing (mock, stored on device) ----
const IKEY = 'senddee.staff.issues.v1'
const CKEY = 'senddee.staff.closings.v1'
const readJson = (k) => { try { return JSON.parse(localStorage.getItem(k) || '[]') } catch { return [] } }
export async function listIssues() { await delay(100); return readJson(IKEY) }
export async function createIssue(issue, staff) {
  await delay(250)
  const list = readJson(IKEY)
  const it = { id: 'IS' + String(list.length + 1).padStart(4, '0'), at: now(), status: 'open', by: staff.name, ...issue }
  list.unshift(it); try { localStorage.setItem(IKEY, JSON.stringify(list)) } catch {}
  return it
}
export async function listClosings() { await delay(100); return readJson(CKEY) }
export async function closeDay({ expected, counted, note }, staff) {
  await delay(300)
  const list = readJson(CKEY)
  const c = { id: 'CL' + String(list.length + 1).padStart(4, '0'), at: now(), expected, counted, diff: counted - expected, note: note || '', by: staff.name }
  list.unshift(c); try { localStorage.setItem(CKEY, JSON.stringify(list)) } catch {}
  return c
}

// Fix a parcel before it is handed to the courier. Re-prices it and reports the cash difference.
export async function editOrder(id, patch) {
  await delay(300)
  const list = load(); const o = list.find((x) => x.id === id)
  if (!o) throw new Error('ไม่พบพัสดุ')
  if (o.status !== 'received') throw new Error('แก้ไขได้เฉพาะพัสดุที่ยังไม่ส่งมอบขนส่ง')
  const w = Number(patch.parcel.weight)
  if (!(w > 0) || w > MAX_WEIGHT_KG) throw new Error(`น้ำหนักต้องมากกว่า 0 และไม่เกิน ${MAX_WEIGHT_KG} กก.`)
  const f = calcFee({ weight: w, service: patch.service, cod: o.cod })
  const diff = f.shipping - o.payment.amount
  o.receiver = { ...patch.receiver }; o.parcel = { ...o.parcel, ...patch.parcel, weight: w }
  o.service = patch.service; o.fee = f.shipping; o.codFee = f.codFee; o.payment.amount = f.shipping
  o.events.push({ status: 'received', text: `แก้ไขข้อมูลพัสดุ${diff ? ` (ค่าบริการ${diff > 0 ? 'เก็บเพิ่ม' : 'คืนลูกค้า'} ฿${Math.abs(diff)})` : ''}`, at: now() })
  save(list); return { order: o, diff }
}
export async function resolveIssue(id) {
  await delay(150)
  const list = readJson(IKEY); const it = list.find((x) => x.id === id)
  if (it) { it.status = 'resolved'; it.resolvedAt = now(); try { localStorage.setItem(IKEY, JSON.stringify(list)) } catch {} }
  return list
}
