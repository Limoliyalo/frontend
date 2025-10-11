<template>
    <div class="w-full px-4 flex flex-col items-center">
        <div class="w-full glass-container">
            <div class="w-full flex justify-center space-x-8 mt-6">
                <!-- Left side: Food visual and percentage -->
                <div class="flex flex-col items-center w-32">
                    <div class="food-visual">
                        <div
                            class="food"
                            :style="{ height: foodLevel + '%' }"
                        ></div>
                    </div>
                    <p class="mt-2 text-lg">Съедено: {{ foodLevel }}%</p>
                </div>

                <!-- Right side: Buttons -->
                <div class="flex flex-col space-y-3">
                    <button
                        @click="foodLevel = Math.min(100, foodLevel + 10)"
                        class="p-2 rounded-full bg-yellow-500 text-white w-12 h-12 flex items-center justify-center text-xl"
                    >
                        +
                    </button>
                    <button
                        @click="foodLevel = Math.max(0, foodLevel - 10)"
                        class="p-2 rounded-full bg-yellow-500 text-white w-12 h-12 flex items-center justify-center text-xl"
                    >
                        -
                    </button>
                </div>
            </div>

            <div class="mt-6">
                <p class="text-lg text-center">
                    {{ adviceText }}
                </p>
            </div>
        </div>

        <!-- Weekly statistics section -->
        <div class="w-full mt-8 glass-container">
            <h3 class="text-xl text-center mb-4">Статистика за неделю</h3>
            <div
                class="relative w-full h-40 rounded-lg border border-white/20 bg-black/20 p-4 pl-12"
            >
                <!-- Y-Axis Labels -->
                <div
                    class="absolute left-2 top-4 bottom-12 flex flex-col justify-between text-sm text-white/50"
                >
                    <span>100</span>
                    <span>50</span>
                </div>
                <div class="absolute left-2 bottom-4 text-sm text-white/50">
                    <span>0</span>
                </div>

                <!-- Grid Lines -->
                <div
                    class="absolute left-12 right-4 top-4 border-t border-dashed border-white/20"
                ></div>
                <div
                    class="absolute left-12 right-4 top-1/2 -translate-y-1/2 border-t border-dashed border-white/20"
                ></div>

                <!-- Bars -->
                <div class="relative z-10 flex h-full items-end justify-around">
                    <div
                        v-for="stat in weeklyStats"
                        :key="stat.day"
                        class="flex flex-col items-center text-center w-10"
                    >
                        <div
                            class="flex h-full w-full items-end justify-center"
                        >
                            <div
                                class="w-4 rounded-t-md bg-yellow-500"
                                :style="{ height: stat.percentage + '%' }"
                            ></div>
                        </div>
                        <p class="absolute -bottom-6 text-sm">{{ stat.day }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

const foodLevel = ref(50) // Start at 50%

const weeklyStats = ref([
    { day: 'Пн', percentage: 70 },
    { day: 'Вт', percentage: 80 },
    { day: 'Ср', percentage: 60 },
    { day: 'Чт', percentage: 85 },
    { day: 'Пт', percentage: 95 },
    { day: 'Сб', percentage: 100 },
    { day: 'Вс', percentage: 90 },
])

const adviceText = computed(() => {
    if (foodLevel.value < 50) {
        return 'Кажется, кто-то не доедает'
    } else if (foodLevel.value >= 50 && foodLevel.value < 90) {
        return 'В самый раз'
    } else if (foodLevel.value >= 90) {
        return 'Ты скоро лопнешь!'
    }
})
</script>

<style scoped>
.food-visual {
    width: 80px; /* Made visual wider */
    height: 120px; /* Made visual taller */
    border: 4px solid rgba(255, 255, 255, 0.7);
    border-top: none;
    border-radius: 0 0 20px 20px;
    position: relative;
    background-color: rgba(255, 255, 255, 0.1);
    overflow: hidden; /* To keep the food inside */
}

.food {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: #f59e0b; /* tailwind yellow-500 */
    transition: height 0.5s ease-in-out;
}
</style>
