import { Router } from 'vue-router' // غير VueRouter لـ Router إذا كان Vue 3

export function useExternalRoute(router: Router) {
  router.beforeEach((to, from, next) => {
    const full = to.fullPath.substring(1)
    if (full.startsWith('https:') || full.startsWith('http:')) {
      next(false)
      window.open(full, 'browser')
    } else {
      next()
    }
    // احذف الـ route object من هنا؛ مش مكانه
  })
}
