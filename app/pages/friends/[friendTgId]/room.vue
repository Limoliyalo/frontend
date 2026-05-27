<template>
    <div class="h-dvh overflow-hidden">
        <AppLoader
            v-if="isLoading"
            :progress="loaderProgress"
            :message="loaderMessage"
            :action-label="isRoomSlow ? 'Вернуться к себе' : undefined"
            :message-class="ROOM_LOADER_MESSAGE_CLASS"
            @action="returnToSelf"
        />

        <div
            v-else-if="errorMessage"
            class="relative flex h-dvh overflow-hidden items-center justify-center p-4 text-white"
        >
            <RoomScene :background="null" :items-with-positions="[]" />
            <div class="glass-container max-w-xs text-center">
                <p class="text-sm">{{ errorMessage }}</p>
            </div>
        </div>

        <template v-else-if="roomData">
            <RoomScene
                :background="roomData.background"
                :items-with-positions="roomData.itemsWithPositions"
            />
            <div
                class="absolute left-4 top-8 z-10 flex max-w-[calc(100vw-2rem)] items-center gap-2 rounded-full bg-black/30 px-3 py-2 text-white backdrop-blur"
            >
                <div
                    class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-400 font-semibold"
                >
                    {{ friendLevel }}
                </div>
                <span class="min-w-0 truncate text-sm font-semibold">
                    {{ friendName }}
                </span>
            </div>
        </template>
    </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
    FriendRoomLoadError,
    isFriendInfoPendingError,
    useFriendRoom,
    type FriendRoomData,
} from '~/composables/useFriendRoom'
import {
    ROOM_LOADER_MESSAGE_CLASS,
    useGuestRoomLoader,
} from '~/composables/useGuestRoomLoader'

definePageMeta({
    guestRoom: true,
})

const route = useRoute()
const router = useRouter()
const { loadFriendRoom } = useFriendRoom()
const {
    progress: loaderProgress,
    message: loaderMessage,
    isSlow: isRoomSlow,
    start: startRoomLoader,
    complete: completeRoomLoader,
    stop: stopRoomLoader,
} = useGuestRoomLoader()

const friendTgId = ref<number | null>(null)
const roomData = ref<FriendRoomData | null>(null)
const isLoading = ref(true)
const errorMessage = ref<string | null>(null)

let roomLoadRequestId = 0

const friendName = computed(() => {
    const name = roomData.value?.friendInfo.character?.name?.trim()
    return name || (friendTgId.value ? String(friendTgId.value) : 'Друг')
})

const friendLevel = computed(
    () => roomData.value?.friendInfo.character?.level ?? 1,
)

function getRouteFriendTgId(): number | null {
    const param = route.params.friendTgId
    const raw = Array.isArray(param) ? param[0] : param
    const parsed = Number(raw)
    return parsed || null
}

function roomErrorMessage(error: unknown): string {
    if (
        error instanceof FriendRoomLoadError &&
        error.reason === 'no_character'
    ) {
        return 'Друг еще не создал персонажа'
    }

    if (isFriendInfoPendingError(error)) {
        return 'Ваша заявка еще не принята'
    }

    return 'Не удалось загрузить комнату друга'
}

async function loadRoom(): Promise<void> {
    const requestId = ++roomLoadRequestId
    const parsedFriendTgId = getRouteFriendTgId()
    friendTgId.value = parsedFriendTgId
    roomData.value = null
    errorMessage.value = null
    isLoading.value = true
    startRoomLoader()

    if (!parsedFriendTgId) {
        errorMessage.value = 'Не удалось найти друга'
        isLoading.value = false
        stopRoomLoader()
        return
    }

    try {
        const loadedRoomData = await loadFriendRoom(parsedFriendTgId)
        if (requestId !== roomLoadRequestId) return

        roomData.value = loadedRoomData
        completeRoomLoader()
    } catch (error: unknown) {
        if (requestId !== roomLoadRequestId) return

        errorMessage.value = roomErrorMessage(error)
    } finally {
        if (requestId === roomLoadRequestId) {
            stopRoomLoader()
            isLoading.value = false
        }
    }
}

async function returnToSelf(): Promise<void> {
    roomLoadRequestId += 1
    completeRoomLoader()
    await router.push('/')
}

watch(
    () => route.params.friendTgId,
    () => {
        void loadRoom()
    },
    { immediate: true },
)
</script>
