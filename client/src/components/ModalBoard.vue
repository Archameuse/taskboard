<template>
  <aside @mousedown="() => $emit('close')" class="fixed top-0 left-0 w-full h-full bg-[#0000004d] p-4 flex justify-end">
    <form @submit="save" @mousedown.stop class="h-full w-full max-w-xl bg-white rounded-xl flex flex-col p-6 gap-6 overflow-y-auto">
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-semibold">Task details</h2>
        <button @click="() => $emit('close')" type="button" class="h-10 aspect-square border border-gray2 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray2 active:opacity-80 transition">
          <img draggable="false" src="/close_ring_duotone-1.svg">
        </button>
      </div>
      <ModalGroup label-id="board-name-input" label-name="Board name">
        <input required id="board-name-input" ref="nameRef" placeholder="Enter a board name" :value="name" class="border border-gray1 rounded-lg px-4 py-2 text-lg placeholder:text-gray1">
      </ModalGroup>
      <ModalGroup label-id="board-description-input" label-name="Description">
        <textarea id="board-description-input" ref="descriptionRef" placeholder="Enter a short description" :value="description"  class="border border-gray1 rounded-lg px-4 py-2 text-lg placeholder:text-gray1 min-h-20 h-40 max-h-60"></textarea>
      </ModalGroup>

      <div class="flex-grow flex w-full justify-end items-end gap-4 text-white [&>button]:w-32 [&>button]:justify-center [&>button]:items-center [&>button]:py-2 [&>button]:rounded-4xl [&>button]:flex [&>button]:gap-2 [&>button]:hover:opacity-80 [&>button]:active:opacity-95 [&>button]:hover:cursor-pointer">
        <button v-if="id" @click="() => emit('delete')" type="button" class="bg-gray1">Delete <img src="/Trash.svg"></button>
        <button type="submit" class="bg-blue">Save <img src="/Done_round.svg"></button>
      </div>
    </form>
  </aside>
</template>

<script setup lang="ts">
import { ref, type PropType } from 'vue';
import { v4 } from 'uuid'
import ModalGroup from './ModalGroup.vue';
import IconWrapper from './IconWrapper.vue';
const emit = defineEmits<{
  (e: 'close'): void,
  (e: 'delete'): void,
  (e: 'save', value: Board): void
}>()
const props = defineProps({
  name: {
    type: String,
    required: true
  },
  description: String,
  id: String
})
const nameRef = ref<HTMLInputElement>()
const descriptionRef = ref<HTMLTextAreaElement>()
const save = (e:Event) => {
  const form = e.target as HTMLFormElement
  if(!form.checkValidity()) return
  e.preventDefault()
  const name = nameRef.value?.value||''
  const description = descriptionRef.value?.value||''
  if(!name) return alert('Please enter a name')
  emit('save', {
    id: props.id||v4(),
    name,
    description
  })
}
</script>
