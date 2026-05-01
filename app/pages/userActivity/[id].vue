<template>
    <div>
        <div
            class="container mx-auto mb-2 flex flex-col items-center gap-8 p-4"
        >
            <h2
                v-if="currentBaseActivity"
                class="text-center text-xl font-bold text-white"
            >
                {{
                    activitiesStore.getActivityTypeName(
                        currentBaseActivity.activity_type_id,
                    )
                }}
            </h2>

            <!-- Редактирование цели -->
            <div
                v-if="currentBaseActivity"
                class="w-full max-w-lg glass-container p-4 rounded-2xl"
            >
                <div class="flex items-center justify-between gap-4">
                    <div class="text-white">
                        <div class="text-sm opacity-80">Цель</div>
                        <div class="text-lg font-semibold">
                            {{ currentBaseActivity.goal }}
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <UInput
                            type="number"
                            min="1"
                            step="1"
                            size="lg"
                            class="w-28 text-center bg-black/20 text-white border border-white/30 placeholder:text-white/50 rounded-md"
                            v-model.number="goalDraft"
                        />
                        <UButton
                            size="lg"
                            :loading="isSavingGoal"
                            :disabled="!canSaveGoal"
                            @click="saveGoal"
                        >
                            Сохранить цель
                        </UButton>
                    </div>
                </div>
                <div v-if="goalError" class="text-white text-sm mt-2">
                    {{ goalError }}
                </div>
            </div>

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
                    class="w-28 text-center bg-black/20 text-white border border-white/30 placeholder:text-white/50 rounded-md"
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
    </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useActivitiesStore } from '#imports'
import { useMyBackgroundsStore } from '~/stores/backgrounds.store'

definePageMeta({
    layout: 'inner-page',
    pageTitle: 'Активность',
    scrollMainContent: true,
})

const activitiesStore = useActivitiesStore()
const backgroundsStore = useMyBackgroundsStore()
const { activeBackgroundForHome } = storeToRefs(backgroundsStore)
const route = useRoute()
const baseActivityID = computed(() => route.params.id as string)
const currentBaseActivity = computed(() =>
    activitiesStore.getBaseActivity(baseActivityID.value),
)
const progressValue = ref(0)
const dailyActivityId = ref<string | null>(null)
const goalDraft = ref<number>(1)
const isSavingGoal = ref(false)
const goalError = ref<string | null>(null)

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
        currentBaseActivity.value?.activity_type_id ?? '',
    ),
)

watch(
    () => currentBaseActivity.value?.goal,
    goal => {
        if (typeof goal === 'number') goalDraft.value = goal
    },
    { immediate: true },
)

const canSaveGoal = computed(() => {
    const base = currentBaseActivity.value
    if (!base) return false
    if (!Number.isInteger(goalDraft.value) || goalDraft.value < 1) return false
    return goalDraft.value !== base.goal
})

onMounted(async () => {
    await Promise.all([
        activitiesStore.loadActivityTypesCatalog(),
        activitiesStore.loadCharacterBaseActivities(),
        backgroundsStore.ensureBackgroundsLoaded(),
    ])

    const base = currentBaseActivity.value
    if (!base) return

    const activityTypeId = base.activity_type_id

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
        d => d.toISOString().split('T')[0] + 'T00:00:00.000Z',
    )

    const results = await Promise.allSettled(
        dayStrings.map(day => activitiesStore.fetchDailyActivitiesForDay(day)),
    )

    chartData.value = last7Days.map((d, i) => {
        const dateKey = d.toISOString().split('T')[0]!
        const isToday = dateKey === today
        const result = results[i]
        const entries = result?.status === 'fulfilled' ? result.value : []
        const entry = entries.find(a => a.activity_type_id === activityTypeId)
        const percentage =
            entry && entry.goal > 0
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
    if (progressValue.value < (currentBaseActivity.value?.goal ?? Infinity)) {
        progressValue.value++
    }
}
const decrement = () => {
    if (progressValue.value > 0) progressValue.value--
}

const saveGoal = async () => {
    goalError.value = null
    const base = currentBaseActivity.value
    if (!base) return

    if (!Number.isInteger(goalDraft.value) || goalDraft.value < 1) {
        goalError.value = 'Введите целое число (минимум 1)'
        return
    }

    try {
        isSavingGoal.value = true
        await activitiesStore.updateCharacterBaseActivityGoal(
            base.id,
            goalDraft.value,
        )

        if (progressValue.value > goalDraft.value) {
            progressValue.value = goalDraft.value
        }
    } catch {
        goalError.value = 'Не удалось сохранить цель. Попробуйте ещё раз.'
    } finally {
        isSavingGoal.value = false
    }
}

const applyChanges = async () => {
    const base = currentBaseActivity.value
    if (!base) return

    const activityTypeId = base.activity_type_id
    const todayDate = `${new Date().toISOString().split('T')[0]}T00:00:00Z`

    if (dailyActivityId.value === null) {
        await activitiesStore.createCharacterDailyActivity({
            activity_type_id: activityTypeId,
            date: todayDate,
            value: progressValue.value,
            goal: base.goal,
            notes: '',
        })
    } else {
        await activitiesStore.updateCharacterDailyActivity({
            activity_id: dailyActivityId.value,
            value: progressValue.value,
            goal: base.goal,
            notes: '',
        })
    }
    alert('Изменения сохранены')
}
</script>

<style></style>
