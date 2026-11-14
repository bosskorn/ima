<script setup>
import { RouterView, useRoute } from 'vue-router'
import TabBar from './components/TabBar.vue'
const route = useRoute()
</script>

<template>
  <RouterView v-slot="{ Component }">
    <component :is="Component" />
  </RouterView>
  <TabBar v-if="route.meta.tab" />
</template>
