<template>
    <div class="p-4 flex items-center justify-center">
        <div v-if="filteredBackgrounds.length > 0" class="relative flex items-center justify-center">
            <!-- Вертикальный слайдер -->
            <div
                ref="sliderRef"
                class="relative overflow-hidden h-[320px] w-40 [@media(max-height:595px)]:h-[240px] [@media(max-height:595px)]:w-32"
                @touchstart="onTouchStart"
                @touchmove="onTouchMove"
                @touchend="onTouchEnd"
                @wheel.prevent="onWheel"
            >
                <div
                    class="transition-transform duration-300 ease-out will-change-transform"
                    :style="{ transform: `translateY(${translateY}px)` }"
                >
                    <div
                        v-for="(carouselItem) in filteredBackgrounds"
                        :key="carouselItem.id"
                        class="h-[320px] w-40 p-4 rounded-lg glass-container-2 flex flex-col items-center justify-center relative overflow-hidden [@media(max-height:595px)]:h-[240px] [@media(max-height:595px)]:w-32 [@media(max-height:595px)]:p-2"
                    >
                        <!-- Кнопка избранного -->
                        <div
                            class="absolute top-0 right-1 z-20 rounded-full p-1 bg-gray-900/50 backdrop-blur-sm cursor-pointer"
                            @click.stop="backgroundsStore.toggleFavoriteBackground(carouselItem.id)"
                        >
                            <Icon
                                :name="carouselItem.is_favorite ? 'flat-color-icons:like' : 'hugeicons:favourite'"
                                :class="carouselItem.is_favorite ? 'text-red-500' : 'text-white'"
                            />
                        </div>

                        <!-- Фоновое изображение -->
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

                        <!-- Название -->
                        <span
                            class="relative z-10 text-2xl font-bold px-3 py-1.5 rounded-md bg-gray-900/50 backdrop-blur-sm [@media(max-height:595px)]:text-xl"
                        >{{ carouselItem.name }}</span>

                        <!-- Кнопки действий -->
                        <div class="absolute bottom-4 z-10 px-3 py-2 rounded-lg bg-gray-900/50 backdrop-blur-sm [@media(max-height:595px)]:bottom-2">
                            <template v-if="carouselItem.is_purchased">
                                <div class="flex items-center justify-center">
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
                            </template>
                            <template v-else>
                                <div class="flex items-center justify-center mb-1">
                                    Цена: {{ carouselItem.cost }}
                                </div>
                                <UButton
                                    @click="buyItem(carouselItem.id)"
                                    class="buy-button"
                                >
                                    Купить
                                </UButton>
                            </template>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Навигационные точки справа -->
            <div class="absolute -right-5 top-0 h-full flex flex-col items-center justify-center gap-1.5">
                <div
                    v-for="(_, index) in filteredBackgrounds"
                    :key="index"
                    class="rounded-full cursor-pointer transition-all duration-200"
                    :class="index === currentIndex ? 'w-2 h-2 bg-white' : 'w-1.5 h-1.5 bg-white/40'"
                    @click="goTo(index)"
                />
            </div>
        </div>

        <!-- Пустое состояние -->
        <div
            v-else
            class="text-center flex justify-center items-center h-[320px] [@media(max-height:595px)]:h-[240px]"
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
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
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

// ─── Слайдер ────────────────────────────────────────────────────────────────

const sliderRef = ref<HTMLElement | null>(null)
const currentIndex = ref(0)
const slideHeight = ref(320)

const translateY = computed(() => -currentIndex.value * slideHeight.value)

function goTo(index: number) {
    const max = filteredBackgrounds.value.length - 1
    currentIndex.value = Math.max(0, Math.min(index, max))
}

function next() { goTo(currentIndex.value + 1) }
function prev() { goTo(currentIndex.value - 1) }

// Сброс при смене списка
watch(() => filteredBackgrounds.value.length, () => {
    currentIndex.value = 0
})

// Высота слайда по размеру экрана
function updateSlideHeight() {
    slideHeight.value = window.innerHeight <= 595 ? 240 : 320
}

onMounted(() => {
    updateSlideHeight()
    window.addEventListener('resize', updateSlideHeight)
})

onUnmounted(() => {
    window.removeEventListener('resize', updateSlideHeight)
})

// ─── Touch ───────────────────────────────────────────────────────────────────

const touchStartY = ref(0)
const touchDelta = ref(0)

function onTouchStart(e: TouchEvent) {
    touchStartY.value = e.touches[0].clientY
    touchDelta.value = 0
}

function onTouchMove(e: TouchEvent) {
    touchDelta.value = touchStartY.value - e.touches[0].clientY
}

function onTouchEnd() {
    if (touchDelta.value > 40) next()
    else if (touchDelta.value < -40) prev()
    touchDelta.value = 0
}

// ─── Mouse wheel ─────────────────────────────────────────────────────────────

let wheelLocked = false

function onWheel(e: WheelEvent) {
    if (wheelLocked) return
    wheelLocked = true
    if (e.deltaY > 0) next()
    else prev()
    setTimeout(() => { wheelLocked = false }, 350)
}

// ─── Данные ──────────────────────────────────────────────────────────────────

const shopBackgroundsWithStatus = computed(() => {
    const characterItemsMap = new Map<string, CharacterBackground>(
        characterBackgrounds.value.map(charItem => [
            charItem.background_id,
            charItem,
        ]),
    )

    return allBackgrounds.value.map(item => {
        const charItem = characterItemsMap.get(item.id)
        return {
            ...item,
            is_purchased: charItem ? charItem.is_purchased : false,
            is_active: charItem ? charItem.is_active : false,
            is_favorite: charItem ? charItem.is_favorite : false,
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

// ─── Действия ────────────────────────────────────────────────────────────────

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