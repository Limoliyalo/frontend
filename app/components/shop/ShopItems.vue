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
            <div class="absolute top-0 right-1 z-10">
                <!-- <Icon
                    :name="
                        shopItem.is_favorite
                            ? 'flat-color-icons:like'
                            : 'hugeicons:favourite'
                    "
                    @click="itemsStore.toggleFavorite(shopItem.id)"
                /> -->
            </div>
            <div
                class="flex items-center justify-center p-4 border rounded-lg glass-container-2 h-28 [@media(max-height:595px)]:h-24 [@media(max-height:595px)]:p-2"
            >
                <!-- <Icon
                    :name="shopItem.icon"
                    class="w-20 h-20 [@media(max-height:595px)]:w-16 [@media(max-height:595px)]:h-16"
                /> -->
            </div>
            <span class="text-xs text-center font-semibold mt-2">{{
                shopItem.name
            }}</span>
            <div
                class="flex items-center justify-center"
                v-if="!shopItem.is_purchased"
            >
                Цена: {{ shopItem.cost }}
            </div>
            <button v-if="shopItem.is_purchased" class="purchased-button">
                <div>
                    <button
                        v-if="!shopItem.is_active"
                        @click="equip(shopItem.character_item_id)"
                    >
                        Надеть
                    </button>
                    <button v-else @click="unequip(shopItem.character_item_id)">
                        Снять
                    </button>
                </div>
            </button>

            <!-- Кнопка "Купить" использует shopItem.id -->
            <button v-else @click="buyItem(shopItem.id)" class="buy-button">
                Купить
            </button>
        </div>
    </div>

    <div v-else class="text-center flex justify-center items-center">
        У вас пока нет понравившихся предметов...
    </div>
    <button
        class="text-center flex justify-center items-center"
        @click="giveMeMoney"
    >
        Дай денег пж
    </button>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useItemsStore } from '~/stores/items.store'
import type { CharacterItem } from '~/types/items/items'
import type { Item } from '~/types/items/items'

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

const shopItemsWithStatus = computed(() => {
    // Создаем Map, где ключ - это ID предмета (item_id),
    // а значение - сам объект characterItem.
    const characterItemsMap = new Map<string, CharacterItem>(
        characterItems.value.map(charItem => [charItem.item_id, charItem])
    )

    return allItems.value.map(item => {
        // Находим соответствующий купленный предмет
        const charItem = characterItemsMap.get(item.id)

        return {
            ...item,
            // Предмет куплен, если он есть в Map
            is_purchased: !!charItem,
            // Статус активности берем из найденного charItem
            is_active: charItem ? charItem.is_active : false,
            // ID для связи (character_item_id), который нужен для API
            character_item_id: charItem ? charItem.id : null,
        }
    })
})

const filtredShopItems = computed(() => {
    let items = shopItemsWithStatus.value

    // if (props.isFavourite) {
    //     items = items.filter(item => characterItems.is_favorite)
    // }

    if (props.searchQuery) {
        items = items.filter(item =>
            item.name.toLowerCase().includes(props.searchQuery.toLowerCase())
        )
    }

    return items
})

const buyItem = (itemId: string) => {
    itemsStore.purchaseItem(itemId)
}

async function giveMeMoney() {
    await itemsStore.giveMeMoney(30)
}

async function equip(character_item_id: string | null) {
    if (!character_item_id) return
    await itemsStore.equipMyItem(character_item_id)
}
async function unequip(character_item_id: string | null) {
    if (!character_item_id) return
    await itemsStore.unequipMyItem(character_item_id)
}
</script>

<style></style>
