# Подробный отчет по рефакторингу startup-загрузки Healthity

Этот документ объясняет все изменения, которые были сделаны в проекте в рамках задачи:

- убрать мигание главного экрана;
- централизованно загрузить основные данные приложения на входе;
- показать loader с картинкой на весь экран;
- не рендерить главный экран, пока критичные данные и картинки не готовы;
- сделать код чище, производительнее и устойчивее к повторным запросам.

Документ написан как разбор для обучения: не только “что поменялось”, но и “почему старая версия была проблемной” и “какое правило стоит запомнить, чтобы не повторять ошибку”.

---

## 1. Главные проблемы проекта, которые были исправлены

### 1.1. Данные грузились не в одном месте, а россыпью по компонентам

До рефакторинга почти каждая страница и часть маленьких компонентов сами делали API-запросы в `onMounted`.

Примеры:

- `app/pages/index.vue` грузил фоны, предметы и активности.
- `app/components/ProgressBar.vue` отдельно грузил статистику.
- `app/components/ui/LevelCircle.vue` отдельно грузил статистику.
- `app/components/userinfo/UserDayProgress.vue` отдельно грузил статистику.
- `app/components/userinfo/CharacterBaseActivityList.vue` отдельно грузил типы активностей, базовые активности и daily-активности.
- `app/components/Register.vue` отдельно проверял персонажа.

Проблема в том, что такой подход создает гонки:

1. Страница уже отрисовалась.
2. Потом пришел фон.
3. Потом пришли предметы.
4. Потом пришла статистика.
5. Потом дочерние компоненты еще раз сходили за теми же данными.

Визуально это выглядит как мигание: сначала fallback-фон, потом настоящий фон, потом предметы появляются позже, потом прогресс меняется.

Что изменено:

- Добавлен единый startup-store `app/stores/app-bootstrap.store.ts`.
- `app/app.vue` теперь сначала показывает loader.
- Главный экран появляется только после того, как startup-загрузка завершена.
- Визуальные компоненты перестали сами дергать API и теперь читают уже готовое состояние из stores.

Главное правило:

> Компонент, который просто показывает данные, не должен сам решать, когда и как эти данные грузятся. Особенно если эти данные нужны всему приложению.

---

### 1.2. Не было app-level bootstrap

Bootstrap в этом проекте означает “стартовая подготовка приложения”.

То есть это не библиотека Bootstrap, а процесс:

1. Проверить Telegram-пользователя.
2. Проверить/зарегистрировать backend-пользователя.
3. Загрузить персонажа.
4. Загрузить статистику.
5. Загрузить активный фон.
6. Загрузить активности.
7. Загрузить предметы на активном фоне.
8. Предзагрузить картинки, которые должны быть видны сразу.
9. Только после этого показать приложение.

До изменения каждый кусок делался где придется. После изменения за это отвечает `useAppBootstrapStore`.

Главное правило:

> Если у приложения есть обязательный набор данных для первого экрана, этот набор должен грузиться централизованно, а не случайно из разных компонентов.

---

### 1.3. Главный экран рендерился до загрузки картинок

Даже если API уже вернул URL фона, браузеру еще нужно скачать и декодировать картинку.

Старое поведение:

1. API вернул `picture_url`.
2. Vue поставил `<img :src="picture_url">`.
3. Браузер начал загружать картинку.
4. Пользователь видел пустоту/fallback/перерисовку.

Новое поведение:

- Bootstrap собирает URL критичных картинок.
- Для каждой картинки создается `new Image()`.
- Картинка грузится заранее.
- Если браузер поддерживает `image.decode()`, мы ждем decode.
- Только потом статус bootstrap становится `ready`.

Главное правило:

> Если цель “экран не мигает”, недостаточно загрузить JSON. Нужно дождаться загрузки и декодирования картинок, которые участвуют в первом кадре.

---

### 1.4. API-ошибки были обычными `Error` без статуса

Раньше `useApi` делал так:

```ts
throw new Error(`HTTP error! status: ${response.status}`)
```

А потом код проверял ошибку примерно так:

```ts
error.message.includes('404')
```

Почему это плохо:

- статус спрятан в строке;
- строку легко изменить и сломать обработку;
- `404` может случайно встретиться в другом тексте;
- невозможно удобно различать `401`, `403`, `404`, `500`;
- сложно писать надежную логику “если персонажа нет, это не ошибка, а новый пользователь”.

Что изменено:

- Добавлен класс `ApiError`.
- У ошибки теперь есть `status`, `url`, `body`.
- Добавлены helpers `isApiError()` и `isApiStatus()`.

Теперь можно писать:

```ts
if (!isApiStatus(error, 404)) throw error
```

Главное правило:

> Не парсить технические данные из текста ошибки, если можно хранить их структурированно.

---

### 1.5. API base URL был зашит прямо в коде

Раньше в `useApi.ts` было:

```ts
const BASE_URL = 'https://healthity.ru/api/v1'
```

Проблема:

- для staging/dev окружения придется менять код;
- hardcoded URL сложнее тестировать;
- конфигурация приложения должна жить в config, а не внутри helper-функции.

Что изменено:

- В `nuxt.config.ts` добавлен `runtimeConfig.public.apiBase`.
- По умолчанию используется `https://healthity.ru/api/v1`.
- Можно переопределить через `NUXT_PUBLIC_API_BASE`.

Главное правило:

> URL backend’а, ключи окружения и публичные настройки должны быть в runtime config, а не захардкожены глубоко в коде.

---

### 1.6. Не было защиты от повторных одинаковых запросов

Представь, что два компонента одновременно вызывают:

```ts
userStore.loadUserStatistic()
```

До изменения оба могли отправить запрос. Если таких компонентов три, запросов уже три.

Что изменено:

