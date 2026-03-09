import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useApi } from '#imports'
import type { FriendFullInfo, Friend } from '~/types/friends/friends'

export const useUserFriendsStore = defineStore('userFriendsStore', () => {
    const { apiRequest } = useApi()

    const friends = ref<Friend[]>([])

    const allFriends = computed<Friend[]>(() => friends.value)

    async function loadFriends(): Promise<void> {
        friends.value = await apiRequest<Friend[]>('/user-friends/me', {
            method: 'GET',
        })
    }

    async function addFriend(friend_tg_id: number): Promise<void> {
        const newFriend = await apiRequest<Friend>('/user-friends/me', {
            method: 'POST',
            body: JSON.stringify({ friend_tg_id }),
        })
        friends.value.push(newFriend)
    }

    async function deleteFriend(friend_tg_id: number): Promise<void> {
        await apiRequest('/user-friends/me', {
            method: 'DELETE',
            body: JSON.stringify({ friend_tg_id }),
        })
        friends.value = friends.value.filter(
            f => f.friend_tg_id !== friend_tg_id,
        )
    }

    async function loadFriendFullInfo(
        friend_tg_id: number,
    ): Promise<FriendFullInfo> {
        return apiRequest<FriendFullInfo>(
            `/user-friends/me/friend?friend_tg_id=${friend_tg_id}`,
            { method: 'GET' },
        )
    }

    return {
        friends,
        allFriends,
        loadFriends,
        addFriend,
        deleteFriend,
        loadFriendFullInfo,
    }
})
