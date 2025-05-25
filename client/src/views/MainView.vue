<template>
  <main class="w-full max-w-xl h-200 mx-auto mt-16 flex flex-col">
    <button @click="taskBoardModal=true" class="flex flex-col cursor-pointer text-left">
      <div class="flex items-center gap-4">
        <img draggable="false" src="/Logo.svg">
        <h1 class="text-[2.5rem]">{{ board.name }} </h1>
        <img draggable="false" src="/Edit_duotone.svg">
        <div v-if="saving" class="flex gap-2 justify-center items-center">
          <svg class="animate-spin" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M10.14,1.16a11,11,0,0,0-9,8.92A1.59,1.59,0,0,0,2.46,12,1.52,1.52,0,0,0,4.11,10.7a8,8,0,0,1,6.66-6.61A1.42,1.42,0,0,0,12,2.69h0A1.57,1.57,0,0,0,10.14,1.16Z" class="spinner_P7sC"/></svg>
          <h2 class="animate-pulse">Saving Board...</h2>
        </div>
      </div>
      <h2 class=" ml-14">{{ board.description }}</h2>
    </button>
    <section class="flex flex-col gap-4 mt-12">
      <TaskBar v-for="task of tasks.values()" v-bind:key="task.id" @click="() => selectTask(task)" :class="!task.status?'bg-gray2':task.status==='completed'?'bg-green1':task.status==='progress'?'bg-yellow1':'bg-red2'">
        <IconWrapper class="bg-white">
          {{ task.icon }}
        </IconWrapper>
        <TaskBarText :name="task.name" :description="task.description" />
        <IconWrapper :class="!task.status?'':task.status==='completed'?'bg-green2':task.status==='progress'?'bg-yellow2':'bg-red1'">
          <img v-if="task.status" draggable="false" class="h-6 aspect-square" :src="
            task.status==='completed'?'/Done_round_duotone.svg':task.status==='progress'?'/Time_atack_duotone.svg':'/close_ring_duotone.svg'
            ">
        </IconWrapper>
      </TaskBar>
      <TaskBar class="bg-yellow3" @click="addTask">
        <IconWrapper class="bg-yellow2">
          <img draggable="false" class="h-6 aspect-square" src="/Add_round_duotone.svg">
        </IconWrapper>
        <TaskBarText name="Add new task"/>
      </TaskBar>
    </section>
  </main>
  <ModalMain v-if="addModal" :task="activeTask" @close="closeTask" @delete="delTask" @save="saveTask"/>
  <ModalBoard v-if="taskBoardModal" @close="closeBoard" @delete="delBoard" @save="saveBoard" :name="board.name" :description="board.description" :id="board.id"/>
</template>

