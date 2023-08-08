import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';

import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';

import App from './App.vue';

const app = createApp(App);
app.use(Antd);
app.use(createPinia());
app.use(createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'overview', component: () => import('@/overview/OverviewPage.vue') },
    { path: '/storage', name: 'storage', component: () => import('@/storage/StoragePage.vue') },
    { path: '/tasks', name: 'tasks', component: () => import('@/tasks/TasksPage.vue') },
    { path: '/cost', name: 'cost', component: () => import('@/cost/CostPage.vue') },
  ],
}));
app.mount('#app');
