<template>
    <div class="flex flex-col gap-1.5 mt-4 mx-4">
        <div class="flex gap-1.5 items-center justify-start">
            <ShopSearch @search="handleSearch" />
            <ShopFavourite @click="isFavourite = !isFavourite" />
        </div>
        <div class="glass-container overflow-hidden max-h-110 w-full mt-4 p-4">
            <UTabs :items="tabItems" class="w-full">
                <template #items>
                    <ShopItems
                        :search-query="searchQuery"
                        :is-favourite="isFavourite"
                    />
                </template>
                <template #environments>
                    <ShopEnvironments />
                </template>
            </UTabs>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
const tabItems = [
    {
        slot: 'items',
        label: 'Предметы',
    },
    {
        slot: 'environments',
        label: 'Окружения',
    },
]

const isFavourite = ref(false)

const searchQuery = ref('')

const handleSearch = (query: string) => {
    searchQuery.value = query
}
</script>

<style>
.glass-container-2 {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    transition: all 0.3s ease;
}

.glass-container-2:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.05);
}
</style>
