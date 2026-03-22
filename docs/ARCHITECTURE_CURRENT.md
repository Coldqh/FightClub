# Текущая архитектура проекта

## Общая картина

Проект работает как HTA/Web-приложение с одним действующим runtime в [fight_simulator.hta](/C:/Fight%20Simulator/fight_simulator.hta) и web-зеркалом в [index.html](/C:/Fight%20Simulator/index.html).

Логика уже разделена на несколько слоев:

- entrypoint и основной runtime: [fight_simulator.hta](/C:/Fight%20Simulator/fight_simulator.hta)
- web-копия: [index.html](/C:/Fight%20Simulator/index.html)
- core-слой состояния и инфраструктуры: [src/core](/C:/Fight%20Simulator/src/core)
- content-слой: [src/content](/C:/Fight%20Simulator/src/content)
- генерация имен и пулов: [country_data.js](/C:/Fight%20Simulator/country_data.js)
- игровые константы runtime: [game_data.js](/C:/Fight%20Simulator/game_data.js)
- версия web-сборки: [version.json](/C:/Fight%20Simulator/version.json)

## Entry Point и жизненный цикл

Основной запуск идет через [fight_simulator.hta](/C:/Fight%20Simulator/fight_simulator.hta), который подключает внешние data/core-файлы и затем исполняет inline-runtime.

Ключевые точки:

- `window.onload`
  - обновляет превью сейва
  - открывает стартовый экран
  - рендерит приложение
  - запускает проверку обновления
- `render()`
  - центральный UI-dispatch
  - выбирает экран по `state.screen`
  - рисует активную панель
  - вызывает безопасное автосохранение

## Core-слой

Инфраструктура вынесена в `src/core`:

- [rng_manager.js](/C:/Fight%20Simulator/src/core/rng_manager.js)
  - native/seeded RNG
  - выбор случайных значений и seed-state
- [save_manager.js](/C:/Fight%20Simulator/src/core/save_manager.js)
  - чтение/запись snapshot в `localStorage`
- [time_system.js](/C:/Fight%20Simulator/src/core/time_system.js)
  - календарь карьеры
  - месяц/год/неделя
  - возраст бойца по времени
- [state_factory.js](/C:/Fight%20Simulator/src/core/state_factory.js)
  - канонический `GameState`
  - legacy-адаптеры runtime
  - миграция старого snapshot в новую структуру
- [validators.js](/C:/Fight%20Simulator/src/core/validators.js)
  - базовая проверка целостности состояния после загрузки

## Content-слой

Контент отделен от логики:

- [src/content/content_data.js](/C:/Fight%20Simulator/src/content/content_data.js)
  - страны
  - арены
  - базовые типы соперников
  - tier-данные соперников
  - недельные события
- [src/content/content_loader.js](/C:/Fight%20Simulator/src/content/content_loader.js)
  - единый доступ к странам, аренам, пулам имен и событиям
- [country_data.js](/C:/Fight%20Simulator/country_data.js)
  - seed-конфиги
  - собранные пулы имен, фамилий и кличек

Сейчас логика генерации новых бойцов, соперников, арен и недельных событий уже использует `ContentLoader`, а не большие захардкоженные массивы внутри runtime-функций.

## Runtime State

В рантайме по-прежнему живет объект `state`, но он уже считается legacy-оберткой поверх канонического `GameState`.

Главные runtime-секции:

- `meta`
- `player`
- `career`
- `world`
- `battle`
- `ui`
- `feed`

Подробная схема описана в [STATE_SCHEMA.md](/C:/Fight%20Simulator/docs/STATE_SCHEMA.md).

Внутри карьерного цикла теперь поверх старой недели работает `TimeSystem`, а переход недели запускает world tick: обновление календаря, возраста, долгих состояний и доступных мировых предложений.

## UI-рендер

Основные функции рендера:

- `renderMainMenu()`
- `renderCreate()`
- `renderGame()`
- `renderMainPanel()`
- `renderCharacterPanel()`
- `renderTrainPanel()`
- `renderRecoverPanel()`
- `renderWorkPanel()`
- `renderTravelPanel()`
- `renderFightSelectPanel()`
- `renderFightLivePanel()`
- `renderFightBreakPanel()`
- `renderFightResultPanel()`
- `renderEnding()`

UI по-прежнему монолитен, но опирается на внешние content/core-слои.

## Карьерная логика

Карьерный цикл пока остается в [fight_simulator.hta](/C:/Fight%20Simulator/fight_simulator.hta), но уже опирается на внешние данные.

Ключевые функции:

- `resetCreate()`
- `startCareer()`
- `spendWeek()`
- `advanceWeek()`
- `weeklyEvent()`
- `travelToCountry(countryKey)`
- `actionTrain(kind)`
- `actionRecover(kind)`
- `actionWork()`

## Генерация стран, имен и соперников

Главные точки генерации:

- `getCountryInfo(countryKey)` -> `ContentLoader.getCountry(...)`
- `listCountries()` -> `ContentLoader.listCountries()`
- `makeIdentity(countryKey)` -> пулы из [country_data.js](/C:/Fight%20Simulator/country_data.js)
- `generateOpponent(tier)` -> tier/type/arena через `ContentLoader`
- `openFightSelect()` -> формирование карточек соперников текущей страны

## Боевая логика

Боевая система пока все еще находится в [fight_simulator.hta](/C:/Fight%20Simulator/fight_simulator.hta).

Основные блоки:

- `startFight(index)`
- `fightAction(actionKey)`
- `runAiAfterPlayer()`
- `completeFightTurn()`
- `finishFightRound()`
- `startNextRound()`
- `finalizeFight(result, method, lines)`
- `closeFightResult()`

Вспомогательные боевые функции:

- `buildFightState()`
- `fightStateBySide()`
- `fightStatsBySide()`
- `actionReachAllowed()`
- `canUseFightAction()`
- `strikeActor()`
- `applyDefenseAction()`
- `attemptCounterAttack()`
- `resolveKnockdown()`
- `advanceKnockdownSequence()`
- `applyFightResults()`

## Система сохранения

Сейвы уже идут через новый слой:

- `buildSaveSnapshot()`
- `saveGameState()`
- `loadSavedSnapshot()`
- `migrateSave(saveData)`
- `validateState(gameState)`
- `continueSavedGame()`

Новый snapshot содержит `saveVersion` и канонический `game`, а старые сейвы мигрируют в эту структуру при загрузке.

## Что уже стабилизировано

- есть `SAVE_VERSION`
- есть migration-слой для старых сейвов
- `localStorage` завернут в `SaveManager`
- RNG вынесен в отдельный слой
- введен `GameState`
- базовый контент вынесен в data-driven слой

## Что еще остается монолитным

- боевой runtime
- карьерный flow
- UI-рендер

Это все еще один рабочий файл, но теперь поверх него уже есть нормальные core/content-слои, и следующие этапы можно делать без переписывания всего проекта с нуля.
