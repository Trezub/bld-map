import { nextTick } from 'vue';
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import MapTwo from '../pages/MapTwo.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: MapTwo,
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
