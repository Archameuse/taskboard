<template>
  <div class="flex-grow overflow-hidden flex flex-col h-full justify-center select-none text-left">
    <h2 class="font-semibold text-xl break-words overflow-hidden h-fit">{{ name }}</h2>
    <p v-if="description" class="font-light overflow-hidden break-words">{{ description }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps({
  name: {
    type: String,
    required: true
  },
  description: String
})
</script>
