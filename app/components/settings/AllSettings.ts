import { shallowRef } from 'vue'
import DoNotDisturb from './settingsList/DoNotDisturb.vue'
import QuietHours from './settingsList/QuietHours.vue'
import QuietDays from './settingsList/QuietDays.vue'
import Logout from './settingsList/Logout.vue'

export const settingsArr = shallowRef([
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
        component: Logout,
    },
])
