<template>
    <div class="p-4">
        <PageBackground :url="activeBackgroundForHome?.settings_url" :alt="activeBackgroundForHome?.name" />
        <div class="flex flex-col space-y-4">
            <Settings-Setting
                v-for="(setting, index) in settingsArr"
                :key="index"
            >
                <component :is="setting.component" />
            </Settings-Setting>
        </div>
        <div class="flex flex-col items-center justify-center mt-4">
            <UButton class="cursor-pointer" @click="deleteMySettings">
                По умолчанию
            </UButton>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { settingsArr } from '../components/settings/AllSettings'
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useMyUserStore } from '~/stores/user.store'
import { useMyBackgroundsStore } from '~/stores/backgrounds.store'

const backgroundsStore = useMyBackgroundsStore()
const { activeBackgroundForHome } = storeToRefs(backgroundsStore)

const userStore = useMyUserStore()

onMounted(() => {
    userStore.loadUserSettings()
})

async function deleteMySettings() {
    await userStore.deleteUserSettings()
    await userStore.loadUserSettings()
}
</script>

<style></style>
