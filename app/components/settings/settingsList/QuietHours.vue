<template>
    <div v-if="draft" class="w-full flex flex-col items-center space-y-3">
        <span class="text-xs">Тихие часы</span>
        <div class="flex flex-col items-center">
            <span class="text-sm">с</span>
            <UInput
                v-model="quietHoursFrom"
                type="time"
                class="w-28 bg-black/20 text-white border border-white/30 placeholder:text-white/50 rounded-md"
            />
            <span class="text-sm">по</span>
            <UInput
                v-model="quietHoursTo"
                type="time"
                class="w-28 bg-black/20 text-white border border-white/30 placeholder:text-white/50 rounded-md"
            />
        </div>
    </div>
    <div v-else class="w-full flex flex-col items-center space-y-3 text-xs">
        Загрузка...
    </div>
</template>

<script lang="ts" setup>
import { computed, inject } from 'vue'
import { settingsDraftKey } from '~/components/settings/settingsDraftContext'

const { draft } = inject(settingsDraftKey)!

const quietHoursFrom = computed({
    get: () => draft.value?.quiet_start_time ?? '00:00:00',
    set: (val: string) => {
        if (draft.value) draft.value.quiet_start_time = val
    },
})

const quietHoursTo = computed({
    get: () => draft.value?.quiet_end_time ?? '00:00:00',
    set: (val: string) => {
        if (draft.value) draft.value.quiet_end_time = val
    },
})
</script>
