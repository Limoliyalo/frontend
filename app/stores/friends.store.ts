import { defineStore } from 'pinia'
import { useApi } from '#imports'
import type { FriendState } from '~/types/friends/friends'

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
    },
})