- В stores добавлены флаги вроде `statisticLoaded`, `itemsLoaded`, `activityTypesLoaded`.
- Добавлены переменные для текущего promise: `statisticPromise`, `itemsPromise`, `activityTypesPromise`.
- Если запрос уже идет, повторный вызов возвращает тот же promise.

Это называется in-flight dedupe.

Схема:

```ts
if (loaded && !force) return
if (currentPromise && !force) return currentPromise

currentPromise = apiRequest(...)
    .then(...)
    .finally(() => {
        currentPromise = null
    })

return currentPromise
```

Главное правило:

> Если функцию загрузки могут вызвать несколько мест, она должна быть idempotent: повторный вызов не должен ломать состояние и не должен плодить лишние запросы.

---

### 1.7. Частые `.find()` заменены на computed `Map`

В коде было много поисков по массивам:

```ts
items.value.find(item => item.id === id)
characterItems.value.find(ci => ci.item_id === itemId)
activityTypes.value.find(type => type.id === activityTypeId)
```

На маленьких массивах это не страшно, но по мере роста данных и количества рендеров это становится шумом.

Что изменено:

- Добавлены computed maps:
  - `itemById`;
  - `characterItemById`;
  - `characterItemByItemId`;
  - `activityTypeById`;
  - `activityTypeIdByName`;
  - `baseActivityById`;
  - `backgroundById`;
  - `categoryById`.

Теперь lookup выглядит так:

```ts
itemById.value.get(id)
```

Главное правило:

> Если ты часто ищешь элементы по id, лучше сделать `Map`, чем каждый раз бегать по массиву через `.find()`.

---

### 1.8. В UI были dev-only куски и `alert`

Были вещи вроде:

- кнопка “Дай денег пж”;
- helper `giveMeMoney`;
- `console.log` при регистрации;
- `alert()` после действий.

Проблема:

- dev-only код может случайно попасть пользователям;
- `alert()` блокирует UI и выглядит не как часть приложения;
- логи загрязняют консоль;
- такие куски делают код менее производственным.

Что изменено:

- dev-only money helper удален;
- `console.log`/`console.error` из измененной логики удалены;
- alerts в измененных сценариях заменены на inline state/error.

Главное правило:

> В production UI лучше показывать состояние внутри интерфейса, а не через `alert()`.

---

### 1.9. Был баг в `equip/unequip` фонов

В `backgrounds.store.ts` раньше при equip/unequip отправлялось:

```ts
body: JSON.stringify({ background_id: char.id })
```

Но `char.id` - это id записи `CharacterBackground`, а не id самого фона.

Правильное поле:

```ts
char.background_id
```

Что изменено:

```ts
body: JSON.stringify({ background_id: char.background_id })
```

Почему это важно:

- backend endpoint ожидает `background_id`;
- если отправить id связи, backend может не найти фон или применить действие неправильно;
- UI потом может думать, что активный фон изменился, но серверное состояние не совпадает.

Главное правило:

> Всегда различай id сущности и id связи. `character_background.id` и `character_background.background_id` - это разные вещи.

---

### 1.10. Telegram plugin блокировал старт приложения

Раньше `initTelegram.client.ts` был async plugin и сразу делал запросы:

```ts
await userStore.fetchCurrentUser()
```

Проблема:

- plugin выполняется до нормального рендера приложения;
- если сеть медленная, пользователь может долго видеть пустоту;
- loader не успевает появиться сразу, потому что приложение еще не дошло до render gate.

Что изменено:

- plugin теперь только читает Telegram/localStorage и кладет данные в user store;
- backend-проверка пользователя переехала в bootstrap, где уже виден loader.

Главное правило:

> Client plugin должен быстро подготовить локальный контекст. Долгие сетевые операции лучше делать там, где UI уже может показать загрузку.

---

## 2. Важные понятия

### 2.1. Что значит `ensure*Loaded`

`ensure*Loaded` - это функция “убедись, что данные есть”.

Она отличается от обычного `load*` по смыслу:

- `load*` звучит как “загрузи сейчас”;
- `ensure*Loaded` звучит как “если уже загружено, ничего не делай; если не загружено, загрузи”.

В коде многие `ensure*Loaded` сейчас являются alias на `load*` с `force = false`.

Пример:

```ts
ensureUserStatisticLoaded: loadUserStatistic
```

То есть вызов:

```ts
userStore.ensureUserStatisticLoaded()
```

попадает в:

```ts
loadUserStatistic(false)
```

и не делает повторный запрос, если статистика уже есть.

Когда использовать:

- на странице, если данные нужны для отображения;
- в компоненте высокого уровня;
- в bootstrap;
- в warm-load.

Когда не использовать:

- сразу после мутации, когда данные могли измениться. Там нужен `force = true`.

---

### 2.2. Что значит параметр `force`

`force` - это флаг “принудительно обновить данные, даже если store думает, что они уже загружены”.

Типичный код:

```ts
async function loadUserStatistic(force = false): Promise<void> {
    if (statisticLoaded.value && !force) return
    if (statisticPromise && !force) return statisticPromise

    // реальный запрос
}
```

Разбор:

- `force = false` по умолчанию.
- Если данные уже загружены и `force` не включен, функция просто выходит.
- Если запрос уже идет и `force` не включен, функция возвращает текущий promise.
- Если `force = true`, эти проверки пропускаются и запрос идет заново.

Когда нужен `force = true`:

1. После покупки предмета.
   - Баланс пользователя изменился.
   - Значит статистику нужно обновить заново.
2. После покупки фона.
   - Баланс и список фонов могли измениться.
3. После создания персонажа.
   - До этого персонажа не было.
   - После создания нужно принудительно перечитать персонажа.
4. После удаления настроек.
   - Старый settings state больше не актуален.
   - Нужно заново получить defaults.
5. При retry bootstrap.
   - Пользователь нажал повторить.
   - Нужно не доверять старому failed/partial состоянию.

