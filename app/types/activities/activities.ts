export interface ActivityType {
    name: string
    unit: string
    color: string
    daily_goal_default: number
    id: string
    created_at?: string
}

// Base Activity

export interface BaseActivity {
    goal: number
    id: string
    character_id: string
    activity_type_id: string
    created_at?: string
    updated_at?: string
}

export interface BaseActivityCreate {
    activity_type_id: string
    goal: number
}

export interface BaseActivityDelete extends Omit<BaseActivityCreate, 'goal'> {}

export interface BaseActivityUpdate extends BaseActivityCreate {}

// Daily Activity

export interface DailyActivity {
    date: string
    value: number
    goal: number
    notes: string
    id: string
    character_id: string
    activity_type_id: string
    created_at?: string
    updated_at?: string
}

export interface DailyActivityCreate {
    activity_type_id: string
    date: string
    value: number
    goal: number
    notes: string
}

export interface DailyActivityUpdate {
    activity_id: string
    value: number
    goal: number
    notes: string
}
