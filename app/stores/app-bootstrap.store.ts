import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import synthWaveGirlImage from '~/assets/SynthWave_Girl.png'
import { useActivitiesStore } from '~/stores/activities.store'
import { useMyBackgroundsStore } from '~/stores/backgrounds.store'
import { useCategoriesStore } from '~/stores/categories.store'
import { useMyCharacterStore } from '~/stores/character.store'
import { useItemsStore } from '~/stores/items.store'
import { useMyUserStore } from '~/stores/user.store'

type BootstrapStatus = 'idle' | 'loading' | 'ready' | 'slow' | 'error'

const SLOW_START_MS = 30000

const LOADER_MESSAGES = [
    'Скоро зайдем',
    'Подгружаем ваши результаты',
    'Готовим фон',
    'Расставляем предметы',
    'Факт: короткая прогулка помогает быстрее восстановить внимание.',
    'Факт: вода важна для энергии не меньше, чем тренировка.',
    'Факт: медитация тренирует навык возвращаться к фокусу.',
    'Факт: регулярность часто важнее идеального плана.',
] as const

const SLOW_MESSAGE =
    'Запуск занимает слишком много времени. Переоткройте приложение.'

const ERROR_MESSAGE = 'Не удалось запустить приложение. Попробуйте еще раз.'

const preloadImage = async (src: string | null | undefined): Promise<void> => {
    if (!import.meta.client || !src) return

    await new Promise<void>(resolve => {
        const image = new Image()
        image.decoding = 'async'
        image.onload = () => {
            const decode = image.decode?.()
            if (!decode) {
                resolve()
                return
            }

            decode.then(() => resolve()).catch(() => resolve())
        }
        image.onerror = () => resolve()
        image.src = src
    })
}

const preloadImages = async (
    sources: Array<string | null | undefined>,
): Promise<void> => {
    const uniqueSources = [...new Set(sources.filter(Boolean))] as string[]
    await Promise.all(uniqueSources.map(source => preloadImage(source)))
}

