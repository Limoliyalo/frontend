<template>
    <div class="w-full flex flex-col items-center space-y-3">
        <span class="text-xs">Тихие часы</span>
        <div class="flex flex-col items-center">
            <span class="text-sm">с</span>
            <UInput v-model="quietHoursFrom" type="time" class="w-28" />
            <span class="text-sm">по</span>
            <UInput v-model="quietHoursTo" type="time" class="w-28" />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useMyUserStore } from '~/stores/user.store'

const userStore = useMyUserStore()

const quietHoursFrom = computed({
    get: () => userStore.settings?.quiet_start_time ?? '00:00:00',
    set: async (val: string) => {
        if (userStore.settings) userStore.settings.quiet_start_time = val
        await userStore.updateUserSettings({ quiet_start_time: val })
    },
})

const quietHoursTo = computed({
    get: () => userStore.settings?.quiet_end_time ?? '00:00:00',
    set: async (val: string) => {
        if (userStore.settings) userStore.settings.quiet_end_time = val
        await userStore.updateUserSettings({ quiet_end_time: val })
    },
})
</script>