<script lang="ts">
interface MyComponentInstance extends ComponentPublicInstance {
  setTasks: (task?:Task[]) => void;
  setBoard: (board?:Board) => void;
}
import { ref, type ComponentPublicInstance } from 'vue';
import TaskBar from '@/components/TaskBar.vue';
import IconWrapper from '@/components/IconWrapper.vue';
import TaskBarText from '@/components/TaskBarText.vue';
import ModalMain from '@/components/ModalMain.vue';
import ModalBoard from '@/components/ModalBoard.vue';
import { v4 } from 'uuid';
export default {
  components: {
    IconWrapper,TaskBar,TaskBarText,ModalMain,ModalBoard
  },
  data() {
    const tasks = ref<Map<string,Task>>(new Map())
    const activeTask = ref<Task|undefined>()
    const addModal = ref<boolean>(false)
    const taskBoardModal = ref<boolean>(false)
    const saving = ref<boolean>(false)
    const board = ref<Board>({
      name: 'My Task Board',
      description: 'Tasks to keep organised',
      id: typeof this.$route.params.id === 'string' ? this.$route.params.id : undefined
    })
    return {tasks, activeTask, addModal, saving, taskBoardModal, board}
  },
  async beforeRouteEnter(to,from,next) {
    if(from.matched.length&&to.fullPath!=='/') return next()
    const {id} = to.params
    let tasks:Task[]
    let board:Board
    if(!(to.fullPath==='/')&&typeof id === 'string') {
      const data = await fetch(import.meta.env.VITE_API_URL+'board?'+new URLSearchParams({
        id
      })).then(resp => resp.json() as Promise<{
        board:Board
        tasks:Task[]
      }>)
      tasks = data.tasks
      board = data.board
    }
    next(vm => {
      (vm as MyComponentInstance).setTasks(tasks),
      (vm as MyComponentInstance).setBoard(board)
    })
  },
  methods: {
    setTasks(tasks?:Task[]) {
      if(!tasks) tasks = [
      {id:v4(),icon:'⏰',status:'progress',name:'Task in Progress'},
      {id:v4(),icon:'🏋️',status:'completed',name:'Task Completed'},
      {id:v4(),icon:'☕',status:'wont',name:"Task Won't Do"},
      {id:v4(),icon:'📚',name:'Task To Do', description: 'Work on a Challenge on devChallenges.io, learn Typescript.'}
    ]
    this.tasks = new Map(tasks.map(task => [task.id,task]))
    },
    setBoard(board?:Board) {
      if(!board) board = {
          name: 'My Task Board',
          description: 'Tasks to keep organised',
        }
      if(!board.id) board.id = typeof this.$route.params.id === 'string' ? this.$route.params.id : undefined
      this.board = board
    },
    selectTask (task:Task) {
      this.activeTask = task
      this.addModal = true
    },
    addTask () {
      this.activeTask = undefined
      this.addModal = true
    },
    closeTask() {
      this.addModal = false
    },
    async delTask() {
      this.closeTask()
      if(!this.activeTask) return
      const {id} = this.$route.params
      const deletedTask = this.tasks.get(this.activeTask.id)
      this.tasks.delete(this.activeTask.id)
      if(this.$route.fullPath==='/') {
        this.saving = true
        const newBoard = v4()
        this.$router.push('/'+newBoard)
        this.board.id = typeof this.$route.params.id === 'string' ? this.$route.params.id : undefined
        const resp = await fetch(import.meta.env.VITE_API_URL+'board', {
          method: 'POST',
          body: JSON.stringify({
            board: {
              id: this.board.id,
              name: this.board.name,
              description: this.board.description,
            } as Board,
            tasks: Array.from(this.tasks.values())
          }),
          headers: {
            'Content-Type': 'application/json'
          }
        })
        this.saving = false
        if(!resp.ok) {
          alert('Error uploading this board')
          this.$router.replace('/')
          this.board.id = undefined
        }
      } else {
        if(typeof id !== 'string') return alert('Cant get board id')
        this.saving = true
        const resp = await fetch(import.meta.env.VITE_API_URL+'task?'+new URLSearchParams({
          id,
          taskId: this.activeTask.id
        }), {method: 'DELETE'})
        this.saving = false
        if(!resp.ok) {
          alert('Error deleting this task')
          if(deletedTask) this.tasks.set(this.activeTask.id,deletedTask)
        }
      }
      // tasks.value.delete(activeTask.value)
      // delete api call
    },
    async saveTask(task:Task) {
      this.closeTask()
      if(!task) return
      if(this.$route.fullPath==='/') {
        this.saving = true
        this.tasks.set(task.id,task)
        const newBoard = v4()
        this.$router.push('/'+newBoard)
        this.board.id = typeof this.$route.params.id === 'string' ? this.$route.params.id : undefined
        const resp = await fetch(import.meta.env.VITE_API_URL+'board', {
          method: 'POST',
          body: JSON.stringify({
            board: {
              id: newBoard,
              name: this.board.name,
              description: this.board.description
            } as Board,
            tasks: Array.from(this.tasks.values())
          }),
          headers: {
            'Content-Type': 'application/json'
          }
        })
        this.saving = false
        if(!resp.ok) {
          alert('Error uploading this board')
          this.$router.replace('/')
          this.board.id = undefined
        }
      } else {
        const {id} = this.$route.params
        if(typeof id !== 'string') return alert('Cant get board id')
        this.saving = true
        const prevTask = this.tasks.get(task.id)
        const method = prevTask?'PATCH':'POST'
        this.tasks.set(task.id,task)
        const resp = await fetch(import.meta.env.VITE_API_URL+'task', {
          method,
          body: JSON.stringify({
            id,
            task: task
          }),
          headers: {
            'Content-Type': 'application/json'
          }
        })
        this.saving = false
        if(!resp.ok) {
          alert('Error saving this task')
          if(prevTask) this.tasks.set(task.id,prevTask)
          else this.tasks.delete(task.id)
        }
      }
    },
    closeBoard() {
      this.taskBoardModal = false
    },
    async delBoard() {
      this.closeBoard()
      if(this.$route.fullPath==='/') return alert(`Wrong id provided`)
      const {id} = this.$route.params
      if(typeof id !== 'string') return alert('Cant get board id')
      this.saving = true
      const resp = await fetch(import.meta.env.VITE_API_URL+'board?'+ new URLSearchParams({
        id
      }), {
        method: 'DELETE'
      })
      this.saving = false
      if(!resp.ok) alert('Something went wrong deleting board')
      else {
        this.$router.replace('/')}
        this.board.id = undefined
      },
    async saveBoard(board:Board) {
      this.closeBoard()
      if(!board) return
      this.saving=true
      const prevBoard = this.board
      this.board = board
      if(this.$route.fullPath==='/') {
        this.$router.push('/'+board.id)
        // this.board.id = board.id
        const resp = await fetch(import.meta.env.VITE_API_URL+'board', {
          method: 'POST',
          body: JSON.stringify({
            board: board,
            tasks: Array.from(this.tasks.values())
          }),
          headers: {
            'Content-Type': 'application/json'
          }
        })
        this.saving = false
        if(!resp.ok) {
          alert('Error uploading this board')
          this.$router.replace('/')
          this.board = prevBoard
        }
        this.saving=false
      } else {
        const resp = await fetch(import.meta.env.VITE_API_URL+'board', {
          method: 'PATCH',
          body: JSON.stringify({board}),
          headers: {
            'Content-Type': 'application/json'
          }
        })
        this.saving=false
        if(!resp.ok) {
          this.board = prevBoard
        }
      }
    }
  }

}
</script>
