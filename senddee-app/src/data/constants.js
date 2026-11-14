export const STATUS = {
  pending:          { label: 'รอรับพัสดุ',      color: 'amber' },
  picked_up:        { label: 'รับพัสดุแล้ว',    color: 'blue' },
  in_transit:       { label: 'กำลังขนส่ง',      color: 'blue' },
  out_for_delivery: { label: 'กำลังนำส่ง',      color: 'violet' },
  delivered:        { label: 'จัดส่งสำเร็จ',    color: 'green' },
  cancelled:        { label: 'ยกเลิกแล้ว',      color: 'red' },
}
export const STATUS_FLOW = ['pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered']

export const SERVICES = [
  { id: 'standard', name: 'Standard',  desc: 'ส่งภายใน 2–3 วันทำการ', eta: '2–3 วัน', mult: 1,   extra: 0 },
  { id: 'express',  name: 'Express',   desc: 'ส่งภายใน 1 วันทำการ',   eta: '1 วัน',   mult: 1.4, extra: 0 },
  { id: 'sameday',  name: 'Same Day',  desc: 'ถึงภายในวันนี้ (กทม. และปริมณฑล)', eta: 'ภายในวัน', mult: 1.4, extra: 80 },
]

export const PARCEL_TYPES = ['เอกสาร', 'เสื้อผ้า', 'เครื่องสำอาง', 'อาหารแห้ง', 'อิเล็กทรอนิกส์', 'ของใช้ทั่วไป', 'อื่น ๆ']
export const MAX_WEIGHT_KG = 30
