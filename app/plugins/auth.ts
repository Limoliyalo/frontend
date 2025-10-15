import { useAuthStore } from '~/store/auth.store'

/**
 * Этот плагин запускается при инициализации приложения Nuxt.
 * Его задача - проверить, есть ли у пользователя refresh_token,
 * и если да - попытаться обновить access_token.
 * Это позволяет пользователю оставаться в системе после перезагрузки страницы.
 */
export default defineNuxtPlugin(async nuxtApp => {
  const authStore = useAuthStore()

  // Если токен уже есть (например, после серверного рендеринга),
  // то ничего делать не нужно.
  if (authStore.isAuthenticated) {
    return
  }

  // Пытаемся обновить токен. Логика обработки ошибок находится
  // внутри самого действия refreshAccessToken в хранилище.
  await authStore.refreshAccessToken()
})
