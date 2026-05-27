<template>
    <AppLoader
        v-if="isReturningHome"
        :progress="80"
        message="Возвращаем вас домой"
        :message-class="ROOM_LOADER_MESSAGE_CLASS"
    />

    <nav class="w-full">
        <button
            v-if="isGuestRoom"
            type="button"
            class="flex h-12 w-full items-center justify-center rounded-full text-sm font-semibold text-white active:bg-white/10"
            @click="returnToSelf"
        >
            Вернуться к себе
        </button>

        <ul v-else class="flex justify-around items-center">
            <li v-for="(btn, index) in navBtns" :key="index">
                <ui-nav-item :nav-btn="btn" />
            </li>
        </ul>
    </nav>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ROOM_LOADER_MESSAGE_CLASS } from '~/composables/useGuestRoomLoader'
import type { NavBtn } from '~/types/uiTypes/uiTypes'

defineOptions({ name: 'AppNavbar' })

const route = useRoute()
const router = useRouter()
const isReturningHome = ref(false)
const isGuestRoom = computed(() => Boolean(route.meta.guestRoom))

const navBtns: NavBtn[] = [
    { linkto: '/', iconName: 'hugeicons:home-01' },
    { linkto: '/shop', iconName: 'hugeicons:shopping-bag-01' },
    { linkto: '/profile', iconName: 'hugeicons:profile' },
]

async function returnToSelf(): Promise<void> {
    if (isReturningHome.value) return

    isReturningHome.value = true
    await new Promise(resolve => setTimeout(resolve, 150))
    await router.push('/')
    setTimeout(() => {
        isReturningHome.value = false
    }, 350)
}
</script>

<style></style>
