export interface Item {
    id: string
    name: string
    description: string
    cost: number
    required_level: number
    is_available: boolean
    category_id: string
    created_at?: string
    updated_at?: string
}

export interface CharacterItem {
    character_id: string
    item_id: string
    is_active: boolean
    is_favorite: boolean
    id: string
    purchased_at: string
}

export interface ItemState {
    items: Item[]
    characterItems: CharacterItem[]
    isLoading: boolean
}
