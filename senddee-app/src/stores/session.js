import { defineStore } from 'pinia'

const KEY = 'senddee.session.v1'
const DEFAULT = {
  id: '', name: '', // staff (empty = logged out)
  branch: 'สาขาลาดพร้าว', branchPhone: '021234567',
  address: '99/9 ถ.ลาดพร้าว แขวงจรเข้บัว เขตลาดพร้าว', province: 'กรุงเทพมหานคร', postcode: '10230',
}
function load() { try { return { ...DEFAULT, ...JSON.parse(localStorage.getItem(KEY) || '{}') } } catch { return { ...DEFAULT } } }

export const useSession = defineStore('session', {
  state: () => load(),
  getters: { loggedIn: (s) => !!s.id },
  actions: {
    persist() { try { localStorage.setItem(KEY, JSON.stringify(this.$state)) } catch {} },
    // MOCK login: accepts any 4+ digit PIN. Replace with a real call to the Senddee backend.
    login(id, name) { this.id = id; this.name = name || `พนักงาน ${id}`; this.persist() },
    logout() { this.id = ''; this.name = ''; this.persist() },
    saveBranch(patch) { Object.assign(this, patch); this.persist() },
  },
})
