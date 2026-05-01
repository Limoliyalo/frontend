<template>
    <div class="flex min-h-0 flex-1 flex-col gap-1.5 mx-4 mt-4 mb-2">
        <PageBackground
            :url="activeBackgroundForHome?.shop_url"
            :alt="activeBackgroundForHome?.name"
        />
        <div class="flex gap-1.5 items-center justify-start">
            <ShopSearch @search="handleSearch" />
            <ShopFavourite @click="isFavourite = !isFavourite" />
        </div>
        <div
            class="glass-container mt-4 flex min-h-0 w-full flex-1 flex-col overflow-hidden p-4"
        >
            <div class="flex min-h-0 flex-1 flex-col">
                <UTabs
                    :items="tabItems"
                    class="flex h-full min-h-0 w-full flex-1 flex-col"
                    :ui="{
                        list: 'shrink-0',
                        content:
                            'flex min-h-0 flex-1 flex-col overflow-hidden',
                    }"
                >
                    <template #items>
                        <ShopItems
                            :search-query="searchQuery"
                            :is-favourite="isFavourite"
                        />
                    </template>
                    <template #environments>
                        <ShopEnvironments
                            :search-query="searchQuery"
                            :is-favourite="isFavourite"
                        />
                    </template>
                </UTabs>
            </div>
            <div class="flex shrink-0 items-center justify-center pt-2">
                баланс: {{ userStat?.balance }}
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
definePageMeta({ layout: 'inner-page', pageTitle: 'Магазин' })

import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useMyUserStore } from '~/stores/user.store'
import { useItemsStore } from '~/stores/items.store'
import { useMyBackgroundsStore } from '~/stores/backgrounds.store'

const userStore = useMyUserStore()
const itemsStore = useItemsStore()
const backgroundsStore = useMyBackgroundsStore()
const { activeBackgroundForHome } = storeToRefs(backgroundsStore)

const userStat = computed(() => userStore.statistic)

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

onMounted(async () => {
    await Promise.all([
        userStore.loadUserStatistic(),
        itemsStore.loadItemsCatalog(),
        itemsStore.loadCharacterItems(),
        backgroundsStore.ensureBackgroundsLoaded(),
    ])
})
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
