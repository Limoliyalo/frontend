<template>
    <div class="p-4 flex flex-col items-center min-h-screen">
        <!-- Заголовок страницы -->
        <div class="w-full max-w-lg mb-6 text-center">
            <h1 class="text-3xl font-bold">Детальная страница активности</h1>
            <p class="mt-2 text-sm text-gray-500">
                ID:
                <span class="font-mono bg-gray-200 p-1 rounded">{{
                    activityId
                }}</span>
            </p>
        </div>

        <!-- Основной блок с прогрессом -->
        <div class="glass-container w-full max-w-lg p-6 rounded-2xl">
            <h2 class="text-xl font-semibold mb-4 text-center">Ваш Прогресс</h2>

            <!-- Здесь может быть название активности -->
            <p class="text-lg text-center mb-3">{{ activityName }}</p>

            <!-- Визуальный прогресс-бар -->
            <div class="w-full bg-gray-700/50 rounded-full h-4 mb-2">
                <!-- Ширина этого div будет меняться в зависимости от прогресса -->
                <div
                    class="bg-gradient-to-r from-cyan-400 to-blue-600 h-4 rounded-full"
                    style="width: 45%"
                ></div>
            </div>
            <p class="text-center text-gray-300 mb-6">45 / 100 раз</p>

            <!-- Кнопки управления прогрессом -->
            <div class="flex items-center justify-center gap-6 mb-8">
                <UButton
                    class="w-14 h-14 text-3xl rounded-full flex items-center justify-center"
                    >-</UButton
                >
                <span class="text-4xl font-bold w-28 text-center">45</span>
                <UButton
                    class="w-14 h-14 text-3xl rounded-full flex items-center justify-center"
                    >+</UButton
                >
            </div>

            <!-- Кнопка сохранения -->
            <UButton
                class="w-full text-white font-bold py-3 px-4 rounded-xl transition-transform transform hover:scale-105"
            >
                Сохранить изменения
            </UButton>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { useRoute } from 'vue-router'
import { onMounted, ref } from 'vue'
import { useActivitiesStore } from '~/stores/activities.store'
import type { UserDailyActivity } from '~/types/activities/activities'

const ActivityStore = useActivitiesStore()
const route = useRoute()
const activityId = route.params.id
const activityName = ref('')
const userActivityInfo = ref<UserDailyActivity | undefined>()

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
    } else {
        activityName.value = 'Активность пользователя не найдена'
    }
})
</script>
