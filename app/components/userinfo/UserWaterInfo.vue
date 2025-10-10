<template>
    <div class="w-full px-4 flex flex-col items-center">
        <div class="w-full flex justify-center space-x-8 mt-6">
            <div class="flex flex-col items-center w-32">
                <div class="glass-visual">
                    <div
                        class="water"
                        :style="{ height: waterLevel + '%' }"
                    ></div>
                </div>
                <p class="mt-2 text-lg">Выпито: {{ waterLevel }}%</p>
            </div>

            <div class="flex flex-col space-y-3">
                <button
                    @click="waterLevel = Math.min(100, waterLevel + 10)"
                    class="p-2 rounded-full bg-blue-500 text-white w-12 h-12 flex items-center justify-center text-xl"
                >
                    +
                </button>
                <button
                    @click="waterLevel = Math.max(0, waterLevel - 10)"
                    class="p-2 rounded-full bg-blue-500 text-white w-12 h-12 flex items-center justify-center text-xl"
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

const waterLevel = ref(50) // Start at 50%

const adviceText = computed(() => {
    if (waterLevel.value < 50) {
        return 'Можно было бы пить и побольше'
    } else if (waterLevel.value >= 50 && waterLevel.value < 90) {
        return 'Норм залил но можно и до полного'
    } else if (waterLevel.value >= 90) {
        return 'Все, ща лопнешь'
    }
})
</script>

<style scoped>
.glass-visual {
    width: 80px; /* Made glass wider */
    height: 120px; /* Made glass taller */
    border: 4px solid rgba(255, 255, 255, 0.7);
    border-top: none;
    border-radius: 0 0 20px 20px;
    position: relative;
    background-color: rgba(255, 255, 255, 0.1);
    overflow: hidden; /* To keep the water inside */
}

.water {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: #3b82f6; /* tailwind blue-500 */
    transition: height 0.5s ease-in-out;
}
</style>
