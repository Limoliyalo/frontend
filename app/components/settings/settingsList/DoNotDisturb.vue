<template>
    <div v-if="draft" class="flex items-center justify-around">
        <span class="text-xs text-start">Включить режим не беспокоить</span>
        <USwitch v-model="doNotDisturb" />
    </div>
    <div v-else>Загрузка...</div>
</template>

<script lang="ts" setup>
import { computed, inject } from 'vue'
import {
    settingsDraftKey,
} from '~/components/settings/settingsDraftContext'

const { draft } = inject(settingsDraftKey)!

const doNotDisturb = computed({
    get: () => draft.value?.do_not_disturb ?? false,
    set: (val: boolean) => {
        if (draft.value) draft.value.do_not_disturb = val
    },
})
</script>
