import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { isApiStatus, useApi } from '~/composables/useApi'
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
    const activityTypesLoaded = ref(false)
    const baseActivitiesLoaded = ref(false)
    const dailyActivitiesDay = ref<string | null>(null)

    let activityTypesPromise: Promise<void> | null = null
    let baseActivitiesPromise: Promise<void> | null = null
    let dailyActivitiesPromise: Promise<void> | null = null
    let dailyActivitiesPromiseDay: string | null = null

    const activityTypesCatalog = computed<ActivityType[]>(
        () => activityTypes.value,
    )

    const characterBaseActivities = computed<BaseActivity[]>(
        () => baseActivities.value,
    )
    const activityTypeById = computed(
        () => new Map(activityTypes.value.map(type => [type.id, type])),
    )
    const activityTypeIdByName = computed(
        () =>
            new Map(
                activityTypes.value.map(type => [
                    type.name.trim().toLowerCase(),
                    type.id,
                ]),
            ),
    )
    const baseActivityById = computed(
        () =>
            new Map(
                baseActivities.value.map(activity => [
                    activity.id,
                    activity,
                ]),
            ),
    )

    const defaultActivityTypeIds = computed<string[]>(() =>
        DEFAULT_ACTIVITY_NAMES.map(name =>
            getActivityTypeIdByName(name),
        ).filter((id): id is string => id != null),
    )

    const getActivityTypeName = (activityTypeId: string): string =>
        activityTypeById.value.get(activityTypeId)?.name ?? ''

    const getActivityTypeColor = (activityTypeId: string): string =>
        activityTypeById.value.get(activityTypeId)?.color ?? ''

    const getActivityTypeUnit = (activityTypeId: string): string =>
        activityTypeById.value.get(activityTypeId)?.unit ?? ''

    const getBaseActivity = (id: string): BaseActivity | undefined =>
        baseActivityById.value.get(id)

    const getActivityTypeIdByName = (name: string): string | undefined => {
        const normalized = name.trim().toLowerCase()
        return activityTypeIdByName.value.get(normalized)
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

    async function loadActivityTypesCatalog(force = false): Promise<void> {
        if (activityTypesLoaded.value && !force) return
        if (activityTypesPromise && !force) return activityTypesPromise

        activityTypesPromise = apiRequest<ActivityType[]>(
            '/activity-types/catalog',
            {
                method: 'GET',
            },
        )
            .then(data => {
                activityTypes.value = data
                activityTypesLoaded.value = true
            })
            .finally(() => {
                activityTypesPromise = null
            })

        return activityTypesPromise
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
        await loadCharacterBaseActivities(true)
    }

    async function loadCharacterBaseActivities(force = false): Promise<void> {
        if (baseActivitiesLoaded.value && !force) return
        if (baseActivitiesPromise && !force) return baseActivitiesPromise

        baseActivitiesPromise = apiRequest<BaseActivity[]>(
            '/base-character-activities/me',
            { method: 'GET' },
        )
            .then(data => {
                baseActivities.value = data
                baseActivitiesLoaded.value = true
            })
            .catch((error: unknown) => {
                if (!isApiStatus(error, 404)) throw error

                baseActivities.value = []
                baseActivitiesLoaded.value = true
            })
            .finally(() => {
                baseActivitiesPromise = null
            })

        return baseActivitiesPromise
    }

    async function updateCharacterBaseActivityGoal(
        activity_id: string,
        goal: number,
    ): Promise<void> {
        await apiRequest('/base-character-activities/me', {
            method: 'PATCH',
            body: JSON.stringify({ activity_id, goal }),
        })

        await loadCharacterBaseActivities(true)
    }

    async function loadCharacterDailyActivities(
        date?: string,
        force = false,
    ): Promise<void> {
        const day = date ?? toApiDayString(new Date())
        if (dailyActivitiesDay.value === day && !force) return
        if (
            dailyActivitiesPromise &&
            dailyActivitiesPromiseDay === day &&
            !force
        ) {
            return dailyActivitiesPromise
        }

        dailyActivitiesPromiseDay = day
        dailyActivitiesPromise = apiRequest<DailyActivity[]>(
            '/daily-activities/me',
            {
                method: 'GET',
                query: { day },
            },
        )
            .then(data => {
                dailyActivities.value = data
                dailyActivitiesDay.value = day
            })
            .finally(() => {
                dailyActivitiesPromise = null
                dailyActivitiesPromiseDay = null
            })

        return dailyActivitiesPromise
    }

    async function createCharacterDailyActivity(
        dailyActivity: DailyActivityCreate,
    ): Promise<void> {
        await apiRequest('/daily-activities/me', {
            method: 'POST',
            body: JSON.stringify(dailyActivity),
        })
        await loadCharacterDailyActivities(undefined, true)
    }

    async function updateCharacterDailyActivity(
        dailyActivity: DailyActivityUpdate,
    ): Promise<void> {
        await apiRequest('/daily-activities/me', {
            method: 'PATCH',
            body: JSON.stringify(dailyActivity),
        })

        const activity = dailyActivities.value.find(
            item => item.id === dailyActivity.activity_id,
        )
        if (activity) {
            activity.value = dailyActivity.value
            activity.goal = dailyActivity.goal
            activity.notes = dailyActivity.notes
        }
    }

    async function fetchDailyActivitiesForDay(
        date: string,
    ): Promise<DailyActivity[]> {
        return await apiRequest<DailyActivity[]>('/daily-activities/me', {
            method: 'GET',
            query: { day: date },
        })
    }

    return {
        activityTypes,
        baseActivities,
        dailyActivities,
        activityTypesLoaded,
        baseActivitiesLoaded,
        dailyActivitiesDay,

        activityTypesCatalog,
        characterBaseActivities,
        activityTypeById,
        activityTypeIdByName,
        baseActivityById,
        defaultActivityTypeIds,

        getActivityTypeName,
        getActivityTypeColor,
        getActivityTypeUnit,
        getActivityTypeIdByName,
        getBaseActivity,
        getDailyActivityForType,

        loadActivityTypesCatalog,
        ensureActivityTypesCatalogLoaded: loadActivityTypesCatalog,
        createCharacterBaseActivities,
        loadCharacterBaseActivities,
        ensureCharacterBaseActivitiesLoaded: loadCharacterBaseActivities,
        updateCharacterBaseActivityGoal,
        loadCharacterDailyActivities,
        ensureCharacterDailyActivitiesLoaded: loadCharacterDailyActivities,
        createCharacterDailyActivity,
        updateCharacterDailyActivity,
        fetchDailyActivitiesForDay,
    }
})
