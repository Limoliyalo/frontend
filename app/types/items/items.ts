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

export interface ItemState {
    items: Item[]
    isLoading: boolean
}
