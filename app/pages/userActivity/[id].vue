<template>
    <div class="p-4 flex flex-col items-center gap-8 container mx-auto">
        <!-- Название активности -->
        <h1 class="text-3xl font-bold text-white">Название Активности</h1>

        <!-- Шкала прогресса -->
        <div class="w-full max-w-lg">
            <UProgress :value="50" :max="100" />
            <div class="text-center text-white mt-2">50 / 100</div>
            <UProgress :value="progressValue" :max="100" />
            <div class="text-center text-white mt-2">
                {{ progressValue }} / 100
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
                class="w-28 text-center"
                :value="50"
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
            <UButton size="xl">Применить</UButton>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { useRoute } from '#imports'

const route = useRoute()
const activityID = ref(route.params.id)

const progressValue = ref(50)

const increment = () => {
    if (progressValue.value < 100) progressValue.value++
}
const decrement = () => {
    if (progressValue.value > 0) progressValue.value--
}
</script>

<style></style>