Когда `force = true` не нужен:

- при обычном заходе на страницу;
- при чтении уже загруженных каталогов;
- когда компонент просто хочет убедиться, что данные есть.

Очень важное правило:

> `force` нужен после действий, которые меняют данные на сервере. Для обычного чтения используй ensure без force.

---

### 2.3. Что значит in-flight promise cache

Это защита от ситуации “один и тот же запрос уже идет”.

Без защиты:

```ts
loadUserStatistic()
loadUserStatistic()
loadUserStatistic()
```

могут отправить 3 HTTP-запроса.

С защитой:

```ts
if (statisticPromise && !force) return statisticPromise
```

второй и третий вызовы получают тот же promise, который создал первый вызов.

Польза:

- меньше нагрузки на backend;
- меньше гонок;
- меньше лишних перерисовок;
- проще прогнозировать состояние.

---

### 2.4. Что значит warm-load

Warm-load - это “теплая догрузка” после того, как главный экран уже готов.

В bootstrap есть критичные данные:

- активный фон;
- предметы на активном фоне;
- статистика;
- активности;
- картинки первого экрана.

А есть второстепенные данные:

- каталог предметов магазина;
- категории;
- настройки пользователя.

Они полезны, но не должны задерживать первый стабильный рендер главной.

Поэтому после `ready` запускается:

```ts
void Promise.allSettled([
    categoriesStore.ensureCategoriesLoaded(),
    itemsStore.ensureItemsCatalogLoaded(),
    userStore.ensureUserSettingsLoaded(),
])
```

Почему `Promise.allSettled`, а не `Promise.all`:

- `Promise.all` падает целиком, если один запрос упал;
- `Promise.allSettled` дождется всех и не сломает уже показанное приложение.

Главное правило:

> Не все данные одинаково важны для первого экрана. Критичное блокирует рендер, второстепенное догружается после.

---

## 3. Новый startup flow приложения

Новый порядок работы такой:

1. `initTelegram.client.ts` быстро читает Telegram/localStorage.
2. `app.vue` сразу показывает `AppLoader`.
3. `app.vue` вызывает `bootstrapStore.start()`.
4. Bootstrap проверяет backend-пользователя.
5. Если пользователь не авторизован, грузится fallback-картинка и приложение показывается.
6. Если пользователь авторизован, bootstrap грузит персонажа.
7. Если персонажа нет (`404`), это считается нормальным состоянием нового пользователя.
8. Если персонаж есть, грузятся:
   - статистика;
   - фоны;
   - типы активностей;
   - базовые активности;
   - daily-активности;
   - предметы пользователя;
   - предметы на активном фоне.
9. Предзагружаются критичные картинки.
10. Статус становится `ready`.
11. Только теперь `NuxtLayout` и `NuxtPage` попадают в DOM.
12. После этого запускается warm-load.

Именно поэтому главный экран больше не должен мигать: он не появляется, пока данные и картинки не готовы.

---

## 4. Файл за файлом

### 4.1. `nuxt.config.ts`

Что было не так:

- base URL backend’а был захардкожен в `useApi.ts`;
- нельзя было нормально переопределить API для dev/staging/prod окружений.

Что изменено:

```ts
runtimeConfig: {
    public: {
        apiBase:
            process.env.NUXT_PUBLIC_API_BASE ??
            'https://healthity.ru/api/v1',
    },
},
```

Почему так:

- `runtimeConfig.public` доступен на клиенте;
- `NUXT_PUBLIC_API_BASE` позволяет подменить backend без изменения кода;
- default оставлен на production backend `https://healthity.ru/api/v1`.

Что запомнить:

> Конфигурация окружения должна быть в config, а не в helper-функциях.

---

### 4.2. `app/composables/useApi.ts`

Что было не так:

- `BASE_URL` был hardcoded;
- `query` был типизирован как `Record<string, any>`;
- query собирался через object reduce, что не поддерживало массивы значений;
- ошибка API была обычным `Error` без `status`;
- проверка `404` в других местах зависела от текста ошибки;
- headers собирались как plain object, что хуже работает с уже переданными `Headers`.

Что изменено:

1. Добавлены типы:

```ts
type ApiQueryValue = string | number | boolean | null | undefined
type ApiQuery = Record<string, ApiQueryValue | ApiQueryValue[]>
```

Это убрало `any` и разрешило передавать массивы query values.

2. Добавлен `ApiError`:

```ts
export class ApiError extends Error {
    status: number
    url: string
    body: string | null
}
```

Теперь ошибка хранит:

- HTTP status;
- URL;
- body ответа.

3. Добавлены helpers:

```ts
isApiError(error)
isApiStatus(error, 404)
```

4. `runtimeConfig.public.apiBase` используется вместо hardcoded URL.

5. Headers теперь собираются через `new Headers()`.

Почему так:

- `Headers` умеет корректно объединять переданные headers;
- можно не перетирать вручную `Content-Type`/`Accept`/`Authorization`;
- `Authorization` добавляется только если есть Telegram initData.

Важный урок:

> API helper должен быть максимально скучным и надежным. Чем меньше “магии на строках”, тем меньше случайных багов.

---

### 4.3. `app/stores/app-bootstrap.store.ts`

Это новый главный файл startup-логики.

Какую проблему решает:

- раньше startup был размазан по страницам и компонентам;
- не было единого статуса “приложение готово”;
- не было централизованного прогресса;
- не было контроля долгого запуска;
- не было предзагрузки критичных картинок до рендера.

Ключевые части:

#### `BootstrapStatus`

```ts
type BootstrapStatus = 'idle' | 'loading' | 'ready' | 'slow' | 'error'
```

Зачем:

- `idle` - bootstrap еще не запускался;
- `loading` - идет нормальная загрузка;
- `ready` - можно показывать приложение;
- `slow` - загрузка длится больше 30 секунд;
- `error` - загрузка упала.

