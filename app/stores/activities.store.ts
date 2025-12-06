import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useApi } from '#imports'
import type {
    ActivityType,
    BaseActivity,
    DailyActivity,
    DailyActivityCreate,
    DailyActivityUpdate,
} from '~/types/activities/activities'

export const useActivitiesStore = defineStore('activities', () => {
    const activityTypes = ref<ActivityType[]>([])
    const baseActivities = ref<BaseActivity[]>([])
    const dailyActivities = ref<DailyActivity[]>([])

    // Getters
    const getActivityTypesCatalog = computed(() => activityTypes.value)
    const getCharacterBaseActivities = computed(() => baseActivities.value)
    const getCharacterBaseActivityName = (activityTypeId: string) => {
        const activity = activityTypes.value.find(
            activity => activity.id === activityTypeId
        )
        return activity ? activity.name : ''
    }
    const getCharacterBaseActivityColor = (activityTypeId: string) => {
        const color = activityTypes.value.find(
            activity => activity.id === activityTypeId
        )
        return color ? color.color : ''
    }
    const getCurrentBaseActivity = (id: string): BaseActivity | undefined => {
        return baseActivities.value.find(activity => activity.id === id)
    }
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

    async function loadCharacterBaseActivities() {
        const { apiRequest } = useApi()
        try {
            baseActivities.value = await apiRequest(
                '/base-character-activities/me',
                {
                    method: 'GET',
                }
            )
            console.log(
                'Базовые активности персонажа успешно загружены:',
                baseActivities.value
            )
        } catch (error) {
            console.error(
                'Ошибка при загрузке базовых активностей персонажа:',
                error
            )
        }
    }

    async function loadCharacterDailyActivities(date?: string) {
        const { apiRequest } = useApi()
        try {
            const day =
                date ??
                new Date().toISOString().split('T')[0] + 'T00:00:00.000Z'

            dailyActivities.value = await apiRequest(
                `/daily-activities/me?day=${day}`,
                {
                    method: 'GET',
                }
            )

            console.log(
                'Ежедневные активности персонажа успешно загружены:',
                dailyActivities.value
            )
        } catch (error) {
            console.error(
                'Ошибка при загрузке ежедневных активностей персонажа:',
                error
            )
        }
    }

    async function createCharacterDailyActivity(
        dailyActivity: DailyActivityCreate
    ) {
        const { apiRequest } = useApi()
        try {
            await apiRequest('/daily-activities/me', {
                method: 'POST',
                body: JSON.stringify(dailyActivity),
            })

            console.log('Ежедневная активность персонажа успешно создана.')
        } catch (error) {
            console.error(
                'Ошибка при создании ежедневной активности персонажа:',
                error
            )
        }
    }

    async function updateCharacterDailyActivity(
        dailyActivity: DailyActivityUpdate
    ) {
        const { apiRequest } = useApi()
        try {
            await apiRequest('/daily-activities/me', {
                method: 'PATCH',
                body: JSON.stringify(dailyActivity),
            })

            console.log('Ежедневная активность персонажа успешно обновлена.')
        } catch (error) {
            console.error(
                'Ошибка при обновлении ежедневной активности персонажа:',
                error
            )
        }
    }

    function getDailyActivityForType(activityTypeId: string, date: string) {
        return dailyActivities.value.find(
            daily =>
                daily.activity_type_id === activityTypeId &&
                daily.date.startsWith(date) // проверка на день
        )
    }

    return {
        loadActivityTypesCatalog,
        getActivityTypesCatalog,
        createCharacterBaseActivities,
        loadCharacterBaseActivities,
        getCharacterBaseActivities,
        getCharacterBaseActivityName,
        getCharacterBaseActivityColor,
        getCurrentBaseActivity,
        loadCharacterDailyActivities,
        createCharacterDailyActivity,
        updateCharacterDailyActivity,
        getDailyActivityForType,
    }
})
