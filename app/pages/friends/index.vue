<template>
    <div class="p-4 text-white">
        <PageBackground
            :url="activeBackgroundForHome?.friends_url"
            :alt="activeBackgroundForHome?.name"
        />

        <AppLoader
            v-if="isRoomLoading"
            :progress="roomLoaderProgress"
            :message="roomLoaderMessage"
            :action-label="isRoomSlow ? 'Вернуться к себе' : undefined"
            :message-class="ROOM_LOADER_MESSAGE_CLASS"
            @action="returnToSelfFromLoader"
        />

        <div class="glass-container flex flex-col gap-3">
            <p
                v-if="roomLoadError"
                class="rounded-lg bg-red-500/30 px-3 py-2 text-center text-sm text-white"
            >
                {{ roomLoadError }}
            </p>

            <div
                v-if="friendArr.length === 0"
                class="rounded-lg bg-white/10 px-4 py-5 text-center text-sm text-white/75"
            >
                Список друзей пуст
            </div>

            <div
                v-for="friend in friendArr"
                :key="friend.id"
                class="rounded-lg bg-white/10 p-3 text-white"
            >
                <div class="flex items-center gap-2">
                    <button
                        v-if="isMutualFriend(friend.friend_tg_id)"
                        type="button"
                        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 active:bg-white/20"
                        :aria-label="
                            isFriendExpanded(friend.friend_tg_id)
                                ? 'Скрыть данные друга'
                                : 'Показать данные друга'
                        "
                        @click="toggleFriendDetails(friend.friend_tg_id)"
                    >
                        <Icon
                            :name="
                                isFriendExpanded(friend.friend_tg_id)
                                    ? 'hugeicons:arrow-up-01'
                                    : 'hugeicons:arrow-down-01'
                            "
                            size="20"
                        />
                    </button>
                    <div
                        v-else
                        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold"
                    >
                        <Icon
                            v-if="
                                getFriendProfile(friend.friend_tg_id).status ===
                                'loading'
                            "
                            class="animate-spin"
                            name="hugeicons:loading-03"
                            size="18"
                        />
                        <span v-else>{{ statusInitial(friend.friend_tg_id) }}</span>
                    </div>

                    <div class="min-w-0 flex-1">
                        <p class="truncate text-sm font-semibold">
                            {{ friendName(friend.friend_tg_id) }}
                        </p>
                        <p class="truncate text-xs text-white/65">
                            {{ statusText(friend.friend_tg_id) }}
                        </p>
                    </div>

                    <button
                        v-if="isMutualFriend(friend.friend_tg_id)"
                        type="button"
                        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 active:bg-white/20"
                        aria-label="Заглянуть в комнату друга"
                        title="Заглянуть в комнату"
                        @click="openVisitModal(friend.friend_tg_id)"
                    >
                        <Icon name="hugeicons:search-01" size="20" />
                    </button>

                    <button
                        type="button"
                        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 active:bg-white/20"
                        aria-label="Удалить друга"
                        @click="openDeleteModal(friend.friend_tg_id)"
                    >
                        <Icon name="hugeicons:delete-02" size="20" />
                    </button>
                </div>

                <div
                    v-if="
                        isMutualFriend(friend.friend_tg_id) &&
                        isFriendExpanded(friend.friend_tg_id)
                    "
                    class="mt-3 border-t border-white/15 pt-3"
                >
                    <div class="mb-3 flex items-center justify-between text-sm">
                        <span class="text-white/70">Уровень</span>
                        <span class="font-semibold">
                            {{ friendLevel(friend.friend_tg_id) }}
                        </span>
                    </div>

                    <div
                        v-if="
                            friendActivities(friend.friend_tg_id).length > 0
                        "
                        class="flex flex-col gap-2"
                    >
                        <div
                            v-for="activity in friendActivities(
                                friend.friend_tg_id,
                            )"
                            :key="activity.id"
                            class="flex items-center justify-between rounded-lg px-3 py-2 text-xs"
                            :style="{
                                backgroundColor: activityColor(
                                    activity.activity_type_id,
                                ),
                            }"
                        >
                            <span class="min-w-0 truncate font-medium">
                                {{ activityName(activity.activity_type_id) }}
                            </span>
                            <span class="shrink-0 pl-3">
                                {{ formatActivityGoal(activity) }}
                            </span>
                        </div>
                    </div>
                    <p v-else class="text-center text-xs text-white/60">
                        Основные активности пока не выбраны
                    </p>
                </div>
            </div>

            <UButton
                class="mt-2 flex self-center justify-self-center"
                @click="showModal = true"
            >
                Добавить друга
            </UButton>
        </div>

        <div
            v-if="showModal"
            class="fixed inset-0 z-[1000] flex items-center justify-center bg-black/55 p-4"
        >
            <div class="glass-container w-80 text-white">
                <h2 class="mb-3 text-lg font-semibold">Добавить друга</h2>
                <input
                    v-model="friendId"
                    type="number"
                    placeholder="Введите ID друга"
                    class="mb-2 w-full rounded-lg border border-white/20 bg-white/10 p-2 text-white placeholder:text-white/50"
                >
                <p
                    v-if="addFriendError"
                    class="mb-3 text-sm text-red-200"
                >
                    {{ addFriendError }}
                </p>
                <div class="flex justify-center gap-2">
                    <UButton :loading="isAddingFriend" @click="addFriend">
                        Добавить
                    </UButton>
                    <UButton
                        variant="soft"
                        color="neutral"
                        @click="closeAddModal"
                    >
                        Отмена
                    </UButton>
                </div>
            </div>
        </div>

        <div
            v-if="showDeleteModal"
            class="fixed inset-0 z-[1000] flex items-center justify-center bg-black/55 p-4"
        >
            <div class="glass-container w-80 text-white">
                <h2 class="mb-3 text-center text-lg font-semibold">
                    Вы уверены, что хотите удалить друга?
                </h2>
                <div class="flex justify-center gap-2">
                    <UButton @click="confirmDeleteFriend">Подтвердить</UButton>
                    <UButton
                        variant="soft"
                        color="neutral"
                        @click="closeDeleteModal"
                    >
                        Отмена
                    </UButton>
                </div>
            </div>
        </div>

        <div
            v-if="friendToVisit !== null && !isRoomLoading"
            class="fixed inset-0 z-[1000] flex items-center justify-center bg-black/55 p-4"
        >
            <div class="glass-container w-80 text-white">
                <h2 class="mb-2 text-center text-lg font-semibold">
                    Заглянуть в гости к другу?
                </h2>
                <p class="mb-4 text-center text-sm text-white/70">
                    {{ friendName(friendToVisit) }}
                </p>
                <div class="flex justify-center gap-2">
                    <UButton @click="confirmVisitFriendRoom">Да</UButton>
                    <UButton
                        variant="soft"
                        color="neutral"
                        @click="closeVisitModal"
                    >
                        Нет
                    </UButton>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useActivitiesStore, useUserFriendsStore } from '#imports'
