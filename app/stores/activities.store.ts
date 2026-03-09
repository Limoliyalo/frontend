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

const toApiDayString = (date: Date): string =>
    date.toISOString().split('T')[0] + 'T00:00:00.000Z'

const DEFAULT_ACTIVITY_NAMES = ['water', 'food', 'exercise'] as const

export const useActivitiesStore = defineStore('activities', () => {
    const { apiRequest } = useApi()

    const activityTypes = ref<ActivityType[]>([])
    const baseActivities = ref<BaseActivity[]>([])
    const dailyActivities = ref<DailyActivity[]>([])

    const activityTypesCatalog = computed<ActivityType[]>(
        () => activityTypes.value,
    )

    const characterBaseActivities = computed<BaseActivity[]>(
        () => baseActivities.value,
    )

    const defaultActivityTypeIds = computed<string[]>(() =>
        DEFAULT_ACTIVITY_NAMES.map(name =>
            getActivityTypeIdByName(name),
        ).filter((id): id is string => id != null),
    )

    const getActivityTypeName = (activityTypeId: string): string =>
        activityTypes.value.find(a => a.id === activityTypeId)?.name ?? ''

    const getActivityTypeColor = (activityTypeId: string): string =>
        activityTypes.value.find(a => a.id === activityTypeId)?.color ?? ''

    const getBaseActivity = (id: string): BaseActivity | undefined =>
        baseActivities.value.find(a => a.id === id)

    const getActivityTypeIdByName = (name: string): string | undefined => {
        const normalized = name.trim().toLowerCase()
        return activityTypes.value.find(
            t => t.name.trim().toLowerCase() === normalized,
        )?.id
    }

    const getDailyActivityForType = (
        activityTypeId: string,
        date: string,
    ): DailyActivity | undefined =>
        dailyActivities.value.find(
            d =>
                d.activity_type_id === activityTypeId &&
                d.date.startsWith(date),
        )

    async function loadActivityTypesCatalog(): Promise<void> {
        if (activityTypes.value.length > 0) return

        const data = await apiRequest<ActivityType[]>(
            '/activity-types/catalog',
            {
                method: 'GET',
            },
        )

        activityTypes.value = data
    }

    async function createCharacterBaseActivities(
        activityTypeIds: string[],
    ): Promise<void> {
        await Promise.all(
            activityTypeIds.map(activity_type_id =>
                apiRequest('/base-character-activities/me', {
                    method: 'POST',
                    body: JSON.stringify({ activity_type_id }),
                }),
            ),
        )
    }

    async function loadCharacterBaseActivities(): Promise<void> {
        baseActivities.value = await apiRequest<BaseActivity[]>(
            '/base-character-activities/me',
            { method: 'GET' },
        )
    }

    async function loadCharacterDailyActivities(date?: string): Promise<void> {
        const day = date ?? toApiDayString(new Date())

        dailyActivities.value = await apiRequest<DailyActivity[]>(
            `/daily-activities/me?day=${day}`,
            { method: 'GET' },
        )
    }

    async function createCharacterDailyActivity(
        dailyActivity: DailyActivityCreate,
    ): Promise<void> {
        await apiRequest('/daily-activities/me', {
            method: 'POST',
            body: JSON.stringify(dailyActivity),
        })
    }

    async function updateCharacterDailyActivity(
        dailyActivity: DailyActivityUpdate,
    ): Promise<void> {
        await apiRequest('/daily-activities/me', {
            method: 'PATCH',
            body: JSON.stringify(dailyActivity),
        })
    }

    return {
        activityTypes,
        baseActivities,
        dailyActivities,

        activityTypesCatalog,
        characterBaseActivities,
        defaultActivityTypeIds,

        getActivityTypeName,
        getActivityTypeColor,
        getActivityTypeIdByName,
        getBaseActivity,
        getDailyActivityForType,

        loadActivityTypesCatalog,
        createCharacterBaseActivities,
        loadCharacterBaseActivities,
        loadCharacterDailyActivities,
        createCharacterDailyActivity,
        updateCharacterDailyActivity,
    }
})
