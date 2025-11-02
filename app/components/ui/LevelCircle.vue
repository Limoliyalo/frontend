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

interface userStat {
    user_id: number
    balance: number
    level: number
    total_experience: number
    character_name: string
    character_sex: string
    purchased_items_count: number
    purchased_backgrounds_count: number
    mood_entries_count: number
    activities_count: number
    total_transactions: number
    friends_count: number
}
const userStat = ref<userStat | null>(null)
const userStore = useMyUserStore()

onMounted(async () => {
    await userStore.loadUserStatistic()
    userStat.value = userStore.getStatistic
})
</script>

<style></style>
