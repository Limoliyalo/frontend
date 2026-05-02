import type { InjectionKey, Ref } from 'vue'

export type UserSettingsDraft = {
    do_not_disturb: boolean
    quiet_start_time: string
    quiet_end_time: string
    muted_days: string[]
}

export type SettingsDraftContext = {
    draft: Ref<UserSettingsDraft | null>
}

export const settingsDraftKey: InjectionKey<SettingsDraftContext> = Symbol(
    'settingsDraft',
)