#### `SLOW_START_MS = 30000`

Это требование: если запуск длится больше 30 секунд, показать сообщение:

```ts
Запуск занимает слишком много времени. Переоткройте приложение.
```

#### `LOADER_MESSAGES`

Массив фраз:

- “Скоро зайдем”;
- “Подгружаем ваши результаты”;
- “Готовим фон”;
- “Расставляем предметы”;
- факты про прогулку, воду, медитацию и регулярность.

Они сменяются через timer.

#### `preloadImage`

Что делает:

1. Если код не на клиенте, ничего не делает.
2. Если `src` пустой, ничего не делает.
3. Создает `new Image()`.
4. Ставит `image.decoding = 'async'`.
5. Ждет `onload`.
6. Если доступен `image.decode()`, ждет декодирование.
7. Даже если картинка не загрузилась, promise resolve’ится, чтобы приложение не зависло навсегда.

Почему ошибки картинки не reject:

- если одна картинка с backend сломалась, лучше показать приложение с отсутствующей картинкой, чем держать пользователя в вечном loader;
- для “не мигает” важно ждать успешные картинки, но не превращать битый asset в deadlock.

#### `preloadImages`

Что делает:

- убирает дубли через `Set`;
- фильтрует пустые значения;
- параллельно грузит все картинки.

#### `start(force = false)`

Главный публичный метод.

Логика:

```ts
if (status.value === 'ready' && !force) return
if (bootstrapPromise && !force) return bootstrapPromise
```

То есть:

- если уже готово и не нужен force, ничего не делаем;
- если bootstrap уже идет, возвращаем текущий promise;
- если `force = true`, запускаем заново.

#### `retry()`

```ts
async function retry(): Promise<void> {
    await start(true)
}
```

Зачем `force = true`:

- retry должен действительно повторить загрузку;
- нельзя просто вернуть старый failed promise или старое состояние.

#### `runBootstrap(force = false)`

Это сам сценарий загрузки.

Порядок:

1. `ensureBackendUser()`.
2. Если нет авторизации, preload fallback-картинки и выйти.
3. `characterStore.loadMyCharacter(force)`.
4. Если персонажа нет, preload fallback-картинки и выйти.
5. `userStore.loadUserStatistic(force)`.
6. `backgroundsStore.ensureBackgroundsLoaded(force)`.
7. Параллельно:
   - activity types;
   - base activities;
   - daily activities.
8. `itemsStore.loadCharacterItems(force)`.
9. `itemsStore.loadItemsWithPositionsForBackground(backgroundId, force)`.
10. `preloadCriticalHomeImages()`.

Почему некоторые шаги последовательные:

- нельзя загрузить предметы на активном фоне, пока неизвестен активный фон;
- нельзя понять новый пользователь или нет, пока не загружен персонаж;
- нельзя preload’ить реальные background URL, пока фоны не загружены.

Почему активности грузятся параллельно:

- они не зависят друг от друга напрямую в момент загрузки;
- параллельная загрузка быстрее последовательной.

#### `warmLoad()`

После `ready` запускается:

- categories;
- items catalog;
- user settings.

Эти данные не должны задерживать первый экран.

Что запомнить:

> Bootstrap должен грузить минимум, который нужен для первого стабильного экрана. Остальное можно догружать после.

---

### 4.4. `app/components/AppLoader.vue`

Это новый компонент loader’а.

Что делает:

- показывает `app/assets/Loader.png`;
- картинка занимает весь экран;
- progress bar, текст и retry-кнопка находятся поверх картинки.

Главная часть:

```vue
<img
    :src="loaderImage"
    alt="Загрузка Healthity"
    class="absolute inset-0 h-full w-full object-cover"
/>
```

Почему `object-cover`:

- картинка заполняет весь экран;
- не остается пустых полей;
- часть картинки может обрезаться, но экран выглядит цельно.

Почему controls поверх:

```vue
class="absolute inset-x-0 bottom-10 z-10 ..."
```

- `absolute` кладет блок поверх фоновой картинки;
- `z-10` гарантирует, что progress/text выше картинки;
- `bottom-10` держит loader UI внизу экрана.

Что принимает компонент:

- `progress`;
- `message`;
- `showRetry`.

Почему компонент тупой:

- он не знает, как грузятся данные;
- он только отображает состояние;
- это правильно: логика в store, UI в component.

---

### 4.5. `app/app.vue`

Что было:

```vue
<NuxtLayout>
    <NuxtPage />
</NuxtLayout>
```

То есть приложение показывалось сразу.

Что стало:

```vue
<AppLoader v-if="!bootstrapStore.isReady" ... />
<NuxtLayout v-else>
    <NuxtPage />
</NuxtLayout>
```

Почему это важно:

- пока bootstrap не готов, страницы вообще не монтируются;
- значит их `onMounted` не запускается раньше времени;
- пользователь видит loader, а не наполовину собранный экран.

`onMounted`:

```ts
onMounted(() => {
    void bootstrapStore.start()
})
```

Почему `void`:

- мы сознательно запускаем async процесс без `await` в setup;
- ошибки обрабатываются внутри store;
- TypeScript/ESLint понимает, что promise не забыли случайно.

Важное замечание:

Nuxt dev может предупреждать, что `NuxtPage`/`NuxtLayout` не использованы, пока loader виден. Это dev-warning из-за условного рендера. В production build приложение собирается нормально.

---

### 4.6. `app/plugins/initTelegram.client.ts`

Что было не так:

- plugin был `async`;
- делал backend-запросы до рендера приложения;
- если Telegram/backend отвечали долго, loader мог не появиться сразу.

Что изменено:

- plugin стал синхронным;
- `process.server` заменен на `import.meta.server`;
- backend-запросы удалены из plugin;
- plugin только:
  - вызывает Telegram ready/expand;
  - читает `initData`;
  - сохраняет пользователя в store;
  - fallback’ается на localStorage.

