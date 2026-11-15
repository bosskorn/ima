<script setup>
import { STATUS } from '../data/constants'
defineProps({ status: String, short: Boolean })
</script>
<template>
  <span class="badge" :class="STATUS[status]?.color">{{ short ? STATUS[status]?.short : STATUS[status]?.label || status }}</span>
</template>
