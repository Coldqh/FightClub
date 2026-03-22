# CHATGPT PERFORMANCE AND RUNTIME AUDIT

Дата аудита: 2026-03-22  
Репозиторий: `Fight Simulator` / `boxing life sim`  
Формат аудита: статический архитектурный разбор + частичная инструментальная инспекция кода  
Ограничение аудита: в этой задаче код не менялся и не фиксился; полный HTA GUI-profiler не поднимался из-за ограничений старого host/runtime, поэтому часть выводов основана на детальном static control-flow audit и уже встроенных debug timers.

---

# 1. Executive Summary

## Что это за проект в техническом смысле

Это большой single-page runtime, собранный вокруг одного гигантского монолита `fight_simulator.hta`, который:

- хранит legacy runtime state в глобальном `state`
- одновременно поддерживает canonical `state.game`
- на каждом существенном действии синхронизирует данные между legacy и canonical слоями
- рендерит интерфейс одной большой строкой HTML через `app.innerHTML = ...`
- держит боевой рантайм, недельную симуляцию, карьерные панели, профили, рейтинги, NPC, события и часть инфраструктурной логики в одном execution path

Проект уже не маленький life sim. Это смесь:

- монолитного UI runtime
- world simulation
- turn-based battle runtime
- large derived views over persistent roster
- save/serialization bridge
- old compatibility layer

Текущая проблема производительности не выглядит как один баг. Это системная сумма архитектурных узких мест.

## Самые тяжёлые части прямо сейчас

По коду наиболее тяжёлые зоны:

1. `fight_simulator.hta` как общий runtime/render monolith
2. `syncGameStateFromRuntime()` / `syncRuntimeStateFromGame()` bridge
3. `normalizeGameState()` в `src/core/state_factory.js`
4. `refreshWorldState()` и `runWorldTick()`
5. `renderCareerGymPanel()` / `renderCareerTrainerPanel()`
6. `WorldRankingsEngine` ranking/profile builders
7. battle action chain: `fightAction()` -> `strikeActor()` -> animation/render/timers
8. save path: `buildSaveSnapshot()` + `JSON.stringify()` + `localStorage.setItem(...)`
9. repeated NPC/relation sync in `ensureNpcWorld()`
10. global full-app rerender on every panel/action/animation step

## 10 самых вероятных причин плохого отклика и лагов

1. Полный rebuild всего UI дерева через `render()` и `app.innerHTML` на почти любое действие.
2. Render flow завязан на deferred save, а save path сам по себе дорогой.
3. Двойной источник правды: legacy runtime `state.*` + canonical `state.game`, между которыми идут тяжёлые sync/normalize passes.
4. `normalizeGameState()` не просто нормализует данные, а прогоняет enrichment почти всех мировых подсистем.
5. `week advance` делает слишком много синхронно в одном main-thread pass.
6. Gym/trainer flow делает full sync туда-обратно + refresh world + rerender.
7. Rankings/profiles строятся из full-roster scans и full sorts, а pagination уменьшает только DOM, но не вычисления.
8. Battle animation завязана на state mutation + full rerender, а не на локальные стабильные DOM nodes.
9. У боя встроены delay/timer stages, и поверх них сидит heavy render path, поэтому perceived latency резко растёт.
10. В проекте много мест, где UI selector имеет side effects и сам трогает canonical/world state.

## 10 самых опасных performance/runtime проблем, которые нужно чинить первыми

1. Монолитный `render()` с полной заменой `innerHTML`.
2. Full canonical/runtime sync на UI paths, где нужен только readonly projection.
3. `refreshWorldState()` как oversized synchronous world rebuild.
4. `runWorldTick()` как overloaded weekly pipeline.
5. Save pipeline: deep clone + two `JSON.stringify()` + `localStorage.setItem(...)`.
6. Battle animation/render race: animation render immediately overwritten by next render.
7. `ensureNpcWorld()` с `syncAllNpcRelationSnapshots()` на обычных lookup paths.
8. `WorldRankingsEngine` full scans/sorts на открытие рейтингов и профилей.
9. `WorldFacilityEngine.listTrainersByGym()` и связанный gym/trainer flow с full scans и full world refresh.
10. Side-effect selectors inside render flow (`currentProSummary`, `currentCareerTransitionCards`, encounter/profile helpers).

---

# 2. Repository Map Focused on Runtime

## Главные runtime-файлы

| Файл | Роль | Почему hotspot |
|---|---|---|
| `fight_simulator.hta` | Основной runtime, UI, battle, week loop, save glue, panel routing | Главный монолит проекта, ~685 KB |
| `index.html` | Web-wrapper, грузит тот же runtime stack | Повторяет HTA runtime structure |
| `src/core/state_factory.js` | Save schema, normalize, migrate, runtime <-> game transforms | Clone-heavy и central to every sync |
| `src/core/world_sim_state.js` | Canonical section attachment | Участвует в обогащении состояния |
| `src/core/persistent_fighter_registry.js` | Persistent roster enrichment | Может дозаполнять ростер и строить entity links |
| `src/core/world_rankings_engine.js` | Рейтинги, профили, реестр | Full-roster scans, sorts, profile construction |
| `src/core/world_facility_engine.js` | Gyms/trainers/facility links | Gym/trainer UI path и world roster links |
| `src/core/world_career_sim_engine.js` | Weekly NPC/world simulation | Один из тяжёлых weekly subsystems |
| `src/core/amateur_season_engine.js` | Сезоны/турниры любителей | Может участвовать в world tick и rankings |
| `src/core/pro_career_engine.js` | Pro pipeline, summary, org data | Вызывается из career/pro/ranking paths |
| `src/core/sparring_camp_engine.js` | Spаrring/camp subsystem | Участвует в weekly refresh и sparring UI |
| `src/core/encounter_history_engine.js` | Cross-track encounter memory | Вызывается в offer/profile/world paths |
| `src/core/world_story_engine.js` | Story/media/history derived layer | Вызывается из `refreshWorldState()` |
| `src/core/career_transition_engine.js` | Transition state and ranking | Вызывается и в weekly path, и в render path |
| `src/content/content_loader.js` | Shared content cache | Не главный лаг, но central lookup layer |
| `src/core/save_manager.js` | localStorage load/save | Sync IO on main thread |

## Файлы, отвечающие за UI

Основной UI почти полностью живёт в `fight_simulator.hta`:

- `render()` `(~15778)`
- `renderGame()` `(~15125)`
- `renderMainPanel()` `(~15075)`
- `openPanel()` `(~10904)`
- `renderNavigationTabs()` `(~11872)`

Отдельные тяжёлые panel builders:

- `renderCareerPanel()` `(~13453)`
- `renderCareerGymPanel()` `(~13559)`
- `renderCareerTrainerPanel()` `(~13596)`
- `renderRankingsPanel()` `(~13294)`
- `renderFighterProfilePanel()` `(~13312)`
- `renderTrainerProfilePanel()` `(~13386)`
- `renderPeoplePanel()` `(~11811)`
- `renderFightSelectPanel()` `(~12062)`
- `renderLegendArchive()` `(~12099+)`

## Файлы, отвечающие за бой

Core battle runtime находится в `fight_simulator.hta`:

- `fightAction()` `(~15668)`
- `runAiAfterPlayer()` `(~15622)`
- `completeFightTurn()` `(~15500)`
- `finishFightRound()` `(~15409+)`
- `strikeActor()` `(~14186)`
- `renderFightLivePanel()` `(~15722)`
- `renderFightStatsPanel()` `(~15705)`
- `renderFightLogPanel()` `(~11518)`
- `finalizeFight()` `(~11548)`
- animation helpers `clearFightAnimation()`, `scheduleFightStep()`, `setFightAnimationFrame()` `(~13816-13843)`

Battle ruleset data/logic:

- `src/content/battle_ruleset_data.js`
- `src/core/battle_ruleset_engine.js`

## Файлы, отвечающие за week advance

Primary path:

- `spendWeek()` `(~10917)`
- `advanceWeek()` `(~10931)`
- `runWorldTick()` `(~10244)`
- `runPersistentWorldCareerSimulation()` `(~10228)`
- `updateNpcWorldForWeek()` `(~8744)`
- `refreshWorldState()` `(~8897)`

Supporting heavy subsystems:

- `src/core/world_career_sim_engine.js`
- `src/core/amateur_season_engine.js`
- `src/core/world_story_engine.js`
- `src/core/career_transition_engine.js`
- `src/core/sparring_camp_engine.js`

## Файлы, отвечающие за gym/trainer panels

- `renderCareerGymPanel()` `fight_simulator.hta ~13559`
- `renderCareerTrainerPanel()` `fight_simulator.hta ~13596`
- `joinGym()` `fight_simulator.hta ~7129`
- `hireTrainer()` `fight_simulator.hta ~7179`
- `listCareerGymChoices()` `fight_simulator.hta ~12318`
- `listCareerTrainerChoices()` `fight_simulator.hta ~12329`
- `src/core/world_facility_engine.js`

## Файлы, отвечающие за rankings/lists/profiles

- `renderRankingsPanel()` and helpers in `fight_simulator.hta`
- `currentStreetRankingView()` `~7704`
- `currentAmateurRankingView()` `~7717`
- `currentProRankingView()` `~7730`
- `currentRosterDirectoryView()` `~7743`
- `currentViewedFighterProfile()` `~7757`
- `currentViewedTrainerProfile()` `~7770`
- `src/core/world_rankings_engine.js`
- `src/content/ranking_profile_data.js`

## Самые большие и перегруженные файлы

На момент аудита крупнейшие релевантные runtime-файлы:

- `fight_simulator.hta` — абсолютный HOTSPOT
- `index.html` — web mirror того же runtime
- `src/core/pro_career_engine.js`
- `src/core/amateur_season_engine.js`
- `src/core/state_factory.js`
- `src/content/content_loader.js`
- `src/core/world_rankings_engine.js`
- `src/core/career_transition_engine.js`
- `src/core/world_sim_state.js`
- `src/core/world_career_sim_engine.js`
- `src/core/sparring_camp_engine.js`

## Файлы, которые выглядят как runtime hotspots

**HOTSPOT A:** `fight_simulator.hta`  
Ответственность слишком широкая: UI, state bridge, week loop, battle loop, save, events, panels.

**HOTSPOT B:** `src/core/state_factory.js`  
Любой sync/normalize тащит за собой нормализацию почти всего мира.

**HOTSPOT C:** `src/core/world_rankings_engine.js`  
Почти всё строится full-scan/full-sort style.

**HOTSPOT D:** `src/core/world_facility_engine.js`  
Gym/trainer flow пока практичный, но вычислительно грубый.

**HOTSPOT E:** `src/core/world_career_sim_engine.js`  
Heavy weekly pass over persistent roster.

---

# 3. Boot Flow and Runtime Initialization

## Что происходит при запуске игры

Текущий boot flow в `fight_simulator.hta`:

1. `window.onload` `(~15868)`:
   - `refreshSavedPreview()`
   - `state.screen = "menu"`
   - `render()`
   - `checkForAppUpdate()`

2. `refreshSavedPreview()` `(~2579)`:
   - `loadSavedSnapshot()`
   - `SaveManager.load(...)`
   - `JSON.parse(...)` всего payload из `localStorage`
   - `buildSavePreview(saved)`

3. `render()`:
   - строит full menu DOM
   - вставляет HTML через `app.innerHTML`
   - планирует deferred `saveGameState()`

4. `checkForAppUpdate()` `(~2369)`:
   - async `XMLHttpRequest` к `version.json`
   - по ответу обновляет `state.remoteVersion` / `state.updateAvailable`
   - вызывает `render()`

## Что инициализируется

На старте и при первом полноценном продолжении карьеры могут инициализироваться:

- saved preview
- legacy runtime state
- canonical game state on demand
- update banner state
- debug runtime state

При `continueSavedGame()` `(~2613)` идёт более тяжёлый поток:

1. `loadSavedSnapshot()` + `migrateSave()`
2. `validateState(saved.game)`
3. `syncRuntimeStateFromGame(saved.game)`
4. `normalizeLoadedFight(...)`
5. `ensureLifeState()`
6. `ensureNpcWorld()`
7. `normalizeWorldOffers()`
8. при необходимости `refreshWorldState()`
9. `syncGameStateFromRuntime()`
10. `render()`

