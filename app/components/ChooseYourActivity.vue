<template>
    <div
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
import { ref, onMounted } from 'vue'
import { useActivitiesStore } from '~/stores/activities.store'
import type {
    ActivityType,
    ActivityCreatePayload,
} from '~/types/activities/activities'

const activitiesStore = useActivitiesStore()

// We create a new type that includes a 'selected' flag for the checkbox
type SelectableActivity = ActivityType & {
    selected: boolean
    value: number
    goal: number
    notes: string | null
}

const allActivities = ref<SelectableActivity[]>([])

onMounted(async () => {
    await activitiesStore.loadActivitiesCatalog()
    // We map the original activities to our new type, adding the 'selected' property
    allActivities.value = activitiesStore.allActivities.map(activity => ({
        ...activity,
        selected: false,
        value: 0,
        goal: activity.daily_goal_default,
        notes: null,
    }))
})

async function Submit(userDailyActivities: SelectableActivity[]) {
    userDailyActivities.forEach(element => {
        if (element.selected) {
            activitiesStore.makeUserDailyActivity(element)
        }
    })
}
</script>

<style></style>
