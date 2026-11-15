export const STATUS = {
  received:         { label: 'รับฝากแล้ว · รอส่งมอบ', short: 'รอส่งมอบ',   color: 'amber' },
  handed_over:      { label: 'ส่งมอบขนส่งแล้ว',       short: 'ส่งมอบแล้ว', color: 'blue' },
  in_transit:       { label: 'กำลังขนส่ง',            short: 'กำลังขนส่ง', color: 'blue' },
  out_for_delivery: { label: 'กำลังนำส่ง',            short: 'กำลังนำส่ง', color: 'violet' },
  delivered:        { label: 'จัดส่งสำเร็จ',          short: 'สำเร็จ',     color: 'green' },
  cancelled:        { label: 'ยกเลิก (Void)',         short: 'ยกเลิก',     color: 'red' },
}
export const STATUS_FLOW = ['received', 'handed_over', 'in_transit', 'out_for_delivery', 'delivered']

export const MAX_WEIGHT_KG = 30

export const APP_VERSION = __APP_VERSION__
export const APP_BUILD = __APP_BUILD__
// PLACEHOLDERS — replace with the real franchise-network values.
export const SUPPORT_PHONE = '02-000-0000'
export const BRANCHES = { LP001: 'สาขาลาดพร้าว', BN002: 'สาขาบางนา' }
export const DEMO_STAFF = { S001: 'น้องฟ้า', S002: 'พี่ต้น' }
export const DEMO_PIN = '1234'

// ---- carriers (franchise currently has Flash Express and SPX Express) ----
// `start` prices are the real starting rates given by the business (Flash ฿28, SPX ฿25).
// The heavier tiers are PLACEHOLDERS — replace with the franchise rate card.
import flashLogo from '../assets/carriers/flash.svg'
import spxLogo from '../assets/carriers/spx.png'
export const CARRIERS = [
  { id: 'flash', name: 'Flash Express', short: 'Flash', logo: flashLogo, start: 28, tiers: [[1, 28], [2, 33], [3, 38], [5, 50], [10, 75], [15, 100], [20, 130], [25, 155], [30, 180]] },
  { id: 'spx', name: 'SPX Express', short: 'SPX', logo: spxLogo, start: 25, tiers: [[1, 25], [2, 29], [3, 34], [5, 45], [10, 70], [15, 95], [20, 125], [25, 150], [30, 170]] },
]
export const COD_RATE = 0.03 // 3% of the COD amount, charged to the sender together with shipping

export const PRODUCT_TYPES = [
  'เสื้อผ้า / แฟชั่น', 'รองเท้า', 'กระเป๋า', 'เครื่องประดับ / นาฬิกา', 'เครื่องสำอาง / ความงาม', 'สกินแคร์ / ของใช้ส่วนตัว',
  'อาหารแห้ง / ขนม', 'เครื่องดื่ม', 'อาหารเสริม / วิตามิน', 'อุปกรณ์การแพทย์ / ยา',
  'มือถือ / แท็บเล็ต', 'อุปกรณ์เสริมมือถือ', 'คอมพิวเตอร์ / ไอที', 'เครื่องใช้ไฟฟ้า', 'กล้อง / อุปกรณ์ถ่ายภาพ',
  'ของใช้ในบ้าน', 'เฟอร์นิเจอร์ / ของตกแต่ง', 'เครื่องครัว / ภาชนะ', 'ของแตกง่าย (แก้ว / เซรามิก)',
  'ของเล่น / เกม', 'แม่และเด็ก', 'หนังสือ / เครื่องเขียน', 'เอกสาร',
  'กีฬา / ฟิตเนส', 'แคมป์ปิ้ง / เอาต์ดอร์', 'อะไหล่ยานยนต์', 'เครื่องมือช่าง / อุปกรณ์ก่อสร้าง',
  'ต้นไม้ / ของแต่งสวน', 'สัตว์เลี้ยง / อุปกรณ์สัตว์เลี้ยง', 'ของสะสม / ของที่ระลึก', 'ของขวัญ', 'อื่น ๆ',
]

export const BANKS = ['กสิกรไทย', 'ไทยพาณิชย์', 'กรุงเทพ', 'กรุงไทย', 'กรุงศรีอยุธยา', 'ทหารไทยธนชาต (ttb)', 'ออมสิน', 'ธ.ก.ส.', 'ซีไอเอ็มบี ไทย', 'ยูโอบี', 'เกียรตินาคินภัทร', 'ทิสโก้', 'แลนด์ แอนด์ เฮ้าส์', 'อาคารสงเคราะห์ (ธอส.)']

// PLACEHOLDER — share of each charge that the franchise keeps after paying the carrier. Used only for the
// "estimated profit" figure in Settings. Replace with real carrier cost per tier when available.
export const PROFIT_MARGIN = 0.15
