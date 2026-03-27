<template>
    <div class="p-4 flex flex-col items-center gap-8 container mx-auto">
        <!-- Название активности -->
        <h1 v-if="currentBaseActivity" class="text-3xl font-bold text-white">
            Название Активности
            {{
                activitiesStore.getActivityTypeName(
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

        <!-- Статистика за неделю -->
        <div class="w-full max-w-lg">
            <UserinfoActivityWeeklyChart
                :chart-data="chartData"
                :color="activityColor"
            />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useActivitiesStore, onMounted } from '#imports'

const activitiesStore = useActivitiesStore()
const route = useRoute()
const baseActivityID = ref(route.params.id)
const currentBaseActivity = activitiesStore.getBaseActivity(
    baseActivityID.value as string
)!
const progressValue = ref(0)
const dailyActivityId = ref<string | null>(null)

const RU_DAYS = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']

interface ChartItem {
    date: string
    percentage: number
    dayLabel: string
    isToday: boolean
}

const chartData = ref<ChartItem[]>([])

const activityColor = computed(() =>
    activitiesStore.getActivityTypeColor(
        currentBaseActivity?.activity_type_id ?? ''
    )
)

onMounted(async () => {
    const activityTypeId = currentBaseActivity.activity_type_id

    await activitiesStore.loadCharacterDailyActivities()

    const today = new Date().toISOString().split('T')[0] || ''
    const daily = activitiesStore.getDailyActivityForType(activityTypeId, today)

    if (daily) {
        dailyActivityId.value = daily.id
        progressValue.value = daily.value
    } else {
        dailyActivityId.value = null
        progressValue.value = 0
    }

    // Fetch last 7 days for the weekly chart
    const todayDate = new Date()
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(todayDate)
        d.setDate(d.getDate() - (6 - i))
        return d
    })

    const dayStrings = last7Days.map(
        d => d.toISOString().split('T')[0] + 'T00:00:00.000Z'
    )

    const results = await Promise.allSettled(
        dayStrings.map(day => activitiesStore.fetchDailyActivitiesForDay(day))
    )

    chartData.value = last7Days.map((d, i) => {
        const dateKey = d.toISOString().split('T')[0]!
        const isToday = dateKey === today
        const result = results[i]
        const entries = result?.status === 'fulfilled' ? result.value : []
        const entry = entries.find(a => a.activity_type_id === activityTypeId)
        const percentage = entry && entry.goal > 0
            ? Math.min((entry.value / entry.goal) * 100, 100)
            : 0

        return {
            date: dateKey,
            percentage,
            dayLabel: RU_DAYS[d.getDay()]!,
            isToday,
        }
    })
})

const increment = () => {
    if (progressValue.value < (currentBaseActivity?.goal ?? Infinity)) {
        progressValue.value++
    }
}
const decrement = () => {
    if (progressValue.value > 0) progressValue.value--
}

const applyChanges = async () => {
    const activityTypeId = currentBaseActivity.activity_type_id
    const todayDate = `${new Date().toISOString().split('T')[0]}T00:00:00Z`

    if (dailyActivityId.value === null) {
        await activitiesStore.createCharacterDailyActivity({
            activity_type_id: activityTypeId,
            date: todayDate,
            value: progressValue.value,
            goal: currentBaseActivity.goal,
            notes: '',
        })
    } else {
        await activitiesStore.updateCharacterDailyActivity({
            activity_id: dailyActivityId.value,
            value: progressValue.value,
            goal: currentBaseActivity.goal,
            notes: '',
        })
    }
    alert('Изменения сохранены')
}
</script>

<style></style>
