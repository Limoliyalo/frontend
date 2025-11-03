<template>
    <div v-if="userStore.settings" class="flex items-center justify-around">
        <span class="text-xs text-start">Включить режим не беспокоить</span>
        <USwitch v-model="doNotDisturb" />
    </div>
    <div v-else>Загрузка...</div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useMyUserStore } from '~/stores/user.store'

const userStore = useMyUserStore()

const doNotDisturb = computed({
    get: () => userStore.settings?.do_not_disturb ?? false,
    set: async (val: boolean) => {
        // реактивно обновляем локально
        if (userStore.settings) userStore.settings.do_not_disturb = val

        // отправляем PATCH
        await userStore.updateUserSettings({ do_not_disturb: val })
    },
})
</script>
