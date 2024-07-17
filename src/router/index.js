import { createRouter, createWebHistory } from 'vue-router';
import AppLayout from '@/layout/AppLayout.vue';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: AppLayout,
            children: [
                {
                    path: '/',
                    name: 'dashboard',
                    component: () => import('@/views/Dashboard.vue')
                },
                
                {
                    path: '/pages/bot',
                    name: 'bot',
                    component: () => import('@/views/pages/Bot.vue')
                },
             
           
                {
                    path: '/pages/Tags',
                    name: 'tags',
                    component: () => import('@/views/pages/Tags.vue')
                },
                
              
            ]
        },
        {
            path: '/landing',
            name: 'landing',
            component: () => import('@/views/pages/Landing.vue')
        },
        {
            path: '/pages/notfound',
            name: 'notfound',
            component: () => import('@/views/pages/NotFound.vue')
        }

        
    ]
});

export default router;
