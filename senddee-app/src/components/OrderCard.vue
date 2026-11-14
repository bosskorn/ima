<script setup>
import StatusBadge from './StatusBadge.vue'
defineProps({ order: Object })
const fmt = (iso) => new Date(iso).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
</script>

<template>
  <RouterLink :to="`/orders/${order.id}`" class="oc card">
    <div class="row between">
      <span class="bold no">{{ order.trackingNo }}</span>
      <StatusBadge :status="order.status" />
    </div>
    <div class="row mid">
      <div class="grow">
        <div class="bold">{{ order.receiver.name }}</div>
        <div class="muted">{{ order.receiver.province }} · {{ order.parcel.weight }} กก.</div>
      </div>
      <div class="right">
        <div v-if="order.cod" class="cod">COD ฿{{ order.cod.toLocaleString() }}</div>
        <div class="muted">{{ fmt(order.createdAt) }}</div>
      </div>
    </div>
  </RouterLink>
</template>

<style scoped>
.oc { display: block; text-decoration: none; color: inherit; margin-top: 10px; }
.no { font-size: 14px; letter-spacing: .3px; }
.mid { margin-top: 10px; align-items: flex-end; }
.grow { flex: 1; min-width: 0; }
.cod { color: var(--accent); font-weight: 700; font-size: 13px; }
</style>
