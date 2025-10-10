<template>
    <div class="w-full flex flex-col items-center space-y-3">
        <span class="text-xs">Тихие дни</span>
        <div class="flex items-center space-x-1">
            <UButton
                v-for="day in days"
                :key="day.key"
                @click="toggleDay(day.key)"
                :variant="isDaySelected(day.key) ? 'solid' : 'outline'"
                size="sm"
                class="rounded-full"
            >
                {{ day.label }}
            </UButton>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
const days = ref([
    { key: 'mon', label: 'Пн' },
    { key: 'tue', label: 'Вт' },
    { key: 'wed', label: 'Ср' },
    { key: 'thu', label: 'Чт' },
    { key: 'fri', label: 'Пт' },
    { key: 'sat', label: 'Сб' },
    { key: 'sun', label: 'Вс' },
])

const selectedDays = ref([''])

function toggleDay(dayKey: string) {
    const index = selectedDays.value.indexOf(dayKey)
    if (index === -1) {
        selectedDays.value.push(dayKey)
    } else {
        selectedDays.value.splice(index, 1)
    }
}

function isDaySelected(dayKey: string) {
    return selectedDays.value.includes(dayKey)
}
</script>

<style></style>
