<template>
    <div
        class="grid grid-cols-3 gap-x-4 gap-y-6 p-4 h-[336px] overflow-y-auto [@media(max-height:595px)]:h-[260px] [@media(max-height:595px)]:gap-y-4 [@media(max-height:595px)]:p-2"
    >
        <div
            v-for="shopItem in filtredShopItems"
            :key="shopItem.id"
            class="text-center relative"
        >
            <div class="absolute top-0 right-1 z-10">
                <Icon
                    :name="
                        shopItem.isFavourite
                            ? 'flat-color-icons:like'
                            : 'hugeicons:favourite'
                    "
                    @click="shopItem.isFavourite = !shopItem.isFavourite"
                />
            </div>
            <div
                class="flex items-center justify-center p-4 border rounded-lg glass-container-2 h-28 [@media(max-height:595px)]:h-24 [@media(max-height:595px)]:p-2"
            >
                <Icon
                    :name="shopItem.icon"
                    class="w-20 h-20 [@media(max-height:595px)]:w-16 [@media(max-height:595px)]:h-16"
                />
            </div>
            <span class="text-xs text-center font-semibold mt-2">{{
                shopItem.name
            }}</span>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

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

const filtredShopItems = computed(() => {
    let items = shopItems.value

    if (props.isFavourite) {
        items = items.filter(item => item.isFavourite)
    }

    if (props.searchQuery) {
        items = items.filter(item =>
            item.name.toLowerCase().includes(props.searchQuery.toLowerCase())
        )
    }

    return items
})

const shopItems = ref([
    { id: 1, name: 'Лампа', icon: 'i-lucide-lamp', isFavourite: false },
    { id: 2, name: 'Стол', icon: 'i-lucide-table', isFavourite: false },
    { id: 3, name: 'Стул', icon: 'i-lucide-armchair', isFavourite: false },
    { id: 4, name: 'Книга', icon: 'i-lucide-book-open', isFavourite: false },
    { id: 5, name: 'Картина', icon: 'i-lucide-image', isFavourite: false },
    { id: 6, name: 'Растение', icon: 'i-lucide-flower-2', isFavourite: false },
    { id: 7, name: 'Часы', icon: 'i-lucide-clock', isFavourite: false },
    { id: 8, name: 'Компьютер', icon: 'i-lucide-laptop', isFavourite: false },
    { id: 9, name: 'Телефон', icon: 'i-lucide-smartphone', isFavourite: false },
    { id: 10, name: 'Лампа', icon: 'i-lucide-lamp', isFavourite: false },
    { id: 11, name: 'Стол', icon: 'i-lucide-table', isFavourite: false },
    { id: 12, name: 'Стул', icon: 'i-lucide-armchair', isFavourite: false },
    { id: 13, name: 'Книга', icon: 'i-lucide-book-open', isFavourite: false },
    { id: 14, name: 'Картина', icon: 'i-lucide-image', isFavourite: false },
    { id: 15, name: 'Растение', icon: 'i-lucide-flower-2', isFavourite: false },
    { id: 16, name: 'Часы', icon: 'i-lucide-clock', isFavourite: false },
    { id: 17, name: 'Компьютер', icon: 'i-lucide-laptop', isFavourite: false },
    {
        id: 18,
        name: 'Телефон',
        icon: 'i-lucide-smartphone',
        isFavourite: false,
    },
    { id: 19, name: 'Лампа', icon: 'i-lucide-lamp', isFavourite: false },
    { id: 20, name: 'Стол', icon: 'i-lucide-table', isFavourite: false },
    { id: 21, name: 'Стул', icon: 'i-lucide-armchair', isFavourite: false },
    { id: 22, name: 'Книга', icon: 'i-lucide-book-open', isFavourite: false },
    { id: 23, name: 'Картина', icon: 'i-lucide-image', isFavourite: false },
    { id: 24, name: 'Растение', icon: 'i-lucide-flower-2', isFavourite: false },
    { id: 25, name: 'Часы', icon: 'i-lucide-clock', isFavourite: false },
    { id: 26, name: 'Компьютер', icon: 'i-lucide-laptop', isFavourite: false },
    {
        id: 27,
        name: 'Телефон',
        icon: 'i-lucide-smartphone',
        isFavourite: false,
    },
])
</script>

<style></style>