Это уже near-full runtime hydration, и он тяжёлый.

## Какие данные грузятся сразу

Фактически сразу или очень рано на load/continue:

- весь save snapshot из `localStorage`
- world preview / saved preview
- при continue: полный canonical/runtime bridge
- world offers
- NPC world compatibility state
- potential fight normalization

## Что можно было бы грузить лениво, но сейчас может грузиться сразу

Сейчас eager или quasi-eager выглядят:

- save preview from full save payload
- world offer normalization on continue
- NPC compatibility sync on continue
- update banner check immediately after first render

Под вопросом, но вероятно не должно быть eager на start menu:

- full save payload parse ради одной карточки preview
- immediate second `render()` после version check

## Что уже на старте может ухудшать производительность

1. `refreshSavedPreview()` читает и парсит весь save.
2. `render()` после меню уже планирует save.
3. `checkForAppUpdate()` по ответу делает ещё один full render.
4. На `continueSavedGame()` возможен полный `refreshWorldState()`.

### Uncertainty

Я не снимал реальный cold-start timeline в HTA/WebView профайлере. Но из control flow видно, что старт даже до gameplay не совсем лёгкий.

---

# 4. Canonical Runtime and UI Architecture

## Как реально устроен runtime

Проект сейчас живёт в двух моделях одновременно:

### A. Legacy runtime state

Глобальный mutable `state` в `fight_simulator.hta`, включающий:

- `state.fighter`
- `state.world`
- `state.opponents`
- `state.fight`
- `state.log`
- `state.create`
- `state.panel`
- `state.screen`
- и много вспомогательных runtime branches

### B. Canonical game state

`state.game` и world-sim branches:

- `playerState`
- `worldState`
- `rosterState`
- `organizationState`
- `competitionState`
- `narrativeState`

Эти ветки поддерживаются через `state_factory.js`, `world_sim_state.js`, persistent registry и другие engines.

## Ключевая архитектурная проблема

UI и gameplay постоянно прыгают между этими двумя моделями.

### Основные bridge функции

В `fight_simulator.hta`:

- `syncGameStateFromRuntime()` `(~1162)`
- `syncRuntimeStateFromGame(gameState)` `(~1174)`
- `ensurePersistentGameState(forceSync)` `(~7562)`

В `src/core/state_factory.js`:

- `buildGameStateFromRuntime(...)` `(~1254)`
- `applyGameStateToRuntime(...)` `(~1296)`
- `normalizeGameState(...)` `(~956)`
- `clonePlainData(...)` `(~3)`

## Почему это дорого

### `syncGameStateFromRuntime()`

Не просто "даёт ссылку". Он:

- строит новый `gameState` из legacy snapshot
- тянет `buildGameStateFromLegacySnapshot(...)`
- нормализует через `normalizeGameState(...)`
- увеличивает `gameVersion`
- инвалидирует projection caches

### `syncRuntimeStateFromGame(gameState)`

Тоже не cheap:

- повторно `normalizeGameState(gameState, ...)`
- затем `applyGameStateToRuntime(...)`
- затем deep clone почти всех canonical веток обратно в legacy runtime

### `normalizeGameState(...)` is not a pure cheap normalize

Это один из самых важных выводов аудита.

`normalizeGameState(...)` в `src/core/state_factory.js` не ограничивается sanitation данных. Он вызывает почти весь мировой enrichment pipeline:

- `ensureWorldSimSections`
- `ensurePersistentRosterSections`
- `ensureAmateurEcosystemSections`
- `ensureAmateurSeasonSections`
- `ensureStreetCareerSections`
- `ensureProCareerSections`
- `ensureSparringCampSections`
- `ensureWorldCareerSections`
- `ensureEncounterHistorySections`
- `ensureWorldStorySections`
- `ensureCareerTransitionSections`
- `WorldFacilityEngine.normalizeGameStateFacilities(...)`

То есть любое seemingly innocent state sync потенциально тянет огромный объём world logic.

## Как устроен UI-рендер

`render()` `(~15778)`:

1. `beginRenderCycle()`
2. выбирает screen
3. `renderGame()` или menu/end/archive/create
4. optionally `renderDebugPanel()`
5. `app.innerHTML = renderUpdateBanner() + debugHtml + html`
6. `scheduleSaveGameState()`

Это означает:

- никакого granular DOM update
- никакого diffing
- никакого stable subtree retention
- любой panel switch/animation step/battle turn = full DOM replacement for active app shell

## Есть ли монолитный рендер

Да. Абсолютно.

Даже когда пользователь просто:

- открывает вкладку
- раскрывает секцию
- кликает fight action
- меняет страницу рейтинга
- открывает профиль

выполняется большой `render()` всего активного экрана.

## Где UI напрямую лезет в world computations

Много где.

### Примеры

#### 1. `memoizeGameProjection(...)` в `fight_simulator.hta` `(~1237)`

Перед тем как вернуть cached derived view, он делает:

- `ensurePersistentGameState(false)`

А значит любой selector/projection может потянуть canonical sync.

#### 2. `currentProSummary()` `(~3603)`

Внутри projection selector:

- вызывает `ProCareerEngine.ensureState(gameState)`
- пишет `state.game = gameState`
- вызывает `syncWorldSimSectionsFromGameState(gameState)`

Это side effect inside derived view.

#### 3. `currentCareerTransitionCards()` `(~3490+)`

Если `availableTransitionIds` пусты:

- вызывает `CareerTransitionEngine.syncPlayerTransitionState(...)`
- пишет `state.game = gameState`
- вызывает `touchGameProjectionState()`
- вызывает `syncWorldSimSectionsFromGameState(gameState)`

Это ещё один selector, который сам мутирует state и инвалидирует projection caches.

#### 4. `currentEncounterHistoryForOpponent(...)` `(~7833+)`

Для простого получения encounter history:

- `ensurePersistentGameState(false)`
- `ensureEncounterHistoryState(gameState)`
- `state.game = gameState`
- `syncWorldSimSectionsFromGameState(gameState)`

## Где бизнес-логика смешана с presentation layer

Практически везде в `fight_simulator.hta`.

Смешение особенно заметно в:

- career panels
- fight panels
- week advance adjacent UI functions
- profile/ranking sections
- panel navigation

UI-функции не только рендерят, но и:

- инициируют canonical sync
- добивают missing world sections
- пересобирают derived state
- тянут world summary builders
- иногда обновляют runtime cache versions

## Где state update и render flow переплетены так, что это даёт лаги

Наиболее опасные места:

1. `openPanel()` -> `render()`
2. gym/trainer actions -> full state sync -> `refreshWorldState()` -> `render()/openPanel`
3. fight action -> `strikeActor()` -> `setFightAnimationFrame()` -> `render()` -> затем `fightAction()` делает ещё `render()`
4. `finalizeFight()` -> `applyFightResults()` -> `advanceWeek()` -> `render()`
5. `window.onresize = render()`
6. `checkForAppUpdate()` -> `render()`

---

# 5. Full Critical Path Analysis

## 5.1 Переключение вкладки

### Базовый flow

`onclick='openPanel("...")'` -> `openPanel(panel)` `(~10904)` -> `render()` -> `renderGame()` -> `renderNavigationTabs()` + `renderMainPanel()`

### Что вызывается

- `openPanel()`
- `render()`
- `renderGame()`
- один из panel builders
- `scheduleSaveGameState()`

### Какие данные пересчитываются

Это зависит от панели, но даже простой tab switch:

- полностью перестраивает DOM активного приложения
- сбрасывает render memo
- может триггерить `ensurePersistentGameState(false)` внутри panel helpers
- может реиспользовать или инвалидировать `gameProjection` cache depending on `gameVersion`

### Какие DOM-секции пересобираются

Даже без тяжёлой панели:

- topbar
- navigation tabs
- main panel container
- весь HTML содержимого текущей панели
- update banner
- debug panel если debug включён

### Почему это может занимать ~2 секунды

Потому что tab switch здесь не равен "скрыть/показать существующий tab".  
Он равен:

- полный rebuild строки HTML
- полная замена DOM subtree
- возможный readonly->canonical sync
- возможный deferred save scheduling

Если панель использует derived views, ranking/profiles/career summaries, то добавляются ещё:

- full scans по ростеру
- сортировки
- access checks
- lookups через dual-state bridge

## 5.2 Открытие/раскрытие тяжёлой вкладки

### Gym / trainer panel

`openPanel("careerGym")` / `openPanel("careerTrainer")`

Что происходит:

- full render whole app
- panel builder вызывает `ensurePersistentGameState(false)`
- строит списки gyms/trainers
- для каждой карточки считает access / requirement / costs / bonuses
- в trainer panel фильтрует trainer list by current gym and current track

### Career panel

`renderCareerPanel()` `(~13453)` формально стал compact, но всё равно тянет:

- `currentStreetCareerSummary()`
- `currentProSummary()`
- `currentAmateurState()`
- `currentNationalTeamStatusInfo()`
- `currentAmateurOrganization()`
- `currentNationalTeam()`
- `currentGym()`
- `currentTrainerNpc()`
- `currentTrainerType()`
- `currentPreparationSummary()`
- `currentContract()`
- `currentCareerTopTransitionCards(2)`
- `currentTrackNearestGoal()`

Часть этих helper functions themselves are projections with world lookups.

### Rankings / profiles

`renderRankingsPanel()` `(~13294)`:

- строит только текущий раздел, это хорошо
- но сам раздел строится из full ranking view
- pagination режет DOM, но не вычислительную стоимость сортировки и сборки списка

`renderFighterProfilePanel()` / `renderTrainerProfilePanel()`:

- берут full profile projection
- pro fighter profile может строить full Ring ranking и сканировать org ranking tables
- trainer profile может fallback-сканировать весь roster

### People-related heavy panels

`renderPeoplePanel()` `(~11811)`:

- `knownNpcs()`
- per NPC:
  - `findRelationship(npc.id)` linear lookup
  - `relationshipArcsForNpc(npc.id)` loops active arcs
  - `renderSectionCard(...)` with eagerly built heavy body

Это не главный пользовательский симптом, но панель потенциально тяжёлая.

### Какие expensive operations происходят

- full HTML generation for entire active screen
- repeated string concatenation
- repeated linear scans over roster/NPC/relations arrays
- expensive derived view builders
- panel open also schedules save

## 5.3 Выбор или смена зала

### Flow

`joinGym(gymId)` `(~7129)`

1. `getGym(gymId)`
2. `currentGym()`
3. `amateurOrganizationForGym(gym.id)`
4. `facilityGymAccessInfo(gym.id)` -> `ensurePersistentGameState(false)` -> `WorldFacilityEngine.gymAccessInfo(...)`
5. balance checks
6. `gameState = syncGameStateFromRuntime()`
7. `WorldFacilityEngine.signGym(gameState, currentPlayerEntityId(), gym.id, state.fighter.week)`
8. `syncRuntimeStateFromGame(gameState)`
9. `syncLegacyFacilityStateFromPlayerEntity(gameState)`
10. relation/media/biography adjustments
11. `refreshWorldState()`
12. `openPanel("careerTrainer")`

### Что пересчитывается

- full canonical game rebuild
- normalize/enrich of canonical game
- facility links
- legacy facility snapshot
- weekly offers/world summaries
- transitions/story/sparring offers during `refreshWorldState()`
- then full trainer panel render

### Какие связи обновляются

- fighter -> gym binding
- possibly fighter -> trainer reset
- gym roster links
- legacy `state.world.gymMembership`
- legacy `state.world.trainerAssignment`
- amateur org binding if applicable

### Какие списки строятся

- gym access info
- on success immediate open of trainer list for new gym
- full weekly offers in `refreshWorldState()`

### Какие кэши отсутствуют или недостаточно узкие

- нет узкого `facilityVersion`; invalidates coarse `gameVersion`
- нет отдельного cheap readonly facility access view
- нет partial world refresh specifically for facility change

### Почему это может занимать ~5 секунд

Потому что смена зала сейчас ближе к "rebuild and resync half the world", чем к "update facility choice".

## 5.4 Выбор или смена тренера

### Flow

