import { shallowRef } from 'vue'
import DoNotDisturb from './settingsList/DoNotDisturb.vue'
import QuietHours from './settingsList/QuietHours.vue'
import QuietDays from './settingsList/QuietDays.vue'
import UserId from './settingsList/UserId.vue'
import TelegramNotifications from './settingsList/TelegramNotifications.vue'

export const settingsArr = shallowRef([
    {
        component: TelegramNotifications,
    },
    {
        component: DoNotDisturb,
    },
    {
        component: QuietHours,
    },
    {
        component: QuietDays,
    },
    {
        component: UserId,
    },
])
