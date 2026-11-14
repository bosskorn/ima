import { defineStore } from 'pinia'

const KEY = 'senddee.receive.draft'
const blank = () => ({ pickup: 'shop', sender: { phone: '', name: '', address: '', bank: null, confirmed: false }, txId: '', orderIds: [] })
function load() { try { return { ...blank(), ...JSON.parse(localStorage.getItem(KEY) || '{}') } } catch { return blank() } }

// The customer visit currently being served: one sender, many parcels, one receipt.
export const useReceive = defineStore('receive', {
  state: () => load(),
  actions: {
    persist() { try { localStorage.setItem(KEY, JSON.stringify(this.$state)) } catch {} },
    reset() { Object.assign(this, blank()); this.persist() },
    addOrder(order) { this.txId = order.txId; this.orderIds.push(order.id); this.persist() },
  },
})
