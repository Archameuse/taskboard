<template>
  <aside @mousedown="() => $emit('close')" class="fixed top-0 left-0 w-full h-full bg-[#0000004d] p-4 flex justify-end">
    <form @submit="save" @mousedown.stop class="h-full w-full max-w-xl bg-white rounded-xl flex flex-col p-6 gap-6 overflow-y-auto">
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-semibold">Task details</h2>
        <button @click="() => $emit('close')" type="button" class="h-10 aspect-square border border-gray2 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray2 active:opacity-80 transition">
          <img draggable="false" src="/close_ring_duotone-1.svg">
        </button>
      </div>
      <ModalGroup label-id="name-input" label-name="Task name">
        <input required id="name-input" ref="nameRef" placeholder="Enter a task name" :value="task?.name" class="border border-gray1 rounded-lg px-4 py-2 text-lg placeholder:text-gray1">
      </ModalGroup>
      <ModalGroup label-id="description-input" label-name="Description">
        <textarea id="description-input" ref="descriptionRef" placeholder="Enter a short description" :value="task?.description"  class="border border-gray1 rounded-lg px-4 py-2 text-lg placeholder:text-gray1 min-h-20 h-40 max-h-60"></textarea>
      </ModalGroup>
      <ModalGroup label-name="Icon">
        <ul class="flex gap-2 flex-wrap">
          <IconWrapper tabindex="0" v-for="icon of icons" @click="() => activeIcon=icon" v-bind:key="icon" :class="activeIcon===icon?'bg-yellow1':'bg-gray2'" class="cursor-pointer hover:opacity-80 active:opacity-95 transition">
            {{ icon }}
          </IconWrapper>
        </ul>
      </ModalGroup>
      <ModalGroup label-name="Status">
        <ul class="flex gap-2 flex-wrap">
          <button v-for="status of statuses" type="button" v-bind:key="status" @click="() => {activeStatus===status?activeStatus=undefined:activeStatus=status}" :class="activeStatus===status&&'ring-2 ring-blue'" class="w-62 border-2 border-gray2 rounded-xl py-1 px-2 flex items-center gap-2 cursor-pointer hover:opacity-80 active:opacity-95">
            <IconWrapper :class="status==='completed'?'bg-green2':status==='progress'?'bg-yellow2':'bg-red1'">
              <img draggable="false" class="h-6 aspect-square" :src="
                status==='completed'?'/Done_round_duotone.svg':status==='progress'?'/Time_atack_duotone.svg':'/close_ring_duotone.svg'
              ">
            </IconWrapper>
            <h2 class="text-lg font-medium select-none flex-grow text-left">{{status==='progress'?'In Progress':status==='completed'?'Completed':"Won't do"}}</h2>
            <div class="rounded-full h-5 aspect-square overflow-hidden">
              <div v-if="status===activeStatus" class="bg-blue p-0.5">
                <img src="/Done_round.svg" draggable="false" class="select-none">
              </div>
            </div>
          </button>
        </ul>
      </ModalGroup>
      <div class="flex-grow flex w-full justify-end items-end gap-4 text-white [&>button]:w-32 [&>button]:justify-center [&>button]:items-center [&>button]:py-2 [&>button]:rounded-4xl [&>button]:flex [&>button]:gap-2 [&>button]:hover:opacity-80 [&>button]:active:opacity-95 [&>button]:hover:cursor-pointer">
        <button v-if="task" @click="() => emit('delete')" type="button" class="bg-gray1">Delete <img src="/Trash.svg"></button>
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
  (e: 'save', value: Task): void
}>()
const props = defineProps({
  task: {
    type: Object as PropType<Task>
  }
})
const icons:Icons[] = ['🧑‍💻','💬','☕','🏋️','📚','⏰']
const statuses:Status[] = ['progress','completed','wont']
const activeIcon = ref<Icons>(props.task?.icon||icons[0])
const activeStatus = ref<Status|undefined>(props.task?.status)
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
    id: props.task?.id||v4(),
    name,
    description,
    icon: activeIcon.value,
    status: activeStatus.value
  })
}
</script>
