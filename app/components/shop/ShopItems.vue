<template>
    <div
        class="grid grid-cols-3 gap-x-4 gap-y-6 p-4 h-[336px] overflow-y-auto [@media(max-height:595px)]:h-[260px] [@media(max-height:595px)]:gap-y-4 [@media(max-height:595px)]:p-2"
        v-if="filtredShopItems.length > 0"
    >
        <div
            v-for="shopItem in filtredShopItems"
            :key="shopItem.id"
            class="text-center relative"
        >
            <div
                class="absolute top-0 right-1 z-10 rounded-full p-1 bg-gray-900/50 backdrop-blur-sm"
            >
                <Icon
                    :name="
                        itemsStore.getCharacterItemByItemId(shopItem.id)
                            ?.is_favorite
                            ? 'flat-color-icons:like'
                            : 'hugeicons:favourite'
                    "
                    class="text-white"
                    @click="itemsStore.toggleFavoriteCharacterItem(shopItem.id)"
                />
            </div>
            <div
                class="relative flex items-center justify-center p-4 border rounded-lg glass-container-2 h-28 [@media(max-height:595px)]:h-24 [@media(max-height:595px)]:p-2 overflow-hidden"
            >
                <img
                    v-if="shopItem.picture_url"
                    :src="shopItem.picture_url"
                    :alt="shopItem.name"
                    class="absolute inset-0 w-full h-full object-cover"
                />
                <div
                    v-else
                    class="flex items-center justify-center text-gray-400 text-2xl w-full h-full"
                >
                    —
                </div>
            </div>
            <div>
                <span class="text-xs text-center font-semibold mt-2">{{
                    shopItem.name
                }}</span>
            </div>
            <div
                v-if="
                    !itemsStore.getCharacterItemByItemId(shopItem.id)
                        ?.is_purchased
                "
            >
                <div class="flex items-center justify-center">
                    Цена: {{ shopItem.cost }}
                </div>
                <UButton @click="buyItem(shopItem.id)" class="buy-button">
                    Купить
                </UButton>
            </div>
            <div v-else>
                <UButton
                    v-if="
                        !itemsStore.getCharacterItemByItemId(shopItem.id)
                            ?.is_active
                    "
                    @click="
                        equip(
                            itemsStore.getCharacterItemByItemId(shopItem.id)
                                ?.id
                        )
                    "
                >
                    Надеть
                </UButton>
                <UButton
                    v-else
                    @click="
                        unequip(
                            itemsStore.getCharacterItemByItemId(shopItem.id)
                                ?.id
                        )
                    "
                >
                    Снять
                </UButton>
            </div>
        </div>
    </div>

    <div v-else class="text-center flex justify-center items-center">
        {{
            isFavourite
                ? 'У вас пока нет понравившихся предметов...'
                : 'Нет подходящих товаров'
        }}
    </div>
    <button
        class="text-center flex self-center justify-self-center"
        @click="giveMeMoney"
    >
        Дай денег пж
    </button>
</template>

<script lang="ts" setup>
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useItemsStore } from '~/stores/items.store'
import type { CharacterItem, Item } from '~/types/items/items'

const props = defineProps({
    searchQuery: {
        type: String,
        required: false,
        default: '',
    },
    isFavourite: {
        type: Boolean,
        required: false,
        default: false,
    },
})

const itemsStore = useItemsStore()
const { allItems, characterItems } = storeToRefs(itemsStore)

const items = computed<Item[]>(() => allItems.value)
const charItems = computed<CharacterItem[]>(() => characterItems.value)
const likedItems = computed<Item[]>(
    () => itemsStore.getAllFavoriteCharacterItems
)
const nonFavoriteItems = computed<Item[]>(
    () => itemsStore.getNonFavoriteCatalogItems
)
const filtredShopItems = computed(() => {
    const source = props.isFavourite ? likedItems.value : nonFavoriteItems.value
    if (!props.searchQuery) return source
    return source.filter(item =>
        item.name.toLowerCase().includes(props.searchQuery.toLowerCase())
    )
})

const buyItem = (itemId: string) => {
    itemsStore.purchaseItem(itemId)
}

async function giveMeMoney() {
    await itemsStore.giveMeMoney(30)
}

async function equip(character_item_id: string | undefined) {
    if (!character_item_id) return
    await itemsStore.equipMyItem(character_item_id)
}
async function unequip(character_item_id: string | undefined) {
    if (!character_item_id) return
    await itemsStore.unequipMyItem(character_item_id)
}
</script>

<style></style>