Почему `import.meta.server`:

- это рекомендованный Nuxt-style способ проверки server/client;
- ESLint Nuxt ругался на `process.server`.

Главное правило:

> Plugin не должен делать долгую startup-сеть, если у приложения есть loader/bootstrap.

---

### 4.7. `app/stores/user.store.ts`

Что было не так:

- статистика и настройки грузились каждый раз при вызове;
- не было защиты от параллельных одинаковых запросов;
- `404` настроек ловился через текст ошибки;
- `clear()` не чистил статистику и настройки.

Что изменено:

Добавлены:

```ts
const statisticLoaded = ref(false)
const settingsLoaded = ref(false)
let statisticPromise: Promise<void> | null = null
let settingsPromise: Promise<void> | null = null
```

Теперь `loadUserStatistic(force = false)`:

- не делает запрос, если статистика уже загружена;
- возвращает текущий promise, если запрос уже идет;
- делает новый запрос при `force = true`.

Почему после покупки вызывается:

```ts
userStore.loadUserStatistic(true)
```

Потому что баланс/опыт могли измениться, и старый cache уже неактуален.

`loadUserSettings(force = false)`:

- использует `isApiStatus(error, 404)`;
- при 404 создает default settings через `updateUserSettings(DEFAULT_SETTINGS)`;
- не парсит строку ошибки.

`clear()` теперь чистит:

- user;
- initData;
- statistic;
- settings;
- loaded flags.

Что запомнить:

> Если store очищает авторизацию, он должен очищать и данные, которые относятся к этой авторизации.

---

### 4.8. `app/stores/character.store.ts`

Что было не так:

- `loadMyCharacter()` падал при `404`;
- для нового пользователя отсутствие персонажа выглядело как ошибка;
- нельзя было отличить “персонажа нет” от “сервер упал”;
- не было кэша загрузки.

Что изменено:

- `loadMyCharacter(force = false)` теперь возвращает `Character | null`;
- при `404` кладет `character.value = null`;
- ставит `isLoaded = true`;
- при любой другой ошибке пробрасывает ошибку дальше.

Почему это важно:

- новый пользователь должен увидеть регистрацию;
- существующий пользователь должен пройти дальше;
- настоящие ошибки должны уходить в bootstrap error state.

После создания персонажа:

```ts
await loadMyCharacter(true)
```

Почему `force = true`:

- до создания store мог помнить, что персонажа нет;
- после создания нужно принудительно перечитать состояние.

---

### 4.9. `app/stores/backgrounds.store.ts`

Что было не так:

- фоны могли грузиться повторно;
- активный фон искался через `.find()`;
- был unused type `BackgroundState`;
- equip/unequip отправляли неправильный id;
- после покупки статистика обновлялась без force.

Что изменено:

Добавлены loaded flags:

- `backgroundsLoaded`;
- `characterBackgroundsLoaded`;
- `isLoaded`.

Добавлены promise caches:

- `backgroundsPromise`;
- `characterBackgroundsPromise`;
- `ensurePromise`.

Добавлен:

```ts
const backgroundById = computed(
    () => new Map(backgrounds.value.map(background => [background.id, background])),
)
```

Теперь активный фон ищется через map:

```ts
backgroundById.value.get(active.background_id)
```

Исправлен главный баг:

```ts
body: JSON.stringify({ background_id: char.background_id })
```

Почему это было важно:

- `char.id` - id записи владения/связи;
- `char.background_id` - id фона;
- backend ожидает id фона.

После покупки:

```ts
await userStore.loadUserStatistic(true)
```

Потому что баланс изменился.

---

### 4.10. `app/stores/items.store.ts`

Что было не так:

- каталог предметов и предметы персонажа могли грузиться повторно;
- lookup’и были через `.find()`;
- после покупки/equip/unequip кэш позиций очищался грубо;
- была dev-only функция `giveMeMoney`;
- после покупки предмета статистика не обновлялась принудительно;
- позиции предметов на фоне могли запрашиваться повторно одновременно.

Что изменено:

Добавлены:

- `itemsLoaded`;
- `characterItemsLoaded`;
- `itemsPromise`;
- `characterItemsPromise`;
- `positionsPromises`.

Добавлены maps:

- `itemById`;
- `characterItemById`;
- `characterItemByItemId`.

Почему `characterItemByItemId` особенно важен:

- UI часто знает `item.id`;
- статус покупки/активности лежит в `CharacterItem`;
- связь идет по `CharacterItem.item_id`.

Добавлена функция:

```ts
function invalidateItemsWithPositions(): void
```

Она очищает:

- готовый кэш позиций;
- текущие promise’ы позиций.

Когда вызывается:

- после покупки предмета;
- после equip;
- после unequip.

Почему:

- список активных предметов на фоне изменился;
- старые позиции/filtered result больше нельзя считать актуальными.

Удалено:

- `giveMeMoney`;
- dev-only кнопка в `ShopItems`.

После покупки предмета:

```ts
await userStore.loadUserStatistic(true)
```

Потому что баланс мог измениться.

---

### 4.11. `app/stores/activities.store.ts`

Что было не так:

- activity types грузились только по `activityTypes.value.length`, но без полноценного loaded flag;
- base activities могли грузиться повторно;
- daily activities не знали, за какой день они загружены;
- `404` base activities ловился через текст;
- lookup’и были через `.find()`;
- после создания daily activity страницу приходилось вручную перегружать.

Что изменено:

Добавлены flags:

- `activityTypesLoaded`;
- `baseActivitiesLoaded`;
- `dailyActivitiesDay`.

Добавлены promise caches:

- `activityTypesPromise`;
- `baseActivitiesPromise`;
- `dailyActivitiesPromise`;
- `dailyActivitiesPromiseDay`.

