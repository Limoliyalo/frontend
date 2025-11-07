export interface Background {
    name: string
    description: string
    color: string
    cost: number
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
    id: string
    purchased_at: string
}

export interface BackgroundState {
    backgrounds: Background[]
    characterBackgrounds: CharacterBackground[]
}
