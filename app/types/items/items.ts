export interface Item {
    id: string
    name: string
    description: string
    cost: number
    required_level: number
    is_available: boolean
    picture_url: string | null
    category_id: string
    created_at?: string
    updated_at?: string
}

export interface CharacterItem {
    character_id: string
    item_id: string
    is_active: boolean
    is_favorite: boolean
    is_purchased: boolean
    id: string
}

export interface ItemState {
    items: Item[]
    characterItems: CharacterItem[]
    isLoading: boolean
}

/** Position of an item on a background (from item-background-positions API). */
export interface ItemBackgroundPosition {
    item_id: string
    background_id: string
    position_x: number
    position_y: number
    position_z: number
    id: string
}

/** Response element from GET /item-background-positions/me/items?background_id=... */
export interface ItemWithBackgroundPosition {
    item: Item
    position: ItemBackgroundPosition
}

