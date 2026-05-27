import { computed, onScopeDispose, ref } from 'vue'

const ROOM_LOAD_SLOW_MS = 30000

const ROOM_LOADER_MESSAGES = [
    'Загружаем комнату друга',
    'Ищем активный фон',
    'Расставляем предметы',
    'Слегка наводим порядок',
    'Проверяем уровень персонажа',
    'Готовим гостевой режим',
] as const

const ROOM_LOAD_SLOW_MESSAGE =
    'Загрузка затянулась. Можно вернуться к себе и попробовать позже.'

export const ROOM_LOADER_MESSAGE_CLASS =
    'min-h-14 text-center text-lg font-extrabold leading-7 text-emerald-100 drop-shadow-[0_2px_8px_rgba(0,0,0,0.75)]'

export const useGuestRoomLoader = () => {
    const progress = ref(0)
    const messageIndex = ref(0)
    const isSlow = ref(false)

    let messageTimer: ReturnType<typeof setInterval> | null = null
    let slowTimer: ReturnType<typeof setTimeout> | null = null

    const message = computed(() => {
        if (isSlow.value) return ROOM_LOAD_SLOW_MESSAGE
        return ROOM_LOADER_MESSAGES[messageIndex.value]
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

    function start(): void {
        clearTimers()
        progress.value = 20
        messageIndex.value = 0
        isSlow.value = false

        messageTimer = setInterval(() => {
            messageIndex.value =
                (messageIndex.value + 1) % ROOM_LOADER_MESSAGES.length
            progress.value = Math.min(progress.value + 12, 90)
        }, 2500)

        slowTimer = setTimeout(() => {
            isSlow.value = true
            progress.value = Math.max(progress.value, 90)
        }, ROOM_LOAD_SLOW_MS)
    }

    function complete(): void {
        progress.value = 100
        clearTimers()
    }

    function stop(): void {
        clearTimers()
        isSlow.value = false
    }

    onScopeDispose(clearTimers)

    return {
        progress,
        message,
        isSlow,
        start,
        complete,
        stop,
    }
}
