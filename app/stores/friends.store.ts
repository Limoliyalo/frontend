import { defineStore } from 'pinia'
import { useApi } from '#imports'
import type { FriendFullInfo, FriendState } from '~/types/friends/friends'

export const useUserFriendsStore = defineStore('userFriendsStore', {
    state: (): FriendState => ({
        friends: [],
    }),
    getters: {
        allFriends: state => state.friends,
    },
    actions: {
        async loadFriends() {
            const { apiRequest } = useApi()
            try {
                const data = await apiRequest('/user-friends/me', {
                    method: 'GET',
                })
                this.friends = data
                console.log('Друзья успешно загружены:', data)
            } catch (error) {
                console.error('Ошибка при загрузке друзей:', error)
            }
        },
        async addFriend(friend_tg_id: number) {
            const { apiRequest } = useApi()
            try {
                const newFriend = await apiRequest('/user-friends/me', {
                    method: 'POST',
                    body: JSON.stringify({
                        friend_tg_id: friend_tg_id,
                    }),
                })
                if (newFriend) {
                    this.friends.push(newFriend)
                }
                console.log(`Друг ${friend_tg_id} успешно добавлен`)
            } catch (error) {
                console.error(
                    `Ошибка при добавлении друга ${friend_tg_id}:`,
                    error
                )
            }
        },
        async deleteFriend(friend_tg_id: number) {
            const { apiRequest } = useApi()
            try {
                await apiRequest('/user-friends/me', {
                    method: 'DELETE',
                    body: JSON.stringify({
                        friend_tg_id,
                    }),
                })
                this.friends = this.friends.filter(
                    friend => friend.friend_tg_id !== friend_tg_id
                )
                console.log(`Друг ${friend_tg_id} успешно удален`)
                return true
            } catch (error) {
                console.error(
                    `Ошибка при удалении друга ${friend_tg_id}:`,
                    error
                )
                return false
            }
        },
        async loadFriendFullInfo(
            friend_tg_id: number
        ): Promise<FriendFullInfo | null> {
            const { apiRequest } = useApi()
            try {
                const friendInfo = await apiRequest(
                    `/user-friends/me/friend?friend_tg_id=${friend_tg_id}`,
                    {
                        method: 'GET',
                    }
                )
                return friendInfo
            } catch (error) {
                console.error(
                    `Ошибка при загрузке полной информации о друге ${friend_tg_id}:`,
                    error
                )
                return null
            }
        },
    },
})
