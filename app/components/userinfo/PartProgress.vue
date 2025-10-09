<!-- Компонент для просмотра конкретного прогресса пользователя (вода еда и тд) -->
<template>
    <div class="glass-container mt-20 p-4">
        <div class="flex justify-center space-x-4 mb-4">
            <button
                @click="activeTab = 'water'"
                :class="['pill', { active: activeTab === 'water' }]"
            >
                Вода
            </button>
            <button
                @click="activeTab = 'timer'"
                :class="['pill', { active: activeTab === 'timer' }]"
            >
                Таймер
            </button>
            <button
                @click="activeTab = 'food'"
                :class="['pill', { active: activeTab === 'food' }]"
            >
                Еда
            </button>
        </div>

        <div class="mt-4">
            <div v-if="activeTab === 'water'">
                <UserinfoWaterInfo />
            </div>
            <div v-else-if="activeTab === 'timer'">
                <UserinfoTimerInfo />
            </div>
            <div v-else-if="activeTab === 'food'">
                <UserinfoFoodInfo />
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
const activeTab = ref('water')
</script>

<style scoped>
.pill {
    padding: 0.5rem 1rem;
    border-radius: 9999px; /* rounded-full */
    background-color: rgba(255, 255, 255, 0.1);
    color: white;
    transition: background-color 0.3s ease;
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.pill:hover {
    background-color: rgba(255, 255, 255, 0.2);
}

.pill.active {
    background-color: rgba(255, 255, 255, 0.3);
    font-weight: 600; /* semibold */
}
</style>
