import { defineStore } from 'pinia'

const KEY = 'senddee.session.v1'
const DEFAULT = {
  id: '', name: '', role: 'พนักงานแฟรนไชส์', branchCode: '', loginAt: '', // staff (empty id = logged out)
  branch: 'สาขาลาดพร้าว', branchPhone: '021234567',
  printerName: '', paper: '100', autoPrint: true, defaultCarrier: 'flash',
  address: '99/9 ถ.ลาดพร้าว แขวงจรเข้บัว เขตลาดพร้าว', province: 'กรุงเทพมหานคร', postcode: '10230',
}
function load() { try { return { ...DEFAULT, ...JSON.parse(localStorage.getItem(KEY) || '{}') } } catch { return { ...DEFAULT } } }

export const useSession = defineStore('session', {
  state: () => load(),
  getters: { loggedIn: (s) => !!s.id },
  actions: {
    persist() { try { localStorage.setItem(KEY, JSON.stringify(this.$state)) } catch {} },
    // MOCK login (see LoginView). Replace with a real call to the Senddee backend.
    login({ id, name, branchCode, branch }) { Object.assign(this, { id, name, branchCode, branch, loginAt: new Date().toISOString() }); this.persist() },
    logout() { this.id = ''; this.name = ''; this.loginAt = ''; this.persist() },
    saveBranch(patch) { Object.assign(this, patch); this.persist() },
  },
})
