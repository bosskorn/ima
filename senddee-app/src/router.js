import { createRouter, createWebHashHistory } from 'vue-router'
import { useSession } from './stores/session'

const routes = [
  { path: '/login', component: () => import('./views/LoginView.vue'), meta: { public: true } },
  { path: '/', component: () => import('./views/DashboardView.vue'), meta: { tab: true } },
  { path: '/shop', component: () => import('./views/ShopView.vue'), meta: { tab: true } },
  { path: '/receive', component: () => import('./views/ReceiveView.vue'), meta: { tab: true } },
  { path: '/done/:id', component: () => import('./views/DoneView.vue'), props: true },
  { path: '/search', component: () => import('./views/SearchView.vue'), meta: { tab: true } },
  { path: '/summary', component: () => import('./views/SummaryView.vue'), meta: { tab: true } },
  { path: '/orders/:id', component: () => import('./views/OrderDetailView.vue'), props: true },
  { path: '/settings', component: () => import('./views/SettingsView.vue'), meta: { tab: true } },
  { path: '/quote', component: () => import('./views/QuoteView.vue') },
  { path: '/issues', component: () => import('./views/IssuesView.vue') },
  { path: '/news', component: () => import('./views/NewsView.vue'), meta: { tab: true } },
]

const router = createRouter({ history: createWebHashHistory(), routes, scrollBehavior: () => ({ top: 0 }) })
router.beforeEach((to) => {
  const s = useSession()
  if (!to.meta.public && !s.loggedIn) return '/login'
  if (to.path === '/login' && s.loggedIn) return '/'
})
export default router
