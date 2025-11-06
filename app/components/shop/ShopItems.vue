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
                <Icon
                    :name="
                        shopItem.is_favorite
                            ? 'flat-color-icons:like'
                            : 'hugeicons:favourite'
                    "
                    @click="
                        itemsStore.toggleFavorite(shopItem.character_item_id)
                    "
                />
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
        </div>
    </div>
    <div v-else class="text-center flex justify-center items-center">
        У вас пока нет понравившихся предметов...
    </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useItemsStore } from '~/stores/items.store'

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
const { getCombinedItemsCatalog: allItems } = storeToRefs(itemsStore)

const filtredShopItems = computed(() => {
    let items = allItems.value

    if (props.isFavourite) {
        items = items.filter(item => item.is_favorite)
    }

    if (props.searchQuery) {
        items = items.filter(item =>
            item.name.toLowerCase().includes(props.searchQuery.toLowerCase())
        )
    }

    return items
})

const shopItems = ref([])
</script>

<style></style>
