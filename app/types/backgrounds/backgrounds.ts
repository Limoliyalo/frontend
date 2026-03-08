export interface Background {
    name: string
    description: string
    color: string
    cost: number
    picture_url?: string | null
    required_level: number
    is_available: boolean
    id: string
    created_at?: string
}

export interface CharacterBackground {
    character_id: string
    background_id: string
    is_active: boolean
    is_favorite: boolean
    is_purchased: boolean
    id: string
    /** Сервер может присылать timestamp покупки, но UI опирается на is_purchased. */
    purchased_at?: string | null
}

export interface BackgroundState {
    backgrounds: Background[]
    characterBackgrounds: CharacterBackground[]
    /** Кэш окружения для главного экрана (is_active). Обновляется при загрузке и при equip/unequip. */
    activeBackgroundForHome: Background | null
}
