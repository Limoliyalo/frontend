<template>
    <div class="p-4 flex flex-col items-center min-h-screen">
        <!-- Заголовок страницы -->
        <div class="w-full max-w-lg mb-6 text-center">
            <h1 class="text-3xl font-bold">Детальная страница активности</h1>
        </div>

        <!-- Основной блок с прогрессом -->
        <div
            v-if="userActivityInfo"
            class="glass-container w-full max-w-lg p-6 rounded-2xl"
        >
            <h2 class="text-xl font-semibold mb-4 text-center">Ваш Прогресс</h2>

            <!-- Здесь может быть название активности -->
            <p class="text-lg text-center mb-3">{{ activityName }}</p>

            <!-- Визуальный прогресс-бар -->
            <div class="w-full bg-gray-700/50 rounded-full h-4 mb-2">
                <div
                    class="bg-gradient-to-r from-cyan-400 to-blue-600 h-4 rounded-full"
                    :style="{ width: progressPercentage }"
                ></div>
            </div>
            <p class="text-center text-gray-300 mb-6">
                {{ currentProgress }} / {{ userActivityInfo.goal }}
                {{ activityUnit }}
            </p>

            <!-- Кнопки управления прогрессом -->
            <div class="flex items-center justify-center gap-6 mb-8">
                <UButton
                    @click="decrement"
                    class="w-14 h-14 text-3xl rounded-full flex items-center justify-center"
                    >-</UButton
                >
                <UInput
                    v-model.number="currentProgress"
                    type="number"
                    class="text-4xl font-bold w-28 text-center"
                    :ui="{
                        base: 'text-4xl font-bold w-28 text-center',
                    }"
                />
                <UButton
                    @click="increment"
                    class="w-14 h-14 text-3xl rounded-full flex items-center justify-center"
                    >+</UButton
                >
            </div>

            <!-- Кнопка сохранения -->
            <UButton
                @click="saveChanges"
                class="w-full text-white text-center font-bold py-3 px-4 rounded-xl transition-transform transform hover:scale-105"
            >
                Сохранить изменения
            </UButton>
        </div>
        <!-- Сообщение, если данные еще не загружены или не найдены -->
        <div v-else class="text-center">
            <p>{{ activityName || 'Загрузка данных...' }}</p>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { useRoute } from 'vue-router'
import { onMounted, ref, computed } from 'vue'
import { useActivitiesStore } from '~/stores/activities.store'
import type { UserDailyActivity } from '~/types/activities/activities'

const ActivityStore = useActivitiesStore()
const route = useRoute()
const activityId = route.params.id

const activityName = ref('')
const activityUnit = ref('')
const userActivityInfo = ref<UserDailyActivity | undefined>()
const currentProgress = ref(0)

const progressPercentage = computed(() => {
    if (!userActivityInfo.value || !userActivityInfo.value.goal) {
        return '0%'
    }
    const percentage =
        (currentProgress.value / userActivityInfo.value.goal) * 100
    return `${Math.min(percentage, 100)}%`
})

const increment = () => {
    if (
        userActivityInfo.value &&
        currentProgress.value < userActivityInfo.value.goal
    ) {
        currentProgress.value++
    }
}

const decrement = () => {
    if (currentProgress.value > 0) {
        currentProgress.value--
    }
}

const saveChanges = async () => {
    if (!userActivityInfo.value) return

    await ActivityStore.updateUserDailyActivity({
        id: userActivityInfo.value.id,
        value: currentProgress.value,
    })

    alert('Прогресс сохранен!')
}

onMounted(async () => {
    await ActivityStore.loadActivitiesCatalog()
    await ActivityStore.loadUserActivities()

    const userActivity = ActivityStore.getUserActivityById(activityId)
    userActivityInfo.value = userActivity

    if (userActivity) {
        const activityType = ActivityStore.getActivityById(
            userActivity.activity_type_id
        )

        activityName.value = activityType?.name || 'Неизвестная активность'
        activityUnit.value = activityType?.unit || ''
        currentProgress.value = userActivity.value
    } else {
        activityName.value = 'Активность пользователя не найдена'
    }
})
</script>