import {
    FriendRoomLoadError,
    isFriendInfoPendingError,
    useFriendRoom,
} from '~/composables/useFriendRoom'
import {
    ROOM_LOADER_MESSAGE_CLASS,
    useGuestRoomLoader,
} from '~/composables/useGuestRoomLoader'
import { useMyBackgroundsStore } from '~/stores/backgrounds.store'
import type { BaseActivity } from '~/types/activities/activities'
import type {
    FriendFullInfo,
    FriendProfileState,
} from '~/types/friends/friends'

definePageMeta({
    layout: 'inner-page',
    pageTitle: 'Друзья',
    scrollMainContent: true,
    pageHelp: {
        title: 'Для чего этот экран',
        body: 'Здесь можно добавлять друзей, смотреть их персонажей и поддерживать друг друга в полезных привычках. Если дружба еще не взаимная, профиль друга появится после ответного добавления.',
    },
})

const router = useRouter()
const backgroundsStore = useMyBackgroundsStore()
const { activeBackgroundForHome } = storeToRefs(backgroundsStore)

const friendStore = useUserFriendsStore()
const activityStore = useActivitiesStore()
const { loadFriendRoom } = useFriendRoom()
const {
    progress: roomLoaderProgress,
    message: roomLoaderMessage,
    isSlow: isRoomSlow,
    start: startRoomLoader,
    complete: completeRoomLoader,
    stop: stopRoomLoader,
} = useGuestRoomLoader()

const friendArr = computed(() => friendStore.friends)
const friendProfiles = ref<Record<number, FriendProfileState>>({})
const expandedFriends = ref<Record<number, boolean>>({})

const showModal = ref(false)
const showDeleteModal = ref(false)
const friendId = ref('')
const friendToDelete = ref<number | null>(null)
const friendToVisit = ref<number | null>(null)
const addFriendError = ref<string | null>(null)
const roomLoadError = ref<string | null>(null)
const isAddingFriend = ref(false)
const isRoomLoading = ref(false)

let roomLoadRequestId = 0

onMounted(async () => {
    await Promise.all([
        friendStore.ensureFriendsLoaded(),
        activityStore.ensureActivityTypesCatalogLoaded(),
    ])
    await loadFriendsFullInfo()
})

function setFriendProfile(
    friendTgId: number,
    profile: FriendProfileState,
): void {
    friendProfiles.value = {
        ...friendProfiles.value,
        [friendTgId]: profile,
    }
}

function getFriendProfile(friendTgId: number): FriendProfileState {
    return friendProfiles.value[friendTgId] ?? { status: 'loading' }
}

function isMutualFriend(friendTgId: number): boolean {
    return getFriendProfile(friendTgId).status === 'mutual'
}

function isFriendExpanded(friendTgId: number): boolean {
    return expandedFriends.value[friendTgId] === true
}

function toggleFriendDetails(friendTgId: number): void {
    expandedFriends.value = {
        ...expandedFriends.value,
        [friendTgId]: !isFriendExpanded(friendTgId),
    }
}

function friendName(friendTgId: number): string {
    const name = getFriendProfile(friendTgId).info?.character?.name?.trim()
    return name || String(friendTgId)
}

