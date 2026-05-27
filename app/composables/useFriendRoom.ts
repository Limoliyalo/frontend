import synthWaveGirlImage from '~/assets/SynthWave_Girl.png'
import { isApiError } from '~/composables/useApi'
import { preloadImages } from '~/composables/useImagePreload'
import { useMyBackgroundsStore } from '~/stores/backgrounds.store'
import { useUserFriendsStore } from '~/stores/friends.store'
import { useItemsStore } from '~/stores/items.store'
import type { Background } from '~/types/backgrounds/backgrounds'
import type { FriendFullInfo } from '~/types/friends/friends'
import type { ItemWithBackgroundPosition } from '~/types/items/items'

export interface FriendRoomData {
    friendInfo: FriendFullInfo
    background: Background | null
    itemsWithPositions: ItemWithBackgroundPosition[]
}

export type FriendRoomLoadErrorReason = 'no_character'

export class FriendRoomLoadError extends Error {
    reason: FriendRoomLoadErrorReason

    constructor(reason: FriendRoomLoadErrorReason) {
        super(reason)
        this.name = 'FriendRoomLoadError'
        this.reason = reason
    }
}

export const isFriendInfoPendingError = (error: unknown): boolean =>
    isApiError(error) && [400, 403, 404, 422].includes(error.status)

export const useFriendRoom = () => {
    const backgroundsStore = useMyBackgroundsStore()
    const friendStore = useUserFriendsStore()
    const itemsStore = useItemsStore()

    async function loadFriendRoom(
        friendTgId: number,
        force = false,
    ): Promise<FriendRoomData> {
        const [friendInfo] = await Promise.all([
            friendStore.loadFriendFullInfo(friendTgId, force),
            backgroundsStore.loadBackgroundsCatalog(),
            itemsStore.ensureItemsCatalogLoaded(),
        ])

        if (!friendInfo.character) {
            throw new FriendRoomLoadError('no_character')
        }

        const activeBackgroundLink =
            friendInfo.character_backgrounds?.find(
                background => background.is_active,
            ) ?? null
        const background = activeBackgroundLink
            ? (backgroundsStore.backgroundById.get(
                  activeBackgroundLink.background_id,
              ) ?? null)
            : null

        const rawItemsWithPositions = background
            ? await itemsStore.loadRawItemsWithPositionsForBackground(
                  background.id,
                  force,
              )
            : []
        const activeFriendItemIds = new Set(
            (friendInfo.character_items ?? [])
                .filter(item => item.is_active && item.is_purchased)
                .map(item => item.item_id),
        )
        const itemsWithPositions = rawItemsWithPositions.filter(entry =>
            activeFriendItemIds.has(entry.item.id),
        )

        await preloadImages([
            background?.picture_url ?? synthWaveGirlImage,
            ...itemsWithPositions.map(item => item.item.picture_url),
        ])

        return {
            friendInfo,
            background,
            itemsWithPositions,
        }
    }

    return {
        loadFriendRoom,
    }
}
