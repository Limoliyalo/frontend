<template>
    <div>
        <PageBackground :url="activeBackgroundForHome?.friends_url" :alt="activeBackgroundForHome?.name" />
    <div class="glass-container">
        <div
            v-for="friend in friendArr"
            :key="friend.id"
            class="flex items-center w-full"
        >
            <div class="flex-1 flex justify-center gap-3 text-center">
                <template v-if="friendInfoMap[friend.friend_tg_id]">
                    <span>{{ friendInfoMap[friend.friend_tg_id]?.character.name }}</span>
                    <span>{{ friendInfoMap[friend.friend_tg_id]?.character.sex }}</span>
                    <span>Level {{ friendInfoMap[friend.friend_tg_id]?.character.level }}</span>
                </template>
                <template v-else-if="friendInfoMap[friend.friend_tg_id] === null">
                    <span class="text-white/60 italic text-sm">пока ваша дружба с {{ friend.friend_tg_id }} не взаимна((</span>
                </template>
                <template v-else>
                    <span>{{ friend.friend_tg_id }}</span>
                </template>
            </div>
            <button
                type="button"
                class="ml-auto flex items-center"
                @click="openDeleteModal(friend.friend_tg_id)"
            >
                <Icon name="hugeicons:delete-02" size="20" />
            </button>
        </div>
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
                <UButton @click="addFriend">Добавить</UButton>
                <UButton @click="showModal = false">Отмена</UButton>
            </div>
        </div>
    </div>
    <div
        v-if="showDeleteModal"
        class="fixed inset-0 flex items-center justify-center bg-black/50"
    >
        <div class="bg-white p-6 rounded-2xl shadow-xl w-80">
            <h2 class="text-lg font-semibold mb-3 text-center">
                Вы уверены, что хотите удалить друга?
            </h2>
            <div class="flex justify-end gap-2">
                <UButton @click="confirmDeleteFriend">Подтвердить</UButton>
                <UButton @click="closeDeleteModal">Отмена</UButton>
            </div>
        </div>
    </div>
    </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserFriendsStore } from '#imports'
import { useMyBackgroundsStore } from '~/stores/backgrounds.store'
import type { FriendFullInfo } from '~/types/friends/friends'

const backgroundsStore = useMyBackgroundsStore()
const { activeBackgroundForHome } = storeToRefs(backgroundsStore)

const friendStore = useUserFriendsStore()
const friendArr = computed(() => friendStore.friends)
const friendInfoMap = ref<Record<number, FriendFullInfo | null>>({})

const showModal = ref(false)
const showDeleteModal = ref(false)
const friendId = ref('')
const friendToDelete = ref<number | null>(null)

onMounted(async () => {
    await friendStore.loadFriends()
    await loadFriendsFullInfo()
})

async function addFriend() {
    const parsedFriendId = Number(friendId.value)

    if (!parsedFriendId) {
        return
    }

    await friendStore.addFriend(parsedFriendId)
    const friendInfo = await friendStore.loadFriendFullInfo(parsedFriendId)

    if (friendInfo) {
        friendInfoMap.value[parsedFriendId] = friendInfo
    }

    friendId.value = ''
    showModal.value = false
}

function openDeleteModal(friend_tg_id: number) {
    friendToDelete.value = friend_tg_id
    showDeleteModal.value = true
}

function closeDeleteModal() {
    showDeleteModal.value = false
    friendToDelete.value = null
}

async function confirmDeleteFriend() {
    if (!friendToDelete.value) {
        return
    }

    const deletedFriendId = friendToDelete.value
    const deleted = await friendStore.deleteFriend(deletedFriendId)

    if (deleted) {
        delete friendInfoMap.value[deletedFriendId]
        closeDeleteModal()
    }
}

async function loadFriendsFullInfo() {
    const results = await Promise.allSettled(
        friendArr.value.map(friend =>
            friendStore.loadFriendFullInfo(friend.friend_tg_id)
        )
    )

    friendInfoMap.value = results.reduce<Record<number, FriendFullInfo | null>>(
        (acc, result, i) => {
            const tgId = friendArr.value[i]!.friend_tg_id
            if (result.status === 'fulfilled' && result.value) {
                acc[result.value.user_tg_id] = result.value
            } else {
                acc[tgId] = null
            }
            return acc
        },
        {}
    )
}
</script>

<style></style>
