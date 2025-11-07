export interface Friend {
    owner_tg_id: number
    friend_tg_id: number
    id: string
    created_at: string
}

export interface FriendState {
    friends: Friend[]
}
