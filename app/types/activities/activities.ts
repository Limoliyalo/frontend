// 1. Тип для активности из каталога (у тебя он уже есть и он хорош)
export interface ActivityType {
    id: string
    name: string
    unit: string
    color: string
    daily_goal_default: number
    created_at: string
}

// 2. Новый тип для ежедневной активности пользователя
export interface UserDailyActivity {
    id: string
    date: string
    value: number
    goal: number
    notes: string | null
    character_id: string
    activity_type_id: string
    created_at: string
    updated_at: string
}

// 3. Тип для данных при СОЗДАНИИ активности (только то, что нужно)
export interface ActivityCreatePayload extends ActivityType {
    value?: number
    goal?: number
    notes?: string | null
}

// 4. Тип для данных при ОБНОВЛЕНИИ активности
export interface ActivityUpdatePayload {
    id: string // ID самой ежедневной активности
    value?: number
    goal?: number
    notes?: string | null
}

// 5. Обновленный тип для состояния стора
export interface ActivityState {
    activities: ActivityType[]
    userActivities: UserDailyActivity[] // Используем новый, правильный тип
}
