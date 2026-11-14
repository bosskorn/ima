import { defineStore } from 'pinia'

const KEY = 'senddee.profile.v1'
const DEFAULT = {
  branch: 'สาขาลาดพร้าว',
  name: 'ร้าน Senddee สาขาลาดพร้าว',
  phone: '0812345678',
  address: '99/9 ถ.ลาดพร้าว แขวงจรเข้บัว เขตลาดพร้าว',
  province: 'กรุงเทพมหานคร',
  postcode: '10230',
}
function load() {
  try { return { ...DEFAULT, ...JSON.parse(localStorage.getItem(KEY) || '{}') } } catch { return { ...DEFAULT } }
}

export const useProfile = defineStore('profile', {
  state: () => ({ ...load() }),
  actions: {
    save(patch) {
      Object.assign(this, patch)
      try { localStorage.setItem(KEY, JSON.stringify(this.$state)) } catch {}
    },
  },
})
