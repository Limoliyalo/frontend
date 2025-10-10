<template>
    <div class="w-full px-4 flex flex-col items-center">
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

        <div
            class="mt-6 text-center text-white/70 p-4 border border-white/20 rounded-lg"
        >
            <p>тут будет статистика за неделю</p>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

const foodLevel = ref(50) // Start at 50%

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