export const useAppBootstrapStore = defineStore('appBootstrap', () => {
    const status = ref<BootstrapStatus>('idle')
    const progress = ref(0)
    const errorMessage = ref<string | null>(null)
    const messageIndex = ref(0)

    let bootstrapPromise: Promise<void> | null = null
    let messageTimer: ReturnType<typeof setInterval> | null = null
    let slowTimer: ReturnType<typeof setTimeout> | null = null

    const isReady = computed(() => status.value === 'ready')
    const isLoading = computed(
        () => status.value === 'loading' || status.value === 'slow',
    )
    const isSlow = computed(() => status.value === 'slow')
    const message = computed(() => {
        if (status.value === 'error') return errorMessage.value ?? ERROR_MESSAGE
        if (status.value === 'slow') return SLOW_MESSAGE
        return LOADER_MESSAGES[messageIndex.value]
    })

    function clearTimers(): void {
        if (messageTimer) {
            clearInterval(messageTimer)
            messageTimer = null
        }
        if (slowTimer) {
            clearTimeout(slowTimer)
            slowTimer = null
        }
    }

    function startTimers(): void {
        clearTimers()
        messageTimer = setInterval(() => {
            messageIndex.value =
                (messageIndex.value + 1) % LOADER_MESSAGES.length
        }, 2500)
        slowTimer = setTimeout(() => {
            if (status.value === 'loading') status.value = 'slow'
        }, SLOW_START_MS)
    }

    function resetState(): void {
        status.value = 'loading'
        progress.value = 0
        errorMessage.value = null
        messageIndex.value = 0
        startTimers()
    }

    async function runStep(
        step: () => Promise<void>,
        done: number,
        total: number,
    ): Promise<void> {
        await step()
        progress.value = Math.round((done / total) * 100)
    }

    async function ensureBackendUser(): Promise<void> {
        const userStore = useMyUserStore()
        if (!userStore.isAuthorized) return

        try {
            await userStore.fetchCurrentUser()
        } catch {
            await userStore.registerUser()
        }
    }

    async function preloadCriticalHomeImages(): Promise<void> {
        const backgroundsStore = useMyBackgroundsStore()
        const itemsStore = useItemsStore()

        const activeBackground = backgroundsStore.activeBackgroundForHome
        const activeBackgroundId = activeBackground?.id ?? ''
        const activeItems =
            itemsStore.getCachedItemsWithPositionsForBackground(
                activeBackgroundId,
            ) ?? []

        await preloadImages([
            activeBackground?.picture_url ?? synthWaveGirlImage,
            activeBackground?.shop_url,
            activeBackground?.profile_url,
            activeBackground?.settings_url,
            activeBackground?.friends_url,
            ...activeItems.map(item => item.item.picture_url),
        ])
    }

    function warmLoad(): void {
        const categoriesStore = useCategoriesStore()
        const itemsStore = useItemsStore()
        const userStore = useMyUserStore()
        if (!userStore.isAuthorized) return

        void Promise.allSettled([
            categoriesStore.ensureCategoriesLoaded(),
            itemsStore.ensureItemsCatalogLoaded(),
            userStore.ensureUserSettingsLoaded(),
        ])
    }

    async function runBootstrap(force = false): Promise<void> {
        const userStore = useMyUserStore()
        const characterStore = useMyCharacterStore()
        const backgroundsStore = useMyBackgroundsStore()
        const itemsStore = useItemsStore()
        const activitiesStore = useActivitiesStore()

        const totalSteps = 8
        let completedSteps = 0

        await runStep(
            () => ensureBackendUser(),
            ++completedSteps,
            totalSteps,
        )

        if (!userStore.isAuthorized) {
            await runStep(
                () => preloadImages([synthWaveGirlImage]),
                totalSteps,
                totalSteps,
            )
            return
        }

        const character = await characterStore.loadMyCharacter(force)
        progress.value = Math.round((++completedSteps / totalSteps) * 100)

        if (!character) {
            await runStep(
                () => preloadImages([synthWaveGirlImage]),
                totalSteps,
                totalSteps,
            )
            return
        }

        await runStep(
            () => userStore.loadUserStatistic(force),
            ++completedSteps,
            totalSteps,
        )
        await runStep(
            () => backgroundsStore.ensureBackgroundsLoaded(force),
            ++completedSteps,
            totalSteps,
        )
        await runStep(
            () =>
                Promise.all([
                    activitiesStore.loadActivityTypesCatalog(force),
                    activitiesStore.loadCharacterBaseActivities(force),
                    activitiesStore.loadCharacterDailyActivities(
                        undefined,
                        force,
                    ),
                ]).then(() => undefined),
            ++completedSteps,
            totalSteps,
        )
        await runStep(
            () => itemsStore.loadCharacterItems(force),
            ++completedSteps,
            totalSteps,
        )
        await runStep(
            () => {
                const backgroundId =
                    backgroundsStore.activeBackgroundForHome?.id ?? ''

                return itemsStore
                    .loadItemsWithPositionsForBackground(backgroundId, force)
                    .then(() => undefined)
            },
            ++completedSteps,
            totalSteps,
        )
        await runStep(
            () => preloadCriticalHomeImages(),
            ++completedSteps,
            totalSteps,
        )
    }

    async function start(force = false): Promise<void> {
        if (status.value === 'ready' && !force) return
        if (bootstrapPromise && !force) return bootstrapPromise

        resetState()
        bootstrapPromise = runBootstrap(force)
            .then(() => {
                progress.value = 100
                status.value = 'ready'
                warmLoad()
            })
            .catch(() => {
                errorMessage.value = ERROR_MESSAGE
                status.value = 'error'
            })
            .finally(() => {
                clearTimers()
                bootstrapPromise = null
            })

        return bootstrapPromise
    }

    async function retry(): Promise<void> {
        await start(true)
    }

    return {
        status,
        progress,
        message,
        errorMessage,
        isReady,
        isLoading,
        isSlow,
        start,
        retry,
    }
})
