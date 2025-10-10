<!-- Компонент для общего прогресса пользователя -->
<template>
    <div class="glass-container h-32 flex justify-start items-center">
        <div class="h-full w-full flex justify-around items-center">
            <div class="progress-imitation"></div>
            <div class="text-center text-sm w-30">
                <p>Общий показатель прогресса за день для пользователя</p>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup></script>

<style scoped>
.progress-imitation {
    width: 76px;
    height: 76px;
    border-radius: 50%;
    background: conic-gradient(white 0% 75%, #4b5563 75% 100%);
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    font-size: 1.25rem;
    font-weight: 700;
}

.progress-imitation::before {
    content: '';
    position: absolute;
    width: 80%;
    height: 80%;
    background: #111827;
    border-radius: 50%;
}

.progress-imitation::after {
    content: '5';
    position: absolute;
}
</style>
