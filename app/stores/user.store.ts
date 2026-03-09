import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useApi } from '#imports'
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

    async function loadUserStatistic(): Promise<void> {
        statistic.value = await apiRequest<userStat>('/users/me/statistics', {
            method: 'GET',
        })
    }

    async function updateUserSettings(
        patch: Partial<userSettings>,
    ): Promise<void> {
        settings.value = await apiRequest<userSettings>('/user-settings/me', {
            method: 'PATCH',
            body: JSON.stringify(patch),
        })
    }

    async function loadUserSettings(): Promise<void> {
        try {
            settings.value = await apiRequest<userSettings>(
                '/user-settings/me',
                { method: 'GET' },
            )
        } catch (error: unknown) {
            const is404 =
                error instanceof Error && error.message.includes('404')

            if (!is404) throw error

            await updateUserSettings(DEFAULT_SETTINGS)
        }
    }

    async function deleteUserSettings(): Promise<void> {
        await apiRequest('/user-settings/me', { method: 'DELETE' })
        settings.value = null
    }

    return {
        user,
        initData,
        statistic,
        settings,

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
        updateUserSettings,
        deleteUserSettings,
    }
})
