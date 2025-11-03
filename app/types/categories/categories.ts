export interface Category {
    id: string
    name: string
    created_at: string
}

export interface CategoryState {
    categories: Category[]
    isLoading: boolean
}
