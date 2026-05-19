import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useApi } from '#imports'
import type { FriendFullInfo, Friend } from '~/types/friends/friends'

export const useUserFriendsStore = defineStore('userFriendsStore', () => {
    const { apiRequest } = useApi()

    const friends = ref<Friend[]>([])
    const isLoaded = ref(false)
    let loadPromise: Promise<void> | null = null

    const allFriends = computed<Friend[]>(() => friends.value)

    async function loadFriends(force = false): Promise<void> {
        if (isLoaded.value && !force) return
        if (loadPromise && !force) return loadPromise

        loadPromise = apiRequest<Friend[]>('/user-friends/me', {
            method: 'GET',
        })
            .then(data => {
                friends.value = data
                isLoaded.value = true
            })
            .finally(() => {
                loadPromise = null
            })

        return loadPromise
    }

    async function addFriend(friend_tg_id: number): Promise<void> {
        const newFriend = await apiRequest<Friend>('/user-friends/me', {
            method: 'POST',
            body: JSON.stringify({ friend_tg_id }),
        })
        friends.value.push(newFriend)
        isLoaded.value = true
    }

    async function deleteFriend(friend_tg_id: number): Promise<boolean> {
        await apiRequest('/user-friends/me', {
            method: 'DELETE',
            body: JSON.stringify({ friend_tg_id }),
        })
        friends.value = friends.value.filter(
            f => f.friend_tg_id !== friend_tg_id,
        )
        return true
    }

    async function loadFriendFullInfo(
        friend_tg_id: number,
    ): Promise<FriendFullInfo> {
        return apiRequest<FriendFullInfo>('/user-friends/me/friend', {
            method: 'GET',
            query: { friend_tg_id },
        })
    }

    return {
        friends,
        isLoaded,
        allFriends,
        loadFriends,
        ensureFriendsLoaded: loadFriends,
        addFriend,
        deleteFriend,
        loadFriendFullInfo,
    }
})
