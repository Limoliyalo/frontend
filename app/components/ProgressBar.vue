<template>
    <div>
        <div><ui-level-circle class="absolute -top-4 -left-2 z-10" /></div>
        <UProgress :model-value="value" class="w-[14rem]" />
    </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useMyUserStore } from '~/stores/user.store'

const userStore = useMyUserStore()
const MAX_EXPERIENCE = 100

const value = computed(() => {
    const statistic = userStore.statistic

    if (!statistic) {
        return 0
    }

    return statistic.total_experience % MAX_EXPERIENCE
})
</script>

<style></style>
