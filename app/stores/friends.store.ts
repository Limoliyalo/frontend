import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useApi } from '#imports'
import type { FriendFullInfo, Friend } from '~/types/friends/friends'

export const useUserFriendsStore = defineStore('userFriendsStore', () => {
    const { apiRequest } = useApi()

    const friends = ref<Friend[]>([])
    const friendInfoByTgId = ref<Record<number, FriendFullInfo | undefined>>({})
    const isLoaded = ref(false)
    let loadPromise: Promise<void> | null = null
    const friendInfoPromises: Record<
        number,
        Promise<FriendFullInfo> | undefined
    > = {}

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

    async function addFriend(friend_tg_id: number): Promise<Friend> {
        const newFriend = await apiRequest<Friend>('/user-friends/me', {
            method: 'POST',
            body: JSON.stringify({ friend_tg_id }),
        })
        const friendIndex = friends.value.findIndex(
            friend => friend.friend_tg_id === friend_tg_id,
        )
        if (friendIndex >= 0) {
            friends.value[friendIndex] = newFriend
        } else {
            friends.value.push(newFriend)
        }
        isLoaded.value = true
        return newFriend
    }

    async function deleteFriend(friend_tg_id: number): Promise<boolean> {
        await apiRequest('/user-friends/me', {
            method: 'DELETE',
            body: JSON.stringify({ friend_tg_id }),
        })
        friends.value = friends.value.filter(
            f => f.friend_tg_id !== friend_tg_id,
        )
        const { [friend_tg_id]: _removed, ...rest } = friendInfoByTgId.value
        friendInfoByTgId.value = rest
        return true
    }

    async function loadFriendFullInfo(
        friend_tg_id: number,
        force = false,
    ): Promise<FriendFullInfo> {
        const cached = friendInfoByTgId.value[friend_tg_id]
        if (cached && !force) return cached

        const currentPromise = friendInfoPromises[friend_tg_id]
        if (currentPromise && !force) return currentPromise

        friendInfoPromises[friend_tg_id] = apiRequest<FriendFullInfo>(
            '/user-friends/me/friend',
            {
                method: 'GET',
                query: { friend_tg_id },
            },
        )
            .then(data => {
                friendInfoByTgId.value[friend_tg_id] = data
                return data
            })
            .finally(() => {
                friendInfoPromises[friend_tg_id] = undefined
            })

        return friendInfoPromises[friend_tg_id]!
    }

    return {
        friends,
        friendInfoByTgId,
        isLoaded,
        allFriends,
        loadFriends,
        ensureFriendsLoaded: loadFriends,
        addFriend,
        deleteFriend,
        loadFriendFullInfo,
    }
})
