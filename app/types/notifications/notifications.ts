export interface NotificationStatus {
    user_id: number
    is_active: boolean
    interval_minutes: number
    schedule_id: string | null
    last_sent_at: string | null
}

export interface NotificationStopResponse {
    user_id: number
    is_active: boolean
    message: string
}
