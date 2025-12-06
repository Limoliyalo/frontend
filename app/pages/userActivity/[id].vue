<template>
    <div class="p-4 flex flex-col items-center gap-8 container mx-auto">
        <!-- Название активности -->
        <h1 v-if="currentBaseActivity" class="text-3xl font-bold text-white">
            Название Активности
            {{
                activitiesStore.getCharacterBaseActivityName(
                    currentBaseActivity?.activity_type_id
                )
            }}
        </h1>

        <!-- Шкала прогресса -->
        <div class="w-full max-w-lg">
            <UProgress
                v-model="progressValue"
                :max="currentBaseActivity?.goal"
            />
            <div class="text-center text-white mt-2">
                {{ progressValue }}/{{ currentBaseActivity?.goal }}
            </div>
        </div>

        <!-- Управление прогрессом -->
        <div class="flex items-center gap-4">
            <UButton
                icon="i-heroicons-minus-solid"
                size="xl"
                class="rounded-full"
                @click="decrement"
            />
            <UInput
                type="number"
                size="xl"
                class="w-28 text-center"
                v-model.number="progressValue"
            />
            <UButton
                icon="i-heroicons-plus-solid"
                size="xl"
                class="rounded-full"
                @click="increment"
            />
        </div>

        <!-- Кнопка Применить -->
        <div>
            <UButton size="xl" @click="applyChanges">Применить</UButton>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { useActivitiesStore, onMounted } from '#imports'

const activitiesStore = useActivitiesStore()
const route = useRoute()
const baseActivityID = ref(route.params.id)
const currentBaseActivity = activitiesStore.getCurrentBaseActivity(
    baseActivityID.value as string
)!
const progressValue = ref(0)
const dailyActivityId = ref<string | null>(null)

onMounted(async () => {
    const activityTypeId = currentBaseActivity.activity_type_id

    // 1. Загружаем daily activities за сегодня
    await activitiesStore.loadCharacterDailyActivities()

    // 2. Ищем запись для этого activity_type_id
    const today = new Date().toISOString().split('T')[0] || '' // YYYY-MM-DD
    const daily = activitiesStore.getDailyActivityForType(activityTypeId, today)

    if (daily) {
        // Уже существует
        dailyActivityId.value = daily.id
        progressValue.value = daily.value
    } else {
        // Ещё нет записи
        dailyActivityId.value = null
        progressValue.value = 0
    }
})

const increment = () => {
    if (progressValue.value < 100) progressValue.value++
}
const decrement = () => {
    if (progressValue.value > 0) progressValue.value--
}

const applyChanges = async () => {
    const activityTypeId = currentBaseActivity.activity_type_id
    const todayDate = `${new Date().toISOString().split('T')[0]}T00:00:00Z`

    if (dailyActivityId.value === null) {
        // Создаём новую запись
        await activitiesStore.createCharacterDailyActivity({
            activity_type_id: activityTypeId,
            date: todayDate,
            value: progressValue.value,
            goal: currentBaseActivity.goal,
            notes: '',
        })
    } else {
        // Обновляем существующую запись
        await activitiesStore.updateCharacterDailyActivity({
            activity_id: dailyActivityId.value,
            value: progressValue.value,
            goal: currentBaseActivity.goal,
            notes: '',
        })
    }
}
</script>

<style></style>
