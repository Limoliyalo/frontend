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
    initData: string | null
}

export const useMyUserStore = defineStore('myUserStore', {
    state: (): UserState => ({
        user: null,
        initData: null,
    }),
    getters: {
        isAuthorized: state => !!state.user && !!state.initData,
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

        getInitData: (state: UserState) => state.initData,
    },
    actions: {
        setUser(user: TelegramUser, initData: string) {
            this.user = user
            this.initData = initData
            localStorage.setItem('tg_user', JSON.stringify(user))
            localStorage.setItem('tg_initData', initData)
            console.log(
                'Пользователь Telegrammmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm:',
                user
            )
        },

        loadFromStorage() {
            const cachedUser = localStorage.getItem('tg_user')
            const cachedInitData = localStorage.getItem('tg_initData')
            if (cachedUser && cachedInitData) {
                this.user = JSON.parse(cachedUser)
                this.initData = cachedInitData
            }
        },
        clear() {
            this.user = null
            this.initData = ''
            localStorage.removeItem('tg_user')
            localStorage.removeItem('tg_initData')
        },
    },
})
