<template>
    <div>
        <div
            class="container mx-auto mb-2 flex flex-col items-center gap-8 p-4"
        >
            <!-- Цель, прогресс, управление и сохранение — один контейнер -->
            <div
                v-if="currentBaseActivity"
                class="w-full max-w-lg glass-container flex flex-col gap-6 rounded-2xl p-4"
            >
                <h2 class="text-center text-xl font-bold text-white">
                    {{
                        activitiesStore.getActivityTypeName(
                            currentBaseActivity.activity_type_id,
                        )
                    }}
                </h2>

                <!-- Шкала прогресса и редактирование цели в строке под баром -->
                <div>
                    <UProgress
                        v-model="progressValue"
                        :max="effectiveGoalMax"
                        size="2xl"
                        color="success"
                        class="w-full"
                    />
                    <div
                        class="mt-4 flex flex-wrap items-center justify-center gap-x-0 gap-y-2 text-white"
                    >
                        <span
                            class="inline-flex min-h-10 items-center text-lg font-medium tabular-nums leading-none"
                        >
                            {{ progressValue }}/
                        </span>
                        <button
                            v-if="!goalEditing"
                            type="button"
                            class="inline-flex min-h-10 cursor-text items-center border-0 bg-transparent p-0 text-lg font-medium tabular-nums leading-none text-white hover:opacity-90 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40"
                            @click="startGoalEdit"
                        >
                            {{ goalDraft }}
                        </button>
                        <input
                            v-else
                            ref="goalInputRef"
                            v-model="goalDraftEdit"
                            type="text"
                            inputmode="numeric"
                            autocomplete="off"
                            class="inline-block min-h-10 min-w-[3ch] max-w-[12ch] border-0 bg-transparent p-0 text-lg font-medium tabular-nums leading-none text-white outline-none ring-0 focus:ring-0"
                            :style="{ width: `${Math.max(goalDraftEdit.length || 1, 2)}ch` }"
                            @blur="commitGoalEdit"
                            @keydown.enter.prevent="commitGoalEdit"
                        />
                    </div>
                    <div
                        v-if="goalError"
                        class="mt-3 text-center text-sm text-white"
                    >
                        {{ goalError }}
                    </div>
                </div>

                <!-- Управление прогрессом -->
                <div class="flex items-center justify-center gap-4">
                    <UButton
                        icon="i-heroicons-minus-solid"
                        size="xl"
                        class="rounded-full"
                        @click="decrement"
                    />
                    <UInput
                        type="number"
                        size="xl"
                        class="w-28 rounded-md border border-white/30 bg-black/20 text-center text-white placeholder:text-white/50"
                        v-model.number="progressValue"
                    />
                    <UButton
                        icon="i-heroicons-plus-solid"
                        size="xl"
                        class="rounded-full"
                        @click="increment"
                    />
                </div>

                <div class="flex justify-center">
                    <UButton
                        size="xl"
                        :loading="isSaving"
                        :disabled="!canSubmitChanges"
                        @click="saveAllChanges"
                    >
                        Сохранить изменения
                    </UButton>
                </div>
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
import { ref, computed, watch, onMounted, nextTick } from 'vue'
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
const savedProgressValue = ref(0)
const dailyActivityId = ref<string | null>(null)
const goalDraft = ref<number>(1)
const goalEditing = ref(false)
const goalDraftEdit = ref('')
const goalInputRef = ref<HTMLInputElement | null>(null)
const rollbackGoalSnapshot = ref(1)
const isSaving = ref(false)
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
        if (goalEditing.value) return
        if (typeof goal === 'number') goalDraft.value = goal
    },
    { immediate: true },
)

const startGoalEdit = () => {
    rollbackGoalSnapshot.value = goalDraft.value
    goalDraftEdit.value = String(goalDraft.value)
    goalEditing.value = true
    nextTick(() => {
        goalInputRef.value?.focus()
        goalInputRef.value?.select()
    })
}

const commitGoalEdit = () => {
    const raw = goalDraftEdit.value.trim()
    const parsed = Number.parseInt(raw, 10)
    const valid =
        raw !== '' &&
        Number.isFinite(parsed) &&
        Number.isInteger(parsed) &&
        parsed >= 1

    goalDraft.value = valid ? parsed : rollbackGoalSnapshot.value
    goalEditing.value = false
}

const goalDraftValid = computed(() => {
    const base = currentBaseActivity.value
    if (!base) return false
    return Number.isInteger(goalDraft.value) && goalDraft.value >= 1
})

const hasGoalChange = computed(() => {
    const base = currentBaseActivity.value
    if (!base) return false
    return goalDraft.value !== base.goal
})

const hasProgressChange = computed(
    () => progressValue.value !== savedProgressValue.value,
)

const canSubmitChanges = computed(() => {
    if (!currentBaseActivity.value) return false
    return (
        hasProgressChange.value ||
        (goalDraftValid.value && hasGoalChange.value)
    )
})

/** Лимит бара и «+»: черновик цели при валидном вводе, иначе сохранённая цель */
const effectiveGoalMax = computed(() => {
    const base = currentBaseActivity.value
    if (!base) return 1
    if (goalDraftValid.value) return goalDraft.value
    return Math.max(1, base.goal)
})

watch(effectiveGoalMax, max => {
    if (progressValue.value > max) progressValue.value = max
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
        savedProgressValue.value = daily.value
    } else {
        dailyActivityId.value = null
        progressValue.value = 0
        savedProgressValue.value = 0
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
    if (progressValue.value < effectiveGoalMax.value) {
        progressValue.value++
    }
}
const decrement = () => {
    if (progressValue.value > 0) progressValue.value--
}

const saveAllChanges = async () => {
    goalError.value = null

    if (!canSubmitChanges.value) return

    const base = currentBaseActivity.value
    if (!base) return

    const needGoal =
        goalDraftValid.value &&
        base.goal !== goalDraft.value

    try {
        isSaving.value = true

        if (needGoal) {
            await activitiesStore.updateCharacterBaseActivityGoal(
                base.id,
                goalDraft.value,
            )
            if (progressValue.value > goalDraft.value) {
                progressValue.value = goalDraft.value
            }
        }

        const baseAfter = currentBaseActivity.value
        if (!baseAfter) return

        const progressDirty =
            progressValue.value !== savedProgressValue.value

        if (progressDirty) {
            const activityTypeId = baseAfter.activity_type_id
            const todayDate = `${new Date().toISOString().split('T')[0]}T00:00:00Z`

            if (dailyActivityId.value === null) {
                await activitiesStore.createCharacterDailyActivity({
                    activity_type_id: activityTypeId,
                    date: todayDate,
                    value: progressValue.value,
                    goal: baseAfter.goal,
                    notes: '',
                })
                await activitiesStore.loadCharacterDailyActivities()
                const today =
                    new Date().toISOString().split('T')[0] || ''
                const created =
                    activitiesStore.getDailyActivityForType(
                        activityTypeId,
                        today,
                    )
                if (created) dailyActivityId.value = created.id
            } else {
                await activitiesStore.updateCharacterDailyActivity({
                    activity_id: dailyActivityId.value,
                    value: progressValue.value,
                    goal: baseAfter.goal,
                    notes: '',
                })
            }
        }

        savedProgressValue.value = progressValue.value
        alert('Изменения сохранены')
    } catch {
        goalError.value =
            'Не удалось сохранить изменения. Попробуйте ещё раз.'
    } finally {
        isSaving.value = false
    }
}
</script>

<style></style>
