<template>
    <div
        v-if="isVisible"
        class="fixed top-0 left-0 w-dvw h-dvh z-1000 flex flex-col items-center justify-center"
    >
        <h1
            class="flex self-center justify-self-center p-4 mb-5 glass-container"
        >
            Выберите свои активности
        </h1>
        <div class="glass-container max-h-63 overflow-y-auto">
            <div
                v-for="(activity, index) in allActivities"
                :key="activity.id"
                :style="{ backgroundColor: activity.color }"
                class="glass-container flex items-center justify-between mb-4"
            >
                <p>{{ activity.name }}</p>
                <div class="flex items-center justify-between gap-3">
                    <p>{{ activity.daily_goal_default }}</p>
                    <p>{{ activity.unit }}</p>
                    <UCheckbox v-if="index >= 3" v-model="activity.selected" />
                </div>
            </div>
        </div>
        <button
            class="flex self-center justify-self-center mt-5 glass-container cursor-pointer"
            @click="Submit"
        >
            Применить
        </button>
    </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useActivitiesStore } from '~/stores/activities.store'
import { useMyCharacterStore } from '~/stores/character.store'
import type { ActivityType } from '~/types/activities/activities'

const activitiesStore = useActivitiesStore()
const characterStore = useMyCharacterStore()

const isVisible = ref(false)

// We create a new type that includes a 'selected' flag for the checkbox
type SelectableActivity = ActivityType & {
    selected: boolean
    value: number
    goal: number
    notes: string | null
}

const allActivities = ref<SelectableActivity[]>([])

watch(
    () => characterStore.isRegistered,
    async isRegistered => {
        if (isRegistered) {
            await activitiesStore.loadUserActivities()
            if (activitiesStore.userActivities.length === 0) {
                await activitiesStore.loadActivitiesCatalog()
                allActivities.value = activitiesStore.allActivities.map(
                    activity => ({
                        ...activity,
                        selected: false,
                        value: 0,
                        goal: activity.daily_goal_default,
                        notes: null,
                    })
                )
                isVisible.value = true
            } else {
                isVisible.value = false
            }
        } else {
            isVisible.value = false
        }
    },
    { immediate: true }
)

async function Submit() {
    const activitiesToSubmit = allActivities.value.filter(
        (activity, index) => index < 3 || activity.selected
    )

    if (activitiesToSubmit.length === 0) {
        isVisible.value = false
        return
    }

    const promises = activitiesToSubmit.map(activity =>
        activitiesStore.makeUserDailyActivity({
            activity_type_id: activity.id,
            goal: activity.goal,
        })
    )

    try {
        await Promise.all(promises)
        isVisible.value = false
        alert('Activities submitted successfully!')
    } catch (error) {
        console.error('Failed to submit activities:', error)
        alert('Failed to submit activities. Please try again later.')
    }
}
</script>

<style></style>
