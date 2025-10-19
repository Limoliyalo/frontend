import { useAuthStore } from '~/store/auth.store'

/**
 * Composable для выполнения аутентифицированных запросов к API.
 * Эта функция является оберткой над $fetch и автоматически добавляет
 * заголовок авторизации (Authorization: Bearer <token>).
 */
export const useApi = <T>(url: string, options: any = {}) => {
    const config = useRuntimeConfig()
    const authStore = useAuthStore()

    // Устанавливаем базовый URL для API, если он еще не задан
    options.baseURL = options.baseURL ?? config.public.apiBase

    // Подготавливаем заголовки
    const headers = {
        ...options.headers,
    }

    // Если пользователь аутентифицирован (есть токен), добавляем заголовок
    if (authStore.isAuthenticated && authStore.accessToken) {
        headers.Authorization = `Bearer ${authStore.accessToken}`
    }

    // Выполняем запрос с обновленными опциями
    return $fetch<T>(url, {
        ...options,
        headers,
    }).catch(async error => {
        // Обработка ошибок авторизации
        if (error.status === 401 || error.status === 403) {
            console.log('Токен недействителен, выполняется выход из системы')
            authStore.logout()
        }
        throw error
    })
}
