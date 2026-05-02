<template>
    <div
        v-if="draft"
        class="w-full flex flex-col items-center space-y-3"
    >
        <span class="text-xs">Тихие дни</span>
        <div class="flex items-center space-x-1">
            <UButton
                v-for="day in days"
                :key="day.key"
                :variant="isDaySelected(day.key) ? 'solid' : 'outline'"
                size="sm"
                class="rounded-full"
                @click="toggleDay(day.key)"
            >
                {{ day.label }}
            </UButton>
        </div>
    </div>
    <div v-else class="w-full text-xs text-center">Загрузка...</div>
</template>

<script lang="ts" setup>
import { ref, computed, inject } from 'vue'
import { settingsDraftKey } from '~/components/settings/settingsDraftContext'

const { draft } = inject(settingsDraftKey)!

const days = ref([
    { key: 'monday', label: 'Пн' },
    { key: 'tuesday', label: 'Вт' },
    { key: 'wednesday', label: 'Ср' },
    { key: 'thursday', label: 'Чт' },
    { key: 'friday', label: 'Пт' },
    { key: 'saturday', label: 'Сб' },
    { key: 'sunday', label: 'Вс' },
])

const selectedDays = computed(() => draft.value?.muted_days ?? [])

function isDaySelected(dayKey: string) {
    return selectedDays.value.includes(dayKey)
}

function toggleDay(dayKey: string) {
    if (!draft.value) return

    const currentDays = [...selectedDays.value]
    const index = currentDays.indexOf(dayKey)

    if (index > -1) {
        currentDays.splice(index, 1)
    } else {
        currentDays.push(dayKey)
    }

    draft.value.muted_days = currentDays
}
</script>
