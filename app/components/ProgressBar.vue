<template>
    <div>
        <div><ui-level-circle class="absolute -top-4 -left-2 z-10" /></div>
        <UProgress :model-value="value" class="w-[14rem]" />
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { useMyUserStore } from '~/stores/user.store'
import type { userStat } from '~/types/user/user'

const userStat = ref<userStat | null>(null)
const userStore = useMyUserStore()
const MAX_EXPERIENCE = 100

onMounted(async () => {
    await userStore.loadUserStatistic()
    userStat.value = userStore.getStatistic
})
const value = computed(() => {
    const statistic = userStore.getStatistic

    if (!statistic) {
        return 0
    }

    return statistic.total_experience % MAX_EXPERIENCE
})
</script>

<style></style>
