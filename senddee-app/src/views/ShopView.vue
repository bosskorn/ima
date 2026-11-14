<script setup>
import { onMounted, ref, computed } from 'vue'
import OrderCard from '../components/OrderCard.vue'
import BottomSheet from '../components/BottomSheet.vue'
import { useOrders } from '../stores/orders'
import { scanBarcode, canCameraScan } from '../utils/scanner'
import { toast } from '../utils/toast'

const orders = useOrders()
onMounted(() => orders.load())

const tab = ref('waiting')
const selected = ref(new Set())
const sheet = ref(false)
const checked = ref(new Set())
const scanInput = ref('')
const busy = ref(false)

const waiting = computed(() => orders.waiting)
const done = computed(() => orders.list.filter((o) => o.status === 'handed_over'))
const chosen = computed(() => waiting.value.filter((o) => selected.value.has(o.id)))
const allSel = computed(() => waiting.value.length > 0 && chosen.value.length === waiting.value.length)
const totalKg = computed(() => chosen.value.reduce((a, o) => a + o.parcel.weight, 0).toFixed(1))

function toggle(id) { const s = new Set(selected.value); s.has(id) ? s.delete(id) : s.add(id); selected.value = s }
function toggleAll() { selected.value = allSel.value ? new Set() : new Set(waiting.value.map((o) => o.id)) }

function openSheet() { checked.value = new Set(); scanInput.value = ''; sheet.value = true }
function tick(no) {
  const v = String(no).trim().toUpperCase(); if (!v) return
  const hit = chosen.value.find((o) => o.trackingNo === v)
  if (!hit) return toast(`${v} ไม่อยู่ในรายการที่เลือก`)
  checked.value = new Set(checked.value).add(hit.id); scanInput.value = ''
}
async function cam() {
  try { const v = await scanBarcode(); if (v) tick(v); else if (!canCameraScan()) toast('สแกนกล้องใช้ได้ในแอปมือถือ — ใช้เครื่องสแกนหรือแตะติ๊กเอง') } catch (e) { toast(e.message) }
}
async function confirm() {
  const missing = chosen.value.length - checked.value.size
  if (missing > 0 && !window.confirm(`ยังไม่ได้สแกนตรวจ ${missing} ชิ้น ยืนยันส่งมอบทั้งหมดเลยไหม?`)) return
  busy.value = true
  const r = await orders.handOver(chosen.value.map((o) => o.id))
  busy.value = false; sheet.value = false; selected.value = new Set()
  toast(`ส่งมอบ ${r.count} ชิ้น · ใบส่งมอบ ${r.handoverId}`, 3500)
}
</script>

<template>
  <div class="page">
    <header class="hdr"><h1>พัสดุในร้าน</h1><p>{{ waiting.length }} ชิ้นรอส่งมอบให้ขนส่ง</p></header>
    <div class="chip-row" style="margin-bottom:6px">
      <button class="chip" :class="{ on: tab === 'waiting' }" @click="tab = 'waiting'">รอส่งมอบ ({{ waiting.length }})</button>
      <button class="chip" :class="{ on: tab === 'done' }" @click="tab = 'done'">ส่งมอบแล้ว ({{ done.length }})</button>
    </div>

    <template v-if="tab === 'waiting'">
      <div v-if="waiting.length" class="row between" style="margin-top:10px">
        <button class="btn soft sm" @click="toggleAll">{{ allSel ? 'ยกเลิกเลือกทั้งหมด' : 'เลือกทั้งหมด' }}</button>
        <span class="muted">เลือก {{ chosen.length }} / {{ waiting.length }}</span>
      </div>
      <OrderCard v-for="o in waiting" :key="o.id" :order="o" selectable :selected="selected.has(o.id)" @toggle="toggle(o.id)" />
      <p v-if="!waiting.length" class="empty">🎉 ไม่มีพัสดุค้างในร้าน</p>
      <div v-if="chosen.length" class="stickybar">
        <div class="total"><small class="muted">{{ totalKg }} กก.</small><b>{{ chosen.length }} ชิ้น</b></div>
        <button class="btn accent" @click="openSheet">ส่งมอบให้ขนส่ง</button>
      </div>
    </template>
    <template v-else>
      <OrderCard v-for="o in done" :key="o.id" :order="o" />
      <p v-if="!done.length" class="empty">ยังไม่มีรายการ</p>
    </template>

    <BottomSheet :open="sheet" title="ตรวจนับก่อนส่งมอบ" @close="sheet = false">
      <p class="muted" style="margin-bottom:10px">สแกนบาร์โค้ดใบปะหน้าทีละชิ้น หรือแตะติ๊กเอง เพื่อให้ตรงกับที่ขนส่งรับไป</p>
      <div class="row" style="margin-bottom:10px">
        <input v-model="scanInput" class="in" placeholder="สแกน/พิมพ์เลขพัสดุ" autocapitalize="characters" @keyup.enter="tick(scanInput)" />
        <button class="icon-btn" @click="cam" aria-label="สแกน">📷</button>
      </div>
      <div class="bar"><i :style="{ width: (chosen.length ? (checked.size / chosen.length) * 100 : 0) + '%' }" /></div>
      <div class="muted" style="margin:4px 0 8px">ตรวจแล้ว {{ checked.size }} / {{ chosen.length }}</div>
      <label v-for="o in chosen" :key="o.id" class="ck">
        <input type="checkbox" :checked="checked.has(o.id)" @change="checked = new Set(checked.has(o.id) ? [...checked].filter((x) => x !== o.id) : [...checked, o.id])" />
        <span class="grow"><b>{{ o.trackingNo }}</b><small class="muted"> {{ o.receiver.province }} · {{ o.parcel.weight }} กก.</small></span>
      </label>
      <template #footer>
        <button class="btn ghost" @click="sheet = false">ยกเลิก</button>
        <button class="btn accent grow" :disabled="busy" @click="confirm">{{ busy ? 'กำลังบันทึก…' : `ยืนยันส่งมอบ ${chosen.length} ชิ้น` }}</button>
      </template>
    </BottomSheet>
  </div>
</template>

<style scoped>
.hdr { background: var(--primary); color: #fff; padding: calc(14px + var(--safe-top)) 16px 18px; margin: 0 -16px 14px; border-radius: 0 0 22px 22px; }
h1 { font-size: 19px; } .hdr p { font-size: 13px; opacity: .85; margin-top: 2px; }
.empty { text-align: center; color: var(--muted); margin-top: 50px; } .grow { flex: 1; }
.in { flex: 1; padding: 12px 14px; border: 1.5px solid var(--line); border-radius: 12px; min-width: 0; }
.bar { height: 6px; background: var(--line); border-radius: 4px; overflow: hidden; } .bar i { display: block; height: 100%; background: var(--primary); transition: width .2s; }
.ck { display: flex; gap: 12px; align-items: center; padding: 11px 0; border-bottom: 1px solid var(--line); } .ck input { width: 22px; height: 22px; accent-color: var(--primary); }
</style>
