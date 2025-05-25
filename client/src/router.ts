import {  createRouter, createWebHistory } from "vue-router"
import MainView from "./views/MainView.vue"

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: MainView },
    { path: '/:id', component: MainView, beforeEnter: async (to,from,next) => {
      if(from.matched.length) next()
      else {
        const {id} = to.params
        if(typeof id !== 'string') return next('/')
        const resp = await fetch(import.meta.env.VITE_API_URL+'board-exist?' + new URLSearchParams({
          id
        }))
        if(resp.ok) next()
        else next('/')
      }
    }},
    { path: '/:id/:pathMatch(.*)*', redirect: '/'}
  ]
})

export default router
