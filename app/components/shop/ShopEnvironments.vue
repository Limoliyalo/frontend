<template>
    <div class="p-4 flex items-center justify-center">
        <UCarousel
            v-if="filteredBackgrounds.length > 0"
            v-slot="{ item: carouselItem }"
            :items="filteredBackgrounds"
            orientation="vertical"
            :ui="{
                container:
                    'h-[336px] w-64 flex items-center justify-center [@media(max-height:595px)]:h-[260px]',
            }"
            class="relatve"
        >
            <div
                class="h-[320px] w-40 p-4 rounded-lg glass-container-2 flex flex-col items-center justify-center relative overflow-hidden [@media(max-height:595px)]:h-[240px] [@media(max-height:595px)]:w-32 [@media(max-height:595px)]:p-2"
            >
                <div
                    class="absolute top-0 right-1 z-20 rounded-full p-1 bg-gray-900/50 backdrop-blur-sm"
                >
                    <Icon
                        :name="
                            carouselItem.is_favorite
                                ? 'flat-color-icons:like'
                                : 'hugeicons:favourite'
                        "
                        :class="
                            carouselItem.is_favorite
                                ? 'text-red-500'
                                : 'text-white'
                        "
                        @click="
                            backgroundsStore.toggleFavoriteBackground(
                                carouselItem.id,
                            )
                        "
                    />
                </div>
                <div class="absolute inset-0 rounded-lg overflow-hidden">
                    <img
                        v-if="carouselItem.picture_url"
                        :src="carouselItem.picture_url"
                        :alt="carouselItem.name"
                        class="w-full h-full object-fill"
                    />
                    <div
                        v-else
                        class="flex items-center justify-center text-gray-400 text-2xl w-full h-full bg-gray-900/30"
                    >
                        —
                    </div>
                </div>
                <span
                    class="relative z-10 text-2xl font-bold px-3 py-1.5 rounded-md bg-gray-900/50 backdrop-blur-sm [@media(max-height:595px)]:text-xl"
                    >{{ carouselItem.name }}</span
                >
                <div
                    class="absolute top-60 z-10 px-3 py-2 rounded-lg bg-gray-900/50 backdrop-blur-sm [@media(max-height:595px)]:top-40"
                >
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
        <div
            v-else
            class="text-center flex justify-center items-center h-[336px] [@media(max-height:595px)]:h-[260px]"
        >
            {{
                isFavourite
                    ? 'У вас пока нет понравившихся окружений...'
                    : 'Нет подходящих окружений'
            }}
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useMyBackgroundsStore } from '~/stores/backgrounds.store'
import type { CharacterBackground } from '~/types/backgrounds/backgrounds'

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

const backgroundsStore = useMyBackgroundsStore()
const { allBackgrounds, characterBackgrounds } = storeToRefs(backgroundsStore)

const shopBackgroundsWithStatus = computed(() => {
    // Создаем Map, где ключ - это ID предмета (item_id),
    // а значение - сам объект characterItem.
    const characterItemsMap = new Map<string, CharacterBackground>(
        characterBackgrounds.value.map(charItem => [
            charItem.background_id,
            charItem,
        ]),
    )

    return allBackgrounds.value.map(item => {
        // Находим соответствующий купленный предмет
        const charItem = characterItemsMap.get(item.id)

        return {
            ...item,
            // Покупка определяется нормализованным флагом из стора.
            is_purchased: charItem ? charItem.is_purchased : false,
            // Статус активности берем из найденного charItem
            is_active: charItem ? charItem.is_active : false,
            // Избранное
            is_favorite: charItem ? charItem.is_favorite : false,
            // ID для связи (character_item_id), который нужен для API
            character_item_id: charItem ? charItem.id : null,
        }
    })
})

const filteredBackgrounds = computed(() => {
    const source = props.isFavourite
        ? shopBackgroundsWithStatus.value.filter(b => b.is_favorite)
        : shopBackgroundsWithStatus.value

    const normalizedQuery = props.searchQuery.trim().toLowerCase()
    if (!normalizedQuery) return source

    return source.filter(background =>
        background.name.toLowerCase().includes(normalizedQuery),
    )
})

const buyItem = (itemId: string) => {
    backgroundsStore.purchaseBackground(itemId)
}

async function equip(character_background_id: string | null) {
    if (!character_background_id) return
    await backgroundsStore.equipBackground(character_background_id)
}
async function unequip(character_background_id: string | null) {
    if (!character_background_id) return
    await backgroundsStore.unequipBackground(character_background_id)
}
</script>

<style></style>
