import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

const commonRoutes = [
  {
    path: '*',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/index',
    component: () => import('../components/Index.vue'),
    children: [
      {
        path: '/t1',
        name: 't1',
        meta: { title: '观点列表' },
        component: () => import('../views/T1.vue')
      },
      {
        path: '/msg',
        name: 'msg',
        meta: { title: '创建观点' },
        component: () => import('../views/Msg.vue')
      },
      {
        path: '/edit',
        name: 'edit',
        meta: { title: '编辑观点' },
        component: () => import('../views/Edit.vue')
      }
    ]
  }
];

const createRouter = () => new Router({ routes: commonRoutes });

const router = createRouter();

export default router;
