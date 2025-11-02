<template>
    <nav class="w-full">
        <ul class="flex justify-around items-center">
            <li v-for="(btn, index) in navBtns" :key="index">
                <ui-nav-item :nav-btn="btn" />
            </li>
        </ul>
    </nav>
</template>

<script lang="ts" setup>
import type { NavBtn } from '~/types/uiTypes/uiTypes'

const navBtns: NavBtn[] = [
    { linkto: '/', iconName: 'hugeicons:home-01' },
    { linkto: '/shop', iconName: 'hugeicons:shopping-bag-01' },
    { linkto: '/profile', iconName: 'hugeicons:profile' },
]
</script>

<style></style>
