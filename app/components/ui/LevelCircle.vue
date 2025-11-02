<template>
    <div
        class="w-11 h-11 rounded-full bg-green-400 flex items-center justify-center text-black"
    >
        {{ userStat?.level }}
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
</script>

<style></style>
