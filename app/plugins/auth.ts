import { useAuthStore } from '~/store/auth.store'

/**
 * Этот плагин запускается при инициализации приложения Nuxt.
 * Его задача - проверить, есть ли у пользователя refresh_token,
 * и если да - попытаться обновить access_token.
 * Это позволяет пользователю оставаться в системе после перезагрузки страницы.
 */
export default defineNuxtPlugin(async nuxtApp => {
    const authStore = useAuthStore()

    // Инициализируем авторизацию при загрузке приложения
    await authStore.initializeAuth()
})
