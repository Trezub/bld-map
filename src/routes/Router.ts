import { nextTick } from 'vue';
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

import Home from '../pages/Home.vue';
import MapRoutes from '../pages/Map.vue';
import MapTwo from '../pages/MapTwo.vue';

const DefaultLayout = () => import('../layouts/Default.vue');

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: DefaultLayout,
    children: [
      { path: 'home', component: Home },
      { path: 'map', component: MapRoutes },
      { path: 'map2', component: MapTwo },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.afterEach((to) => {
  nextTick(() => {
    const menu = document.getElementById('offcanvasNavbar') as HTMLElement;
    const backdrop = document.querySelector(
      '.offcanvas-backdrop'
    ) as HTMLElement;
    if (menu && backdrop) {
      menu.classList.remove('show');
      backdrop.classList.remove('show');
    }
  });
});

export default router;
