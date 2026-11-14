// Mock API layer — every function is async and returns plain objects, so swapping
// this file for real fetch() calls to the Senddee backend later won't touch the views.
import { SERVICES, STATUS_FLOW, MAX_WEIGHT_KG } from '../data/constants'

const KEY = 'senddee.orders.v1'
const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms))
const now = () => new Date().toISOString()
const ago = (h) => new Date(Date.now() - h * 3600e3).toISOString()

function seed() {
  const mk = (no, status, hours, over) => {
    const idx = STATUS_FLOW.indexOf(status)
    const labels = {
      pending: 'สร้างออเดอร์ รอเจ้าหน้าที่รับพัสดุ',
      picked_up: 'เจ้าหน้าที่รับพัสดุจากผู้ส่งแล้ว',
      in_transit: 'พัสดุอยู่ระหว่างขนส่ง ถึงศูนย์กระจายสินค้า',
      out_for_delivery: 'พนักงานกำลังนำส่งพัสดุให้ผู้รับ',
      delivered: 'ผู้รับได้รับพัสดุเรียบร้อยแล้ว',
    }
    const events = STATUS_FLOW.slice(0, idx + 1).map((s, i) => ({
      status: s, text: labels[s], at: ago(hours - i * (hours / (idx + 1))),
    }))
    return {
      id: no, trackingNo: no, status, createdAt: ago(hours), events, cod: 0, service: 'standard',
      parcel: { weight: 1.2, type: 'เสื้อผ้า', note: '' }, fee: 55, codFee: 0,
      sender: { name: 'ร้าน Senddee สาขาลาดพร้าว', phone: '0812345678', address: '99/9 ถ.ลาดพร้าว', province: 'กรุงเทพมหานคร', postcode: '10230' },
      receiver: { name: 'คุณสมชาย ใจดี', phone: '0898765432', address: '12 ม.3 ต.ในเมือง', province: 'ขอนแก่น', postcode: '40000' },
      ...over,
    }
  }
  return [
    mk('SD240001001TH', 'delivered', 70, { cod: 590, codFee: 18, fee: 55, receiver: { name: 'คุณมาลี สุขสันต์', phone: '0861112233', address: '45/1 ถ.มิตรภาพ', province: 'ขอนแก่น', postcode: '40000' } }),
    mk('SD240001002TH', 'out_for_delivery', 30, { service: 'express', fee: 77, receiver: { name: 'คุณวิชัย แสงทอง', phone: '0825556677', address: '8 ซ.นิมมานเหมินท์ 9', province: 'เชียงใหม่', postcode: '50200' } }),
    mk('SD240001003TH', 'in_transit', 20, { parcel: { weight: 4.5, type: 'ของใช้ทั่วไป', note: 'ระวังแตก' }, fee: 75, receiver: { name: 'คุณนภา รุ่งเรือง', phone: '0934445566', address: '221 ถ.เพชรเกษม', province: 'สงขลา', postcode: '90110' } }),
    mk('SD240001004TH', 'pending', 2, { cod: 1290, codFee: 39, fee: 55, parcel: { weight: 2.0, type: 'อิเล็กทรอนิกส์', note: '' } }),
  ]
}

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  const s = seed()
  save(s)
  return s
}
function save(list) {
  try { localStorage.setItem(KEY, JSON.stringify(list)) } catch {}
}

export function calcFee({ weight, service = 'standard', cod = 0 }) {
  const w = Number(weight) || 0
  let base
  if (w <= 1) base = 35
  else if (w <= 3) base = 55
  else if (w <= 5) base = 75
  else if (w <= 10) base = 120
  else if (w <= 20) base = 200
  else base = 200 + Math.ceil(w - 20) * 10
  const s = SERVICES.find((x) => x.id === service) || SERVICES[0]
  const shipping = Math.round(base * s.mult + s.extra)
  const codFee = cod > 0 ? Math.max(15, Math.round(cod * 0.03)) : 0
  return { shipping, codFee, total: shipping + codFee }
}

export async function listOrders() { await delay(); return load() }

export async function getOrder(id) {
  await delay(150)
  return load().find((o) => o.id === id || o.trackingNo === id) || null
}

export async function createOrder(input) {
  await delay(600)
  if (Number(input.parcel.weight) > MAX_WEIGHT_KG) throw new Error(`น้ำหนักเกิน ${MAX_WEIGHT_KG} กก.`)
  const list = load()
  const seq = String(1000 + list.length + 1).padStart(6, '0')
  const no = `SD${String(new Date().getFullYear()).slice(2)}${seq}TH`
  const f = calcFee({ weight: input.parcel.weight, service: input.service, cod: input.cod })
  const order = {
    id: no, trackingNo: no, status: 'pending', createdAt: now(),
    ...input, fee: f.shipping, codFee: f.codFee,
    events: [{ status: 'pending', text: 'สร้างออเดอร์ รอเจ้าหน้าที่รับพัสดุ', at: now() }],
  }
  list.unshift(order)
  save(list)
  return order
}

export async function cancelOrder(id) {
  await delay(300)
  const list = load()
  const o = list.find((x) => x.id === id)
  if (!o) throw new Error('ไม่พบออเดอร์')
  if (o.status !== 'pending') throw new Error('ยกเลิกได้เฉพาะออเดอร์ที่รอรับพัสดุ')
  o.status = 'cancelled'
  o.events.push({ status: 'cancelled', text: 'ยกเลิกออเดอร์โดยผู้ส่ง', at: now() })
  save(list)
  return o
}

// Demo-only helper: moves an order to the next stage so the timeline can be shown.
export async function advanceOrder(id) {
  await delay(200)
  const list = load()
  const o = list.find((x) => x.id === id)
  if (!o) throw new Error('ไม่พบออเดอร์')
  const i = STATUS_FLOW.indexOf(o.status)
  if (i < 0 || i === STATUS_FLOW.length - 1) return o
  const next = STATUS_FLOW[i + 1]
  const text = {
    picked_up: 'เจ้าหน้าที่รับพัสดุจากผู้ส่งแล้ว',
    in_transit: 'พัสดุอยู่ระหว่างขนส่ง ถึงศูนย์กระจายสินค้า',
    out_for_delivery: 'พนักงานกำลังนำส่งพัสดุให้ผู้รับ',
    delivered: 'ผู้รับได้รับพัสดุเรียบร้อยแล้ว',
  }[next]
  o.status = next
  o.events.push({ status: next, text, at: now() })
  save(list)
  return o
}

export async function resetDemo() { localStorage.removeItem(KEY); return load() }
