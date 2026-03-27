<template>
    <div class="glass-container p-4 w-full">
        <h3 class="text-sm font-semibold text-white/70 mb-3 text-center">
            Последние 7 дней
        </h3>
        <div class="flex items-end justify-around gap-1">
            <div
                v-for="item in chartData"
                :key="item.date"
                class="flex flex-col items-center flex-1 gap-1"
            >
                <span class="text-xs text-white/60 h-5 flex items-center">
                    {{ item.percentage > 0 ? Math.round(item.percentage) + '%' : '' }}
                </span>
                <div class="w-full h-[120px] flex items-end">
                    <div
                        class="w-full rounded-t-md transition-all duration-500"
                        :style="{
                            height: Math.max(item.percentage, 0) + '%',
                            minHeight: item.percentage > 0 ? '4px' : '0',
                            backgroundColor: color || '#60a5fa',
                            opacity: item.isToday ? '1' : '0.7',
                        }"
                    />
                </div>
                <span
                    class="text-xs font-medium"
                    :class="item.isToday ? 'text-white' : 'text-white/50'"
                >
                    {{ item.dayLabel }}
                </span>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
interface ChartItem {
    date: string
    percentage: number
    dayLabel: string
    isToday: boolean
}

defineProps<{
    chartData: ChartItem[]
    color: string
}>()
</script>
