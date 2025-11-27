<template>
    <div class="p-4 flex flex-col items-center min-h-screen">
        <!-- Заголовок страницы -->
        <div class="w-full max-w-lg mb-6 text-center">
            <h1 class="text-3xl font-bold">Детальная страница активности</h1>
        </div>

        <!-- Основной блок с прогрессом -->
        <div class="glass-container w-full max-w-lg p-6 rounded-2xl">
            <h2 class="text-xl font-semibold mb-4 text-center">Ваш Прогресс</h2>

            <!-- Здесь может быть название активности -->
            <p class="text-lg text-center mb-3"></p>

            <!-- Визуальный прогресс-бар -->
            <div class="w-full bg-gray-700/50 rounded-full h-4 mb-2">
                <div
                    class="bg-gradient-to-r from-cyan-400 to-blue-600 h-4 rounded-full"
                ></div>
            </div>
            <p class="text-center text-gray-300 mb-6"></p>

            <!-- Кнопки управления прогрессом -->
            <div class="flex items-center justify-center gap-6 mb-8">
                <UButton
                    class="w-14 h-14 text-3xl rounded-full flex items-center justify-center"
                    >-</UButton
                >
                <UInput
                    type="number"
                    class="text-4xl font-bold w-28 text-center"
                    :ui="{
                        base: 'text-4xl font-bold w-28 text-center',
                    }"
                />
                <UButton
                    class="w-14 h-14 text-3xl rounded-full flex items-center justify-center"
                    >+</UButton
                >
            </div>

            <!-- Кнопка сохранения -->
            <UButton
                class="w-full text-white text-center font-bold py-3 px-4 rounded-xl transition-transform transform hover:scale-105"
            >
                Сохранить изменения
            </UButton>
        </div>
        <!-- Сообщение, если данные еще не загружены или не найдены -->
    </div>
</template>

<script lang="ts" setup></script>