`hireTrainer(trainerTypeId)` `(~7179)`

1. `getTrainerType(trainerTypeId)`
2. `facilityTrainerAccessInfo(trainerType.id)` -> `ensurePersistentGameState(false)` -> `WorldFacilityEngine.trainerAccessInfo(...)`
3. `ensureTrainerNpcForGym(null, trainerTypeId)`
4. balance checks
5. `gameState = syncGameStateFromRuntime()`
6. `WorldFacilityEngine.followTrainer(...)`
7. `syncRuntimeStateFromGame(gameState)`
8. `syncLegacyFacilityStateFromPlayerEntity(gameState)`
9. relation/NPC/biography/media updates
10. `refreshWorldState()`
11. `render()`

### Какие данные ищутся/фильтруются/строятся

- trainer access vs fighter track/rank/gym
- NPC trainer wrapper creation/lookup
- facility links rebuild
- world refresh/re-offer processing

### Есть ли повторные полные проходы по всему миру

Да, потенциально:

- canonical sync
- normalize/enrichment
- facility link rebuild
- world refresh
- NPC sync paths

### Отдельный скрытый фактор

`ensureTrainerNpcForGym(...)` `(~7068)`:

- вызывает `ensureNpcWorld()`
- затем linearly scans `state.world.npcs` for matching trainer flag

А `ensureNpcWorld()` itself вызывает `syncAllNpcRelationSnapshots()` каждый раз. Это не должно происходить на обычном trainer lookup path.

## 5.5 Переключение недели

### Весь pipeline

`spendWeek()` `(~10917)`:

1. `evaluateEndState()`
2. `advanceWeek()`
3. `evaluateEndState()`
4. `state.panel = activeEvent ? "worldEvent" : "home"`
5. `render()`
6. write `weekAdvanceMs`

`advanceWeek()` `(~10931)`:

1. `runWorldTick()`
2. write `weekTickMs`

`runWorldTick()` `(~10244)`:

1. `ensureLifeState()`
2. `TimeSystem.advanceWeek(...)`
3. weekly expenses
4. housing/trainer/gym upkeep
5. contract upkeep
6. logs for month/age transitions
7. housing effects
8. injury effects
9. fatigue/wear/support/stress/morale/health shifts
10. debt logic
11. adult transition logic
12. `applyBounds(fighter)`
13. `syncAmateurRankState(fighter, true)`
14. `runPersistentWorldCareerSimulation(action)`
15. `updateNpcWorldForWeek(action)`
16. `refreshWorldState()`
17. reset action
18. `weeklyEvent()` if needed

### Какие подсистемы вызываются

- life/housing/economy
- injury/recovery
- amateur progression
- persistent world sim
- NPC world maintenance
- offer generation
- reputation
- encounter history
- sparring offers
- transition state
- world story/media
- event system

### Что обновляется синхронно

Практически всё.

Нет заметного async slicing, batching by microtasks или deferred heavy recompute.

### Какие вычисления тяжёлые

1. `runPersistentWorldCareerSimulation(action)`
2. `updateNpcWorldForWeek(action)`
3. `refreshWorldState()`
4. inside `refreshWorldState()`:
   - `buildWeeklyOffers()`
   - `syncAllNpcRelationSnapshots()`
   - `refreshReputationState()`
   - `syncGameStateFromRuntime()`
   - `SparringCampEngine.refreshWeeklyOffers(...)`
   - `CareerTransitionEngine.syncPlayerTransitionState(...)`
   - `WorldStoryEngine.syncWorldStory(...)`
   - `syncRuntimeStateFromGame(refreshedGameState)`
   - `drain*Notices(...)`

### Что пересчитывается лишний раз

Очень вероятные дубли:

- runtime -> canonical sync more than once inside one week
- world offers built, then synced, then normalized again
- notices drains after full sync
- relationship snapshots every refresh
- story/transition/sparring refresh even если player их прямо сейчас не открывает

### Какие части скорее всего дают 10 секунд

Если current roster уже большой, наиболее вероятная комбинация:

1. `runPersistentWorldCareerSimulation` over full roster
2. `refreshWorldState` with multiple sync passes
3. `normalizeGameState()` inside sync bridge
4. `WorldRankingsEngine.ensureMinimumRoster(...)` inside persistent roster enrichment if world still needs topping up
5. `syncAllNpcRelationSnapshots()` if NPC list and relations разрослись
6. `buildWeeklyOffers()` + `normalizeFightOffer(...)` + persistent opponent snapshots
7. `WorldStoryEngine.syncWorldStory(...)`
8. `CareerTransitionEngine.syncPlayerTransitionState(...)`
9. `drain*Notices(...)`
10. final `render()` to `home/worldEvent`

## 5.6 Один удар в бою

### Полный путь от клика до визуального результата

`onclick='fightAction("jab")'`

1. `fightAction(actionKey)` `(~15668)`
2. validation / `sanitizeFightState(...)`
3. `maybeForceStopFight(...)`
4. `canUseFightAction(...)`
5. `fight.actionLock = true`
6. `strikeActor(fight, "player", actionKey, null)` `(~14186)`
7. inside `strikeActor`:
   - `sanitizeFightState(...)`
   - `maybeForceStopFight(...)`
   - distance/reach checks
   - stamina mutation
   - `previewAttackModifiers(...)`
   - dodge/hit chance
   - damage compute
   - HP mutation
   - log entries
   - `setStrikeAnimation(...)`
8. `setStrikeAnimation(...)` -> `setFightAnimationFrame(...)`
9. `setFightAnimationFrame(...)`:
   - clears previous animation
   - writes `state.fight.animation`
   - **calls `render()` immediately**
   - schedules `clearFightAnimation()` timeout
10. `strikeActor(...)` returns to `fightAction(...)`
11. `fightAction(...)` then **calls `render()` again**
12. `scheduleFightStep("finishPlayerFightAction", ACTION_DELAY_MS)`
13. later AI step:
   - `runAiAfterPlayer()`
   - can trigger another `strikeActor(...)`
   - another animation render
   - another `render()`
14. `completeFightTurn()`:
   - more state work
   - another `render()`

### Какие вычисления вызываются

Per one player attack:

- multiple validations and clamps
- attack modifiers
- AI follow-up scoring
- several fight context lookups
- repeated fight UI full rebuilds

### Какой state мутируется

- HP/stamina/defense/attack chain
- action lock
- combat log
- animation state
- timers
- round state

### Когда происходит рендер

Критически важно:

- первый render уже внутри `setFightAnimationFrame()`
- второй render в конце `fightAction()`
- третий render later from `clearFightAnimation()`
- далее render from AI action path
- далее render from `completeFightTurn()`

Для одного нажатия удара пользователь может попасть в серию из нескольких full rerenders.

### Какие части могут задерживать удар на 3 секунды

1. built-in pacing timers:
   - `ACTION_DELAY_MS = 500`
   - AI follow-up also delayed
2. двойной render immediately after strike
3. animation clear render
4. if debug open, extra debug render cost
5. if current render is heavy, browser paint gets delayed
6. whole battle DOM is recreated each render
7. save scheduling after each render adds more main-thread pressure

## 5.7 Проигрывание анимации

### Как анимация триггерится

`setStrikeAnimation()` -> `setFightAnimationFrame()`:

- writes animation classes into `state.fight.animation`
- calls full `render()`
- after timeout calls `clearFightAnimation()` which triggers another `render()`

### Зависит ли анимация от блокирующей логики

Да. Полностью.

Анимация здесь не живёт отдельно от синхронной боевой логики.  
Она встроена в state-driven rerender path.

### Есть ли race conditions

Очень вероятно, да:

- first render adds animation classes
- next synchronous render can replace nodes before the browser paints
- timeout-driven clear can fire on stale DOM/state expectations

### Есть ли пропуск анимации при слишком долгом main thread block

Да, это один из самых вероятных сценариев.

Если после `render()` main thread остаётся заблокирован:

- paint откладывается
- animation may never visibly start
- next render replaces animated nodes

### Есть ли проблемы с class toggles / timeouts / rAF

Да:

- нет `requestAnimationFrame` orchestration
- animation uses global state + full rerender, а не local node toggles
- timeouts передаются строками: `window.setTimeout("clearFightAnimation()", ...)` и `window.setTimeout(callbackName + "()", delay)`
- full node replacement likely kills CSS animation continuity

---

# 6. State and Derived Data Performance Audit

## Где хранится state

### Legacy runtime

В `fight_simulator.hta`:

- `state.fighter`
- `state.world`
- `state.opponents`
- `state.fight`
- `state.log`
- `state.activeEvent`
- `state.debug`

### Canonical state

В `state.game` / `GameState`:

- `player`
- `career`
- `world`
- `battle`
- `ui`
- `feed`
- `playerState`
- `worldState`
- `rosterState`
- `organizationState`
- `competitionState`
- `narrativeState`

## Какие derived views строятся слишком часто

### Ranking/profile views

В `fight_simulator.hta`:

- `currentStreetRankingView()` `~7704`
- `currentAmateurRankingView()` `~7717`
- `currentProRankingView()` `~7730`
- `currentRosterDirectoryView()` `~7743`
- `currentViewedFighterProfile()` `~7757`
- `currentViewedTrainerProfile()` `~7770`
- `trainerRosterCountForId()` `~7782`

В `src/core/world_rankings_engine.js`:

- `buildStreetRankingView(...)`
- `buildAmateurRankingView(...)`
- `buildProRankingView(...)`
- `buildRosterDirectoryView(...)`
- `buildFighterProfile(...)`
- `buildTrainerProfile(...)`

### Career summaries

В `fight_simulator.hta`:

- `currentStreetCareerSummary()` `~3584`
- `currentProSummary()` `~3603`
- `currentTrackNearestGoal()` `~3676`
- `currentCareerTransitionCards()` `~3490`

### Facility lists

- `listCareerGymChoices()` `~12318`
- `listCareerTrainerChoices()` `~12329`

## Какие selectors/filters/sorts выполняются повторно

### Repeated full-array filters

В `PersistentFighterRegistry`:

- `getFightersByTrack(...)` -> full scan
- `getFightersByCountry(...)` -> full scan
- `getFightersByGym(...)` -> full scan

В `WorldFacilityEngine`:

- `listGymsByCountry(...)` -> full scan by `roster.gymIds`
- `listTrainersByGym(...)` -> full scan by `roster.trainerIds`

В `WorldRankingsEngine`:

- street ranking: full scan + sort
- amateur ranking: full scan + sort
- pro Ring ranking: full scan + sort
- roster directory: full scan + sort

## Какие поля/ветки state особенно тяжёлые

1. `rosterState.fighterIds / fightersById`
2. `organizationState` with pro orgs + ranking tables
3. `competitionState` with season/tournament state
4. `narrativeState` with transitions/world story/encounters
5. `world.offers`
6. `world.npcs` + `world.relationships`

## Какие массивы часто обходятся полностью

- `roster.fighterIds`
- `roster.trainerIds`
- `roster.gymIds`
- `state.world.npcs`
- `state.world.relationships`
- `state.world.relationshipArcs`
- ranking table entries
- active offer arrays

## Какие индексы/карты отсутствуют, но нужны

Текущему runtime очень помогли бы отдельные стабильные indexed projections:

- `fightersById` — частично уже есть в rosterState
- `fightersByTrack` — отсутствует как cheap maintained index
- `fightersByCountry` — отсутствует как cheap maintained index
- `fightersByGym` — отсутствует как cheap maintained index
- `trainersByGym` — отсутствует как cheap maintained index despite `gym.trainerIds`
- `rankingViewCacheBySection+Filter+Version`
- `fighterProfileCacheById+Version`
- `trainerProfileCacheById+Version`
- `npcById`
- `relationshipByNpcId`
- `activeArcsByNpcId`

## Где source-of-truth нормальный, а где приходится каждый раз всё пересобирать

### Нормально

- `rosterState.fightersById`
- `rosterState.gymsById`
- `rosterState.trainersById`

### Плохо / дорого

- `fightersByTrack` derived every time
- `fightersByCountry` derived every time
- `listTrainersByGym` scans all trainers even though gym already stores trainer IDs
- trainer roster fallback scans all fighters if `boxerIds` empty
- rankings are rebuilt from scratch instead of using maintained ranking projections