Добавлены maps:

- `activityTypeById`;
- `activityTypeIdByName`;
- `baseActivityById`.

`loadCharacterDailyActivities(date?, force = false)` теперь:

- вычисляет day;
- проверяет, загружен ли уже именно этот day;
- не делает повторный запрос без force;
- хранит, какой day сейчас грузится.

Почему нужен `dailyActivitiesDay`:

Если сегодня загружен день `2026-05-17`, а потом код попросит `2026-05-16`, нельзя сказать “daily уже loaded”. Нужно понимать, за какую дату loaded.

После создания daily activity:

```ts
await loadCharacterDailyActivities(undefined, true)
```

Почему:

- сервер создал новую запись;
- локальный список должен обновиться;
- `force = true` гарантирует, что функция не выйдет из-за старого `dailyActivitiesDay`.

После update daily activity:

- store локально обновляет найденную запись;
- это дешевле, чем всегда перечитывать весь день.

`fetchDailyActivitiesForDay` теперь использует `query`, а не ручную строку:

```ts
apiRequest('/daily-activities/me', {
    method: 'GET',
    query: { day: date },
})
```

Так меньше риска ошибиться с `?day=...`.

---

### 4.12. `app/stores/categories.store.ts`

Что было не так:

- категории могли грузиться повторно;
- lookup по id был через `.find()`.

Что изменено:

- добавлен `isLoaded`;
- добавлен `loadPromise`;
- добавлен `categoryById`;
- добавлен alias `ensureCategoriesLoaded`.

Почему это нужно:

- категории относятся к warm-load;
- если магазин откроется позже, данные уже могут быть готовы;
- повторные открытия магазина не должны каждый раз дергать backend.

---

### 4.13. `app/stores/friends.store.ts`

Что было не так:

- друзья грузились каждый раз при заходе;
- не было promise dedupe;
- query для friend info собирался вручную в строке;
- `deleteFriend` фактически ничего не возвращал, но страница ожидала `deleted`.

Что изменено:

- добавлены `isLoaded` и `loadPromise`;
- добавлен `ensureFriendsLoaded`;
- `deleteFriend` возвращает `true`;
- `loadFriendFullInfo` теперь использует `query`.

Почему `deleteFriend` теперь возвращает boolean:

В `friends.vue` был код:

```ts
const deleted = await friendStore.deleteFriend(deletedFriendId)
if (deleted) { ... }
```

Но функция возвращала `void`, значит `deleted` всегда был `undefined`, и блок мог не выполняться.

Теперь после успешного удаления возвращается `true`.

---

### 4.14. `app/app.vue`

Главное изменение:

- добавлен loader gate на уровне всего приложения.

До:

- приложение сразу показывало страницы.

После:

- пока `bootstrapStore.isReady === false`, показывается `AppLoader`;
- когда bootstrap готов, показываются `NuxtLayout` и `NuxtPage`.

Почему это правильно:

- главная страница не успевает отрендериться с пустым/fallback состоянием;
- все критичные запросы идут под loader;
- page components не стартуют раньше bootstrap.

---

### 4.15. `app/pages/index.vue`

Что было не так:

- главная сама запускала критичную startup-загрузку;
- она делала то, что теперь должен делать bootstrap;
- это вызывало позднюю подстановку фона/предметов.

Что изменено:

- удалена первичная загрузка фонов/items/base activities из `onMounted`;
- оставлен `syncItemsForActiveBackground()`;
- watcher регистрации теперь вызывает `ensureCharacterBaseActivitiesLoaded()`.

Почему `syncItemsForActiveBackground()` оставлен:

- активный фон может измениться позже;
- при смене фона нужно подтянуть предметы для нового фона;
- функция уже использует кэш в items store.

Почему `maybeShowActivityPicker()` остался:

- это UI-логика главной;
- если пользователь зарегистрирован, но активностей нет, надо показать выбор активностей.

---

### 4.16. `app/pages/shop.vue`

Что было не так:

- страница магазина всегда заново грузила статистику, каталог предметов, предметы персонажа и фоны;
- импорты были после `definePageMeta`, из-за чего ESLint ругался на `import/first`.

Что изменено:

- `load*` заменены на `ensure*Loaded`;
- `definePageMeta` перенесен после import’ов.

Почему ensure:

- если bootstrap/warm-load уже загрузил данные, магазин не делает повторную сеть;
- если пользователь открыл магазин напрямую, данные все равно будут загружены.

---

### 4.17. `app/pages/profile.vue`

Что было не так:

- профиль грузил только activity types и daily activities;
- base activities могли быть нужны дочернему списку;
- дочерний компонент дополнительно делал свои запросы.

Что изменено:

```ts
await Promise.all([
    activityStore.ensureActivityTypesCatalogLoaded(),
    activityStore.ensureCharacterBaseActivitiesLoaded(),
    activityStore.ensureCharacterDailyActivitiesLoaded(),
])
```

Почему параллельно:

- эти запросы можно запускать вместе;
- ensure защитит от дублей.

---

### 4.18. `app/pages/settings.vue`

Что было не так:

- настройки всегда грузились заново;
- после удаления настроек был обычный load без явного force;
- импорты стояли после `definePageMeta`.

Что изменено:

- `loadUserSettings()` заменен на `ensureUserSettingsLoaded()`;
- после удаления используется `loadUserSettings(true)`;
- imports перенесены выше.

Почему после удаления `force = true`:

- только что удалили настройки на сервере;
- store должен заново получить или создать default settings;
- обычный ensure мог бы решить, что настройки уже были загружены.

---

### 4.19. `app/pages/friends.vue`

Что было не так:

- друзья всегда грузились заново;
- `delete friendInfoMap.value[id]` нарушал lint rule `no-dynamic-delete`;
- `deleteFriend` в store не возвращал boolean, хотя page ждала результат;
- импорты стояли после `definePageMeta`.

