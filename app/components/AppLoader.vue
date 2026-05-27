<template>
    <div
        class="fixed inset-0 z-[100000] min-h-dvh overflow-hidden bg-[var(--app-background)] text-white"
    >
        <img
            :src="loaderImage"
            alt="Загрузка Healthity"
            class="absolute inset-0 h-full w-full object-cover"
        />

        <div
            class="absolute inset-x-0 bottom-10 z-10 mx-auto flex w-full max-w-[360px] flex-col gap-3 px-6"
        >
            <UProgress :model-value="progress" />
            <p :class="messageClasses">
                {{ message }}
            </p>
            <UButton
                v-if="showRetry || actionLabel"
                class="self-center"
                variant="soft"
                color="neutral"
                @click="handleButtonClick"
            >
                {{ showRetry ? 'Попробовать еще раз' : actionLabel }}
            </UButton>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import loaderImage from '~/assets/Loader.png'

const props = defineProps<{
    progress: number
    message: string
    showRetry?: boolean
    actionLabel?: string
    messageClass?: string
}>()

const emit = defineEmits<{
    retry: []
    action: []
}>()

const messageClasses = computed(
    () =>
        props.messageClass ??
        'min-h-12 text-center text-sm leading-6 text-white/90',
)

function handleButtonClick(): void {
    if (props.showRetry) {
        emit('retry')
        return
    }

    emit('action')
}
</script>