### Критическая архитектурная проблема

Даже когда source-of-truth уже есть, UI часто не использует его напрямую и снова идёт в full scan.

Пример:

- `GymEntity` already has `trainerIds`
- но `WorldFacilityEngine.listTrainersByGym(...)` still scans full `roster.trainerIds`

---

# 7. Rendering / DOM Audit

## Как строится DOM

Через string templates + `innerHTML`.

`render()`:

- собирает giant HTML string
- вставляет `app.innerHTML = ...`

Это означает:

- nodes не стабильны
- CSS animation state нестабилен
- scroll/focus state легко теряется
- repaint scope максимально широкий

## Есть ли полные rebuild’ы крупных экранов

Да, системно.

Любой `render()` rebuild’ит:

- shell
- topbar
- navigation
- active panel
- optional debug panel

Для боя even worse: при `fightLive` всё равно пересоздаётся battle subtree целиком.

## Какие панели пересоздаются целиком вместо частичного обновления

- `career`
- `careerGym`
- `careerTrainer`
- `rankings`
- `fighterProfile`
- `trainerProfile`
- `people`
- `fightSelect`
- `fightLive`
- `fightBreak`
- `fightResult`
- `archive`

## Где возможен layout thrashing

Явного чтения layout -> записи layout цикла почти не видно.  
Главная проблема не classic thrash, а massive DOM replacement.

Но есть вероятность paint/layout overhead из-за:

- many nested cards
- meter bars with inline width styles
- repeated DOM reconstruction of large sections

## Где слишком много append/remove операций

Вместо append/remove по nodes проект в основном делает worse pattern:

- полный `innerHTML` replace

Это ещё дороже по масштабу subtree invalidation.

## Где heavy string template generation на больших списках

### `renderFightSelectPanel()` `(~12062)`

На каждый offer:

- карточка
- details section
- ruleset card
- multiple chip rows
- opponent stats rows

И важный нюанс:

`renderSectionCard(...)` принимает уже готовый `bodyHtml`, поэтому большие body строки строятся **даже когда секция закрыта**.

### `renderPeoplePanel()` `(~11811)`

Для каждого NPC:

- карточка
- eager details body
- interaction buttons

### `renderLegendArchive()`

История мира и архивные секции также строятся через `renderSectionCard(...)`, где body-generating functions вызываются заранее.

### `renderFightLivePanel()` `(~15722)`

Полностью rebuild’ит ring board 5x5, health cards, tabs, control panel, stats/log body.

## Где likely re-render storms

1. battle action path
2. animation clear path
3. week spend -> render -> possible update banner render later
4. panel toggle (`toggleUiSection`) -> full render
5. debug panel open/close -> full render
6. resize events on mobile -> full render

## Где likely duplicated listeners

Повторно attach’ящиеся DOM listeners как отдельный bug pattern тут не доминируют, потому что UI mostly uses inline `onclick`.  
Это один из немногих случаев, где проект скорее страдает не от duplicated listeners, а от полного уничтожения/пересоздания nodes.

## Какие вкладки самые тяжёлые и почему

### 1. Gym panel

- canonical sync
- facility access checks
- per-gym derived lines
- no partial reuse

### 2. Trainer panel

- depends on chosen gym
- per-trainer access logic
- more text/bonus rendering

### 3. Rankings

- full scans + sorts
- profile openings
- multiple tabs

### 4. Fight select

- offer list with rich details
- eager section bodies

### 5. People

- per-NPC relation/arc work
- eager detail bodies

### 6. Battle UI

- entire battle subtree rerendered on every action/timer/animation transition

# 8. Lists / Rankings / Profiles Performance Audit

## Какие большие списки уже есть

К моменту этого аудита в проекте уже есть несколько тяжелых list/view классов:

- street ranking
- amateur ranking
- pro ranking
- pro champions + Ring + organization tabs
- global roster directory
- trainer roster lists
- fighter profiles
- trainer profiles
- fight offers
- people/NPC list
- archive/world story sections

Даже если UI visually показывает только 20 элементов на страницу, это не значит, что computation cheap.  
Во многих случаях проект:

1. сначала делает полный scan по ростеру
2. потом строит промежуточный список объектов
3. потом сортирует весь список
4. потом только после этого режет page/window

То есть DOM size частично ограничен, но compute cost всё равно близок к full list cost.

## Как сортируются и фильтруются рейтинги

### Street

`src/core/world_rankings_engine.js`  
`buildStreetRankingView(gameState, options)` `(~773)`

Поведение:

- вызывает `StreetCareerEngine.refreshStreetStandings(gameState)`
- проходит по `roster.fighterIds`
- фильтрует только active + `currentTrackId(fighter) === "street"`
- применяет optional `countryId`
- строит derived entries
- сортирует весь список
- только потом paginate

Это означает:

- country filter помогает, но только после полного scan по roster
- standings refresh может сам быть нетривиальным
- pagination не убирает scan/sort cost

### Amateur

`buildAmateurRankingView(gameState, options)` `(~828)`

Поведение:

- вызывает `AmateurSeasonEngine.ensureState(gameState)` прямо в read path
- для каждого fighter lookup’ит season stats
- строит derived score через medals, points, team status, record, technique
- сортирует весь list по `score`

Подозрительный pattern:

- ranking read path одновременно может "ensure" seasonal state
- значит UI-открытие рейтинга может содержать write-like normalization work

### Pro

`buildProRankingView(gameState, options)` `(~945)`

Поведение:

- собирает organizations через `ContentLoader.listProOrganizations()`
- берет `ProCareerEngine.summary(gameState)`
- строит `Ring` ranking
- для organization tab additionally строит `organizationRankingEntries(gameState, orgId)`
- потом paginate

Это дешевле amateur в пересчёте на один entry, но тяжело тем, что:

- есть несколько tab contexts
- champions view и ring view требуют separate derivations
- player position и title shot explanation тянут organization summary

## Как открываются профили бойцов

### Fighter profile

`fight_simulator.hta`:

- `openFighterProfile(fighterId, returnPanel)` `(~7686)`
- `currentViewedFighterProfile()` `(~7757)`
- `renderFighterProfilePanel()` `(~13312)`

`src/core/world_rankings_engine.js`:

- `buildFighterProfile(gameState, fighterId)` `(~1202)`

При открытии профиля система не просто читает один готовый object. Она:

- ищет fighter в canonical roster
- lookup’ит trainer и gym
- lookup’ит encounter history
- lookup’ит amateur season stats
- если fighter pro: rebuild’ит `Ring` ranking через `buildRingRanking(gameState)`
- затем для каждой organization снова читает ranking entries и ищет внутри fighter

То есть open profile особенно для профи — это не cheap modal open, а mini analytical query.

### Trainer profile

`buildTrainerProfile(gameState, trainerId)` `(~1316)`

При открытии профиля тренера:

- trainer lookup
- gym lookup
- `trainerFighterIds(gameState, trainer.id)`
- затем для каждого fighter build summary line
- grouping by `street / amateur / pro`

Если `trainer.boxerIds` не полон или stale, helper может fallback’иться к scan по roster.  
Даже когда boxerIds уже есть, grouped view всё равно rebuild’ится каждый open.

## Пересчитываются ли рейтинги заново каждый раз

В чистом виде "каждый раз с нуля" — не всегда. Есть coarse memoization через:

- `memoizeGameProjection(...)`
- projection token, завязанный на version-like state markers

Но practically есть три проблемы:

1. invalidation coarse  
   После многих операций токен меняется широко, и cache becomes useless.

2. builders large  
   Даже кешированный builder при miss дорог.

3. read paths still do pre-work  
   Некоторые read paths сами вызывают `ensure*` и refresh-like logic.

То есть nominal caching есть, но она не превращает rankings/profiles в дешёвые операции на большом world state.

## Строится ли список тренеров/бойцов тренера заново каждый раз

Да, в существенной степени.

### Trainer list

- `listCareerTrainerChoices(gymId)` `fight_simulator.hta` `(~12329)`
- внутри вызывает `WorldFacilityEngine.listTrainersByGym(...)`
- в `world_facility_engine.js` `(~208)` это full scan по `roster.trainerIds`

То есть при каждом cache miss:

- scan all trainers
- filter by `currentGymId`
- optional track filter
- sort by salary

### Trainer roster

- `trainerFighterIds(...)`
- `trainerRosterCount(...)`
- `buildTrainerProfile(...)`

Если links stale or missing:

- full fighter scan

### Fighter profile "how many boxers this trainer has"

Даже простой блок в profile card:

- `trainerRosterCountForId()` `fight_simulator.hta` `(~7782)`

может требовать derived rebuild.

## Есть ли пагинация / виртуализация / кэш

### Есть

- pagination в ranking/profile directory (`pageSize = 20`)
- memoized projections
- some build-time performance timers

### Нет или почти нет

- real virtualization / windowing DOM
- incremental list diffing
- stable rendered row reuse
- cached ready-to-render HTML fragments
- profile-level fine-grained caches keyed by fighter/trainer + version

## Есть ли полные пересборки при каждом клике

Да.

Список -> клик на fighter:

- меняется panel state
- whole `render()` перестраивает application subtree
- profile panel body builds from scratch

Клик назад:

- whole `render()` again

Клик на organization tab:

- ranking projection
- html rebuild
- full `app.innerHTML`

## Вероятные причины лагов в рейтингах

1. full roster scan even when only one tab/page visible
2. full sort before paginate
3. organization/ring recomputation during profile open
4. profile panels with large text blocks and repeated chips
5. tabs causing full app rerender
6. lack of stable list row reuse
7. large roster size by design
8. some read paths perform ensure/refresh logic

## Вероятные причины лагов в списках бойцов

1. no per-track pre-index cache used as primary source
2. no per-country materialized list cache
3. score recomputation per entry
4. full derived objects allocated on every build
5. directory/profile flows stacked on top of each other

## Вероятные причины лагов в списках тренеров

1. list built from trainer global scan, not from `gym.trainerIds`
2. access info recomputed per trainer card
3. card text generation non-trivial
4. full trainer panel rerender for every open/back

## Вероятные причины лагов в списках залов

1. access info per gym card
2. trainer count derivation per gym
3. org lookup per gym
4. current gym/current trainer legacy bridge lookups

## Вероятные причины лагов в профилях бойцов

1. profile build does more than read one entity
2. pro profile rebuilds ranking context
3. rivalry/encounter summary pulls extra world state
4. recent results / achievements / biography summary derived on open

## Вероятные причины лагов в профилях тренеров

1. trainer roster grouping cost
2. fighter summaries per roster entry
3. no stable trainer-profile cache
4. full-screen rerender around each open/close

# 9. Gym / Trainer Runtime Audit

## Как устроен flow "сначала зал, потом тренер"

Сейчас UX логика действительно уже направлена в нужную модель:

- сначала `careerGym`
- потом `careerTrainer`

Это видно в:

- `renderCareerGymPanel()` `fight_simulator.hta` `(~13559)`
- `renderCareerTrainerPanel()` `fight_simulator.hta` `(~13596)`

И также в data layer:

- `GymEntity.trainerIds`
- `TrainerEntity.currentGymId`

Но runtime path всё ещё остаётся дорогим и partly hybrid.

## Реально ли trainer связан с gym или это только поверхностно

Связь реальна, но недостаточно exploit’ится как cheap runtime index.

В `src/core/world_facility_engine.js`:

- `listTrainersByGym(gameState, gymId, options)` `(~208)` не читает `gym.trainerIds` как основной источник
- вместо этого он делает full scan по `roster.trainerIds`
- `syncFacilityLinks(gameState)` `(~286)` заново rebuild’ит `gym.rosterIds`, `gym.trainerIds`, `trainer.boxerIds`

То есть data model уже нормальная, а read/write path всё ещё использует rebuild/scans модель.

## Как строятся списки доступных тренеров

`fight_simulator.hta`:

- `listCareerTrainerChoices(gymId)` `(~12329)`
- `renderCareerTrainerPanel()` `(~13596)`

Flow:

1. current gym lookup
2. projection/memoization request
3. `WorldFacilityEngine.listTrainersByGym(...)`
4. per-trainer access info
5. per-card render with specialization/styles/bonuses/min rank

