export interface userStat {
    user_id: number
    balance: number
    level: number
    total_experience: number
    character_name: string
    character_sex: string
    purchased_items_count: number
    purchased_backgrounds_count: number
    mood_entries_count: number
    activities_count: number
    total_transactions: number
    friends_count: number
}

export interface TelegramUser {
    id: number
    first_name: string
    last_name?: string
    username?: string
    language_code?: string
    is_premium?: boolean
    photo_url?: string
}

export interface UserState {
    user: TelegramUser | null
    initData: string | null
    statistic: userStat | null
}
