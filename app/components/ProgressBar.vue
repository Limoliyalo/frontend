<template>
    <div>
        <div><ui-level-circle class="absolute -top-4 -left-2 z-10" /></div>
        <UProgress v-model="value" class="w-[14rem]" />
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useMyUserStore } from '~/stores/user.store'
import type { userStat } from '~/types/user/user'

const userStat = ref<userStat | null>(null)
const userStore = useMyUserStore()

onMounted(async () => {
    await userStore.loadUserStatistic()
    userStat.value = userStore.getStatistic
})
const value = ref(userStat.value?.level)
</script>

<style></style>
