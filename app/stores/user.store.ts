import { defineStore } from 'pinia'

interface TelegramUser {
    id: number
    first_name: string
    last_name?: string
    username?: string
    language_code?: string
    is_premium?: boolean
    photo_url?: string
}

interface UserState {
    user: TelegramUser | null
    isLoaded: boolean
    initData: string | null
}

export const useMyUserStore = defineStore('myUserStore', {
    state: (): UserState => ({
        user: null,
        isLoaded: false,
        initData: null,
    }),
    getters: {
        getUser: (state: UserState) => state.user,
        getUserId: (state: UserState) => state.user?.id,
        getUsername: (state: UserState) => state.user?.username || null,
        getFirstName: (state: UserState) => state.user?.first_name || null,
        getLastName: (state: UserState) => state.user?.last_name || null,
        getFullName: (state: UserState) => {
            if (!state.user) return ''
            const firstName = state.user.first_name || ''
            const lastName = state.user.last_name || ''
            return [firstName, lastName].filter(Boolean).join(' ')
        },
        getLanguageCode: (state: UserState) =>
            state.user?.language_code || null,
        isPremium: (state: UserState) => state.user?.is_premium || false,
        getPhotoUrl: (state: UserState) => state.user?.photo_url || null,
        isUserLoaded: (state: UserState) => state.isLoaded,
        getInitData: (state: UserState) => state.initData,
    },
    actions: {
        setUser(user: TelegramUser | null) {
            this.user = user
            this.isLoaded = true
            console.log(
                'Пользователь Telegrammmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm:',
                user
            )
        },
        setInitData(initData: string | null) {
            this.initData = initData
        },
        loadUserFromTelegram() {
            if (
                typeof window !== 'undefined' &&
                (window as any).Telegram?.WebApp?.initDataUnsafe?.user
            ) {
                this.setUser(
                    (window as any).Telegram.WebApp.initDataUnsafe.user
                )
            }
        },
        loadInitData() {
            if (
                typeof window !== 'undefined' &&
                (window as any).Telegram?.WebApp
            ) {
                const initData = (window as any).Telegram.WebApp.initData
                this.setInitData(initData || null)
            } else {
                // Если приложение не запущено в Telegram, используем тестовый initData
                this.setInitData('test_init_data')
            }
        },
    },
})
