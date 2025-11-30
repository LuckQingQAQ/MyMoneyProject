import Dashboard from '@/component/Dashboard.vue'
import NotFound from '@/component/NotFound.vue'
import Reports from '@/component/Reports.vue'
import Settings from '@/component/Settings.vue'
import Transactions from '@/component/Transactions.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: Dashboard },
    { path: '/dashboard', component: Dashboard },
    { path: '/transactions', component: Transactions },
    { path: '/reports', component: Reports },
    { path: '/settings', component: Settings },
    { path: '/NotFound', component: NotFound }
  ],
})

export default router