Что изменено:

- `loadFriends()` заменен на `ensureFriendsLoaded()`;
- delete заменен на immutable update:

```ts
const { [deletedFriendId]: _removed, ...rest } = friendInfoMap.value
friendInfoMap.value = rest
```

Почему так:

- Vue лучше отслеживает замену объекта;
- ESLint не ругается;
- код явно говорит: “создай новый объект без удаленного ключа”.

---

### 4.20. `app/pages/userActivity/[id].vue`

Что было не так:

- были лишние imports/storeToRefs;
- active background ref был создан, но не использовался;
- активности грузились обычными `load*`;
- после создания daily activity был лишний повторный load;
- после сохранения был `alert`.

Что изменено:

- удален unused `storeToRefs` и `activeBackgroundForHome`;
- `loadActivityTypesCatalog`/`loadCharacterBaseActivities` заменены на ensure;
- `loadCharacterDailyActivities` заменен на ensure;
- лишний reload после create убран, потому что store теперь сам обновляет daily activities;
- `alert('Изменения сохранены')` удален.

Почему удаление alert нормально:

- кнопка уже выключается/включается через состояние изменений;
- ошибки показываются через `goalError`;
- блокирующий browser alert ухудшает UX.

---

### 4.21. `app/components/Register.vue`

Что было не так:

- компонент сам проверял персонажа в `onMounted`;
- внутри был отдельный `registerUser`, который не использовался и отправлял странный `password`;
- были `console.log`, `console.error`, `alert`;
- после создания персонажа не было централизованного обновления startup-данных;
- ESLint ругался на однословное имя компонента.

Что изменено:

- удален `checkCharacter`;
- удален мертвый `registerUser`;
- добавлен `isSubmitting`;
- добавлен `errorMessage`;
- после создания персонажа вызывается `bootstrapStore.retry()`;
- добавлено `defineOptions({ name: 'CharacterRegister' })`.

Почему после создания персонажа нужен bootstrap retry:

- новый пользователь до создания персонажа не имел полного набора данных;
- после создания нужно загрузить статистику, фон, активности, предметы;
- bootstrap уже умеет делать это правильно.

---

### 4.22. `app/components/ProgressBar.vue`

Что было не так:

- компонент сам грузил статистику;
- создавал локальный `userStat`, хотя уже есть `userStore.statistic`;
- это дублировало запросы с другими компонентами.

Что изменено:

- удалены `ref`, `onMounted`, type import;
- компонент просто читает `userStore.statistic`.

Главное правило:

> ProgressBar - это view-компонент. Он должен показывать прогресс, а не управлять загрузкой пользователя.

---

### 4.23. `app/components/ui/LevelCircle.vue`

Что было не так:

- сам грузил статистику;
- дублировал запрос ProgressBar/UserDayProgress.

Что изменено:

- использует computed:

```ts
const userStat = computed(() => userStore.statistic)
```

Теперь уровень обновится реактивно, когда store обновится.

---

### 4.24. `app/components/userinfo/UserDayProgress.vue`

Что было не так:

- сам грузил статистику;
- держал локальную копию `userStat`;
- создавал дубли запроса.

Что изменено:

- удалена локальная загрузка;
- `userStat` теперь computed от store.

---

### 4.25. `app/components/userinfo/CharacterBaseActivityList.vue`

Что было не так:

- компонент списка сам грузил:
  - activity types;
  - base activities;
  - daily activities.

Это плохо, потому что тот же набор нужен профилю и bootstrap.

Что изменено:

- удален `onMounted` с загрузками;
- компонент просто читает `activitiesStore.characterBaseActivities`.

Почему это правильно:

- страница/большой flow отвечает за данные;
- список отвечает за отображение.

---

### 4.26. `app/components/ChooseYourActivity.vue`

Что было не так:

- компонент сам грузил activity types и base activities;
- `createBaseActivities()` не ждал завершения API;
- чекбоксы инициализировались только в `onMounted`, а не при изменении catalog.

Что изменено:

- `onMounted` заменен на `watch(activityTypesCatalog, syncCheckedActivities, { immediate: true })`;
- `createBaseActivities` стал async и ожидает store action.

Почему watcher:

- catalog может быть уже загружен bootstrap’ом до mount компонента;
- может прийти позже;
- watcher с `immediate: true` покрывает оба случая.

Почему await при создании:

- нельзя закрывать модалку до завершения создания активностей;
- иначе UI может закрыться, а данные еще не готовы.

---

### 4.27. `app/components/shop/ShopItems.vue`

Что было не так:

- был dev-only блок “Дай денег пж”;
- был hardcoded Telegram id;
- использовалась функция `giveMeMoney`;
- форматирование computed было неаккуратным.

Что изменено:

- dev-only UI удален;
- import `useMyUserStore` удален;
- helper `giveMeMoney` удален из компонента;
- форматирование computed и async functions выровнено.

Почему это важно:

- production UI не должен содержать debug-действия;
- деньги/баланс нельзя менять из клиентского debug helper’а.

---

### 4.28. `app/components/Navbar.vue`

Что было не так:

- ESLint ругался на однословное имя компонента `Navbar`.

Что изменено:

```ts
defineOptions({ name: 'AppNavbar' })
```

Почему:

- Vue styleguide рекомендует multi-word component names;
- это предотвращает конфликт с native/custom HTML tags.

---

### 4.29. `app/layouts/default.vue`

Что было не так:

- template имел два root elements;
- ESLint ругался на `vue/no-multiple-template-root`.

Что изменено:

- оба блока обернуты в один root `<div>`.

Почему:

- правила проекта требуют один root;
- поведение визуально не изменилось.

---

### 4.30. `app/types/activities/activities.ts`

Что было не так:

