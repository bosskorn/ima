export const baht = (n) => {
  const v = Math.abs(Number(n || 0)), frac = Math.abs(v - Math.round(v)) > 0.001
  return (Number(n) < 0 ? '-' : '') + '฿' + v.toLocaleString('th-TH', frac ? { minimumFractionDigits: 2, maximumFractionDigits: 2 } : {})
}
export const baht2 = (n) => (Number(n) < 0 ? '-' : '') + '฿' + Math.abs(Number(n || 0)).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
export const fmtDT = (iso) => new Date(iso).toLocaleString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
export const fmtT = (iso) => new Date(iso).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
export const isToday = (iso) => new Date(iso).toDateString() === new Date().toDateString()
export const hoursSince = (iso) => (Date.now() - new Date(iso).getTime()) / 3600e3
export const maskPhone = (p) => (/^\d{10}$/.test(p || '') ? `${p.slice(0, 3)}-xxx-${p.slice(6)}` : p || '')
export const fmtDate = (iso) => new Date(iso).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })
