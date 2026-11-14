import { defineStore } from 'pinia'
import * as api from '../api'
import { isToday, hoursSince } from '../utils/format'
import { useSession } from './session'

export const useOrders = defineStore('orders', {
  state: () => ({ list: [], loaded: false }),
  getters: {
    waiting: (s) => s.list.filter((o) => o.status === 'received'),
    overdue() { return this.waiting.filter((o) => hoursSince(o.createdAt) > 24) },
    today: (s) => s.list.filter((o) => isToday(o.createdAt) && o.status !== 'cancelled'),
    summary: (s) => api.summarize(s.list),
    byId: (s) => (id) => s.list.find((o) => o.id === id),
  },
  actions: {
    async load(force = false) {
      if (this.loaded && !force) return
      this.list = await api.listOrders(); this.loaded = true
    },
    async create(input) {
      const o = await api.createOrder(input, useSession())
      this.list = await api.listOrders(); return o
    },
    async pay(txId, method) { const tx = await api.payTx(txId, method); this.list = await api.listOrders(); return tx },
    async edit(id, patch) { const r = await api.editOrder(id, patch); this.list = await api.listOrders(); return r },
    async void(id, reason) { await api.voidOrder(id, reason); this.list = await api.listOrders() },
    async handOver(ids) { const r = await api.handOver(ids); this.list = await api.listOrders(); return r },
    async advance(id) { await api.advanceOrder(id); this.list = await api.listOrders() },
    async reset() { this.list = await api.resetDemo() },
  },
})
