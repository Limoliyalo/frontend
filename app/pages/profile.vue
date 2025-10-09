<template>
    <div class="p-4">
        <div class="glass-container h-32 flex justify-start items-center">
            <div class="h-full w-full flex justify-around items-center">
                <div class="progress-imitation"></div>
                <div class="text-center text-sm w-30">
                    <p>Общий показатель прогресса за день для пользователя</p>
                </div>
            </div>
        </div>

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
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
const activeTab = ref('water')
</script>

<style scoped>
.progress-imitation {
    width: 76px;
    height: 76px;
    border-radius: 50%;
    background: conic-gradient(white 0% 75%, #4b5563 75% 100%);
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    font-size: 1.25rem;
    font-weight: 700;
}

.progress-imitation::before {
    content: '';
    position: absolute;
    width: 80%;
    height: 80%;
    /* Assuming a dark background like tailwind gray-900 */
    background: #111827;
    border-radius: 50%;
}

/* Static text in the middle */
.progress-imitation::after {
    content: '5';
    position: absolute;
}

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
