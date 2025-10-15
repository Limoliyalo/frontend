import { useAuthStore } from '~/store/auth.store'

/**
 * Middleware для защиты роутов.
 * Проверяет, аутентифицирован ли пользователь. Если нет,
 * перенаправляет его на страницу входа.
 */
export default defineNuxtRouteMiddleware(to => {
  // Получаем доступ к хранилищу
  const authStore = useAuthStore()

  // Список публичных роутов, которые не требуют авторизации
  const publicRoutes = ['/login']

  // Если пользователь не аутентифицирован и пытается зайти не на публичный роут
  if (!authStore.isAuthenticated && !publicRoutes.includes(to.path)) {
    console.log('Middleware: Пользователь не авторизован. Перенаправление на /login')
    // Возвращаем путь, куда нужно перенаправить пользователя
    return navigateTo('/login', { replace: true })
  }
})
