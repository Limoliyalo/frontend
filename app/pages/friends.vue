<template>
    <div class="glass-container">
        <div v-for="friend in friendArr" :key="friend.id"></div>
        <UButton
            class="flex self-center justify-self-center mt-5"
            @click="showModal = true"
            >Добавить дргуа</UButton
        >
    </div>
    <div
        v-if="showModal"
        class="fixed inset-0 flex items-center justify-center bg-black/50"
    >
        <div class="bg-white p-6 rounded-2xl shadow-xl w-80">
            <h2 class="text-lg font-semibold mb-3">Добавить друга</h2>
            <input
                v-model="friendId"
                type="number"
                placeholder="Введите ID друга"
                class="border w-full p-2 rounded mb-4"
            />
            <div class="flex justify-end gap-2">
                <UButton>Добавить</UButton>
                <UButton @click="showModal = false">Отмена</UButton>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useUserFriendsStore } from '#imports'
import type { Friend } from '~/types/friends/friends'

const friendStore = useUserFriendsStore()
const friendArr = ref<Friend[]>([])

const showModal = ref(false)
const friendId = ref('')

onMounted(async () => {
    await friendStore.loadFriends()
    friendArr.value = friendStore.friends
})
</script>

<style></style>
