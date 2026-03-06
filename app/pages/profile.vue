<template>
    <div class="p-4">
        <UserinfoUserDayProgress
            :segments="[
                { progress: foodPercentage, color: foodColor },
                { progress: waterPercentage, color: waterColor },
                { progress: exercisePercentage, color: exerciseColor },
            ]"
            :background-color="['#a7f3d0', '#bfdbfe', '#fde68a']"
        />
        <CharacterBaseActivityList class="mt-5" />
    </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { useActivitiesStore } from '#imports'
import CharacterBaseActivityList from '~/components/userinfo/CharacterBaseActivityList.vue'
import type { DailyActivity } from '~/types/activities/activities'

const activityStore = useActivitiesStore()
const foodprogress = ref<DailyActivity>()
const exerciseprogress = ref<DailyActivity>()
const waterprogress = ref<DailyActivity>()
const today = new Date().toISOString().split('T')[0] || '' // YYYY-MM-DD

const foodId = computed(() => activityStore.getActivityTypeIdByName('food'))
const waterId = computed(() => activityStore.getActivityTypeIdByName('water'))
const exerciseId = computed(() =>
    activityStore.getActivityTypeIdByName('exercise'),
)

const foodColor = computed(() =>
    foodId.value
        ? activityStore.getCharacterBaseActivityColor(foodId.value)
        : '#3b82f6',
)

const waterColor = computed(() =>
    waterId.value
        ? activityStore.getCharacterBaseActivityColor(waterId.value)
        : '#10b981',
)

const exerciseColor = computed(() =>
    exerciseId.value
        ? activityStore.getCharacterBaseActivityColor(exerciseId.value)
        : '#f59e0b',
)

const foodPercentage = computed(() => {
    const activity = foodprogress.value
    if (activity && activity.goal > 0) {
        return (activity.value / activity.goal) * 100
    }
    return 0
})

const waterPercentage = computed(() => {
    const activity = waterprogress.value
    if (activity && activity.goal > 0) {
        return (activity.value / activity.goal) * 100
    }
    return 0
})

const exercisePercentage = computed(() => {
    const activity = exerciseprogress.value
    if (activity && activity.goal > 0) {
        return (activity.value / activity.goal) * 100
    }
    return 0
})

onMounted(async () => {
    await activityStore.loadActivityTypesCatalog()
    await activityStore.loadCharacterDailyActivities()
    if (foodId.value) {
        foodprogress.value = activityStore.getDailyActivityForType(
            foodId.value,
            today,
        )
    }
    if (exerciseId.value) {
        exerciseprogress.value = activityStore.getDailyActivityForType(
            exerciseId.value,
            today,
        )
    }
    if (waterId.value) {
        waterprogress.value = activityStore.getDailyActivityForType(
            waterId.value,
            today,
        )
    }
})
</script>

<style scoped></style>