Проблема:

- даже при правильной UX последовательности underlying computation still scans too much

## Насколько тяжёлый пересчёт при открытии вкладки

### Gym panel open

`renderCareerGymPanel()` делает:

- `ensurePersistentGameState(false)`
- `listCareerGymChoices()`
- `currentGym()`
- `currentTrainerType()`
- для каждого gym:
  - optional org lookup
  - `WorldFacilityEngine.gymAccessInfo(...)`
  - `gymTrainerCount(gym)`
  - string assembly for bonuses, rep, min rank, reason

### Trainer panel open

`renderCareerTrainerPanel()` делает:

- `ensurePersistentGameState(false)`
- `currentTrainerType()`
- `currentGym()`
- `listCareerTrainerChoices(gym.id)`
- для каждого trainer:
  - `trainerAccessInfo(...)`
  - preferred styles string
  - specialization string
  - bonuses summary

На практике самая тяжёлая часть — не один builder, а cumulative chain:

- canonical state ensure
- facility list build
- access checks
- possible NPC/legacy lookups
- full app rerender

## Есть ли nested loops по всем бойцам/всем тренерам/всем залам

Да, и это один из важнейших факторов.

### Level 1: panel list loop

На gym panel:

- loop all gyms in country/track

На trainer panel:

- loop all trainers in current gym

### Level 2: inside derived helpers

`gymTrainerCount(gym)`:

- cheap only if `gym.trainerIds` present and trusted
- otherwise calls `listCareerTrainerChoices(gym.id)` -> full scan all trainers

### Level 3: world facility sync

`syncFacilityLinks(gameState)`:

- loop all gyms
- loop all trainers
- loop all fighters

### Level 4: legacy bridge

`syncLegacyFacilityStateFromPlayerEntity(gameState)`:

- reads canonical fighter/gym/trainer
- clones legacy structures back into `state.world.*`

### Level 5: NPC shadow layer

`currentTrainerNpc()` -> `ensureTrainerNpcForGym(...)` -> `ensureNpcWorld()`

Это уже цепочка, где простой вопрос "кто мой тренер?" может разбудить world NPC layer.

## Есть ли repeated scans по всему roster

Да.

Критичные:

- `WorldFacilityEngine.listGymsByCountry(...)` full scan gyms
- `WorldFacilityEngine.listTrainersByGym(...)` full scan trainers
- `syncFacilityLinks(...)` full scan gyms/trainers/fighters
- `PersistentFighterRegistry.getFightersByGym(...)` full scan fighters
- trainer roster/profile fallbacks

Если mutation path делает sync, а open panel снова читает derived lists, стоимость удваивается.

## Почему выбор тренера и зала может занимать ~5 секунд

Наиболее вероятная комбинация причин:

1. mutation path сам по себе heavy  
   `joinGym()` / `hireTrainer()` делают canonical sync + facility op + runtime sync + legacy sync + `refreshWorldState()`

2. `refreshWorldState()` giant  
   После facility mutation UI не просто обновляет facility slice, а дергает почти весь world refresh pipeline.

3. immediate render after mutation  
   После heavy mutation идёт full `render()`

4. trainer lookup still hybrid  
   Часть логики работает через canonical facility state, часть через legacy `state.world.trainerAssignment` и NPC trainer shadow.

5. access checks and summaries per card  
   Даже второй экран trainer panel строится не дешево.

## Practical diagnosis

Если user reports:

- "смена зала 5 секунд"
- "выбор тренера 5 секунд"

то корневая причина почти наверняка не в одном цикле UI, а в sequence:

`button -> canonical sync -> facility mutation -> facility link rebuild -> runtime sync -> legacy bridge sync -> refreshWorldState -> render`

То есть screen itself heavy, но main pain — mutation path plus post-mutation global refresh.

# 10. Week Advance Performance Audit

## Весь pipeline week advance

Главная entry point:

- `spendWeek()` around `fight_simulator.hta` `(~10917)`
- `advanceWeek()` `(~10931)`
- `runWorldTick()` `(~10244)`

Observed high-level path:

`user action -> spendWeek() -> advanceWeek() -> runWorldTick() -> follow-up refresh/state sync -> render()`

## Какие функции вызываются

Внутри `runWorldTick()`:

1. calendar advance
2. weekly expense handling
3. housing cost
4. gym/trainer upkeep
5. contract upkeep
6. housing effects
7. injury effects
8. fatigue/wear/support/stress/morale/health drift
9. debt handling
10. adult transition trigger
11. bounds clamp
12. amateur rank sync
13. persistent world career simulation
14. NPC world week update
15. full `refreshWorldState()`
16. event gating / weekly event open

Это уже большой synchronous workload ещё до UI render.

## Сколько больших систем обновляется в одном тике

Week tick тянет почти все системные слои:

- player economy
- housing
- injuries and health drift
- morale/stress/support
- contracts
- amateur ranks
- persistent world sim
- NPC world
- offers
- reputation/media
- encounter history
- sparring offers
- transition system
- world story
- possible events
- save scheduling later via render

То есть неделя — это not one simulation step, а mega-orchestration over most subsystems.

## Есть ли дублирующиеся world updates

Да, это одна из самых серьёзных архитектурных проблем.

### First duplication layer

`runPersistentWorldCareerSimulation(action)`:

- `syncGameStateFromRuntime()`
- `WorldCareerSimEngine.runWeeklyPass(...)`
- `syncRuntimeStateFromGame(gameState)`

### Second duplication layer

`refreshWorldState()`:

- `ensurePersistentGameState(true)` again
- later `syncGameStateFromRuntime()` again
- later `syncRuntimeStateFromGame(refreshedGameState)` again
- sometimes `syncGameStateFromRuntime()` one more time if notices exist

Иными словами, за один week tick project может несколько раз пройти bridge:

- runtime -> canonical
- canonical -> runtime
- runtime -> canonical
- canonical -> runtime

На большом state это очень дорого.

## Есть ли repeated ranking rebuilds

Прямого явного "rebuild all rankings" в `runWorldTick()` не видно как единый call.  
Но есть сильная вероятность косвенных repeated rebuilds через:

- roster normalization
- world story sync
- reputation sync
- offer generation
- transition sync
- later UI open/read paths after tick

Кроме того, если `normalizeGameState()` снова затрагивает persistent roster world sections, derived lists становятся stale и потом rebuild’ятся на первом же открытии.

## Есть ли repeated eligibility recalculations

Да, вероятно.

Источники:

- amateur rank and season logic
- facility access logic
- transition logic
- national team selection status
- offer availability
- organization eligibility / ranking positions

Некоторые из них считаются правильно по смыслу, но слишком broad по охвату.

## Есть ли repeated media/biography recomputation

Да.

`refreshWorldState()` explicitly calls:

- `refreshReputationState()`
- `WorldStoryEngine.syncWorldStory(...)`
- notice draining and push-to-log

Также многие action paths до/после week tick уже записывают:

- biography entries
- media feed entries
- encounter/transition notices

Это создаёт secondary cost:

- arrays grow over run lifetime
- summary/render layers later iterate them

## Есть ли repeated save writes

Прямой save inside `advanceWeek()` не вызывается, но после tick идёт full `render()`, а `render()` всегда делает:

- `scheduleSaveGameState()`

Если week flow вызывает несколько renders подряд, save can get rescheduled or triggered close to expensive transitions.

## Есть ли repeated serialization

Да, это один из крупнейших bottleneck candidates:

- `buildSaveSnapshot()` clone + canonical sync
- `saveGameState()` stringify snapshot once
- `SaveManager.save()` stringify snapshot second time

Плюс bridge functions используют deep clone / normalize patterns.

## Есть ли repeated UI rebuilds после недели

Да.

Potential chain:

- action triggers `spendWeek()`
- `advanceWeek()`
- maybe `evaluateEndState()` and `render()`
- else panel switch and `render()`
- later update banner / focus / debug interactions may trigger extra render

At minimum user-visible week finish almost always implies full app rerender.

## Есть ли повторные full recomputations, которые можно было бы отложить

Да, и их много:

- world story sync
- encounter history sync
- sparring weekly offers
- transition sync
- some ranking/profile preparations
- possibly NPC relation snapshots

Часть этого logically не нужна до первого открытия соответствующих panels after week.

## TOP-15 самых вероятных причин, почему неделя занимает ~10 секунд

1. `runWorldTick()` слишком широк по объёму ответственности.
2. `refreshWorldState()` делает почти ещё один большой pipeline поверх week tick.
3. repeated `syncGameStateFromRuntime()` / `syncRuntimeStateFromGame(...)`.
4. `normalizeGameState()` too expensive for week-path usage.
5. `WorldCareerSimEngine.runWeeklyPass(...)` работает по всему миру.
6. `updateNpcWorldForWeek(...)` и соседние NPC passes трогают большой NPC layer.
7. `ensureNpcWorld()` / relation snapshot paths могут срабатывать косвенно.
8. global offer rebuild в `buildWeeklyOffers()`.
9. world story / reputation / encounter sync после уже выполненной симуляции.
10. save snapshot/serialization shortly after tick due to render.
11. large roster minimum means world passes iterate hundreds of fighters.
12. facility/world link normalization can rebuild large relational arrays.
13. transition and eligibility logic вероятно заново оценивает множество состояний.
14. full `render()` после tick rebuild’ит весь app DOM.
15. debug panel, если включена, добавляет measurable extra cost on every render.

# 11. Battle Runtime Audit

## Как строится battle state

Battle runtime живёт внутри монолита `fight_simulator.hta`, а не как изолированный lightweight controller.

Ключевые части:

- `startFightFromOfferPayload(...)` `(~15187)`
- `sanitizeFightState(...)`
- `fightAction(actionKey)` `(~15668)`
- `strikeActor(...)` `(~14186)`
- `runAiAfterPlayer()` `(~15622)`
- `completeFightTurn()` `(~15500)`
- `finalizeFight(...)` `(~11548)`
- `renderFightLivePanel()` `(~15722)`

Battle state хранит:

- `playerState`
- `opponentState`
- hp/stamina/max values
- ring positions
- action lock
- knockdown state
- round/turn counters
- round cards / round stats
- log lines
- ruleset
- animation state
- timers (`pendingTimeout`, `animationTimeout`)

Это functional, но performance-wise проблема в том, что battle state tightly coupled with full app render cycle.

## Как происходит обработка действия

### Player hit path

`fightAction(actionKey)`:

1. reads `state.fight`
2. checks lock/result
3. `sanitizeFightState(fight, "player_action")`
4. `maybeForceStopFight(...)`
5. `canUseFightAction(...)`
6. if move/defense -> mutate + `render()` + `scheduleFightStep(...)`
7. if attack -> `strikeActor(...)`
8. then `render()`
9. if unresolved -> `scheduleFightStep("finishPlayerFightAction", ACTION_DELAY_MS)`

### `strikeActor(...)` path

Inside `strikeActor(...)`:

- attacker/defender state lookup
- fighter/context lookup
- action metadata
- sanitize again
- guard counters
- reach checks
- stamina consumption
- hit chance
- dodge/defense logic
- damage formula
- HP mutation
- impact profile mutation
- log push
- knockdown/KO checks
- animation trigger

### AI response

`runAiAfterPlayer()`:

- sanitize
- maybeForceStopFight
- `pickAiAction(fight)`
- mutate
- `render()`
- schedule next step or complete turn

### Turn end

`completeFightTurn()`:

- sanitize
- maybeStopFightByDamage
- maybeForceStopFight
- push log
- HP recovery
- stamina recovery
- round transition
- `render()`

## Как обновляется UI после действия

Battle UI не обновляется точечно.  
После действия обычно пересобирается весь application subtree.

Даже когда player находится в `fightLive`, `render()` по-прежнему делает:

- optional debug render
- update banner render
- whole `renderGame()` / `renderMainPanel()` chain
- `app.innerHTML = ...`

Внутри `fightLive` заново строятся:

- topbar
- both health cards
- tabs
- ring grid 5x5
- controls or stats or log panel

## Как триггерятся анимации

Animation state is stored in JS state, not in persistent stable DOM nodes.

Ключевые функции:

