<script setup>
import { RouterView, useRoute } from 'vue-router'
import TabBar from './components/TabBar.vue'
import { toastMsg } from './utils/toast'
const route = useRoute()
</script>

<template>
  <RouterView />
  <TabBar v-if="route.meta.tab" />
  <div v-if="toastMsg" class="toast">{{ toastMsg }}</div>
</template>
