<template>
    <div class="glass-container overflow-y-auto mt-8 p-4">
        <div class="grid grid-cols-1 gap-4">
            <userinfo-user-activity
                v-for="activity in combinedActivities"
                :key="activity.id"
                :text="activity.name"
                :color="activity.color"
                :goal="activity.goal"
                :unit="activity.unit"
                :value="activity.value"
            />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, computed } from 'vue'
import { useActivitiesStore } from '~/stores/activities.store'

const activitiesStore = useActivitiesStore()

onMounted(async () => {
    await activitiesStore.loadUserActivities()
    await activitiesStore.loadActivitiesCatalog()
})

const combinedActivities = computed(() => {
    const userActivities = activitiesStore.getUserActivities
    const catalog = activitiesStore.allActivities

    if (!userActivities.length || !catalog.length) {
        return []
    }

    return userActivities.map(userActivity => {
        const activityType = catalog.find(
            type => type.id === userActivity.activity_type_id
        )
        return {
            id: userActivity.id,
            name: activityType?.name || 'Unknown Activity',
            color: activityType?.color || '#FFFFFF',
            unit: activityType?.unit || '',
            goal: userActivity.goal,
            value: userActivity.value,
        }
    })
})
</script>

<style scoped></style>
