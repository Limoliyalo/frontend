<template>
    <div v-if="userStore.settings" class="w-full flex flex-col items-center space-y-3">
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
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useMyUserStore } from '~/stores/user.store'

const userStore = useMyUserStore()

const days = ref([
    { key: 'monday', label: 'Пн' },
    { key: 'tuesday', label: 'Вт' },
    { key: 'wednesday', label: 'Ср' },
    { key: 'thursday', label: 'Чт' },
    { key: 'friday', label: 'Пт' },
    { key: 'saturday', label: 'Сб' },
    { key: 'sunday', label: 'Вс' },
])

const selectedDays = computed(() => userStore.settings?.muted_days ?? [])

function isDaySelected(dayKey: string) {
    return selectedDays.value.includes(dayKey)
}

async function toggleDay(dayKey: string) {
    if (!userStore.settings) return

    const currentDays = [...selectedDays.value]
    const index = currentDays.indexOf(dayKey)

    if (index > -1) {
        currentDays.splice(index, 1)
    } else {
        currentDays.push(dayKey)
    }

    userStore.settings.muted_days = currentDays

    await userStore.updateUserSettings({ muted_days: currentDays })
}
</script>
