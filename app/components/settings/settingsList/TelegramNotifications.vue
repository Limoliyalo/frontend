<template>
    <div class="w-full flex flex-col items-center space-y-3">
        <span class="text-xs text-center"
            >Напоминания в Telegram (интервал, минуты)</span
        >
        <div class="flex w-full max-w-xs items-center gap-2">
            <UInput
                v-model="intervalInput"
                type="number"
                min="1"
                step="1"
                class="flex-1 bg-black/20 text-white border border-white/30 placeholder:text-white/50 rounded-md"
                placeholder="60"
            />
            <UButton
                type="button"
                class="cursor-pointer shrink-0"
                @click="onStart"
            >
                OK
            </UButton>
        </div>
        <p v-if="error" class="text-xs text-white text-center max-w-xs">
            {{ error }}
        </p>

        <div v-if="status" class="w-full text-xs text-center space-y-1">
            <p>
                Статус:
                <span>{{ status.is_active ? 'включены' : 'выключены' }}</span>
            </p>
            <p>Интервал: {{ status.interval_minutes }} мин.</p>
            <p v-if="status.schedule_id">
                Расписание: {{ status.schedule_id }}
            </p>
            <p>
                Последняя отправка:
                {{ formattedLastSent }}
            </p>
        </div>
        <div v-else-if="statusLoading" class="text-xs">Загрузка...</div>

        <UButton
            type="button"
            class="cursor-pointer"
            color="neutral"
            variant="soft"
            @click="onStop"
        >
            Стоп
        </UButton>
    </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useNotificationsStore } from '~/stores/notifications.store'

const notificationsStore = useNotificationsStore()
const { status, statusLoading, error } = storeToRefs(notificationsStore)

const intervalInput = ref('')

watch(
    () => status.value,
    (s) => {
        if (s && s.interval_minutes > 0) {
            intervalInput.value = String(s.interval_minutes)
        }
    },
    { immediate: true },
)

const formattedLastSent = computed(() => {
    const raw = status.value?.last_sent_at
    if (!raw) return '—'
    const d = new Date(raw)
    if (Number.isNaN(d.getTime())) return raw
    return d.toLocaleString()
})

function onStart() {
    // UInput type="number" may bind a number; .trim() is only on strings
    const raw = String(intervalInput.value ?? '').trim()
    if (raw === '') {
        error.value = 'Введите число минут'
        return
    }
    const n = Number.parseInt(raw, 10)
    void notificationsStore.startNotifications(n)
}

function onStop() {
    void notificationsStore.stopNotifications()
}

onMounted(() => {
    void notificationsStore.fetchStatus()
})
</script>
