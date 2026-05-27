import type { BaseActivity } from '~/types/activities/activities'
import type { CharacterBackground } from '~/types/backgrounds/backgrounds'
import type { CharacterItem } from '~/types/items/items'

export interface Friend {
    owner_tg_id: number
    friend_tg_id: number
    id: string
    created_at: string
}

export interface FriendCharacterInfo {
    id?: string
    user_tg_id?: number
    name?: string | null
    sex?: string | null
    current_mood?: string
    level?: number
    total_experience?: number
    created_at?: string
    updated_at?: string
}

export interface FriendFullInfo {
    user_tg_id: number
    character?: FriendCharacterInfo | null
    character_items?: CharacterItem[]
    character_backgrounds?: CharacterBackground[]
    base_activities?: BaseActivity[]
    mood_history?: Record<string, unknown>[]
    transactions?: Record<string, unknown>[]
}

export interface FriendState {
    friends: Friend[]
}

export type FriendProfileStatus =
    | 'loading'
    | 'mutual'
    | 'pending'
    | 'error'
    | 'no_character'

export interface FriendProfileState {
    status: FriendProfileStatus
    info?: FriendFullInfo | null
    message?: string
}