```ts
export interface BaseActivityDelete extends Omit<BaseActivityCreate, 'goal'> {}
export interface BaseActivityUpdate extends BaseActivityCreate {}
```

ESLint ругался, потому что interface без новых полей равен своему supertype.

Что изменено:

```ts
export type BaseActivityDelete = Omit<BaseActivityCreate, 'goal'>
export type BaseActivityUpdate = BaseActivityCreate
```

Почему:

- type alias честнее показывает смысл;
- нет пустого interface;
- lint проходит без ошибки.

---

## 5. Как теперь правильно писать похожий код

### 5.1. Если данные нужны всему приложению

Не надо грузить их в маленьком компоненте.

Плохо:

```ts
onMounted(async () => {
    await userStore.loadUserStatistic()
})
```

Лучше:

```ts
const userStat = computed(() => userStore.statistic)
```

А загрузку делает bootstrap или page-level код.

---

### 5.2. Если данные нужны странице

Используй ensure:

```ts
onMounted(async () => {
    await userStore.ensureUserStatisticLoaded()
})
```

Это значит:

- если данные уже есть, не делай запрос;
- если данных нет, загрузи;
- если запрос уже идет, дождись его.

---

### 5.3. Если данные изменились после POST/PATCH/DELETE

Используй force:

```ts
await userStore.loadUserStatistic(true)
```

Потому что старые loaded-флаги уже не гарантируют актуальность.

---

### 5.4. Если нужно обработать 404

Плохо:

```ts
if (error.message.includes('404')) { ... }
```

Хорошо:

```ts
if (isApiStatus(error, 404)) { ... }
```

Так код не зависит от текста ошибки.

---

### 5.5. Если нужно искать по id много раз

Плохо:

```ts
items.value.find(item => item.id === id)
```

Лучше:

```ts
const itemById = computed(
    () => new Map(items.value.map(item => [item.id, item])),
)

itemById.value.get(id)
```

---

### 5.6. Если компонент должен показать форму/список/прогресс

Он не должен сам неожиданно грузить весь мир.

Правило:

- page/store/bootstrap отвечают за данные;
- component отвечает за отображение и локальные UI-состояния.

---

## 6. Проверки после изменений

Были выполнены проверки:

```bash
npm run build
```

Результат:

- production build проходит.

Также был выполнен:

```bash
npx eslint app
```

Результат:

- ошибок нет;
- остались только style warnings по старым Vue-шаблонам: self-closing HTML elements и порядок атрибутов.

Была выполнена визуальная проверка локально:

```text
http://127.0.0.1:3010/
```

Результат:

- приложение открывается;
- для текущего локального состояния показывается экран регистрации;
- ошибок в браузерной консоли после reload не было;
- loader-картинка теперь растянута на весь экран, UI загрузки поверх нее.

---

## 7. Главные уроки, которые стоит запомнить

1. Не грузи глобальные данные в маленьких визуальных компонентах.
2. Для первого экрана нужен единый bootstrap.
3. Чтобы не было мигания, жди не только JSON, но и картинки.
4. `ensure*Loaded()` - для обычного чтения без повторных запросов.
5. `force = true` - после мутаций или retry, когда старый cache может быть неверным.
6. Не парси `404` из строки ошибки, храни HTTP status структурированно.
7. Если запрос уже идет, верни текущий promise, а не создавай новый.
8. Если часто ищешь по id, сделай `Map`.
9. Не смешивай id связи и id сущности.
10. Client plugin должен быть быстрым; долгую сеть лучше держать под loader.
11. Dev-only функции и кнопки нужно удалять до production.
12. UI-ошибки лучше показывать внутри интерфейса, а не через `alert`.

---

## 8. Короткая карта измененных файлов

Новые файлы:

- `app/stores/app-bootstrap.store.ts` - центральная startup-загрузка.
- `app/components/AppLoader.vue` - полноэкранный loader.

Основные измененные файлы:

- `app/app.vue` - gate между loader и приложением.
- `app/composables/useApi.ts` - runtime API base, typed query, `ApiError`.
- `nuxt.config.ts` - `runtimeConfig.public.apiBase`.
- `app/plugins/initTelegram.client.ts` - быстрый Telegram init без backend-запросов.
- `app/stores/user.store.ts` - dedupe/statistics/settings.
- `app/stores/character.store.ts` - корректный `404` для нового пользователя.
- `app/stores/backgrounds.store.ts` - dedupe/maps/fixed background id.
- `app/stores/items.store.ts` - dedupe/maps/cache invalidation/removed dev money.
- `app/stores/activities.store.ts` - dedupe/maps/day-aware daily activities.
- `app/stores/categories.store.ts` - ensure/cache/map.
- `app/stores/friends.store.ts` - ensure/cache/query/delete result.
- `app/pages/index.vue` - главная больше не делает startup сама.
- `app/pages/shop.vue` - `ensure*Loaded`.
- `app/pages/profile.vue` - `ensure*Loaded`.
- `app/pages/settings.vue` - settings ensure и force после delete.
- `app/pages/friends.vue` - friends ensure и immutable delete.
- `app/pages/userActivity/[id].vue` - ensure, removed alert, removed duplicate reload.
- `app/components/Register.vue` - регистрация теперь перезапускает bootstrap.
- `app/components/ProgressBar.vue` - только отображение store state.
- `app/components/ui/LevelCircle.vue` - только отображение store state.
- `app/components/userinfo/UserDayProgress.vue` - только отображение store state.
- `app/components/userinfo/CharacterBaseActivityList.vue` - без локальных fetch.
- `app/components/ChooseYourActivity.vue` - watcher вместо локальной загрузки.
- `app/components/shop/ShopItems.vue` - удален dev-only money UI.
- `app/components/Navbar.vue` - имя компонента для lint.
- `app/layouts/default.vue` - один root element.
- `app/types/activities/activities.ts` - пустые interfaces заменены type aliases.
