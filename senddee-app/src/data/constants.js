export const STATUS = {
  received:         { label: 'รับฝากแล้ว · รอส่งมอบ', short: 'รอส่งมอบ',   color: 'amber' },
  handed_over:      { label: 'ส่งมอบขนส่งแล้ว',       short: 'ส่งมอบแล้ว', color: 'blue' },
  in_transit:       { label: 'กำลังขนส่ง',            short: 'กำลังขนส่ง', color: 'blue' },
  out_for_delivery: { label: 'กำลังนำส่ง',            short: 'กำลังนำส่ง', color: 'violet' },
  delivered:        { label: 'จัดส่งสำเร็จ',          short: 'สำเร็จ',     color: 'green' },
  cancelled:        { label: 'ยกเลิก (Void)',         short: 'ยกเลิก',     color: 'red' },
}
export const STATUS_FLOW = ['received', 'handed_over', 'in_transit', 'out_for_delivery', 'delivered']

export const SERVICES = [
  { id: 'standard', name: 'Standard', eta: '2–3 วัน',  mult: 1,   extra: 0 },
  { id: 'express',  name: 'Express',  eta: '1 วัน',    mult: 1.4, extra: 0 },
  { id: 'sameday',  name: 'Same Day', eta: 'ภายในวัน', mult: 1.4, extra: 80 },
]
export const PARCEL_TYPES = ['เสื้อผ้า', 'เอกสาร', 'เครื่องสำอาง', 'อาหารแห้ง', 'อิเล็กทรอนิกส์', 'ของใช้ทั่วไป', 'อื่น ๆ']
export const PAYMENTS = [
  { id: 'cash', label: 'เงินสด' },
  { id: 'promptpay', label: 'พร้อมเพย์' },
  { id: 'transfer', label: 'โอนเงิน' },
]
export const MAX_WEIGHT_KG = 30

export const APP_VERSION = __APP_VERSION__
export const APP_BUILD = __APP_BUILD__
// PLACEHOLDERS — replace with the real franchise-network values.
export const SUPPORT_PHONE = '02-000-0000'
export const BRANCHES = { LP001: 'สาขาลาดพร้าว', BN002: 'สาขาบางนา' }
export const DEMO_STAFF = { S001: 'น้องฟ้า', S002: 'พี่ต้น' }
export const DEMO_PIN = '1234'
