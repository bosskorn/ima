import { defineStore } from 'pinia'
import * as api from '../api'

export const useOrders = defineStore('orders', {
  state: () => ({ list: [], loaded: false, loading: false }),
  getters: {
    active: (s) => s.list.filter((o) => !['delivered', 'cancelled'].includes(o.status)),
    delivered: (s) => s.list.filter((o) => o.status === 'delivered'),
    codPending: (s) => s.list.filter((o) => o.cod > 0 && o.status !== 'cancelled' && o.status !== 'delivered')
      .reduce((a, o) => a + o.cod, 0),
  },
  actions: {
    async load(force = false) {
      if (this.loaded && !force) return
      this.loading = true
      this.list = await api.listOrders()
      this.loaded = true
      this.loading = false
    },
    async create(input) {
      const o = await api.createOrder(input)
      this.list = await api.listOrders()
      return o
    },
    async cancel(id) { await api.cancelOrder(id); this.list = await api.listOrders() },
    async advance(id) { await api.advanceOrder(id); this.list = await api.listOrders() },
    async reset() { this.list = await api.resetDemo() },
  },
})