- `setFightAnimationFrame(...)` `(~13843)`
- `setStrikeAnimation(...)`
- `pulseKnockdownAnimation(...)`
- `clearFightAnimation()` `(~13816)`
- `tokenClassFor(side)` `(~13883)`

Pattern:

1. write animation class names into `state.fight.animation`
2. call full `render()`
3. `tokenClassFor(...)` puts classes on rebuilt token nodes
4. timeout later calls `clearFightAnimation()`
5. `clearFightAnimation()` triggers another full `render()`

This is fragile by design.

## Когда происходит ожидание

Battle pacing is timer-driven by JS:

- `ACTION_DELAY_MS = 500`
- `ACTION_ANIMATION_MS = 320`
- other KO/count timings nearby

Ожидание идет через:

- `scheduleFightStep(callbackName, delay)` `(~13829)`
- `window.setTimeout(callbackName + "()", delay)`

То есть:

- timer-based sequencing
- string callback execution
- no explicit frame scheduler
- no sequencing around actual browser paint completion

## Блокирует ли тяжёлая логика анимации

Да, практически наверняка.

Animation is not independent. It depends on:

- synchronous battle logic finishing
- synchronous full render finishing
- browser being free to paint before next sync work

If main thread stays busy after setting animation state, CSS animation may:

- start late
- miss first frame
- be invisible because DOM got rebuilt again
- be cleared before user sees it

## Возможны ли sync stalls перед отрисовкой удара

Да.

Before user sees the strike:

- `fightAction()` does validation/sanitize
- `strikeActor()` computes full combat result
- animation state is set
- `render()` rebuilds full fight UI

If this render is expensive, user perceives:

- click -> freeze
- late update
- late or skipped animation

## Пересчитываются ли лишние battle-derived stats

Да.

Examples:

- `sanitizeFightState(...)` called repeatedly in same logical step
- `ensureFightRulesetState(fight)` called in render stats/live paths
- multiple `fightContextBySide(...)` usages within same hit sequence
- `renderFightStatsPanel(...)` builds ruleset card every open
- full log panel may be rebuilt even if only one line appended

## Пересобирается ли весь battle UI вместо точечного обновления

Да. Это central battle runtime issue.

Вместо:

- update hp meter
- append one combat line
- toggle one animation class

проект делает:

- whole panel rebuild
- often more than once per action

## Есть ли слишком дорогой combat log rebuild

Вероятно да.

Хотя log itself не выглядит самым тяжёлым piece по данным, он является частью full render path.  
Даже если appended only one line, string-build usually reconstructs whole visible log block.

## Есть ли проблемы с очередью анимаций

Да, high probability.

Reasons:

- no explicit animation queue object
- no render/paint acknowledgment
- new action can clear previous animation state
- `clearFightAnimation()` does full rerender
- AI and player actions both issue render + delayed callbacks

## Есть ли проблемы с таймерами / requestAnimationFrame / CSS classes

Да:

- sequencing uses `setTimeout`, not `requestAnimationFrame`
- no forced "next frame" separation before class-based animation
- class application tied to rebuilt nodes
- timeout callback by string name is fragile and opaque

## Почему удар может идти 3 секунды

Наиболее вероятный composite cause:

1. player click starts sync heavy logic
2. `strikeActor()` computes full outcome and logs
3. `setFightAnimationFrame()` triggers full render
4. `fightAction()` triggers another render
5. browser main thread stays busy
6. delayed timeout schedules AI step
7. AI path also rerenders
8. animation clear rerenders again

Даже если nominal delays are ~500ms, stacked sync renders can easily make perceived latency approach multiple seconds on weak device/HTA host.

## Почему анимации могут срабатывать 1 раз из 10

Most probable reasons:

1. animation class applied to node that is immediately replaced
2. browser never gets a clean paint between class set and next rerender
3. same class reapplied without stable reflow/frame separation
4. timeout clears animation while next render already happened
5. debug or heavy render path blocks main thread
6. player -> AI -> turn complete chain causes multiple close renders
7. inline DOM regeneration restarts subtree identity
8. CSS animation event model is not used as truth source
9. battle action pipeline is not synchronized with actual visual completion
10. resize/focus/debug interactions can inject extra renders

## Какие 10 мест самые подозрительные в battle runtime

1. `fightAction(...)` `fight_simulator.hta:15668`
2. `strikeActor(...)` `fight_simulator.hta:14186`
3. `setFightAnimationFrame(...)` `fight_simulator.hta:13843`
4. `clearFightAnimation()` `fight_simulator.hta:13816`
5. `runAiAfterPlayer()` `fight_simulator.hta:15622`
6. `completeFightTurn()` `fight_simulator.hta:15500`
7. `renderFightLivePanel()` `fight_simulator.hta:15722`
8. `render()` `fight_simulator.hta:15778`
9. `finalizeFight(...)` `fight_simulator.hta:11548`
10. `scheduleFightStep(...)` `fight_simulator.hta:13829`

# 12. Animation System Audit

## Какие типы анимаций есть

По коду явно видны:

- strike direction classes (`attack-*`)
- dodge/hit reaction classes (`dodge-*`, `hit-react`)
- crit flash
- knockdown pulse/shake
- token movement illusions through class toggles

Анимации завязаны на CSS classes, которые подставляются в token markup через:

- `tokenClassFor(side)`

## Как они стартуют

Анимация стартует так:

1. battle logic decides what happened
2. `setStrikeAnimation(...)` computes class names
3. `setFightAnimationFrame(...)` writes animation state
4. full render creates token DOM with these classes
5. timeout later removes animation state and rerenders again

There is no evidence of:

- dedicated animation layer
- FLIP pipeline
- transition manager
- frame boundary staging

## Где логика анимации смешана с боевой логикой

Практически везде.

Animation call sites are inside combat resolution, not after a stable state commit:

- miss/hit inside `strikeActor(...)`
- knockdown inside count/stop flows
- AI step and player step share same render loop

This means animation timing is subordinate to combat/control flow timing, not to visual system needs.

## Что может блокировать анимации

1. full `render()` cost
2. debug panel render
3. building battle stats/log DOM
4. save scheduling side effects after render
5. sync week transition after fight finalization
6. any heavy canonical sync if fight-related state touches bridge paths

## Что может сбрасывать или пропускать анимацию

1. immediate second render
2. same node identity lost due to `innerHTML` replace
3. same class applied again without reflow/frame gap
4. `clearFightAnimation()` firing too soon relative to paint
5. timeout order racing with AI action timeout

## Есть ли проблемы с reflow before animation

Да, вероятны.

Поскольку classes ставятся на newly rendered nodes without guaranteed paint boundary, browser may:

- batch style calculations
- skip visible intermediate state
- treat rapid set/remove as same frame outcome

## Есть ли проблемы с class reapplication

Да.

Если user triggers same animation class repeatedly on fresh rebuilt nodes, browser can:

- not replay as expected
- replay only intermittently

Especially because there is no explicit force-reflow or frame staging between same-class applications.

## Есть ли проблемы со stale DOM nodes

Да, фундаментально.

Animation state references conceptual player/opponent tokens, but DOM nodes themselves are recreated by full render.  
So any animation attached to previous node is destroyed.

## Есть ли conflicting timers

High probability:

- `pendingTimeout`
- `animationTimeout`
- round transitions
- KO/count timers
- AI step timers

Without centralized scheduler, overlapping timeouts can compete for same state.

## Есть ли multiple animation triggers on same node

Logically yes, physically on same persistent node no, because nodes are replaced.  
This is actually worse: the app simulates multiple triggers, but the browser sees a stream of destroyed/recreated nodes.

## Есть ли immediate rerender killing animation before it displays

Да, это один из strongest hypotheses.

Example pattern:

- `setFightAnimationFrame(...)` -> `render()`
- caller returns and also calls `render()`
- later AI step also calls `render()`

Такой cascade легко убивает short-lived CSS animation before user meaningfully sees it.

# 13. Save / Serialization / Blocking IO Audit

## Как часто пишется `localStorage`

В текущей модели:

- explicit save on unload
- explicit save in some debug flows
- scheduled save after `render()`

Ключевая строка:

- `render()` `fight_simulator.hta:15813` -> `scheduleSaveGameState()`

То есть save path logically привязан к render frequency.

## Может ли запись в `localStorage` идти слишком часто

Да, особенно при render-heavy flows:

- tab switching
- fight actions
- panel toggles
- week completion
- debug panel interactions

Даже если `scheduleSaveGameState()` дебаунсит save, сама архитектура означает:

- many actions keep touching save scheduler
- save nearly always happens after user-visible state changes

## Может ли большая сериализация происходить на week advance или при каждом рендере

Да.

Save path:

1. `render()` schedules save
2. `saveGameState()` builds snapshot
3. `buildSaveSnapshot()` does `syncGameStateFromRuntime()`
4. snapshot stores `game: clonePlainData(gameState)`
5. `saveGameState()` stringifies snapshot once for metrics
6. `SaveManager.save()` stringifies snapshot second time
7. `localStorage.setItem(...)`

Это heavy synchronous path.

## Есть ли deep clone / `JSON.stringify` на больших state branches слишком часто

Да, absolutely.

### Deep clone

`src/core/state_factory.js`:

- `clonePlainData(value)` `(~3)` = `JSON.parse(JSON.stringify(value))`

Used in multiple schema/bridge/save situations.

### Double stringify

`fight_simulator.hta`:

- `saveGameState()` `(~2555)` computes `payload = JSON.stringify(snapshot)`

`src/core/save_manager.js`:

- `SaveManager.save(...)` `(~30)` does `storage.setItem(key, JSON.stringify(payload))`

This means save path stringifies full snapshot twice.

## Насколько save/load/caching может блокировать main thread

Сильно, потому что:

- `localStorage` synchronous
- snapshot large
- roster/world/history content large
- JSON stringify on hundreds of entities expensive

Specially dangerous moments:

- right after week tick
- right after heavy panel/ranking open if render triggers save shortly after
- around battle progress if multiple renders happen

## Дополнительный save-related pressure

`buildSaveSnapshot()` also:

- sanitizes/normalizes fight state
- syncs canonical state
- writes preview data

То есть save is not mere serialization; it performs preparatory logic too.

## Summary

Save/serialization is not necessarily the only primary cause of 2-10 second lags, but it is a strong secondary amplifier.  
When a heavy action already consumed CPU, synchronous snapshot clone + double stringify + `localStorage.setItem` can turn "noticeable lag" into "UI freeze".

# 14. Data Volume and Roster Pressure Audit

## Сколько реально сущностей в мире

По `src/content/ranking_profile_data.js`:

- `streetPerCountry = 50`
- `amateurPerCountry = 50`
- `proGlobal = 100`

По `country_data.js` seed-country list currently contains 8 countries:

- mexico
- usa
- russia
- cuba
- japan
- china
- uk
- philippines

Минимальный целевой roster pressure therefore approximately:

- street: `8 * 50 = 400`
- amateur: `8 * 50 = 400`
- pro: `100`
- total fighters baseline: `~900`

Это не считая:

- player
- retired fighters retained in history
- trainers
- gyms
- organizations
- national teams
- tournaments
- encounter history
- story/media/history records

## Насколько тяжело обрабатывать разные типы сущностей

### Street fighters

Per fighter data includes:

- standing/rating
- district/scene
- underground titles
- wear/morale/health

Relatively cheap individually, expensive collectively at 400+ scale when rescanned often.

### Amateur fighters

Heavier than street because ranking needs:

- amateur rank
- team status
- season points
- federation points
- medals / placements

### Pro fighters

Fewer in count, but per-fighter profile/ranking heavier because:

- Ring ranking
- org rankings
- title status
- contender status
- reputation/title history

### Trainers

Trainer count lower than fighters, but they create secondary relational pressure:

- gym binding
- boxerIds
- trainer profile grouped fighter lists

### Gyms

Gyms themselves are not huge, but they amplify cost through:

- access calculations
- trainer counts
- roster links
- org links

### National teams / organizations / tournaments

Individually not enormous, but they contribute to normalization/sync complexity and cross-links during week tick.

## Насколько объём данных сам по себе может давить на UI

Сильно, even if DOM visible subset small.

Main reasons:

