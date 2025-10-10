import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/:visibility?/:site?/:page?',
    name: 'page',
    meta: {
      requiresAuth: false
    },
    component: () => import(/* webpackChunkName: "page" */ '../App.vue'),
    beforeEnter: (to, from, next) => { 
      if (!localStorage.getItem('token') && to.params?.visibility == 'group') {
        window.location.href = '/'
      }
      next();
    }
  }
]

const router = createRouter({
  history: createWebHistory('/admin/#/'),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    if (to.hash) {
      return { el: to.hash };
    }
    return { x: 0, y: 0 };
  }
})

export default router
