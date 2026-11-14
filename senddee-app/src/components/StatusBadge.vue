<script setup>
import { STATUS } from '../data/constants'
defineProps({ status: String })
</script>
<template>
  <span class="badge" :class="STATUS[status]?.color">{{ STATUS[status]?.label || status }}</span>
</template>
