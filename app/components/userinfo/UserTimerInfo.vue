<template>
    <div class="">
        <div class="w-full px-4 flex flex-col items-center">
            <Icon name="hugeicons:time-quarter-pass" size="80" class="mt-10 text-white/70" />

            <!-- Right side: The Text/Icon -->
            <div class="flex flex-col items-center">
                <p class="mt-2 text-lg text-center">
                    Время: {{ timeLevel }}%
                </p>
            </div>

            <div class="mt-6">
                <button
                    @click="timeLevel = Math.max(0, timeLevel - 10)"
                    class="p-2 mx-2 rounded bg-green-500 text-white"
                >
                    -
                </button>
                <button
                    @click="timeLevel = Math.min(100, timeLevel + 10)"
                    class="p-2 mx-2 rounded bg-green-500 text-white"
                >
                    +
                </button>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const timeLevel = ref(50) // Start at 50%
</script>

<style scoped>
</style>