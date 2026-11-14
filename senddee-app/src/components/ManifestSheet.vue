<script setup>
import { ref, watch, nextTick, computed } from 'vue'
import JsBarcode from 'jsbarcode'
import BottomSheet from './BottomSheet.vue'
import BrandLogo from './BrandLogo.vue'
import { useSession } from '../stores/session'
import { fmtDT } from '../utils/format'

const props = defineProps({ open: Boolean, manifest: Object })
defineEmits(['close'])
const session = useSession()
const bc = ref(null)
const print = () => window.print()
const kg = computed(() => (props.manifest?.items || []).reduce((a, o) => a + o.parcel.weight, 0).toFixed(1))
watch(() => props.open, async (v) => {
  if (!v) return
  await nextTick()
  if (bc.value) JsBarcode(bc.value, props.manifest.id, { format: 'CODE128', height: 40, displayValue: false, margin: 0, width: 2 })
})
</script>

<template>
  <BottomSheet :open="open" title="ใบส่งมอบพัสดุ" @close="$emit('close')">
    <div v-if="manifest" class="mf printable">
      <div class="top"><BrandLogo variant="print" :size="24" text /><span>ใบส่งมอบ {{ manifest.id }}</span></div>
      <svg ref="bc" class="bc" />
      <div class="meta">{{ session.branch }} · {{ fmtDT(manifest.at) }}<br />ผู้ส่งมอบ: {{ session.name }} · รวม {{ manifest.items.length }} ชิ้น {{ kg }} กก.</div>
      <table>
        <tr v-for="(o, i) in manifest.items" :key="o.id"><td>{{ i + 1 }}</td><td>{{ o.trackingNo }}</td><td>{{ o.receiver.province }}</td><td class="r">{{ o.parcel.weight }} กก.</td></tr>
      </table>
      <div class="sign"><div>ผู้ส่งมอบ ........................</div><div>พนักงานขนส่ง ........................</div></div>
    </div>
    <template #footer><button class="btn ghost" @click="$emit('close')">ปิด</button><button class="btn grow" style="flex:1" @click="print">🖨️ พิมพ์ใบส่งมอบ</button></template>
  </BottomSheet>
</template>

<style scoped>
.mf { background: #fff; color: #000; border: 1px solid #000; padding: 12px; font-size: 13px; }
.top { display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 6px; } .top b { font-size: 18px; letter-spacing: 1px; font-weight: 500; }
.bc { width: 100%; height: 40px; margin-top: 8px; } .meta { margin: 8px 0; color: #333; }
table { width: 100%; border-collapse: collapse; } td { border-top: 1px dashed #999; padding: 5px 4px; } .r { text-align: right; }
.sign { display: flex; justify-content: space-between; gap: 10px; margin-top: 28px; font-size: 12px; }
</style>
