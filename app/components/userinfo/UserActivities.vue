<template>
    <div class="glass-container overflow-y-auto mt-8 p-4">
        <div class="grid grid-cols-1 gap-4">
            <userinfo-user-activity
                v-for="(activity, index) in activities"
                :key="index"
                :linkto="activity.linkto"
                :iconName="activity.iconName"
                :text="activity.text"
                :color="activity.color"
            />
        </div>
    </div>
</template>

<script lang="ts" setup>
const activities = [
    {
        linkto: '/aboutWater',
        iconName: 'hugeicons:water-energy',
        text: 'Сколько вы пили за день',
        color: 'blue',
    },
    {
        linkto: '/aboutBack',
        iconName: 'hugeicons:time-quarter-pass',
        text: 'Следить за осанкой',
        color: 'green',
    },
    {
        linkto: '/aboutFood',
        iconName: 'hugeicons:organic-food',
        text: 'Сколько вы ели за день',
        color: 'yellow',
    },
]
</script>

<style scoped></style>
