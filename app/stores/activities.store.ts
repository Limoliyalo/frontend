import { defineStore } from 'pinia'
import { useApi } from '#imports'
import type {
    ActivityState,
    ActivityCreatePayload,
    ActivityUpdatePayload,
} from '~/types/activities/activities'
import { get } from '@nuxt/ui/runtime/utils/index.js'

export const useActivitiesStore = defineStore('activitiesStore', {
    state: (): ActivityState => ({
        activities: [],
        userActivities: [],
    }),
    getters: {
        allActivities: state => state.activities,
        getUserActivities: state => state.userActivities,
        getActivityById: state => {
            return (id: string | undefined | string[]) =>
                state.activities.find(activity => activity.id === id)
        },
        getUserActivityById: state => {
            return (id: string | undefined | string[]) =>
                state.userActivities.find(activity => activity.id === id)
        },
    },
    actions: {
        async loadActivitiesCatalog() {
            const { apiRequest } = useApi()
            try {
                this.activities = await apiRequest('/activity-types/catalog', {
                    method: 'GET',
                })
                console.log(
                    'Каталог активностей успешно загружен:',
                    this.activities
                )
            } catch (error) {
                console.error(
                    'Ошибка при загрузке каталога активностей:',
                    error
                )
            }
        },
        async loadUserActivities() {
            const { apiRequest } = useApi()
            const today = new Date().toISOString().split('T')[0]
            try {
                this.userActivities = await apiRequest('/daily-activities/me', {
                    method: 'GET',
                    query: {
                        day: today,
                    },
                })
                console.log(
                    'Пользовательские активности успешно загружены:',
                    this.userActivities
                )
            } catch (error) {
                console.error(
                    'Ошибка при загрузке пользовательских активностей:',
                    error
                )
            }
        },
        async makeUserDailyActivity(payload: ActivityCreatePayload) {
            const { apiRequest } = useApi()
            try {
                await apiRequest('/daily-activities/me', {
                    method: 'POST',
                    query: {
                        activity_type_id: payload.id,
                        date: new Date().toISOString().split('T')[0],
                        value: payload.value,
                        goal: payload.goal,
                        notes: payload.notes,
                    },
                })
                console.log(
                    'Пользовательская активность успешно создана:',
                    payload
                )
                await this.loadUserActivities()
            } catch (error) {
                console.error(
                    'Ошибка при создании пользовательской активности:',
                    error
                )
            }
        },
        async updateUserDailyActivity(payload: ActivityUpdatePayload) {
            const { apiRequest } = useApi()
            try {
                await apiRequest(`/daily-activities/${payload.id}/me`, {
                    method: 'PATCH',
                    body: JSON.stringify({
                        value: payload.value,
                        goal: payload.goal,
                        notes: payload.notes,
                    }),
                })
                console.log('Пользовательская активность успешно обновлена')
                await this.loadUserActivities()
            } catch (error) {
                console.error(
                    'Ошибка при обновлении пользовательской активности:',
                    error
                )
            }
        },
    },
})
