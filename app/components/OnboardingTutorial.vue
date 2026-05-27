<template>
    <section
        class="glass-container flex min-h-[330px] w-full max-w-[330px] flex-col rounded-3xl p-5 text-white"
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
    >
        <div
            class="mb-5 flex shrink-0 items-center justify-center gap-2"
            aria-label="Прогресс обучения"
        >
            <span
                v-for="(_, index) in slides"
                :key="index"
                class="h-2 rounded-full transition-all duration-200"
                :class="
                    index === activeSlideIndex
                        ? 'w-6 bg-white'
                        : 'w-2 bg-white/35'
                "
            />
        </div>

        <div class="flex min-h-0 flex-1 flex-col justify-center gap-3">
            <p class="text-center text-xs font-semibold uppercase text-white/60">
                Шаг {{ activeSlideIndex + 1 }} из {{ slides.length }}
            </p>
            <h2
                id="onboarding-title"
                class="text-center text-2xl font-bold leading-tight"
            >
                {{ activeSlide.title }}
            </h2>
            <p class="text-center text-sm leading-relaxed text-white/85">
                {{ activeSlide.body }}
            </p>
        </div>

        <UButton
            block
            size="xl"
            class="mt-6 shrink-0 cursor-pointer justify-center"
            @click="goNext"
        >
            {{ isLastSlide ? 'Приступим' : 'Далее' }}
        </UButton>
    </section>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'

interface OnboardingSlide {
    title: string
    body: string
}

const slides: OnboardingSlide[] = [
    {
        title: 'Привет!',
        body: 'Это Healthity — приложение, которое помогает выстраивать полезные привычки, следить за активностью и делать заботу о себе регулярной.',
    },
    {
        title: 'Основной флоу',
        body: 'Выполняйте цели по выбранным активностям каждый день. За прогресс вы будете получать монеты, которые начисляются в конце дня.',
    },
    {
        title: 'Монеты и стиль',
        body: 'За монеты можно покупать окружение для персонажа, показывать его уникальность и соревноваться с друзьями.',
    },
    {
        title: 'Подсказки рядом',
        body: 'Если что-то непонятно, на каждой странице есть кнопка с восклицательным знаком. Она подскажет, зачем нужна страница и как ей пользоваться. Перейдем к выбору активностей.',
    },
]

const emit = defineEmits<{
    complete: []
}>()

const activeSlideIndex = ref(0)
const activeSlide = computed(() => slides[activeSlideIndex.value]!)
const isLastSlide = computed(() => activeSlideIndex.value === slides.length - 1)

function goNext(): void {
    if (isLastSlide.value) {
        emit('complete')
        return
    }

    activeSlideIndex.value += 1
}
</script>