function friendLevel(friendTgId: number): number {
    return getFriendProfile(friendTgId).info?.character?.level ?? 1
}

function statusInitial(friendTgId: number): string {
    const status = getFriendProfile(friendTgId).status
    if (status === 'pending') return '...'
    if (status === 'error') return '!'
    if (status === 'no_character') return '?'
    return ''
}

function statusText(friendTgId: number): string {
    const profile = getFriendProfile(friendTgId)
    if (profile.status === 'loading') return 'Загружаем данные друга'
    if (profile.status === 'pending') return 'Ваша заявка еще не принята'
    if (profile.status === 'error') {
        return profile.message ?? 'Не удалось загрузить данные друга'
    }
    if (profile.status === 'no_character') return 'Друг еще не создал персонажа'
    return `Уровень ${friendLevel(friendTgId)}`
}

function friendActivities(friendTgId: number): BaseActivity[] {
    return (getFriendProfile(friendTgId).info?.base_activities ?? []).slice(0, 3)
}

function activityName(activityTypeId: string): string {
    return activityStore.getActivityTypeName(activityTypeId) || 'Активность'
}

function activityColor(activityTypeId: string): string {
    return activityStore.getActivityTypeColor(activityTypeId) || '#ffffff26'
}

function formatActivityGoal(activity: BaseActivity): string {
    const unit = activityStore.getActivityTypeUnit(activity.activity_type_id)
    const suffix = unit ? ` ${unit}` : ''
    return `${activity.goal}${suffix}`
}

function getProfileStateFromInfo(info: FriendFullInfo): FriendProfileState {
    if (!info.character) {
        return { status: 'no_character', info }
    }

    return { status: 'mutual', info }
}

async function loadFriendProfile(
    friendTgId: number,
    force = false,
): Promise<void> {
    setFriendProfile(friendTgId, { status: 'loading' })

    try {
        const info = await friendStore.loadFriendFullInfo(friendTgId, force)
        setFriendProfile(friendTgId, getProfileStateFromInfo(info))
    } catch (error: unknown) {
        if (isFriendInfoPendingError(error)) {
            setFriendProfile(friendTgId, {
                status: 'pending',
                info: null,
            })
            return
        }

        setFriendProfile(friendTgId, {
            status: 'error',
            info: null,
            message: 'Не удалось загрузить данные друга',
        })
    }
}

async function loadFriendsFullInfo(): Promise<void> {
    await Promise.all(
        friendArr.value.map(friend => loadFriendProfile(friend.friend_tg_id)),
    )
}

async function addFriend(): Promise<void> {
    const parsedFriendId = Number(friendId.value)
    addFriendError.value = null

    if (!parsedFriendId) {
        addFriendError.value = 'Введите ID друга'
        return
    }

    isAddingFriend.value = true

    try {
        await friendStore.addFriend(parsedFriendId)
        await loadFriendProfile(parsedFriendId, true)
        friendId.value = ''
        showModal.value = false
    } catch {
        addFriendError.value = 'Не удалось добавить друга'
    } finally {
        isAddingFriend.value = false
    }
}

function closeAddModal(): void {
    showModal.value = false
    addFriendError.value = null
}

function openDeleteModal(friendTgId: number): void {
    friendToDelete.value = friendTgId
    showDeleteModal.value = true
}

function closeDeleteModal(): void {
    showDeleteModal.value = false
    friendToDelete.value = null
}

async function confirmDeleteFriend(): Promise<void> {
    if (!friendToDelete.value) {
        return
    }

    const deletedFriendId = friendToDelete.value
    const deleted = await friendStore.deleteFriend(deletedFriendId)

    if (deleted) {
        const { [deletedFriendId]: _removedProfile, ...profilesRest } =
            friendProfiles.value
        const { [deletedFriendId]: _removedExpanded, ...expandedRest } =
            expandedFriends.value
        friendProfiles.value = profilesRest
        expandedFriends.value = expandedRest
        closeDeleteModal()
    }
}

function openVisitModal(friendTgId: number): void {
    friendToVisit.value = friendTgId
    roomLoadError.value = null
}

function closeVisitModal(): void {
    friendToVisit.value = null
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

async function confirmVisitFriendRoom(): Promise<void> {
    const friendTgId = friendToVisit.value
    if (!friendTgId) return

    const requestId = ++roomLoadRequestId
    isRoomLoading.value = true
    roomLoadError.value = null
    startRoomLoader()

    try {
        await loadFriendRoom(friendTgId)
        if (requestId !== roomLoadRequestId) return

        completeRoomLoader()
        await router.push(`/friends/${friendTgId}/room`)
    } catch (error: unknown) {
        if (requestId !== roomLoadRequestId) return

        roomLoadError.value = roomErrorMessage(error)
        stopRoomLoader()
        isRoomLoading.value = false
        friendToVisit.value = null
    }
}

async function returnToSelfFromLoader(): Promise<void> {
    roomLoadRequestId += 1
    stopRoomLoader()
    friendToVisit.value = null
    await router.push('/')
    isRoomLoading.value = false
}
</script>
