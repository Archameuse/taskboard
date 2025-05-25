<template>
  <div class="flex flex-col gap-2">
    <label v-if="labelId" class="text-gray1" :for="labelId">{{ labelName }}</label>
    <h3 v-else class="text-gray1 cursor-default">{{ labelName }}</h3>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
defineProps({
  labelName: {
    type: String,
    required: true
  },
  labelId: String
})
</script>
