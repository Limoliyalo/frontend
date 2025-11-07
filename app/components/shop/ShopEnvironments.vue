<template>
    <div class="p-4 flex items-center justify-center">
        <UCarousel
            v-slot="{ item: carouselItem }"
            :items="shopBackgroundsWithStatus"
            orientation="vertical"
            :ui="{
                container:
                    'h-[336px] w-64 flex items-center justify-center [@media(max-height:595px)]:h-[260px]',
            }"
            class="relatve"
        >
            <div
                class="h-[320px] w-40 p-4 rounded-lg glass-container-2 flex flex-col items-center justify-center [@media(max-height:595px)]:h-[240px] [@media(max-height:595px)]:w-32 [@media(max-height:595px)]:p-2"
            >
                <!-- <Icon
                    :name="carouselItem.icon"
                    class="w-32 h-32 mb-4 [@media(max-height:595px)]:w-24 [@media(max-height:595px)]:h-24 [@media(max-height:595px)]:mb-2"
                /> -->
                <span
                    class="text-2xl font-bold [@media(max-height:595px)]:text-xl"
                    >{{ carouselItem.name }}</span
                >
                <div class="absolute top-60 [@media(max-height:595px)]:top-40">
                    <div
                        class="flex items-center justify-center"
                        v-if="!carouselItem.is_purchased"
                    >
                        Цена: {{ carouselItem.cost }}
                    </div>
                    <div
                        class="flex items-center justify-center"
                        v-if="carouselItem.is_purchased"
                    >
                        <UButton
                            v-if="!carouselItem.is_active"
                            @click="equip(carouselItem.character_item_id)"
                        >
                            Надеть
                        </UButton>
                        <UButton
                            v-else
                            @click="unequip(carouselItem.character_item_id)"
                        >
                            Снять
                        </UButton>
                    </div>

                    <!-- Кнопка "Купить" использует shopItem.id -->
                    <UButton
                        v-else
                        @click="buyItem(carouselItem.id)"
                        class="buy-button"
                    >
                        Купить
                    </UButton>
                </div>
            </div>
        </UCarousel>
    </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useMyBackgroundsStore } from '~/stores/backgrounds.store'
import type { CharacterBackground } from '~/types/backgrounds/backgrounds'

const backgroundsStore = useMyBackgroundsStore()
const { allBackgrounds, characterBackgrounds } = storeToRefs(backgroundsStore)

const shopBackgroundsWithStatus = computed(() => {
    // Создаем Map, где ключ - это ID предмета (item_id),
    // а значение - сам объект characterItem.
    const characterItemsMap = new Map<string, CharacterBackground>(
        characterBackgrounds.value.map(charItem => [
            charItem.background_id,
            charItem,
        ])
    )

    return allBackgrounds.value.map(item => {
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

const buyItem = (itemId: string) => {
    backgroundsStore.purchaseBackground(itemId)
}

async function equip(character_background_id: string | null) {
    if (!character_background_id) return
    await backgroundsStore.equipMyBackground(character_background_id)
}
async function unequip(character_background_id: string | null) {
    if (!character_background_id) return
    await backgroundsStore.unequipMyBackground(character_background_id)
}
</script>

<style></style>
