<template>
    <div class="grid grid-cols-3 gap-x-4 gap-y-6 p-4 h-[336px] overflow-y-auto">
        <div
            v-for="shopItem in filtredShopItems"
            :key="shopItem.id"
            class="text-center"
        >
            <div
                class="flex items-center justify-center p-4 border rounded-lg glass-container-2 h-28"
            >
                <Icon :name="shopItem.icon" class="w-20 h-20" />
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
})

const filtredShopItems = computed(() => {
    if (!props.searchQuery) {
        return shopItems.value
    }
    return shopItems.value.filter(item =>
        item.name.toLowerCase().includes(props.searchQuery.toLowerCase())
    )
})

const shopItems = ref([
    { id: 1, name: 'Лампа', icon: 'i-lucide-lamp' },
    { id: 2, name: 'Стол', icon: 'i-lucide-table' },
    { id: 3, name: 'Стул', icon: 'i-lucide-armchair' },
    { id: 4, name: 'Книга', icon: 'i-lucide-book-open' },
    { id: 5, name: 'Картина', icon: 'i-lucide-image' },
    { id: 6, name: 'Растение', icon: 'i-lucide-flower-2' },
    { id: 7, name: 'Часы', icon: 'i-lucide-clock' },
    { id: 8, name: 'Компьютер', icon: 'i-lucide-laptop' },
    { id: 9, name: 'Телефон', icon: 'i-lucide-smartphone' },
    { id: 10, name: 'Лампа', icon: 'i-lucide-lamp' },
    { id: 11, name: 'Стол', icon: 'i-lucide-table' },
    { id: 12, name: 'Стул', icon: 'i-lucide-armchair' },
    { id: 13, name: 'Книга', icon: 'i-lucide-book-open' },
    { id: 14, name: 'Картина', icon: 'i-lucide-image' },
    { id: 15, name: 'Растение', icon: 'i-lucide-flower-2' },
    { id: 16, name: 'Часы', icon: 'i-lucide-clock' },
    { id: 17, name: 'Компьютер', icon: 'i-lucide-laptop' },
    { id: 18, name: 'Телефон', icon: 'i-lucide-smartphone' },
    { id: 19, name: 'Лампа', icon: 'i-lucide-lamp' },
    { id: 20, name: 'Стол', icon: 'i-lucide-table' },
    { id: 21, name: 'Стул', icon: 'i-lucide-armchair' },
    { id: 22, name: 'Книга', icon: 'i-lucide-book-open' },
    { id: 23, name: 'Картина', icon: 'i-lucide-image' },
    { id: 24, name: 'Растение', icon: 'i-lucide-flower-2' },
    { id: 25, name: 'Часы', icon: 'i-lucide-clock' },
    { id: 26, name: 'Компьютер', icon: 'i-lucide-laptop' },
    { id: 27, name: 'Телефон', icon: 'i-lucide-smartphone' },
])
</script>

<style></style>
