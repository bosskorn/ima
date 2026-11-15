export const baht = (n) => (Number(n) < 0 ? '-' : '') + '฿' + Math.abs(Number(n || 0)).toLocaleString('th-TH')
export const fmtDT = (iso) => new Date(iso).toLocaleString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
export const fmtT = (iso) => new Date(iso).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
export const isToday = (iso) => new Date(iso).toDateString() === new Date().toDateString()
export const hoursSince = (iso) => (Date.now() - new Date(iso).getTime()) / 3600e3
