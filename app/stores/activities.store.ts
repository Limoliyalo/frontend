import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useApi } from '#imports'
import type {
    ActivityType,
    BaseActivity,
    DailyActivity,
} from '~/types/activities/activities'

export const useActivitiesStore = defineStore('activities', () => {
    const activityTypes = ref<ActivityType[]>([])
    const baseActivities = ref<BaseActivity[]>([])
    const dailyActivities = ref<DailyActivity[]>([])

    // Getters
    const getActivityTypesCatalog = computed(() => activityTypes.value)

    // Actions
    async function loadActivityTypesCatalog() {
        const { apiRequest } = useApi()
        try {
            const data: ActivityType[] = await apiRequest(
                '/activity-types/catalog',
                {
                    method: 'GET',
                }
            )
            activityTypes.value = data
            console.log('Каталог типов активностей успешно загружен:', data)
        } catch (error) {
            console.error(
                'Ошибка при загрузке каталога типов активностей:',
                error
            )
        }
    }

    async function createCharacterBaseActivities(activities: string[]) {
        const { apiRequest } = useApi()
        try {
            for (const activityType of activities) {
                const payload = {
                    activity_type_id: activityType,
                }
                await apiRequest('/base-character-activities/me', {
                    method: 'POST',
                    body: JSON.stringify(payload),
                })
            }
            console.log('Базовые активности персонажа успешно созданы.')
        } catch (error) {
            console.error(
                'Ошибка при создании базовых активностей персонажа:',
                error
            )
        }
    }

    return {
        loadActivityTypesCatalog,
        getActivityTypesCatalog,
        createCharacterBaseActivities,
    }
})
