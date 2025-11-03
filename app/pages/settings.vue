<template>
    <div class="p-4">
        <div class="flex flex-col space-y-4">
            <Settings-Setting
                v-for="(setting, index) in settingsArr"
                :key="index"
            >
                <component :is="setting.component" />
            </Settings-Setting>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { settingsArr } from '../components/settings/AllSettings'
import { onMounted } from 'vue'
import { useMyUserStore } from '~/stores/user.store'

const userStore = useMyUserStore()

onMounted(() => {
    userStore.loadUserSettings()
})
</script>

<style></style>
