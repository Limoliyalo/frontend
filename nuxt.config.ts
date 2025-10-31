// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    devtools: { enabled: true },
    css: ['~/assets/css/main.css'],

    modules: [
        '@nuxt/eslint',
        '@nuxt/fonts',
        '@nuxt/icon',
        '@nuxt/image',
        '@nuxt/ui',
        'nuxt-swiper',
        '@pinia/nuxt',
    ],

    app: {
        head: {
            title: 'Healthity',
            meta: [
                {
                    name: 'description',
                    content:
                        'Соревнуйся с здрузьями в ЗОЖ и следи за своим здоровьем!',
                },
            ],
            script: [
                {
                    src: 'https://telegram.org/js/telegram-web-app.js',
                    defer: true,
                },
            ],
        },
    },
    ssr: false,
})