- many UI views scan full roster before paginate
- many mutation paths rebuild relational links globally
- canonical normalization keeps multiple interconnected branches alive
- history/media/biography arrays grow over long runs

## Где нужны индексы

Нужны как primary runtime structures, а не optional helper sugar:

- `fightersById`
- `fightersByTrack`
- `fightersByCountry`
- `fightersByGym`
- `fightersByTrainer`
- `trainersByGym`
- `gymsByCountryAndTrack`
- `organizationRankingCache`
- `ringRankingCache`
- `countryTeamRosterCache`
- `visibleProfileCache`

## Где нужны partial views

- rankings page entries
- trainer roster previews
- fighter profile summaries
- fight offers summaries
- people panel compact rows
- archive section previews

## Где нельзя делать full scans каждый раз

1. on every tab switch
2. on every profile open
3. on every gym/trainer open
4. on every week tick subpass
5. on every battle action

## Pressure conclusion

Объём данных сам по себе уже достаточно большой, чтобы naive full scans стали user-visible.  
На baseline ~900 fighters даже "вроде обычный filter/sort" превращается в bottleneck, если он запускается:

- часто
- в нескольких местах подряд
- внутри full rerender architecture

# 15. Performance Anti-Patterns

Ниже список наиболее явных anti-patterns, которые реально видны в текущем коде.

## 1. Recompute-all-on-any-change

Main manifestation:

- global `render()` on many actions
- giant `refreshWorldState()`
- broad `normalizeGameState()`

Any moderately important change tends to fan out into wide recomputation.

## 2. Full DOM rebuilds

`fight_simulator.hta:15778`:

- `app.innerHTML = renderUpdateBanner() + debugHtml + html`

This destroys/rebuilds entire subtree instead of patching local changes.

## 3. Repeated full-array filtering and sorting

Examples:

- `buildStreetRankingView(...)`
- `buildAmateurRankingView(...)`
- `buildProRankingView(...)`
- `buildRosterDirectoryView(...)`
- `listTrainersByGym(...)`
- `getFightersByTrack/Country/Gym(...)`

## 4. Nested O(n^2) or worse behavior in NPC layer

`syncAllNpcRelationSnapshots()` -> for each NPC -> `syncNpcRelationSnapshot(npcId)` -> `findNpcById()` + `findRelationship()`, both linear scans.

This is classic avoidable quadratic-ish pattern.

## 5. Repeated derived object rebuilding

Examples:

- profile builds
- ranking entry objects
- gym/trainer card descriptors
- biography/summary strings

## 6. UI opening triggers world recompute

Examples:

- `ensurePersistentGameState(false)` on open paths
- `AmateurSeasonEngine.ensureState(...)` inside ranking read
- `currentTrainerNpc()` potentially waking NPC world

## 7. Week tick triggers repeated world recompute

Examples:

- `runPersistentWorldCareerSimulation(...)`
- `updateNpcWorldForWeek(...)`
- `refreshWorldState()`
- repeated canonical/runtime syncs

## 8. Deep copy in loops / bridges

`clonePlainData(...)` based on JSON deep copy is used in hot architectural paths, not only in cold admin paths.

## 9. Massive template regeneration

Many panels build very large HTML strings from scratch:

- rankings
- fight select
- people
- archive
- fight live

## 10. Stale cache invalidation causing full recomputes

Coarse invalidation means many caches miss after major state updates, forcing full rebuild instead of partial recompute.

## 11. Synchronous expensive logging/debug overhead

Not the primary root cause, but debug panel adds non-trivial extra render work when enabled.

## 12. Legacy + canonical dual source-of-truth

This is both correctness and performance anti-pattern:

- duplicated state branches
- duplicated sync passes
- duplicated object graphs

## 13. Mutation paths coupled to full refresh

Example:

- join gym
- hire trainer
- finish fight

Instead of local state update + targeted refresh, they cascade into world/global refresh.

## 14. Eager section body construction for collapsed UI

`renderSectionCard(...)` receives prebuilt `bodyHtml`, so many expensive bodies are built whether or not the section is open.

## 15. Animation tied to rebuild-heavy render path

This is a major anti-pattern for any interactive battle UI.

# 16. Concrete Hotspot Inventory

Ниже перечислены наиболее опасные hotspot’ы, которые наиболее вероятно дают текущие user-visible лаги.

| Severity | Category | Probable location | Symptom | Likely cause | Why this is a hotspot |
|---|---|---|---|---|---|
| Critical | UI render | `fight_simulator.hta:15778` `render()` | Любой экран открывается медленно | Full app `innerHTML` rebuild | Central choke point for almost every action |
| Critical | week tick | `fight_simulator.hta:10244` `runWorldTick()` | Неделя занимает секунды | Too many subsystems in one sync pass | One user action fan-outs into most world systems |
| Critical | week tick | `fight_simulator.hta:8897` `refreshWorldState()` | После недели и некоторых mutation-path всё подвисает | Giant global refresh after already-heavy update | Duplicates much of world sync work |
| Critical | state derivation | `fight_simulator.hta:1162/1174` sync bridge | UI lag after many actions | runtime <-> canonical sync repeatedly | Deep, large object graph conversions |
| Critical | state derivation | `src/core/state_factory.js:956` `normalizeGameState()` | Hidden stalls in loads/syncs | Normalization does major enrichment work | Not a cheap normalize; acts like world rebuild |
| Critical | save/serialization | `fight_simulator.hta:2453/2555`, `save_manager.js:30` | Freeze after heavy actions | clone + double stringify + sync `localStorage` | Heavy blocking IO on main thread |
| Critical | battle | `fight_simulator.hta:15668` `fightAction()` | Удар реагирует с задержкой | Logic + render + timer chain | Every action enters render-heavy path |
| Critical | animation | `fight_simulator.hta:13843` `setFightAnimationFrame()` | Анимации срабатывают редко | Animation tied to full rerender | DOM node identity is not stable |
| Critical | battle | `fight_simulator.hta:11548` `finalizeFight()` | Конец боя ощущается зависшим | `advanceWeek()` runs before result screen | Fight finish waits for week tick |
| High | gym/trainer | `fight_simulator.hta:7129/7179` `joinGym`/`hireTrainer` | Выбор зала/тренера по 5 сек | mutation -> global refresh -> full render | Local action cascades into world recompute |
| High | gym/trainer | `src/core/world_facility_engine.js:286` `syncFacilityLinks()` | Facility UI mutation expensive | Rebuilds gym/trainer/fighter relations globally | Called after sign/follow operations |
| High | ranking/list/profile | `src/core/world_rankings_engine.js:773/828/945/1005` | Рейтинги фризят | Full scans + full sorts before paginate | Scale-sensitive with 900+ fighters |
| High | ranking/list/profile | `src/core/world_rankings_engine.js:1202/1316` | Открытие профилей тяжёлое | Profile open rebuilds ranking/roster context | Not just a modal; mini analytics query |
| High | gym/trainer | `src/core/world_facility_engine.js:208` `listTrainersByGym()` | Trainer panel slow | Scans all trainers instead of using gym-owned list | Wasteful given data model already has `trainerIds` |
| High | state derivation | `src/core/persistent_fighter_registry.js:583/589/595` | Many screens scale poorly | `getFightersByTrack/Country/Gym` full scan roster | Missing primary indexes |
| High | NPC/people | `fight_simulator.hta:6147` `syncAllNpcRelationSnapshots()` | People and secondary lookups degrade | N*linear lookups on NPC/relation arrays | Quadratic tendency |
| High | NPC/people | `fight_simulator.hta:6638` `ensureNpcWorld()` | Seemingly simple reads become heavy | NPC world maintenance during lookup flows | Hidden cost injected into unrelated UI |
| High | DOM/render | `fight_simulator.hta:2139` `renderSectionCard(...)` | Collapsed sections still costly | Body HTML built eagerly | Waste even when UI section closed |
| Medium | ranking/list/profile | `fight_simulator.hta:13294` `renderRankingsPanel()` | First ranking open laggy | Large list builders + full app render | User perceives it directly as tab lag |
| Medium | battle | `fight_simulator.hta:15722` `renderFightLivePanel()` | Fight view heavy every action | Rebuilds ring + meters + controls + tabs | Large subtree rebuilt repeatedly |
| Medium | animation | `fight_simulator.hta:13829` `scheduleFightStep()` | Unstable battle pacing | String timers and timeout sequencing | Hard to debug and easy to desync |
| Medium | resize/render | `fight_simulator.hta:15875` `window.onresize = render` | Mobile orientation/resize jank | Full rerender per resize event | Can fire often on mobile host |
| Medium | startup/load | `fight_simulator.hta:2613` `continueSavedGame()` | Save resume heavy | load -> validate -> sync -> ensureNpcWorld -> maybe refreshWorldState | Resume path front-loads many systems |

## Most dangerous clusters

### Cluster A: Full render architecture

- `render()`
- `renderGame()`
- panel builders
- battle live panel

### Cluster B: Week/global orchestration

- `runWorldTick()`
- `refreshWorldState()`
- canonical/runtime sync bridge

### Cluster C: Rankings/profile derived views

- world ranking builders
- profile builders
- roster directory

### Cluster D: Facility UI and relation graph rebuild

- gym/trainer panels
- `syncFacilityLinks(...)`
- access checks and legacy bridge

### Cluster E: Battle animation timing

- fight action path
- animation state path
- full rerender around CSS animation

# 17. Verification Plan

Этот раздел нужен другому архитектору как практический checklist для подтверждения гипотез, а не только как список догадок.

## Общие принципы измерения

Мерить нужно не только "сколько работает функция", но и user-perceived latency:

- click -> first visible change
- action start -> animation first frame
- week button -> UI interactive again
- tab click -> panel visibly complete

Источники уже встроенных метрик:

- `weekAdvanceMs`
- `weekTickMs`
- `gymPanelOpenMs`
- `rankingsOpenMs`
- `gymPanelBuildMs`
- `trainerPanelBuildMs`
- `seasonPanelBuildMs`
- `teamPanelBuildMs`
- `proOrgsPanelBuildMs`
- `careerPanelBuildMs`
- `renderGameMs`
- `renderDebugMs`

Но их недостаточно. Нужны additional temporary measurements on critical paths.

## Как проверять проблему с tab open

### Сценарий

1. Загрузить живой сейв.
2. Выключить debug panel.
3. Переключать `home -> career -> people -> rankings -> career`.
4. Повторить 5-10 раз.

### Какие логи/таймеры добавить

- `openPanel(panel)` start/end
- `renderMainPanel()` by panel id
- per-panel build time
- total click-to-interactive time

### Где измерять ms

- inside `openPanel(panel)`
- around `render()`
- around specific heavy panel builder

### Нормальная цель

- ordinary tab open target: `<= 80 ms`
- heavy tab open target: `<= 150 ms`
- absolute maximum tolerable first-open on weak device: `<= 250 ms`

## Как проверять gym/trainer lag

### Сценарий

1. Открыть `Карьера -> Залы`.
2. Открыть несколько разных залов подряд.
3. Выбрать зал.
4. Открыть список тренеров зала.
5. Выбрать тренера.
6. Сменить зал ещё раз.

### Какие логи/таймеры добавить

- `joinGym()` total
- `hireTrainer()` total
- inside:
  - `syncGameStateFromRuntime()`
  - `WorldFacilityEngine.signGym/followTrainer`
  - `syncFacilityLinks()`
  - `refreshWorldState()`
  - `renderCareerGymPanel()`
  - `renderCareerTrainerPanel()`

### Нормальная цель

- gym panel open target: `<= 120 ms`
- trainer panel open target: `<= 120 ms`
- select/change gym target: `<= 200 ms`
- select/change trainer target: `<= 200 ms`

## Как проверять week advance lag

### Сценарий

1. Использовать живой mid-game сейв.
2. Повторить 10 обычных недель подряд.
3. Повторить 10 недель в более тяжёлом состоянии:
   - активные турниры
   - active roster/team
   - dense media/encounter history

### Какие логи/таймеры добавить

- total `spendWeek()`
- `advanceWeek()`
- `runWorldTick()`
- `runPersistentWorldCareerSimulation()`
- `updateNpcWorldForWeek()`
- `refreshWorldState()`
- inside `refreshWorldState()`:
  - `buildWeeklyOffers()`
  - `refreshReputationState()`
  - `SparringCampEngine.refreshWeeklyOffers(...)`
  - `CareerTransitionEngine.syncPlayerTransitionState(...)`
  - `WorldStoryEngine.syncWorldStory(...)`
  - number of notices drained
