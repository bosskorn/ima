import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import OrdersView from './views/OrdersView.vue'
import NewOrderView from './views/NewOrderView.vue'
import OrderDetailView from './views/OrderDetailView.vue'
import TrackView from './views/TrackView.vue'
import ProfileView from './views/ProfileView.vue'

export default createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: HomeView, meta: { tab: true } },
    { path: '/orders', component: OrdersView, meta: { tab: true } },
    { path: '/new', component: NewOrderView, meta: { tab: false } },
    { path: '/track', component: TrackView, meta: { tab: true } },
    { path: '/profile', component: ProfileView, meta: { tab: true } },
    { path: '/orders/:id', component: OrderDetailView, props: true, meta: { tab: false } },
  ],
  scrollBehavior: () => ({ top: 0 }),
})
