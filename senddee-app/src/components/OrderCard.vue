<script setup>
import { computed } from 'vue'
import StatusBadge from './StatusBadge.vue'
import { SERVICES } from '../data/constants'
import { baht, fmtDT, hoursSince } from '../utils/format'

const props = defineProps({ order: Object, selectable: Boolean, selected: Boolean })
const emit = defineEmits(['toggle'])
const svc = computed(() => SERVICES.find((s) => s.id === props.order.service)?.name)
const late = computed(() => props.order.status === 'received' && hoursSince(props.order.createdAt) > 24)
</script>

<template>
  <div class="oc card" :class="{ sel: selected, late }" @click="selectable && emit('toggle')">
    <input v-if="selectable" type="checkbox" class="chk" :checked="selected" @click.stop="emit('toggle')" />
    <component :is="selectable ? 'div' : 'RouterLink'" :to="`/orders/${order.id}`" class="main">
      <div class="row between">
        <b class="no">{{ order.trackingNo }}</b>
        <StatusBadge v-if="!selectable" :status="order.status" />
        <span v-else-if="late" class="badge red">ค้างเกิน 24 ชม.</span>
      </div>
      <div class="bold name">{{ order.receiver.name }}</div>
      <div class="muted">{{ order.receiver.province }} · {{ order.parcel.weight }} กก. · {{ svc }}</div>
      <div class="row between foot">
        <span class="muted">{{ fmtDT(order.createdAt) }}</span>
        <span class="row small">
          <span v-if="order.cod" class="cod">COD {{ baht(order.cod) }}</span>
          <b>{{ baht(order.payment.amount) }}</b>
        </span>
      </div>
    </component>
    <RouterLink v-if="selectable" :to="`/orders/${order.id}`" class="detail" @click.stop>ดู ›</RouterLink>
  </div>
</template>

<style scoped>
.oc { display: flex; gap: 12px; align-items: flex-start; margin-top: 10px; border: 2px solid transparent; }
.oc.sel { border-color: var(--primary); background: #f0fdfa; }
.oc.late { border-left: 5px solid var(--danger); }
.chk { width: 22px; height: 22px; margin-top: 2px; accent-color: var(--primary); flex: none; }
.main { flex: 1; min-width: 0; text-decoration: none; color: inherit; display: block; }
.no { font-size: 14px; letter-spacing: .3px; } .name { margin-top: 6px; }
.foot { margin-top: 6px; } .small { gap: 8px; }
.cod { color: var(--accent); font-weight: 500; font-size: 12px; }
.detail { color: var(--primary); font-size: 13px; font-weight: 500; text-decoration: none; align-self: center; }
</style>
