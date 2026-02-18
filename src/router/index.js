import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/components/layout/MainLayout.vue'

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: 'Dashboard' }
      },
      {
        path: '/alerts/create',
        name: 'AlertCreation',
        component: () => import('@/views/AlertCreation.vue'),
        meta: { title: 'Create Alert' }
      },
      {
        path: '/resolutions',
        name: 'ResolutionManagement',
        component: () => import('@/views/ResolutionManagement.vue'),
        meta: { title: 'Resolution Management' }
      },
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Update document title on route change
router.beforeEach((to, from, next) => {
  document.title = to.meta.title 
    ? `${to.meta.title} - Alert Management Platform` 
    : 'Alert Management Platform'
  next()
})

export default router
