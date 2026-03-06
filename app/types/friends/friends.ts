export interface Friend {
    owner_tg_id: number
    friend_tg_id: number
    id: string
    created_at: string
}

export interface FriendCharacterInfo {
    name: string
    sex: string
    level: number
}

export interface FriendFullInfo {
    user_tg_id: number
    character: FriendCharacterInfo
}

export interface FriendState {
    friends: Friend[]
}
