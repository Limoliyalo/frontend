import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// Описываем типы для токенов и пользователя для строгой типизации
interface Tokens {
    access_token: string
    refresh_token: string
}

interface UserCredentials {
    user_tg_id: number
    password: string
}

interface NewUser {
    telegram_id: number
    password: string
}

// Мы используем "setup store" синтаксис.
// Он лучше подходит для работы с composables, такими как useCookie.
export const useAuthStore = defineStore('auth', () => {
    // 1. СОСТОЯНИЕ (State)

    // refreshToken будет храниться в cookie, что переживет перезагрузку страницы.
    const refreshToken = useCookie<string | null>('refreshToken')
    // accessToken хранится только в памяти (ref), для быстрого доступа.
    const accessToken = ref<string | null>(null)

    // 2. ГЕТТЕРЫ (Getters)

    // Проверяем, есть ли у нас токен доступа.
    const isAuthenticated = computed(() => !!accessToken.value)

    // 3. ДЕЙСТВИЯ (Actions)

    /**
     * Устанавливает токены после успешного входа.
     * @param {Tokens} tokens - Объект с access_token и refresh_token.
     */
    function setTokens(tokens: Tokens) {
        accessToken.value = tokens.access_token
        refreshToken.value = tokens.refresh_token
        console.log('Токены успешно установлены.')
    }

    /**
     * Производит вход в систему, получает и сохраняет токены.
     * @param {UserCredentials} credentials - Учетные данные пользователя.
     */
    async function login(credentials: UserCredentials) {
        const config = useRuntimeConfig()
        try {
            const tokens = await $fetch<Tokens>('/auth/login', {
                method: 'POST',
                body: credentials,
                baseURL: config.public.apiBase,
            })

            setTokens(tokens)

            console.log('Успешный вход!')
            // После входа можно перенаправить пользователя
            await navigateTo('/')
        } catch (error) {
            console.error('Ошибка входа:', error)
            alert('Не удалось войти. Проверьте правильность введенных данных.')
        }
    }

    /**
     * Регистрирует нового пользователя и сразу же выполняет вход.
     * @param {NewUser} user - Данные нового пользователя.
     */
    async function regNewUser(user: NewUser) {
        console.log('тут буду храниться типы юзеров в логи', user);
        const config = useRuntimeConfig()
        try {
            await $fetch('/users/register', {
                method: 'POST',
                body: user,
                baseURL: config.public.apiBase,
            })
            console.log('Успешная регистрация!')
            // Сразу после регистрации пытаемся войти
            await login({
                user_tg_id: user.telegram_id,
                password: user.password,
            })
        } catch (error) {
            console.error('Ошибка регистрации:', error)
            alert(
                'Не удалось зарегистрироваться. Проверьте правильность введенных данных.'
            )
        }
    }

    /**
     * Выход из системы. Очищает все токены.
     */
    function logout() {
        console.log('Выход из системы...')
        accessToken.value = null
        refreshToken.value = null
        console.log('Токены очищены.')
        // Можно также перенаправить на главную или страницу входа
        navigateTo('/register')
    }

    /**
     * Обновляет access_token, используя refresh_token.
     * Вызывается при инициализации приложения, если refresh_token существует.
     */
    async function refreshAccessToken() {
        if (!refreshToken.value) {
            // Если нет refresh token, то и обновлять нечего
            return
        }

        console.log('Попытка обновить токен...')
        const config = useRuntimeConfig()
        try {
            const tokens = await $fetch<Tokens>('/auth/refresh', {
                method: 'POST',
                body: { refresh_token: refreshToken.value },
                baseURL: config.public.apiBase,
            })

            setTokens(tokens)
            console.log('Токены успешно обновлены.')
        } catch (error) {
            console.error('Ошибка обновления токена:', error)
            // Если не удалось обновить токен (например, он истек),
            // то выходим из системы, чтобы очистить невалидные данные.
            logout()
        }
    }

    // Возвращаем все, что должно быть доступно извне хранилища
    return {
        accessToken,
        refreshToken,
        isAuthenticated,
        login,
        logout,
        regNewUser,
        setTokens,
        refreshAccessToken, // Экспортируем новую функцию
    }
})
