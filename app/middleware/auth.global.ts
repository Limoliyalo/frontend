import { useAuthStore } from '~/store/auth.store'

/**
 * Глобальный middleware для аутентификации.
 * Запускается при каждой смене маршрута.
 */
export default defineNuxtRouteMiddleware(to => {
    // Получаем доступ к хранилищу
    const authStore = useAuthStore()
    const loggedIn = authStore.isAuthenticated

    // Страница входа является публичной
    const isPublicRoute = to.path === '/register'

    // Если пользователь авторизован
    if (loggedIn) {
        // И пытается зайти на страницу входа, перенаправляем его на главную
        if (isPublicRoute) {
            console.log(
                'Global Middleware: Пользователь авторизован. Перенаправление с /login на /'
            )
            return navigateTo('/', { replace: true })
        }
    } else {
        // Если пользователь НЕ авторизован и пытается зайти НЕ на страницу входа
        if (!isPublicRoute) {
            console.log(
                'Global Middleware: Пользователь не авторизован. Перенаправление на /login'
            )
            // Перенаправляем на страницу входа
            return navigateTo('/register', { replace: true })
        }
    }
})
