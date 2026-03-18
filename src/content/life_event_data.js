var LIFE_EVENT_DATA = {
  events: [
    {
      id: "rough_room_leak",
      title: "Потолок снова капает",
      text: "Плохое жильё напоминает о себе даже ночью: вода, сырость и сорванный сон.",
      conditions: { housingIs: "rough", minWeek: 2 },
      weight: 8,
      cooldown: 6,
      repeatable: true,
      choices: [
        __eventChoice("patch_it", "Чинить самому", "Ты возишься до ночи, но хотя бы выигрываешь немного тишины.", [
          __resource("money", -16),
          __resource("stress", -3),
          __condition("wear", -2)
        ]),
        __eventChoice("live_with_it", "Перетерпеть", "Сил сегодня нет. Значит, сырость остаётся с тобой ещё на неделю.", [
          __resource("stress", 4),
          __condition("morale", -3),
          __condition("wear", 2)
        ])
      ]
    },
    {
      id: "rough_neighbors_noise",
      title: "Соседи не дают уснуть",
      text: "Тонкие стены и чужие разборки съедают голову быстрее любой тренировки.",
      conditions: { housingIs: "rough", minStress: 20 },
      weight: 7,
      cooldown: 5,
      repeatable: true,
      choices: [
        __eventChoice("snap_back", "Ввязаться", "Ты выбиваешь себе тишину, но на нервах.", [
          __resource("stress", 3),
          __condition("morale", -1)
        ]),
        __eventChoice("walk_it_off", "Выйти проветриться", "Ночь остаётся плохой, но голову ты хотя бы не сжигаешь полностью.", [
          __resource("stress", -2),
          __condition("fatigue", 2)
        ])
      ]
    },
    {
      id: "normal_room_small_order",
      title: "Комната наконец выглядит как дом",
      text: "Иногда несколько спокойных часов с порядком дают голове больше, чем один лишний спарринг.",
      conditions: { housingIs: "normal", maxStress: 70 },
      weight: 5,
      cooldown: 8,
      repeatable: true,
      choices: [
        __eventChoice("keep_order", "Поддерживать порядок", "Становится легче держать ритм недели.", [
          __resource("stress", -3),
          __condition("morale", 3)
        ], { add: ["keeps_order"] }),
        __eventChoice("ignore_order", "Пусть как есть", "Ничего не рушится, но и внутренней тишины не прибавляется.", [
          __condition("morale", -1)
        ])
      ]
    },
    {
      id: "comfort_first_good_sleep",
      title: "Наконец-то нормальный сон",
      text: "Комфортные условия неожиданно напоминают, как выглядит настоящее восстановление.",
      conditions: { housingIs: "comfortable", minFatigue: 20 },
      weight: 7,
      cooldown: 8,
      repeatable: true,
      choices: [
        __eventChoice("lean_into_rest", "Дать себе выспаться", "Тело быстро возвращает часть ресурса.", [
          __resource("health", 7),
          __condition("fatigue", -6),
          __condition("morale", 3)
        ]),
        __eventChoice("wake_early", "Не терять режим", "Ты остаёшься в дисциплине, но без полного отката усталости.", [
          __condition("morale", 1),
          __life("support", 1)
        ])
      ]
    },
    {
      id: "comfort_bills_press",
      title: "Комфорт любит деньги",
      text: "Хороший быт делает жизнь ровнее, но кошелёк напоминает, что это не бесплатно.",
      conditions: { housingIs: "comfortable", maxMoney: 70 },
      weight: 7,
      cooldown: 6,
      repeatable: true,
      choices: [
        __eventChoice("hold_it", "Тянуть дальше", "Ты сохраняешь уровень жизни, но давишь на бюджет.", [
          __resource("money", -20),
          __resource("stress", 3)
        ]),
        __eventChoice("downgrade", "Съехать на уровень ниже", "Комфорт уходит, зато становится легче дышать по деньгам.", [
          __life("housingId", 0, "normal"),
          __condition("morale", -3),
          __resource("stress", 1)
        ])
      ]
    },
    {
      id: "friend_pulls_you_out",
      title: "{friend} вытаскивает тебя в люди",
      text: "{friend} видит, что ты начинаешь зажиматься в себе, и не даёт уйти в тишину с концами.",
      actors: [{ slot: "friend", role: "friend", required: true }],
      conditions: { requiresRolesAll: ["friend"], maxSupport: 45, minStress: 30 },
      weight: 8,
      cooldown: 6,
      repeatable: true,
      choices: [
        __eventChoice("go_with_friend", "Пойти с ним", "Пара часов простого человеческого тепла возвращает тебя в реальность.", [
          __resource("stress", -7),
          __condition("morale", 5),
          __life("support", 8),
          __relation("friend", 5, 1, 4, -2)
        ]),
        __eventChoice("stay_closed", "Остаться в себе", "Иногда закрыться проще, чем объяснять, что у тебя внутри.", [
          __resource("stress", 3),
          __condition("morale", -4),
          __life("support", -4),
          __relation("friend", -2, 0, -3, 1)
        ])
      ]
    },
    {
      id: "team_dinner_after_camp",
      title: "Команда зовёт на общий вечер",
      text: "После тяжёлых недель команда предлагает побыть вместе вне режима зала.",
      conditions: { requiresRolesAny: ["trainer", "sparring"], recentActionAny: ["train", "fight"] },
      weight: 7,
      cooldown: 7,
      repeatable: true,
      choices: [
        __eventChoice("join_team", "Пойти", "Неформальный вечер делает лагерь ближе и мягче.", [
          __resource("money", -12),
          __resource("stress", -5),
          __condition("morale", 4),
          __life("support", 6)
        ]),
        __eventChoice("skip_team", "Пропустить", "Ты оставляешь силы себе, но теряешь немного общей ткани команды.", [
          __condition("fatigue", -2),
          __life("support", -2)
        ])
      ]
    },
    {
      id: "family_call_holds_you",
      title: "Звонок от близких",
      text: "Иногда один разговор возвращает больше воздуха, чем целая свободная неделя.",
      conditions: { maxSupport: 70, minStress: 18 },
      weight: 8,
      cooldown: 6,
      repeatable: true,
      choices: [
        __eventChoice("answer", "Ответить и не торопиться", "Разговор оказывается важнее, чем ты думал.", [
          __resource("stress", -6),
          __condition("morale", 5),
          __life("support", 7)
        ], { add: ["family_grounded"] }),
        __eventChoice("rush_it", "Свернуть быстро", "Ты слышишь голоса близких, но не даёшь себе в этом пожить.", [
          __condition("morale", -2),
          __life("support", -2)
        ])
      ]
    },
    {
      id: "missed_family_day",
      title: "Пропущенный семейный день",
      text: "Пока ты строишь карьеру, жизнь дома идёт без паузы и не всегда ждёт твоего окна.",
      conditions: { minWeek: 4, maxSupport: 65, abroadOnly: true },
      weight: 6,
      cooldown: 8,
      repeatable: true,
      choices: [
        __eventChoice("make_time", "Найти время и деньги", "Это не отменяет расстояние, но держит мост целым.", [
          __resource("money", -15),
          __condition("morale", 4),
          __life("support", 6)
        ]),
        __eventChoice("let_it_pass", "Отложить на потом", "Карьерный ритм съедает ещё один кусок обычной жизни.", [
          __condition("morale", -4),
          __life("support", -5),
          __resource("stress", 3)
        ])
      ]
    },
    {
      id: "quiet_evening_clarity",
      title: "Тихий вечер приносит ясность",
      text: "Иногда одиночество не режет, а наоборот собирает тебя обратно.",
      conditions: { maxSupport: 60, maxStress: 55 },
      weight: 5,
      cooldown: 7,
      repeatable: true,
      choices: [
        __eventChoice("write_plan", "Сесть и разложить всё по полкам", "Порядок в голове возвращает немного опоры.", [
          __condition("morale", 4),
          __resource("stress", -3)
        ], { add: ["reflective"] }),
        __eventChoice("drift", "Пустить вечер без формы", "Полностью это не рушит, но и не собирает.", [
          __life("support", -1)
        ])
      ]
    },
    {
      id: "hotel_loneliness_abroad",
      title: "Чужой номер давит сильнее обычного",
      text: "За рубежом даже тишина иногда звучит как пустота.",
      conditions: { abroadOnly: true, maxSupport: 40 },
      weight: 8,
      cooldown: 5,
      repeatable: true,
      choices: [
        __eventChoice("call_home", "Тянуться к своим", "Ты выравниваешься через связь с теми, кто знает тебя без афиши.", [
          __condition("morale", 4),
          __life("support", 6),
          __resource("stress", -3)
        ]),
        __eventChoice("sit_with_it", "Сидеть в этом один", "Иногда это делает только тяжелее.", [
          __resource("stress", 5),
          __condition("morale", -4),
          __life("support", -3)
        ])
      ]
    },
    {
      id: "trainer_sees_stability",
      title: "{trainer} замечает, что ты стал собраннее",
      text: "{trainer} редко говорит тёпло, но видит, когда жизнь вокруг тебя перестаёт разваливаться.",
      actors: [{ slot: "trainer", role: "trainer", required: true }],
      conditions: { requiresRolesAll: ["trainer"], minMorale: 60, minDiscipline: 55 },
      weight: 6,
      cooldown: 10,
      repeatable: true,
      choices: [
        __eventChoice("accept_praise", "Принять это спокойно", "Ты не раздуваешь момент, но он остаётся внутри как крепкая точка.", [
          __condition("morale", 3),
          __relation("trainer", 2, 4, 3, -1)
        ]),
        __eventChoice("ask_for_more", "Спросить, что дальше", "Тренер начинает относиться к тебе как к человеку, который выдержит больше.", [
          __resource("skillPoints", 4),
          __relation("trainer", 1, 5, 4, 0)
        ])
      ]
    },
    {
      id: "trainer_calls_out_slip",
      title: "{trainer} видит, что быт тебя разбирает",
      text: "{trainer} замечает срыв режима раньше, чем ты сам готов это признать.",
      actors: [{ slot: "trainer", role: "trainer", required: true }],
      conditions: { requiresRolesAll: ["trainer"], maxDiscipline: 40, minStress: 40 },
      weight: 7,
      cooldown: 7,
      repeatable: true,
      choices: [
        __eventChoice("take_note", "Принять замечание", "Это неприятно слышать, но оно возвращает тебя в рамку.", [
          __condition("morale", 2),
          __life("support", 2),
          __relation("trainer", 1, 3, 3, -2)
        ]),
        __eventChoice("snap_back", "Ответить жёстко", "Защитная реакция даёт тепло на минуту и холод на неделю.", [
          __condition("morale", -3),
          __relation("trainer", -2, -3, -4, 5)
        ])
      ]
    },
    {
      id: "friend_after_loss",
      title: "{friend} не даёт тебе закрыться после поражения",
      text: "{friend} приходит без лишних слов и просто остаётся рядом.",
      actors: [{ slot: "friend", role: "friend", required: true }],
      conditions: { requiresRolesAll: ["friend"], lastActionType: "fight", lastFightResult: "loss" },
      weight: 9,
      cooldown: 6,
      repeatable: true,
      choices: [
        __eventChoice("let_them_in", "Не гнать его", "Это не чинит поражение, но не даёт ему прорасти глубже.", [
          __resource("stress", -6),
          __condition("morale", 5),
          __life("support", 6),
          __relation("friend", 5, 1, 5, -2)
        ]),
        __eventChoice("push_away", "Снова закрыться", "Никто не лезет, но внутри становится пустее.", [
          __condition("morale", -5),
          __life("support", -5),
          __relation("friend", -3, 0, -4, 2)
        ])
      ]
    },
    {
      id: "team_after_hard_fight",
      title: "Команда держит тебя после тяжёлого боя",
      text: "После по-настоящему тяжёлой недели бойца часто спасают не слова, а присутствие людей рядом.",
      conditions: { requiresRolesAny: ["trainer", "sparring"], lastActionType: "fight", minWear: 20 },
      weight: 7,
      cooldown: 8,
      repeatable: true,
      choices: [
        __eventChoice("lean_on_team", "Опустить плечи рядом с ними", "Лагерь помогает тебе не нести всё одному.", [
          __resource("health", 5),
          __resource("stress", -4),
          __life("support", 5)
        ]),
        __eventChoice("keep_mask", "Держать лицо", "Снаружи всё ровно, но внутри легче не становится.", [
          __condition("morale", -3),
          __life("support", -2)
        ])
      ]
    },
    {
      id: "home_needs_repair",
      title: "Жильё снова тянет деньги",
      text: "Быт не спрашивает, готов ли ты сейчас тратить на него ресурс.",
      conditions: { housingAny: ["rough", "normal"], maxMoney: 90, minWeek: 3 },
      weight: 6,
      cooldown: 7,
      repeatable: true,
      choices: [
        __eventChoice("pay_for_fix", "Закрыть вопрос деньгами", "Это больно по бюджету, но легче по голове.", [
          __resource("money", -22),
          __resource("stress", -4),
          __condition("morale", 2)
        ]),
        __eventChoice("delay_fix", "Отложить ещё на неделю", "Проблема остаётся и съедает фон жизни по кускам.", [
          __resource("stress", 4),
          __condition("wear", 2)
        ])
      ]
    },
    {
      id: "rival_smells_isolation",
      title: "{rival} чувствует, что ты один",
      text: "{rival} замечает, когда вокруг тебя становится меньше поддержки, и давит именно туда.",
      actors: [{ slot: "rival", role: "rival", required: true }],
      conditions: { requiresRolesAll: ["rival"], maxSupport: 40, minFame: 10 },
      weight: 6,
      cooldown: 8,
      repeatable: true,
      choices: [
        __eventChoice("use_it_as_fuel", "Сделать из этого злость", "Тебя это колет, но собирает в узкий жёсткий фокус.", [
          __resource("skillPoints", 4),
          __condition("morale", 1),
          __relation("rival", 0, 2, 0, 5)
        ]),
        __eventChoice("let_it_sink", "Пропустить слишком глубоко", "Подначка падает туда, где и без того было тонко.", [
          __condition("morale", -4),
          __resource("stress", 4),
          __life("support", -3)
        ])
      ]
    },
    {
      id: "doctor_sleep_warning",
      title: "{doctor} говорит, что тебе нужен лучший быт",
      text: "{doctor} прямо намекает, что часть проблем идёт не из боя, а из того, как ты живёшь между неделями.",
      actors: [{ slot: "doctor", role: "doctor", required: true }],
      conditions: { requiresRolesAll: ["doctor"], housingAny: ["rough", "normal"], minWear: 35 },
      weight: 7,
      cooldown: 10,
      repeatable: true,
      choices: [
        __eventChoice("listen_to_doctor", "Вложиться в условия", "Ты решаешь, что без быта тело далеко не утащишь.", [
          __resource("money", -18),
          __condition("wear", -3),
          __condition("morale", 2)
        ]),
        __eventChoice("brush_it_off", "Списать на рабочую мелочь", "Это кажется не срочным, пока тело снова не напомнит.", [
          __condition("wear", 3),
          __relation("doctor", -1, 0, -2, 2)
        ])
      ]
    },
    {
      id: "family_pride_message",
      title: "Близкие видят твой рост",
      text: "Не вся поддержка приходит громко. Иногда она приходит одним коротким сообщением вовремя.",
      conditions: { minFame: 14, maxSupport: 80 },
      weight: 5,
      cooldown: 12,
      repeatable: true,
      choices: [
        __eventChoice("take_it_in", "Остановиться и прочитать внимательно", "Ты вспоминаешь, что за пределами ринга ты всё ещё чей-то человек.", [
          __condition("morale", 5),
          __life("support", 5)
        ]),
        __eventChoice("keep_moving", "Пролистать и идти дальше", "Это всё равно греет, но мимоходом.", [
          __condition("morale", 1)
        ])
      ]
    },
    {
      id: "good_home_good_habits",
      title: "Нормальный быт собирает привычки",
      text: "Когда вокруг меньше хаоса, становится проще делать правильные маленькие вещи подряд.",
      conditions: { housingAny: ["normal", "comfortable"], minDiscipline: 50 },
      weight: 5,
      cooldown: 10,
      repeatable: true,
      choices: [
        __eventChoice("keep_routine", "Удержать рутину", "Мелкая стабильность вдруг начинает работать на тебя.", [
          __condition("morale", 3),
          __resource("stress", -2),
          __resource("skillPoints", 3)
        ], { add: ["life_in_order"] }),
        __eventChoice("ease_off", "Дать себе мягкую неделю", "Иногда даже хороший быт хочется просто прожить без дисциплины.", [
          __resource("health", 4),
          __condition("fatigue", -3)
        ])
      ]
    }
  ]
};
