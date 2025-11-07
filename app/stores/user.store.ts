import { defineStore } from 'pinia'
import { useApi } from '#imports'
import type { TelegramUser, UserState, userSettings } from '~/types/user/user'

export const useMyUserStore = defineStore('myUserStore', {
    state: (): UserState => ({
        user: null,
        initData: null,
        statistic: null,
        settings: null,
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
        getStatistic: (state: UserState) => state.statistic,
        getInitData: (state: UserState) => state.initData,
        getSettings: (state: UserState) => state.settings,
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

        async loadUserStatistic() {
            const { apiRequest } = useApi()
            try {
                this.statistic = await apiRequest('/users/me/statistics', {
                    method: 'GET',
                })
                console.log(
                    'userStat.valueeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
                    this.statistic
                )
            } catch (error) {
                console.log(
                    'Не удалось загрузить статистику пользователя',
                    error
                )
            }
        },
        async loadUserSettings() {
            const { apiRequest } = useApi()
            try {
                this.settings = await apiRequest('/user-settings/me', {
                    method: 'GET',
                })
                console.log(
                    'userSettings.valueeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
                    this.settings
                )
            } catch (error: any) {
                if (error.message && error.message.includes('404')) {
                    console.log(
                        'Настройки пользователя не найдены. Создание настроек по умолчанию.'
                    )
                    try {
                        await this.updateUserSettings({
                            quiet_start_time: '00:00:00',
                            quiet_end_time: '00:00:00',
                            muted_days: [],
                            do_not_disturb: false,
                        })
                        console.log(
                            'Настройки по умолчанию успешно созданы и загружены.'
                        )
                    } catch (patchError) {
                        console.error(
                            'Не удалось создать настройки по умолчанию:',
                            patchError
                        )
                    }
                } else {
                    console.log(
                        'Не удалось загрузить настройки пользователя',
                        error
                    )
                }
            }
        },
        async updateUserSettings(newSettings: Partial<userSettings>) {
            const { apiRequest } = useApi()
            try {
                const updatedSettings = await apiRequest('/user-settings/me', {
                    method: 'PATCH', // Используем PATCH для обновления
                    body: JSON.stringify(newSettings),
                })
                // После успешного ответа сервера, обновляем состояние в хранилище
                this.settings = updatedSettings
                console.log(
                    'Настройки пользователя успешно обновлены',
                    this.settings
                )
            } catch (error) {
                console.error(
                    'Не удалось обновить настройки пользователя',
                    error
                )
                // Здесь можно добавить логику отката изменений, если нужно
            }
        },
        async deleteUserSettings() {
            const { apiRequest } = useApi()
            try {
                await apiRequest('/user-settings/me', {
                    method: 'DELETE',
                })
                this.settings = null
                console.log('Настройки пользователя успешно удалены')
            } catch (error) {
                console.error(
                    'Не удалось удалить настройки пользователя',
                    error
                )
            }
        },
    },
})
