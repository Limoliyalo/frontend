/// <reference types="@twa-dev/types" />

declare global {
    interface Window {
        Telegram?: {
            WebApp: WebApp
        }
    }
}

export {}
