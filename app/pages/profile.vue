<template>
    <div class="p-4">
        <UserinfoUserDayProgress
            :segments="[
                { progress: foodPercentage, color: '#3b82f6' },
                { progress: waterPercentage, color: '#10b981' },
                { progress: exercisePercentage, color: '#f59e0b' },
            ]"
            :background-color="['#bfdbfe', '#a7f3d0', '#fde68a']"
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
    await activityStore.loadCharacterDailyActivities()
    foodprogress.value = activityStore.getDailyActivityForType(
        '9da5fef5-996f-4984-9fd8-b2ecabff250c',
        today
    )
    exerciseprogress.value = activityStore.getDailyActivityForType(
        'b8bfe9b6-e561-4774-b0a4-356273b09903',
        today
    )
    waterprogress.value = activityStore.getDailyActivityForType(
        'dfd67767-301b-4304-9aca-e0f720383bbb',
        today
    )
})
</script>

<style scoped></style>
