<template>
    <div class="p-4">
        <PageBackground
            :url="activeBackgroundForHome?.settings_url"
            :alt="activeBackgroundForHome?.name"
        />
        <div class="flex flex-col space-y-4">
            <Settings-Setting
                v-for="(setting, index) in settingsArr"
                :key="index"
            >
                <component :is="setting.component" />
            </Settings-Setting>
        </div>
        <div class="flex flex-row gap-2 items-center justify-center mt-4">
            <UButton
                :disabled="!isDirty || saving || !userStore.settings"
                :loading="saving"
                class="cursor-pointer"
                @click="saveSettings"
            >
                Сохранить
            </UButton>
            <UButton class="cursor-pointer" @click="deleteMySettings">
                По умолчанию
            </UButton>
        </div>
    </div>
</template>

<script lang="ts" setup>
definePageMeta({
    layout: 'inner-page',
    pageTitle: 'Настройки',
    scrollMainContent: true,
})

import { settingsArr } from '../components/settings/AllSettings'
import {
    computed,
    onMounted,
    provide,
    ref,
} from 'vue'
import { storeToRefs } from 'pinia'
import { useMyUserStore } from '~/stores/user.store'
import { useMyBackgroundsStore } from '~/stores/backgrounds.store'
import type { UserSettingsDraft } from '~/components/settings/settingsDraftContext'
import { settingsDraftKey } from '~/components/settings/settingsDraftContext'

const backgroundsStore = useMyBackgroundsStore()
const { activeBackgroundForHome } = storeToRefs(backgroundsStore)

const userStore = useMyUserStore()

const draft = ref<UserSettingsDraft | null>(null)
const baseline = ref<UserSettingsDraft | null>(null)
const saving = ref(false)

provide(settingsDraftKey, { draft })

function pickFromStore(): UserSettingsDraft | null {
    const s = userStore.settings
    if (!s) return null
    return {
        do_not_disturb: s.do_not_disturb,
        quiet_start_time: s.quiet_start_time,
        quiet_end_time: s.quiet_end_time,
        muted_days: [...s.muted_days],
    }
}

function initDraftFromStore(): void {
    const pick = pickFromStore()
    if (!pick) {
        draft.value = null
        baseline.value = null
        return
    }
    draft.value = {
        ...pick,
        muted_days: [...pick.muted_days],
    }
    baseline.value = {
        ...pick,
        muted_days: [...pick.muted_days],
    }
}

function draftsEqual(a: UserSettingsDraft, b: UserSettingsDraft): boolean {
    if (a.do_not_disturb !== b.do_not_disturb) return false
    if (a.quiet_start_time !== b.quiet_start_time) return false
    if (a.quiet_end_time !== b.quiet_end_time) return false
    const sa = [...a.muted_days].sort()
    const sb = [...b.muted_days].sort()
    if (sa.length !== sb.length) return false
    return sa.every((v, i) => v === sb[i])
}

const isDirty = computed(() => {
    if (!draft.value || !baseline.value) return false
    return !draftsEqual(draft.value, baseline.value)
})

async function saveSettings(): Promise<void> {
    if (!draft.value || !userStore.settings) return
    saving.value = true
    try {
        await userStore.updateUserSettings({
            do_not_disturb: draft.value.do_not_disturb,
            quiet_start_time: draft.value.quiet_start_time,
            quiet_end_time: draft.value.quiet_end_time,
            muted_days: [...draft.value.muted_days],
        })
        initDraftFromStore()
    } finally {
        saving.value = false
    }
}

onMounted(async () => {
    await userStore.loadUserSettings()
    initDraftFromStore()
})

async function deleteMySettings(): Promise<void> {
    await userStore.deleteUserSettings()
    await userStore.loadUserSettings()
    initDraftFromStore()
}
</script>

<style></style>
