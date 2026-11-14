import { ref } from 'vue'
// Static mock announcements from head office. Read-state is kept per device.
export const NEWS = [
  { id: 'n1', date: '2026-11-13', title: 'ปรับเวลารับพัสดุรอบสุดท้าย', body: 'ตั้งแต่วันที่ 15 พ.ย. รถขนส่งเข้ารับพัสดุรอบสุดท้ายเวลา 17:00 น. พัสดุที่รับหลังเวลานี้จะส่งมอบในรอบเช้าวันถัดไป' },
  { id: 'n2', date: '2026-11-12', title: 'น้ำหนักสูงสุดต่อชิ้น 30 กก.', body: 'พัสดุเกิน 30 กก. หรือด้านยาวเกิน 100 ซม. ให้แนะนำลูกค้าใช้บริการพัสดุชิ้นใหญ่ ไม่รับที่เคาน์เตอร์' },
  { id: 'n3', date: '2026-11-10', title: 'ตรวจสินค้าต้องห้ามก่อนรับฝาก', body: 'ห้ามรับของเหลวไม่มีบรรจุภัณฑ์ที่เหมาะสม แบตเตอรี่ลิเธียมเปล่า และของมีคม หากไม่แน่ใจให้แจ้งปัญหาในแอป' },
]
const KEY = 'senddee.news.read'
const read = ref(new Set())
try { read.value = new Set(JSON.parse(localStorage.getItem(KEY) || '[]')) } catch {}
export const isRead = (id) => read.value.has(id)
export function markRead(id) {
  if (read.value.has(id)) return
  read.value = new Set(read.value).add(id)
  try { localStorage.setItem(KEY, JSON.stringify([...read.value])) } catch {}
}
export const unreadCount = () => NEWS.filter((n) => !read.value.has(n.id)).length