- `buildSaveSnapshot()`
- `saveGameState()`

### Нормальная цель

- typical week advance target: `<= 300 ms`
- heavy week target: `<= 700 ms`
- absolute max tolerable on weak device/HTA: `<= 1000 ms`

Anything above that should be treated as failure for this project type.

## Как проверять battle action lag

### Сценарий

1. Открыть стандартный бой.
2. Нажимать:
   - jab/body/hook
   - move
   - defense
3. Измерять 20 действий подряд.

### Какие логи/таймеры добавить

- click timestamp at `fightAction(actionKey)` entry
- `strikeActor(...)` duration
- `setFightAnimationFrame(...)` time to next paint surrogate
- `renderFightLivePanel()` duration
- `clearFightAnimation()` latency
- AI step timings

### Нормальная цель

- battle action logic target: `<= 30-50 ms`
- click to first visible feedback target: `<= 80 ms`
- click to animation first frame target: `<= 100 ms`

## Как проверять animation loss

### Сценарий

1. 50 одинаковых ударов подряд в debug fight.
2. Count how many times animation visibly starts.
3. Repeat with debug panel on/off.

### Какие логи/таймеры добавить

- animation state set timestamp
- render completion timestamp
- `requestAnimationFrame` timestamp after animation set
- animation clear timestamp
- count of renders between animation set and clear

### Нормальная цель

- animation trigger success rate: `>= 99%`
- first-frame target: `<= 16-33 ms` after state commit
- no more than one full render between trigger and visible frame

## Как проверять rankings/profiles

### Сценарий

1. Открыть `Рейтинги`.
2. Переключать tabs:
   - street
   - amateur
   - pro ring
   - WBC
   - roster
3. Открывать 10 fighter profiles подряд.
4. Открывать 5 trainer profiles подряд.

### Какие логи/таймеры добавить

- `renderRankingsPanel()`
- section builders separately
- `buildStreetRankingView()`
- `buildAmateurRankingView()`
- `buildProRankingView()`
- `buildRosterDirectoryView()`
- `buildFighterProfile()`
- `buildTrainerProfile()`

### Нормальная цель

- rankings open target: `<= 150 ms`
- page switch target: `<= 100 ms`
- fighter profile open target: `<= 120 ms`
- trainer profile open target: `<= 120 ms`

## Как проверять save/serialization pressure

### Сценарий

1. Disable debug panel.
2. Measure after:
   - tab switch
   - week advance
   - fight action
   - fight finish

### Какие логи/таймеры добавить

- `buildSaveSnapshot()`
- `clonePlainData()` if called in save path
- first `JSON.stringify`
- `SaveManager.save()`
- total `localStorage.setItem`

### Нормальная цель

- ordinary save target: `<= 25-40 ms`
- heavy week-end save target: `<= 100 ms`

# 18. Correctness Risks That Still Affect Performance

Даже если явные correctness-баги прошлого уже исправлены, архитектурные расхождения всё ещё могут indirectly создавать лаги.

## 1. Stale caches

Current memoization exists, but if invalidation is coarse or wrong:

- cache misses become frequent
- system recomputes entire projections
- debugging becomes confusing because "sometimes fast, sometimes 2 seconds"

## 2. Broken invalidation

Если projection token обновляется слишком широко:

- small local change invalidates large caches

Если обновляется слишком узко:

- stale data forces fallback normalize/recompute elsewhere

Both cases harm performance.

## 3. Duplicated data sources

Core example:

- legacy `state.world.gymMembership / trainerAssignment`
- canonical `fighter.currentGymId / currentTrainerId`

This duplication means:

- sync work
- clone work
- consistency checks
- more reasons to "refresh everything"

## 4. Inconsistent trainer-gym links

Если у trainer нет корректного `currentGymId`, system may:

- bind trainer to compatible gym on the fly
- rebuild facility links
- use fallback scans

This turns correctness healing into runtime cost.

## 5. Inconsistent rankings caches

If ranking views and canonical ranking tables drift:

- profile open may rebuild Ring/organization context
- ranking tab switches may hit expensive repair/ensure paths

## 6. Unnecessary recomputation due to conflicting source-of-truth

This is probably the most important correctness-performance bridge issue.

When the app is unsure which layer is authoritative, it compensates by:

- syncing
- normalizing
- rebuilding links
- rescanning arrays

This is functionally safe-ish, but performance-hostile.

## 7. NPC shadow objects vs canonical entities

Trainer/promoter/persona systems still partly lean on NPC world shadow objects.  
So even if canonical entity exists, UI may still ask NPC layer for relation/status.

This creates:

- hidden scans
- hidden snapshots sync
- more opportunities for stale state and repair work

## 8. World size self-healing on load

`ensureMinimumRoster(...)` is useful for compatibility, but if it runs in hot paths or too often, it turns correctness guarantees into performance debt.

## 9. Uncertainty note

Because this audit avoided code changes and full runtime tracing on real HTA host, some cache/invalidation problems are inferred from control-flow rather than directly sampled with high-resolution profiler.  
But the architecture strongly suggests they are real contributors.

# 19. Top Priority Fix Order

Ниже не "идеальная архитектура будущего", а practical rescue order.

## TOP 15 performance fixes first

1. Stop full-app `innerHTML` rebuild for every panel/action; introduce partial root updates for main panel and battle panel first.
2. Decouple save scheduling from every `render()` and remove save work from high-frequency UI paths.
3. Remove double stringify in save path.
4. Make week advance one deterministic canonical pass with one final sync, not multiple runtime/canonical round-trips.
5. Split `refreshWorldState()` into truly needed post-week steps vs lazy-on-open steps.
6. Replace `listTrainersByGym()` full scan with direct `gym.trainerIds` primary path.
7. Introduce persistent roster indexes for track/country/gym/trainer.
8. Stop rebuilding facility links globally after every local facility mutation unless absolutely required.
9. Make ranking builders consume preindexed lists instead of full roster scans.
10. Cache fighter and trainer profiles by `(id + projection version)`.
11. Make `renderSectionCard(...)` lazy by default or convert heavy callers to body-builder pattern.
12. Remove NPC world maintenance from simple lookup/read paths.
13. Decouple battle animation state from full render cycle.
14. Show fight result before running full week advance, or at minimum defer week tick from the critical visual path.
15. Add explicit profiler spans around week subpasses and keep them visible in debug until regression stops.

## TOP 10 UI responsiveness fixes

1. Partial panel rendering instead of whole-app render.
2. Lazy build collapsed sections.
3. Memoize heavy ranking pages by filter/page/tab.
4. Keep profile modal node stable and only swap content region.
5. Build gym panel from pre-indexed gym summaries.
6. Build trainer panel only from selected gym trainerIds.
7. Avoid calling `ensurePersistentGameState()` from simple read paths unless version dirty.
8. Avoid `render()` on every minor toggle if only section state changed.
9. Throttle or debounce `window.onresize`.
10. Keep debug panel isolated so it does not rebuild with every normal render.

## TOP 10 battle/animation fixes

1. Stop full `render()` inside `setFightAnimationFrame(...)`.
2. Move animation trigger onto stable DOM nodes.
3. Use `requestAnimationFrame` staging for class application/reapplication.
4. Separate combat state mutation from visual animation queue.
5. Update only affected battle subregions: meters, tokens, log tail.
6. Do not clear animation via full rerender.
7. Ensure one click -> one action commit -> one visual update pipeline.
8. Avoid full stats/log rebuild when only control state changes.
9. Prevent `finalizeFight()` from hiding result behind week tick.
10. Instrument click-to-first-frame explicitly and regress against it.

## TOP 10 structural fixes that will reduce lag

1. Choose one authoritative runtime state layer for hot-path UI reads.
2. Restrict normalization to load/migration/explicit repair paths.
3. Materialize roster indexes and maintain them incrementally.
4. Materialize facility indexes and maintain them incrementally.
5. Materialize ranking caches with precise invalidation.
6. Separate world simulation from UI composition.
7. Separate battle runtime from app shell render loop.
8. Remove hidden "ensure" side effects from read-only selectors.
9. Keep legacy adapters, but push them to edge boundaries instead of core hot paths.
10. Introduce clear state versioning per subsystem, not one coarse invalidate-all behavior.

## Что чинить в первую очередь, а что позже

### First wave

- render architecture
- save path
- week tick orchestration
- battle animation coupling

### Second wave

- facility indexes and gym/trainer flow
- rankings/profile indexes and caches
- NPC relation lookup indexing

### Third wave

- structural cleanup of legacy/canonical duality
- deeper virtualization and profile/read-model optimization

# 20. FINAL HANDOFF TO EXTERNAL ARCHITECT

## Как реально устроен runtime сейчас

Проект работает как большой single-threaded monolith:

- глобальный legacy `state`
- параллельный canonical `state.game`
- множество feature engines в `src/core/*`
- one-shot HTML string rendering into `app.innerHTML`
- save scheduling and world synchronization tightly coupled to UI flow

Это не modular reactive app в современном смысле.  
Это hybrid monolith with compatibility layers, large derived views and expensive world state normalization.

## Что тормозит сильнее всего

Самые сильные тормоза почти наверняка здесь:

1. full app rerender on most interactions
2. week tick oversized orchestration
3. repeated runtime <-> canonical syncs
4. heavy normalization used too close to hot paths
5. save clone/stringify/localStorage blocking
6. ranking/profile full scans and sorts
7. facility mutation followed by global world refresh

## Что вероятнее всего ломает анимации

Не "плохой CSS", а архитектура:

- animation is encoded in JS state
- full rerender recreates token DOM
- another rerender often follows quickly
- timers are sequencing logic, not paint
- there is no stable animation layer

Most likely animation failure mode:

`set animation state -> full render -> another sync render before paint/visibility -> clear animation on new nodes`

## Почему неделя и gym/trainer screens такие медленные

### Week

Потому что one week advance:

- updates player systems
- runs world sim
- updates NPC world
- refreshes offers/reputation/story/transitions
- repeatedly syncs runtime and canonical state
- then rerenders whole app
- then likely saves synchronously soon after

### Gym/trainer screens

Потому что they are not just UI lists.  
They sit on top of:

- facility access logic
- facility/world link sync
- legacy/canonical bridge
- optional NPC trainer shadow layer
- global refresh after mutation

## Какие файлы и разделы этого документа читать в первую очередь

First read order for external architect:

1. `#1 Executive Summary`
2. `#4 Canonical Runtime and UI Architecture`
3. `#5 Full Critical Path Analysis`
4. `#10 Week Advance Performance Audit`
5. `#11 Battle Runtime Audit`
6. `#12 Animation System Audit`
7. `#16 Concrete Hotspot Inventory`
8. `#19 Top Priority Fix Order`

Primary source files to inspect first:

- `C:\Fight Simulator\fight_simulator.hta`
- `C:\Fight Simulator\src\core\state_factory.js`
- `C:\Fight Simulator\src\core\world_facility_engine.js`
- `C:\Fight Simulator\src\core\world_rankings_engine.js`
- `C:\Fight Simulator\src\core\persistent_fighter_registry.js`
- `C:\Fight Simulator\src\core\save_manager.js`

## Какой минимальный порядок спасения проекта рекомендуется

If the goal is "make the game feel responsive again quickly", the minimum rescue order is:

1. stop full-app rerenders for the hottest interactions
2. isolate battle UI and animation from global render loop
3. collapse week tick into one pass and remove duplicate sync/refresh work
4. fix save path blocking behavior
5. add real indexes for roster/facility/ranking reads
6. only then optimize secondary panels and history/story layers

## Final assessment

This project is not slow because one function is badly written.  
It is slow because the current runtime architecture combines:

- large world data
- expensive derived views
- dual state layers
- full DOM rebuilds
- synchronous serialization
- battle animation coupled to render storms

The good news: many symptoms point back to a relatively small set of root architectural bottlenecks.  
The bad news: until those bottlenecks are isolated, local micro-optimizations alone will not save responsiveness.
