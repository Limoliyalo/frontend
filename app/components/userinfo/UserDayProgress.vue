<template>
    <div class="flex items-center justify-center pb-8">
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
            <!-- 📸 Фото пользователя в центре -->
            <circle
                :cx="center"
                :cy="center"
                :r="innerRadius"
                fill="white"
                stroke="#ddd"
                stroke-width="2"
            />
            <clipPath id="user-photo-mask">
                <circle :cx="center" :cy="center" :r="innerRadius" />
            </clipPath>
            <image
                v-if="photoUrl"
                :x="center - innerRadius"
                :y="center - innerRadius"
                :width="innerRadius * 2"
                :height="innerRadius * 2"
                :href="photoUrl"
                clip-path="url(#user-photo-mask)"
                preserveAspectRatio="xMidYMid slice"
            />
        </svg>
    </div>

    <div class="glass-container flex items-center justify-around w-full mb-4">
        <p class="text-center text-xs">
            Прогресс {{ userStat?.character_name }} за день
        </p>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useMyUserStore } from '~/stores/user.store'
import type { userStat } from '~/types/user/user'
import type { RingSegment } from '~/types/uiTypes/uiTypes'

const userStat = ref<userStat | null>(null)
const userStore = useMyUserStore()

onMounted(async () => {
    await userStore.loadUserStatistic()
    userStat.value = userStore.statistic
})

interface Props {
    segments: RingSegment[]
    size?: number
    strokeWidth?: number
    backgroundColor: string[]

    gapAngle?: number
}

const props = withDefaults(defineProps<Props>(), {
    size: 120,
    strokeWidth: 10,
    gapAngle: 2,
})

const radius = computed(() => (props.size / 2) * 0.8)
const center = computed(() => props.size / 2)
const photoUrl = computed(() => userStore.photoUrl)
const innerRadius = computed(() => radius.value * 0.9) // радиус для фото внутри

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
