<template>
    <div class="glass-container flex items-center justify-around w-full">
        <div>
            <svg :width="size" :height="size" class="ring-chart">
                <!-- Фоновые дуги -->
                <path
                    v-for="(segment, index) in segments"
                    :key="`bg-${index}`"
                    :d="getBackgroundPath(index)"
                    fill="none"
                    :stroke="backgroundColor[index]"
                    :stroke-width="strokeWidth"
                    stroke-linecap="butt"
                />

                <!-- Прогресс-дуги -->
                <path
                    v-for="(segment, index) in segments"
                    :key="`progress-${index}`"
                    :d="createArc(segment.progress, index)"
                    fill="none"
                    :stroke="segment.color"
                    :stroke-width="strokeWidth"
                    stroke-linecap="round"
                    class="progress-arc"
                />
            </svg>
        </div>

        <p class="text-center text-xs">Прогресс пользователя за день</p>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface RingSegment {
    progress: number
    color: string
}

interface Props {
    segments: RingSegment[]
    size?: number
    strokeWidth?: number
    backgroundColor: string[]

    gapAngle?: number
}

const props = withDefaults(defineProps<Props>(), {
    size: 80,
    strokeWidth: 10,
    gapAngle: 3,
})

const radius = computed(() => (props.size / 2) * 0.8)
const center = computed(() => props.size / 2)

const getSegmentPath = (segmentIndex: number) => {
    const startAngle = -90
    const totalSegments = props.segments.length
    const totalGaps = props.gapAngle * totalSegments
    const segmentAngle = (360 - totalGaps) / totalSegments
    const angle = startAngle + segmentIndex * (segmentAngle + props.gapAngle)

    return { angle, segmentAngle }
}

const getBackgroundPath = (segmentIndex: number) => {
    const { angle, segmentAngle } = getSegmentPath(segmentIndex)
    const startRad = (angle * Math.PI) / 180
    const endRad = ((angle + segmentAngle) * Math.PI) / 180

    const x1 = center.value + radius.value * Math.cos(startRad)
    const y1 = center.value + radius.value * Math.sin(startRad)
    const x2 = center.value + radius.value * Math.cos(endRad)
    const y2 = center.value + radius.value * Math.sin(endRad)

    const largeArcFlag = segmentAngle > 180 ? 1 : 0

    return `M ${x1} ${y1} A ${radius.value} ${radius.value} 0 ${largeArcFlag} 1 ${x2} ${y2}`
}

const createArc = (progress: number, segmentIndex: number) => {
    const { angle, segmentAngle } = getSegmentPath(segmentIndex)
    const progressAngle = (segmentAngle * progress) / 100

    const startRad = (angle * Math.PI) / 180
    const endRad = ((angle + progressAngle) * Math.PI) / 180

    const x1 = center.value + radius.value * Math.cos(startRad)
    const y1 = center.value + radius.value * Math.sin(startRad)
    const x2 = center.value + radius.value * Math.cos(endRad)
    const y2 = center.value + radius.value * Math.sin(endRad)

    const largeArcFlag = progressAngle > 180 ? 1 : 0

    return `M ${x1} ${y1} A ${radius.value} ${radius.value} 0 ${largeArcFlag} 1 ${x2} ${y2}`
}
</script>

<style scoped>
.ring-chart {
    display: block;
}

.progress-arc {
    transition: all 0.5s ease;
}
</style>
