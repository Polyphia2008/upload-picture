import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'landing', component: () => import('./views/LandingView.vue'), meta: { title: 'WsUploadPicture - Image Upload & Link Sharing' } },
    { path: '/upload', alias: ['/playground'], name: 'upload', component: () => import('./views/UploadView.vue'), meta: { title: 'Up ảnh lấy link - WsUploadPicture' } },
    { path: '/models', name: 'models', component: () => import('./views/InfoView.vue'), meta: { title: 'Nguồn lưu trữ - WsUploadPicture', page: 'models' } },
    { path: '/docs', name: 'docs', component: () => import('./views/InfoView.vue'), meta: { title: 'API Docs - WsUploadPicture', page: 'docs' } },
    { path: '/terms', name: 'terms', component: () => import('./views/InfoView.vue'), meta: { title: 'Điều khoản - WsUploadPicture', page: 'terms' } },
    { path: '/pricing', alias: ['/subscription'], name: 'pricing', component: () => import('./views/InfoView.vue'), meta: { title: 'Miễn phí - WsUploadPicture', page: 'pricing' } },
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ],
  scrollBehavior: () => ({ top: 0 })
})

router.afterEach((to) => {
  document.title = String(to.meta.title || 'WsUploadPicture')
  document.documentElement.classList.toggle('is-landing-route', to.name === 'landing')
})
export default router
