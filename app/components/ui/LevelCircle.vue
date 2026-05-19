<template>
    <div
        class="w-11 h-11 rounded-full bg-green-400 flex items-center justify-center text-white"
    >
        {{ userStat?.level }}
    </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useMyUserStore } from '~/stores/user.store'

const userStore = useMyUserStore()
const userStat = computed(() => userStore.statistic)
</script>

<style></style>
