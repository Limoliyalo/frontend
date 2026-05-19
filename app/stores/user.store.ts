import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { isApiStatus, useApi } from '~/composables/useApi'
import type {
    TelegramUser,
    userStat,
    userSettings,
    baseUser,
} from '~/types/user/user'

const DEFAULT_SETTINGS: Pick<
    userSettings,
    'quiet_start_time' | 'quiet_end_time' | 'muted_days' | 'do_not_disturb'
> = {
    quiet_start_time: '00:00:00',
    quiet_end_time: '00:00:00',
    muted_days: [],
    do_not_disturb: false,
}

const STORAGE_KEYS = {
    user: 'tg_user',
    initData: 'tg_initData',
} as const

export const useMyUserStore = defineStore('myUserStore', () => {
    const { apiRequest } = useApi()

    const user = ref<TelegramUser | null>(null)
    const initData = ref<string | null>(null)
    const statistic = ref<userStat | null>(null)
    const settings = ref<userSettings | null>(null)
    const statisticLoaded = ref(false)
    const settingsLoaded = ref(false)

    let statisticPromise: Promise<void> | null = null
    let settingsPromise: Promise<void> | null = null

    const isAuthorized = computed<boolean>(
        () => !!user.value && !!initData.value,
    )

    const userId = computed(() => user.value?.id)
    const username = computed(() => user.value?.username ?? null)
    const firstName = computed(() => user.value?.first_name ?? null)
    const lastName = computed(() => user.value?.last_name ?? null)
    const languageCode = computed(() => user.value?.language_code ?? null)
    const isPremium = computed(() => user.value?.is_premium ?? false)
    const photoUrl = computed(() => user.value?.photo_url ?? null)

    const fullName = computed<string>(() => {
        if (!user.value) return ''
        return [user.value.first_name, user.value.last_name]
            .filter(Boolean)
            .join(' ')
    })

    function setUser(telegramUser: TelegramUser, data: string): void {
        user.value = telegramUser
        initData.value = data
        localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(telegramUser))
        localStorage.setItem(STORAGE_KEYS.initData, data)
    }

    function loadFromStorage(): void {
        const cachedUser = localStorage.getItem(STORAGE_KEYS.user)
        const cachedInitData = localStorage.getItem(STORAGE_KEYS.initData)
        if (cachedUser && cachedInitData) {
            user.value = JSON.parse(cachedUser)
            initData.value = cachedInitData
        }
    }

    function clear(): void {
        user.value = null
        initData.value = null
        statistic.value = null
        settings.value = null
        statisticLoaded.value = false
        settingsLoaded.value = false
        localStorage.removeItem(STORAGE_KEYS.user)
        localStorage.removeItem(STORAGE_KEYS.initData)
    }

    async function registerUser(): Promise<void> {
        await apiRequest('/users/register', {
            method: 'POST',
            body: JSON.stringify({ telegram_id: userId.value }),
        })
    }

    async function fetchCurrentUser(): Promise<baseUser> {
        return apiRequest<baseUser>('/users/me', { method: 'GET' })
    }

    async function loadUserStatistic(force = false): Promise<void> {
        if (statisticLoaded.value && !force) return
        if (statisticPromise && !force) return statisticPromise

        statisticPromise = apiRequest<userStat>('/users/me/statistics', {
            method: 'GET',
        })
            .then(data => {
                statistic.value = data
                statisticLoaded.value = true
            })
            .finally(() => {
                statisticPromise = null
            })

        return statisticPromise
    }

    async function updateUserSettings(
        patch: Partial<userSettings>,
    ): Promise<void> {
        settings.value = await apiRequest<userSettings>('/user-settings/me', {
            method: 'PATCH',
            body: JSON.stringify(patch),
        })
        settingsLoaded.value = true
    }

    async function loadUserSettings(force = false): Promise<void> {
        if (settingsLoaded.value && !force) return
        if (settingsPromise && !force) return settingsPromise

        settingsPromise = (async () => {
            try {
                settings.value = await apiRequest<userSettings>(
                    '/user-settings/me',
                    { method: 'GET' },
                )
                settingsLoaded.value = true
            } catch (error: unknown) {
                if (!isApiStatus(error, 404)) throw error

                await updateUserSettings(DEFAULT_SETTINGS)
            }
        })().finally(() => {
            settingsPromise = null
        })

        return settingsPromise
    }

    async function deleteUserSettings(): Promise<void> {
        await apiRequest('/user-settings/me', { method: 'DELETE' })
        settings.value = null
        settingsLoaded.value = false
    }

    return {
        user,
        initData,
        statistic,
        settings,
        statisticLoaded,
        settingsLoaded,

        isAuthorized,
        userId,
        username,
        firstName,
        lastName,
        fullName,
        languageCode,
        isPremium,
        photoUrl,

        setUser,
        loadFromStorage,
        clear,
        registerUser,
        fetchCurrentUser,
        loadUserStatistic,
        loadUserSettings,
        ensureUserStatisticLoaded: loadUserStatistic,
        ensureUserSettingsLoaded: loadUserSettings,
        updateUserSettings,
        deleteUserSettings,
    }
})
