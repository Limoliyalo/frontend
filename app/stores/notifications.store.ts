import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useApi } from '#imports'
import type {
    NotificationStatus,
    NotificationStopResponse,
} from '~/types/notifications/notifications'

const MIN_INTERVAL_MINUTES = 1

export const useNotificationsStore = defineStore('notifications', () => {
    const { apiRequest } = useApi()

    const status = ref<NotificationStatus | null>(null)
    const statusLoading = ref(false)
    const error = ref<string | null>(null)

    async function fetchStatus(): Promise<void> {
        error.value = null
        statusLoading.value = true
        try {
            status.value = await apiRequest<NotificationStatus>(
                '/notifications/status',
                { method: 'GET' },
            )
        } catch (e: unknown) {
            error.value =
                e instanceof Error ? e.message : 'Не удалось загрузить статус'
        } finally {
            statusLoading.value = false
        }
    }

    function validateInterval(minutes: number): string | null {
        if (!Number.isFinite(minutes) || !Number.isInteger(minutes)) {
            return 'Введите целое число минут'
        }
        if (minutes < MIN_INTERVAL_MINUTES) {
            return `Интервал не меньше ${MIN_INTERVAL_MINUTES} минуты`
        }
        return null
    }

    async function startNotifications(
        notificationTime: number,
    ): Promise<boolean> {
        const validationError = validateInterval(notificationTime)
        if (validationError) {
            error.value = validationError
            return false
        }

        error.value = null
        try {
            await apiRequest('/notifications/start', {
                method: 'POST',
                body: JSON.stringify({
                    notification_time: notificationTime,
                }),
            })
            await fetchStatus()
            return true
        } catch (e: unknown) {
            error.value =
                e instanceof Error
                    ? e.message
                    : 'Не удалось включить напоминания'
            return false
        }
    }

    async function stopNotifications(): Promise<boolean> {
        error.value = null
        try {
            await apiRequest<NotificationStopResponse>('/notifications/stop', {
                method: 'POST',
            })
            await fetchStatus()
            return true
        } catch (e: unknown) {
            error.value =
                e instanceof Error
                    ? e.message
                    : 'Не удалось выключить напоминания'
            return false
        }
    }

    return {
        status,
        statusLoading,
        error,
        fetchStatus,
        startNotifications,
        stopNotifications,
    }
})
