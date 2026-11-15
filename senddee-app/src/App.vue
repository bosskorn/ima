<script setup>
import { ref } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import TabBar from './components/TabBar.vue'
import { toastMsg } from './utils/toast'

const route = useRoute(); const router = useRouter()
// Native-style page transitions: push = slide in from the right, back = slide out to the right,
// switching between bottom-bar tabs (or replacing a page) = quick cross-fade.
const name = ref('fade')
let lastPos = window.history.state?.position ?? 0
router.afterEach((to, from) => {
  toastMsg.value = '' // a message belongs to the screen it was shown on
  const pos = window.history.state?.position ?? lastPos
  const bothTabs = to.meta.tab && from.meta.tab
  if (!from.matched.length || bothTabs || pos === lastPos) name.value = 'fade'
  else name.value = pos > lastPos ? 'slide-fwd' : 'slide-back'
  lastPos = pos
})
</script>

<template>
  <RouterView v-slot="{ Component, route: r }">
    <Transition :name="name">
      <component :is="Component" :key="r.path" />
    </Transition>
  </RouterView>
  <TabBar v-if="route.meta.tab" />
  <div v-if="toastMsg" class="toast">{{ toastMsg }}</div>
</template>
