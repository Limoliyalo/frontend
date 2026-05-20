<template>
    <UPopover
        :content="{
            side: 'bottom',
            align: 'end',
            sideOffset: 10,
            collisionPadding: 16,
        }"
        arrow
        :ui="{
            content:
                'w-72 max-w-[calc(100vw-2rem)] rounded-3xl border border-white/20 bg-[#2b2f43]/95 p-4 text-white shadow-xl backdrop-blur-md',
            arrow: 'fill-[#2b2f43]',
        }"
    >
        <button
            class="glass-container flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg font-bold leading-none text-white cursor-pointer"
            type="button"
            aria-label="Информация о странице"
        >
            <span aria-hidden="true">!</span>
        </button>

        <template #content>
            <div class="space-y-2 text-left">
                <p v-if="help.title" class="text-sm font-bold leading-snug">
                    {{ help.title }}
                </p>
                <p class="text-sm leading-relaxed text-white/85">
                    {{ help.body }}
                </p>
            </div>
        </template>
    </UPopover>
</template>

<script lang="ts" setup>
interface PageHelp {
    title?: string
    body: string
}

defineProps<{
    help: PageHelp
}>()
</script>
