<script setup>
import { computed } from 'vue'
// Flat two/three-colour icons drawn for Senddee (48x48 grid).
const O = '#f97316', OL = '#fdba74', R = '#ef4444', B = '#3b82f6', BL = '#bfdbfe', G = '#22c55e', T = '#0f766e', TL = '#99f6e4', Y = '#f59e0b', GR = '#64748b', W = '#fff'
const ICONS = {
  receive: `<rect x="7" y="17" width="30" height="24" rx="3" fill="${O}"/><path d="M7 17l15-8 15 8z" fill="${OL}"/><rect x="19" y="17" width="6" height="24" fill="${W}" opacity=".55"/><circle cx="37" cy="35" r="9" fill="${G}"/><path d="M37 30v10M32 35h10" stroke="${W}" stroke-width="3" stroke-linecap="round"/>`,
  shop: `<rect x="5" y="8" width="38" height="4" rx="2" fill="${GR}"/><rect x="5" y="26" width="38" height="4" rx="2" fill="${GR}"/><rect x="9" y="12" width="12" height="14" rx="2" fill="${O}"/><rect x="25" y="16" width="12" height="10" rx="2" fill="${OL}"/><rect x="9" y="30" width="16" height="12" rx="2" fill="${Y}"/><rect x="29" y="32" width="10" height="10" rx="2" fill="${O}"/>`,
  handover: `<rect x="4" y="14" width="26" height="20" rx="3" fill="${B}"/><path d="M30 20h9l6 7v7H30z" fill="${BL}"/><circle cx="13" cy="36" r="5" fill="${GR}"/><circle cx="37" cy="36" r="5" fill="${GR}"/><circle cx="13" cy="36" r="2" fill="${W}"/><circle cx="37" cy="36" r="2" fill="${W}"/><path d="M11 24h12m-4-4l4 4-4 4" stroke="${W}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,
  search: `<rect x="6" y="10" width="30" height="28" rx="3" fill="${OL}"/><rect x="6" y="10" width="30" height="8" rx="3" fill="${O}"/><circle cx="26" cy="28" r="9" fill="${W}" stroke="${T}" stroke-width="4"/><path d="M33 35l9 9" stroke="${T}" stroke-width="5" stroke-linecap="round"/>`,
  quote: `<rect x="9" y="5" width="30" height="38" rx="4" fill="${T}"/><rect x="14" y="10" width="20" height="9" rx="2" fill="${TL}"/><g fill="${W}"><circle cx="17" cy="26" r="2.5"/><circle cx="24" cy="26" r="2.5"/><circle cx="31" cy="26" r="2.5"/><circle cx="17" cy="34" r="2.5"/><circle cx="24" cy="34" r="2.5"/></g><rect x="28" y="31" width="6" height="8" rx="2" fill="${O}"/>`,
  label: `<rect x="12" y="6" width="24" height="12" rx="2" fill="${BL}"/><rect x="5" y="16" width="38" height="18" rx="4" fill="${B}"/><rect x="12" y="28" width="24" height="14" rx="2" fill="${W}" stroke="${GR}" stroke-width="2"/><path d="M16 34h16M16 38h10" stroke="${GR}" stroke-width="2" stroke-linecap="round"/><circle cx="37" cy="22" r="2" fill="${G}"/>`,
  transit: `<rect x="4" y="12" width="26" height="22" rx="3" fill="${G}"/><path d="M30 19h9l6 8v7H30z" fill="#bbf7d0"/><circle cx="14" cy="36" r="5" fill="${GR}"/><circle cx="37" cy="36" r="5" fill="${GR}"/><circle cx="14" cy="36" r="2" fill="${W}"/><circle cx="37" cy="36" r="2" fill="${W}"/>`,
  void: `<circle cx="24" cy="24" r="18" fill="none" stroke="${R}" stroke-width="6"/><path d="M12 36L36 12" stroke="${R}" stroke-width="6" stroke-linecap="round"/>`,
  overdue: `<circle cx="24" cy="26" r="17" fill="${O}"/><circle cx="24" cy="26" r="13" fill="${W}"/><path d="M24 18v8l6 4" stroke="${O}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,
  issue: `<path d="M24 5L45 41H3z" fill="${R}" stroke="${R}" stroke-width="4" stroke-linejoin="round"/><path d="M24 17v13" stroke="${W}" stroke-width="4" stroke-linecap="round"/><circle cx="24" cy="35" r="2.4" fill="${W}"/>`,
  summary: `<rect x="5" y="5" width="38" height="38" rx="5" fill="${T}"/><rect x="11" y="26" width="6" height="11" rx="1.5" fill="${TL}"/><rect x="21" y="18" width="6" height="19" rx="1.5" fill="${W}"/><rect x="31" y="11" width="6" height="26" rx="1.5" fill="${O}"/>`,
  closing: `<rect x="4" y="12" width="40" height="26" rx="5" fill="${G}"/><rect x="4" y="12" width="40" height="8" fill="#16a34a"/><circle cx="24" cy="28" r="7" fill="#bbf7d0"/><text x="24" y="32" text-anchor="middle" font-size="10" font-weight="700" fill="#15803d">฿</text>`,
  settings: `<circle cx="24" cy="24" r="17" fill="${GR}"/><g fill="${GR}"><rect x="21" y="2" width="6" height="8" rx="2"/><rect x="21" y="38" width="6" height="8" rx="2"/><rect x="2" y="21" width="8" height="6" rx="2"/><rect x="38" y="21" width="8" height="6" rx="2"/></g><circle cx="24" cy="24" r="7" fill="${W}"/>`,
  news: `<path d="M8 18h8l18-9v30l-18-9H8z" fill="${Y}"/><rect x="8" y="18" width="8" height="12" fill="${O}"/><path d="M14 30l3 12h6l-3-12z" fill="${O}"/><path d="M39 18c3 3 3 9 0 12" stroke="${O}" stroke-width="3" stroke-linecap="round" fill="none"/>`,
  voidnow: `<rect x="8" y="14" width="28" height="26" rx="3" fill="${OL}"/><rect x="8" y="14" width="28" height="7" rx="3" fill="${O}"/><circle cx="34" cy="32" r="11" fill="${R}"/><path d="M29 27l10 10M39 27L29 37" stroke="${W}" stroke-width="3.4" stroke-linecap="round"/>`,
  home: `<path d="M5 22L24 6l19 16v20H5z" fill="${T}"/><rect x="19" y="28" width="10" height="14" rx="2" fill="${W}"/>`,
  user: `<circle cx="24" cy="16" r="9" fill="currentColor"/><path d="M6 42c0-10 8-15 18-15s18 5 18 15z" fill="currentColor"/>`,
}
const props = defineProps({ name: String, size: { type: Number, default: 48 } })
const html = computed(() => ICONS[props.name] || '')
</script>
<template><svg :width="size" :height="size" viewBox="0 0 48 48" aria-hidden="true" v-html="html" /></template>
