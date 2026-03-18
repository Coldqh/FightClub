function __eventChoice(id, label, resultText, effects, tagChanges) {
  return {
    id: id,
    label: label,
    resultText: resultText,
    effects: effects || [],
    tagChanges: tagChanges || null
  };
}

function __resource(key, delta) {
  return { type: "resource", key: key, delta: delta };
}

function __condition(key, delta) {
  return { type: "condition", key: key, delta: delta };
}

function __relation(slot, affinity, respect, trust, tension) {
  return {
    type: "relation",
    slot: slot,
    affinity: affinity || 0,
    respect: respect || 0,
    trust: trust || 0,
    tension: tension || 0
  };
}

var EVENT_DATA = {
  triggerChance: 52,
  events: [
    {
      id: "rent_due_notice",
      title: "Хозяин комнаты стучит в дверь",
      text: "Деньги снова тают быстрее, чем проходит неделя.",
      conditions: { maxMoney: 50, minWeek: 2 },
      weight: 8,
      cooldown: 5,
      repeatable: true,
      choices: [
        __eventChoice("pay", "Отдать сразу", "Ты закрываешь вопрос деньгами и чуть легче дышишь.", [
          __resource("money", -30),
          __resource("stress", -3)
        ], { add: ["paid_rent"], remove: ["rent_delay"] }),
        __eventChoice("delay", "Тянуть время", "Проблема никуда не делась. Она просто стала громче в голове.", [
          __resource("stress", 8),
          __condition("morale", -4)
        ], { add: ["rent_delay"] })
      ]
    },
    {
      id: "friend_spare_couch",
      title: "{friend} предлагает диван",
      text: "{friend} видит, что у тебя неделя идёт тяжело, и предлагает перекантоваться у него.",
      actors: [{ slot: "friend", role: "friend", required: true }],
      conditions: { maxMoney: 35, relationAtLeast: [{ role: "friend", affinity: 45, trust: 40 }] },
      weight: 7,
      cooldown: 8,
      repeatable: true,
      choices: [
        __eventChoice("accept", "Принять помощь", "Ты принимаешь помощь и возвращаешь себе немного опоры.", [
          __resource("stress", -8),
          __condition("morale", 5),
          __relation("friend", 4, 1, 5, -2)
        ], { add: ["accepted_help"] }),
        __eventChoice("refuse", "Отказаться", "Гордость остаётся при тебе вместе с лишним напряжением.", [
          __resource("stress", 4),
          __relation("friend", -2, 2, -2, 1)
        ], { add: ["too_proud"] })
      ]
    },
    {
      id: "gym_owner_cash_shift",
      title: "{gym_owner} подкидывает смену",
      text: "{gym_owner} предлагает ещё одну тяжёлую смену в зале.",
      actors: [{ slot: "gym_owner", role: "gym_owner", required: true }],
      conditions: { maxMoney: 80, requiresRolesAll: ["gym_owner"] },
      weight: 7,
      cooldown: 6,
      repeatable: true,
      choices: [
        __eventChoice("take_shift", "Взять работу", "Смена тянет силы, но кошелёк становится толще.", [
          __resource("money", 55),
          __resource("health", -6),
          __resource("stress", 5),
          __condition("fatigue", 8),
          __relation("gym_owner", 1, 4, 2, -1)
        ]),
        __eventChoice("decline_shift", "Отказаться", "Ты сохраняешь силы, но это замечают.", [
          __condition("morale", 1),
          __relation("gym_owner", 0, -2, -1, 2)
        ])
      ]
    },
    {
      id: "broken_wraps_market",
      title: "Старые бинты просят замены",
      text: "Снаряга сыплется. Можно обновиться или снова сэкономить.",
      conditions: { maxMoney: 120, minWeek: 2 },
      weight: 6,
      cooldown: 7,
      repeatable: true,
      choices: [
        __eventChoice("buy_gear", "Купить комплект", "Ты тратишься, но тело говорит спасибо.", [
          __resource("money", -25),
          __condition("wear", -3),
          __condition("morale", 2)
        ]),
        __eventChoice("save_money", "Сэкономить", "Деньги остаются, но кисти отвечают раздражением.", [
          __condition("wear", 3),
          __resource("stress", 2)
        ])
      ]
    },
    {
      id: "cheap_street_food",
      title: "Еда на бегу",
      text: "Снова выбор между дешёвым перекусом и нормальным восстановлением.",
      conditions: { maxHealth: 85, minWeek: 2 },
      weight: 6,
      cooldown: 4,
      repeatable: true,
      choices: [
        __eventChoice("eat_clean", "Поесть нормально", "Ты тратишь деньги, но возвращаешь часть ресурса.", [
          __resource("money", -18),
          __resource("health", 6),
          __resource("stress", -2)
        ]),
        __eventChoice("eat_cheap", "Снова взять дешёвое", "Ты экономишь деньги, а организм платит за это сам.", [
          __resource("money", 8),
          __resource("health", -4),
          __condition("wear", 2)
        ])
      ]
    },
    {
      id: "sleep_debt_week",
      title: "Неделя без сна",
      text: "Шум, мысли и дорога сливаются в одну вязкую усталость.",
      conditions: { minFatigue: 35, minStress: 25 },
      weight: 7,
      cooldown: 5,
      repeatable: true,
      choices: [
        __eventChoice("force_rest", "Сбросить темп", "Ты режешь темп и возвращаешь себе центр.", [
          __condition("fatigue", -10),
          __condition("morale", 3)
        ], { add: ["learned_to_rest"] }),
        __eventChoice("push_through", "Перетерпеть", "Ты вывозишь на характере, но тело записывает это в счёт.", [
          __condition("fatigue", 10),
          __resource("stress", 5),
          __condition("morale", -3)
        ], { add: ["grinder"] })
      ]
    },
    {
      id: "trainer_double_session",
      title: "{trainer} хочет двойную сессию",
      text: "{trainer} уверен, что тебя можно продавить через тяжёлый режим.",
      actors: [{ slot: "trainer", role: "trainer", required: true }],
      conditions: { requiresRolesAll: ["trainer"], recentActionAny: ["train"], relationAtLeast: [{ role: "trainer", respect: 45 }] },
      weight: 8,
      cooldown: 6,
      repeatable: true,
      choices: [
        __eventChoice("agree", "Согласиться", "Лагерь становится тяжелее, но тренер видит, что ты не сливаешься.", [
          __resource("skillPoints", 6),
          __resource("health", -5),
          __condition("fatigue", 6),
          __relation("trainer", 1, 5, 3, -1)
        ], { add: ["grinder"] }),
        __eventChoice("decline", "Сказать, что перегоришь", "Ты сбавляешь темп и сохраняешь часть ресурса.", [
          __condition("fatigue", -4),
          __condition("morale", 2),
          __relation("trainer", 0, -1, 1, 1)
        ])
      ]
    },
    {
      id: "trainer_calls_for_rest",
      title: "{trainer} видит, что ты изношен",
      text: "{trainer} прямо говорит, что без паузы это кончится плохо.",
      actors: [{ slot: "trainer", role: "trainer", required: true }],
      conditions: { requiresRolesAll: ["trainer"], minWear: 40 },
      weight: 7,
      cooldown: 8,
      repeatable: true,
      choices: [
        __eventChoice("listen", "Послушать тренера", "Ты делаешь шаг назад и выигрываешь ресурс на дистанции.", [
          __condition("wear", -5),
          __resource("health", 6),
          __condition("morale", 2),
          __relation("trainer", 0, 2, 4, -2)
        ]),
        __eventChoice("ignore", "Игнорировать", "Ты давишь дальше и расплачиваешься телом.", [
          __condition("wear", 6),
          __resource("health", -4),
          __relation("trainer", 0, -2, -4, 4)
        ], { add: ["ignores_limits"] })
      ]
    },
    {
      id: "sparring_invitation",
      title: "{sparring} ищет жёсткие раунды",
      text: "{sparring} предлагает закрытый спарринг.",
      actors: [{ slot: "sparring", role: "sparring", required: true }],
      conditions: { requiresRolesAll: ["sparring"], minHealth: 55 },
      weight: 7,
      cooldown: 5,
      repeatable: true,
      choices: [
        __eventChoice("go_hard", "Войти жёстко", "Сессия вышла тяжёлой, но дала рост.", [
          __resource("skillPoints", 5),
          __resource("health", -6),
          __condition("fatigue", 5),
          __relation("sparring", 1, 4, 0, 2)
        ]),
        __eventChoice("keep_light", "Держать лёгкий режим", "Ты получаешь раунды без лишнего урона.", [
          __resource("skillPoints", 2),
          __condition("fatigue", 1),
          __relation("sparring", 0, 1, 2, -1)
        ])
      ]
    },
    {
      id: "rival_barb_public",
      title: "{rival} цепляет тебя на людях",
      text: "{rival} бросает колкость так, чтобы её услышали нужные уши.",
      actors: [{ slot: "rival", role: "rival", required: true }],
      conditions: { requiresRolesAll: ["rival"], minFame: 10 },
      weight: 7,
      cooldown: 6,
      repeatable: true,
      choices: [
        __eventChoice("answer_cold", "Ответить спокойно", "Ты не даёшь себя раскачать и выглядишь взрослее всей сцены.", [
          __resource("fame", 2),
          __condition("morale", 1),
          __relation("rival", -1, 3, 0, -1)
        ]),
        __eventChoice("snap_back", "Вспыхнуть в ответ", "Толпа это любит, но конфликт становится жарче.", [
          __resource("fame", 3),
          __resource("stress", 4),
          __relation("rival", -4, 1, 0, 8)
        ], { add: ["public_spat"] })
      ]
    },
    {
      id: "rival_secret_respect",
      title: "{rival} вдруг говорит без яда",
      text: "Без толпы {rival} признаёт, что ты идёшь правильно.",
      actors: [{ slot: "rival", role: "rival", required: true }],
      conditions: { requiresRolesAll: ["rival"], relationAtLeast: [{ role: "rival", tension: 45, respect: 40 }] },
      weight: 4,
      cooldown: 10,
      repeatable: true,
      choices: [
        __eventChoice("take_respect", "Принять этот момент", "Вражда никуда не делась, но в ней появляется уважение.", [
          __relation("rival", 1, 6, 2, -4)
        ], { add: ["earned_rival_respect"] }),
        __eventChoice("twist_knife", "Добить словом", "Ты давишь дальше и делаешь мост ещё уже.", [
          __resource("fame", 1),
          __relation("rival", -2, 0, -3, 7)
        ])
      ]
    },
    {
      id: "promoter_small_sponsor",
      title: "{promoter} находит мелкий контракт",
      text: "{promoter} может притянуть небольшой локальный спонсорский хвост.",
      actors: [{ slot: "promoter", role: "promoter", required: true }],
      conditions: { requiresRolesAll: ["promoter"], minFame: 12 },
      weight: 6,
      cooldown: 8,
      repeatable: true,
      choices: [
        __eventChoice("take_it", "Согласиться", "Деньги приходят, а имя звучит чаще.", [
          __resource("money", 65),
          __resource("fame", 3),
          __relation("promoter", 1, 2, 4, 0)
        ], { add: ["media_friendly"] }),
        __eventChoice("stay_raw", "Остаться сырым", "Ты не меняешь образ, но деньги уходят мимо.", [
          __condition("morale", 1),
          __relation("promoter", 0, -1, -2, 2)
        ])
      ]
    },
    {
      id: "promoter_dirty_cash",
      title: "{promoter} предлагает грязные деньги",
      text: "{promoter} знает людей, которые готовы заплатить быстро. Потом это имя пойдёт за тобой.",
      actors: [{ slot: "promoter", role: "promoter", required: true }],
      conditions: { requiresRolesAll: ["promoter"], minFame: 18, biographyFlagsNot: ["kept_clean"] },
      weight: 5,
      cooldown: 12,
      repeatable: true,
      choices: [
        __eventChoice("take_dirty", "Взять деньги", "Кэш приходит быстро. Совесть — не так быстро.", [
          __resource("money", 120),
          __resource("stress", 7),
          __relation("promoter", 0, 2, 5, 1)
        ], { add: ["took_dirty_money"], remove: ["kept_clean"] }),
        __eventChoice("refuse_dirty", "Отказаться", "Ты теряешь быстрый заработок, но усиливаешь внутреннюю линию.", [
          __condition("morale", 4),
          __resource("fame", 1),
          __relation("promoter", 0, 1, -3, 3)
        ], { add: ["kept_clean"] })
      ]
    },
    {
      id: "promoter_foreign_card",
      title: "{promoter} чувствует зарубежный шум",
      text: "{promoter} говорит, что за пределами дома твоё имя звучит интереснее обычного.",
      actors: [{ slot: "promoter", role: "promoter", required: true }],
      conditions: { requiresRolesAll: ["promoter"], abroadOnly: true, minFame: 25 },
      weight: 5,
      cooldown: 10,
      repeatable: true,
      choices: [
        __eventChoice("lean_in", "Усилить шум", "Ты вкладываешься в видимость и поднимаешь интерес к себе.", [
          __resource("money", -25),
          __resource("fame", 6),
          __resource("stress", 3),
          __relation("promoter", 0, 2, 4, 0)
        ]),
        __eventChoice("stay_low", "Остаться тише", "Ты держишь голову ниже, но теряешь часть импульса.", [
          __resource("stress", -2),
          __relation("promoter", 0, 0, -1, 1)
        ])
      ]
    },
    {
      id: "journalist_interview",
      title: "{journalist} хочет интервью",
      text: "{journalist} просит короткий разговор. Он точно не будет нейтральным.",
      actors: [{ slot: "journalist", role: "journalist", required: true }],
      conditions: { requiresRolesAll: ["journalist"], minFame: 16 },
      weight: 6,
      cooldown: 8,
      repeatable: true,
      choices: [
        __eventChoice("open_up", "Открыться", "Материал выходит живым, и люди начинают видеть в тебе не только руки.", [
          __resource("fame", 4),
          __relation("journalist", 2, 1, 4, 0)
        ], { add: ["media_friendly"] }),
        __eventChoice("stay_closed", "Говорить сухо", "Ты ничего лишнего не отдаёшь, но материал выходит холодным.", [
          __resource("fame", 1),
          __relation("journalist", 0, 0, -2, 2)
        ])
      ]
    },
    {
      id: "journalist_smear",
      title: "{journalist} копает в грязь",
      text: "{journalist} находит нитку, за которую можно потянуть. Старые решения возвращаются эхом.",
      actors: [{ slot: "journalist", role: "journalist", required: true }],
      conditions: { requiresRolesAll: ["journalist"], minFame: 20, biographyFlagsAny: ["took_dirty_money", "public_spat"] },
      weight: 4,
      cooldown: 12,
      repeatable: true,
      choices: [
        __eventChoice("buy_silence", "Погасить историю деньгами", "История становится тише, но осадок остаётся.", [
          __resource("money", -60),
          __resource("stress", 3),
          __relation("journalist", -2, 0, -4, 4)
        ]),
        __eventChoice("stand_tall", "Принять удар", "Шум идёт по тебе, но ты не позволяешь ему свернуть тебя.", [
          __resource("fame", -2),
          __condition("morale", 3),
          __resource("stress", 5)
        ], { add: ["weathered_scandal"] })
      ]
    },
    {
      id: "doctor_discount",
      title: "{doctor} идёт навстречу",
      text: "{doctor} видит, что ты держишься на честном слове, и может помочь дешевле обычного.",
      actors: [{ slot: "doctor", role: "doctor", required: true }],
      conditions: { requiresRolesAll: ["doctor"], maxHealth: 65, relationAtLeast: [{ role: "doctor", trust: 35 }] },
      weight: 5,
      cooldown: 10,
      repeatable: true,
      choices: [
        __eventChoice("take_help", "Принять помощь", "Ты чуть собрался обратно без полного удара по карману.", [
          __resource("money", -20),
          __resource("health", 10),
          __resource("stress", -3),
          __relation("doctor", 1, 2, 4, -1)
        ]),
        __eventChoice("save_cash", "Сэкономить", "Деньги остались, а тело не стало благодарнее.", [
          __resource("money", 10),
          __condition("wear", 3)
        ])
      ]
    },
    {
      id: "doctor_hide_injury",
      title: "{doctor} может спрятать проблему",
      text: "{doctor} намекает, что часть проблем можно не светить перед нужными людьми.",
      actors: [{ slot: "doctor", role: "doctor", required: true }],
      conditions: { requiresRolesAll: ["doctor"], minFame: 18, maxHealth: 75 },
      weight: 4,
      cooldown: 12,
      repeatable: true,
      choices: [
        __eventChoice("hide_it", "Спрятать", "Ты сохраняешь видимость силы, но долг остаётся в теле.", [
          __resource("fame", 2),
          __condition("wear", 5),
          __relation("doctor", 0, 1, 3, 1)
        ], { add: ["hides_injuries"] }),
        __eventChoice("tell_truth", "Сказать правду", "Это не красиво для афиши, зато честно для тела.", [
          __resource("fame", -1),
          __resource("health", 4),
          __condition("morale", 2)
        ])
      ]
    },
    {
      id: "friend_neighborhood_night",
      title: "{friend} зовёт выдохнуть",
      text: "{friend} тянет тебя на тихий вечер вне зала и без разговоров о боях.",
      actors: [{ slot: "friend", role: "friend", required: true }],
      conditions: { requiresRolesAll: ["friend"], minStress: 30 },
      weight: 6,
      cooldown: 7,
      repeatable: true,
      choices: [
        __eventChoice("go_out", "Выйти с ним", "Голова становится тише, а связь теплее.", [
          __resource("stress", -7),
          __condition("morale", 4),
          __relation("friend", 5, 1, 3, -2)
        ]),
        __eventChoice("stay_locked", "Остаться в себе", "Ты сохраняешь режим, но снова остаёшься один на один с гулом.", [
          __condition("morale", -2),
          __relation("friend", -1, 0, -2, 1)
        ])
      ]
    },
    {
      id: "friend_needs_cash",
      title: "{friend} сам тонет в деньгах",
      text: "{friend} просит занять ему немного, и это не выглядит как пустяк.",
      actors: [{ slot: "friend", role: "friend", required: true }],
      conditions: { requiresRolesAll: ["friend"], minMoney: 40 },
      weight: 5,
      cooldown: 10,
      repeatable: true,
      choices: [
        __eventChoice("lend", "Дать денег", "Ты делишься тем, что у тебя и так не льётся через край.", [
          __resource("money", -25),
          __relation("friend", 4, 1, 5, -2)
        ], { add: ["stood_by_friend"] }),
        __eventChoice("refuse", "Отказать", "Ты сохраняешь деньги, но память об этом не испаряется.", [
          __relation("friend", -4, 0, -5, 3),
          __condition("morale", -1)
        ])
      ]
    },
    {
      id: "friend_covers_for_you",
      title: "{friend} прикрывает тебя",
      text: "{friend} без лишних слов закрывает дыру, которую ты сам не успевал закрыть.",
      actors: [{ slot: "friend", role: "friend", required: true }],
      conditions: { requiresRolesAll: ["friend"], maxStress: 70, relationAtLeast: [{ role: "friend", trust: 50 }] },
      weight: 4,
      cooldown: 12,
      repeatable: true,
      choices: [
        __eventChoice("accept_cover", "Принять", "Это маленький жест, который держит тебя на плаву сильнее денег.", [
          __resource("stress", -5),
          __condition("morale", 4),
          __relation("friend", 3, 0, 5, -2)
        ]),
        __eventChoice("pay_back_now", "Сразу отдать", "Ты не хочешь висеть в долгу даже перед своими.", [
          __resource("money", -20),
          __relation("friend", 1, 2, 2, -1)
        ])
      ]
    },
    {
      id: "gym_owner_help_kid",
      title: "{gym_owner} просит показать пример",
      text: "{gym_owner} просит помочь пацану, который только пришёл в зал.",
      actors: [{ slot: "gym_owner", role: "gym_owner", required: true }],
      conditions: { requiresRolesAll: ["gym_owner"], homeOnly: true },
      weight: 5,
      cooldown: 9,
      repeatable: true,
      choices: [
        __eventChoice("help", "Потратить время", "Ты не заработал на этом денег, но район это увидел.", [
          __resource("fame", 2),
          __condition("morale", 3),
          __relation("gym_owner", 1, 4, 2, -1)
        ], { add: ["helped_kid"] }),
        __eventChoice("skip", "Отмахнуться", "Ты оставляешь это другим и чуть сужаешь пространство вокруг себя.", [
          __relation("gym_owner", 0, -3, -1, 2)
        ])
      ]
    },
    {
      id: "gym_owner_demands_respect",
      title: "{gym_owner} напоминает, чей это зал",
      text: "{gym_owner} не любит, когда вокруг слишком много шума без уважения к дому.",
      actors: [{ slot: "gym_owner", role: "gym_owner", required: true }],
      conditions: { requiresRolesAll: ["gym_owner"], recentActionAny: ["work", "train"] },
      weight: 4,
      cooldown: 8,
      repeatable: true,
      choices: [
        __eventChoice("show_respect", "Сделать как надо", "Ты вкладываешься в зал и усиливаешь свой вес внутри него.", [
          __condition("morale", 2),
          __relation("gym_owner", 0, 5, 2, -1)
        ]),
        __eventChoice("brush_off", "Отмахнуться", "Слова уходят в воздух, но отметка в памяти остаётся.", [
          __relation("gym_owner", 0, -4, 0, 4)
        ])
      ]
    },
    {
      id: "road_customs_hassle",
      title: "Дорога снова кусается",
      text: "Перелёты — это не только новые города. Иногда это нервы и потерянные часы.",
      conditions: { abroadOnly: true, recentActionAny: ["travel"] },
      weight: 7,
      cooldown: 8,
      repeatable: true,
      choices: [
        __eventChoice("pay_fast", "Решить быстро", "Деньги уходят, но ты не вязнешь в дороге дольше нужного.", [
          __resource("money", -20),
          __resource("stress", 2)
        ]),
        __eventChoice("endure", "Перетерпеть", "Ты экономишь деньги, но платишь нервами и усталостью.", [
          __resource("stress", 6),
          __condition("fatigue", 5)
        ], { add: ["road_hardened"] })
      ]
    },
    {
      id: "new_city_loneliness",
      title: "Чужой город не сразу принимает",
      text: "Даже когда вокруг шумно, чужой город умеет делать человека одиноким.",
      conditions: { abroadOnly: true, minStress: 30 },
      weight: 6,
      cooldown: 8,
      repeatable: true,
      choices: [
        __eventChoice("explore", "Выйти в город", "Чужое место становится чуть менее чужим.", [
          __resource("stress", -4),
          __condition("morale", 3)
        ], { add: ["road_hardened"] }),
        __eventChoice("hide", "Закрыться в себе", "Ты сохраняешь силы, но чужой город давит сильнее.", [
          __resource("stress", 4),
          __condition("morale", -3)
        ], { add: ["homesick"] })
      ]
    },
    {
      id: "abroad_local_respect",
      title: "За рубежом тебя начинают узнавать",
      text: "На чужой территории уважение почти всегда приходится вырывать с нуля.",
      conditions: { abroadOnly: true, minFame: 18 },
      weight: 5,
      cooldown: 8,
      repeatable: true,
      choices: [
        __eventChoice("lean_into_it", "Поддержать волну", "Ты пользуешься моментом и добавляешь громкости имени.", [
          __resource("fame", 4),
          __resource("stress", 2)
        ]),
        __eventChoice("stay_workman", "Остаться рабочим", "Ты не устраиваешь шоу, но копишь более тихое уважение.", [
          __condition("morale", 2)
        ], { add: ["quiet_worker"] })
      ]
    },
    {
      id: "home_call_from_family",
      title: "Дом звонит в неподходящий момент",
      text: "Даже короткий звонок из дома цепляет сильнее, когда всё и так напряжено.",
      conditions: { homeOnly: true, minStress: 40 },
      weight: 5,
      cooldown: 10,
      repeatable: true,
      choices: [
        __eventChoice("pick_up", "Взять трубку", "Разговор не решает всего, но возвращает часть почвы под ногами.", [
          __resource("stress", -6),
          __condition("morale", 4)
        ], { add: ["stays_connected"] }),
        __eventChoice("ignore", "Сбросить", "Ты оставляешь это на потом и чувствуешь это дольше, чем хотел бы.", [
          __resource("stress", 3),
          __condition("morale", -4)
        ])
      ]
    },
    {
      id: "after_win_buzz",
      title: "После победы район шумит",
      text: "Победа ещё не успела остыть, а разговоры уже раскручивают твоё имя.",
      conditions: { lastActionType: "fight", lastFightResult: "win" },
      weight: 7,
      cooldown: 5,
      repeatable: true,
      choices: [
        __eventChoice("ride_buzz", "Подхватить волну", "Ты усиливаешь послевкусие победы и оставляешь след глубже.", [
          __resource("fame", 4),
          __condition("morale", 3)
        ], { add: ["public_name"] }),
        __eventChoice("stay_quiet", "Не шуметь", "Ты не расплескиваешь энергию и оставляешь её внутри лагеря.", [
          __resource("stress", -2),
          __condition("morale", 1)
        ])
      ]
    },
    {
      id: "after_loss_doubt",
      title: "После поражения всё звучит иначе",
      text: "После плохого боя даже привычные вещи начинают звучать как сомнение.",
      conditions: { lastActionType: "fight", lastFightResult: "loss" },
      weight: 8,
      cooldown: 5,
      repeatable: true,
      choices: [
        __eventChoice("watch_tape", "Разобрать бой", "Это больно, но полезно. Из поражения вынимается польза.", [
          __resource("skillPoints", 5),
          __condition("morale", -1)
        ], { add: ["learns_from_losses"] }),
        __eventChoice("avoid_it", "Не смотреть назад", "Ты пытаешься пройти мимо, но бой остаётся в голове.", [
          __resource("stress", 5),
          __condition("morale", -4)
        ])
      ]
    },
    {
      id: "after_ko_noise",
      title: "После нокаута все говорят громче",
      text: "Когда бой заканчивается жёстко, его эхо идёт за тобой дольше обычного.",
      conditions: { lastActionType: "fight", lastFightMethodContains: "KO" },
      weight: 6,
      cooldown: 8,
      repeatable: true,
      choices: [
        __eventChoice("embrace", "Принять шум", "Ты не прячешься от образа человека, который умеет выключать свет.", [
          __resource("fame", 5),
          __resource("stress", 2)
        ], { add: ["finisher"] }),
        __eventChoice("downplay", "Снизить градус", "Ты стараешься не превращать это в маску на лице.", [
          __condition("morale", 2),
          __resource("stress", -1)
        ])
      ]
    },
    {
      id: "trainer_rebuild_after_loss",
      title: "{trainer} хочет собрать тебя после провала",
      text: "{trainer} не любит нытьё, но умеет работать с осколками после плохого результата.",
      actors: [{ slot: "trainer", role: "trainer", required: true }],
      conditions: { requiresRolesAll: ["trainer"], lastActionType: "fight", lastFightResult: "loss" },
      weight: 7,
      cooldown: 8,
      repeatable: true,
      choices: [
        __eventChoice("trust_process", "Довериться процессу", "Ты снова входишь в ритм вместе с тренером.", [
          __resource("skillPoints", 4),
          __condition("morale", 4),
          __relation("trainer", 2, 3, 5, 0)
        ]),
        __eventChoice("close_off", "Закрыться", "Ты уходишь в себя. Тренер это видит и запоминает.", [
          __resource("stress", 4),
          __relation("trainer", 0, 0, -4, 4)
        ])
      ]
    },
    {
      id: "promoter_after_win_offer",
      title: "{promoter} активизируется после победы",
      text: "Промоутеры лучше всего слышат звук свежей победы.",
      actors: [{ slot: "promoter", role: "promoter", required: true }],
      conditions: { requiresRolesAll: ["promoter"], lastActionType: "fight", lastFightResult: "win" },
      weight: 6,
      cooldown: 8,
      repeatable: true,
      choices: [
        __eventChoice("meet", "Встретиться", "Ты усиливаешь деловую связь и получаешь чуть больше пространства.", [
          __resource("fame", 2),
          __relation("promoter", 1, 3, 4, 0)
        ]),
        __eventChoice("stay_busy", "Не отвлекаться", "Ты остаёшься в лагере, но промоутер чувствует дистанцию.", [
          __condition("morale", 1),
          __relation("promoter", 0, 0, -2, 1)
        ])
      ]
    },
    {
      id: "rival_after_win_callout",
      title: "{rival} требует следующего шага",
      text: "После твоей победы {rival} снова втягивает тебя в свою орбиту.",
      actors: [{ slot: "rival", role: "rival", required: true }],
      conditions: { requiresRolesAll: ["rival"], lastActionType: "fight", lastFightResult: "win" },
      weight: 6,
      cooldown: 8,
      repeatable: true,
      choices: [
        __eventChoice("accept_heat", "Принять жар", "Ты не уходишь от напряжения и делаешь историю горячее.", [
          __resource("fame", 3),
          __relation("rival", 0, 2, 0, 7)
        ], { add: ["rival_feud"] }),
        __eventChoice("freeze_out", "Оставить без ответа", "Ты не даёшь ему сцены, но напряжение не исчезает.", [
          __resource("stress", -1),
          __relation("rival", 0, -1, 0, 2)
        ])
      ]
    },
    {
      id: "empty_wallet_temptation",
      title: "Быстрые деньги снова рядом",
      text: "Когда карман пустой, моральные линии начинают выглядеть тоньше обычного.",
      conditions: { maxMoney: 25, minWeek: 3 },
      weight: 7,
      cooldown: 10,
      repeatable: true,
      choices: [
        __eventChoice("take_risk_cash", "Пойти в мутную тему", "Деньги приходят быстро, но спокойнее от этого не становится.", [
          __resource("money", 70),
          __resource("stress", 8)
        ], { add: ["street_debt", "took_dirty_money"] }),
        __eventChoice("stay_clean", "Остаться чистым", "Тяжело, но ты снова не даёшь нужде написать за тебя биографию.", [
          __condition("morale", 4)
        ], { add: ["kept_clean"] })
      ]
    },
    {
      id: "quiet_self_reflection",
      title: "Тихая неделя в голове",
      text: "Иногда самый громкий разговор идёт не с людьми вокруг, а с собой.",
      conditions: { minStress: 50, maxMorale: 55 },
      weight: 6,
      cooldown: 8,
      repeatable: true,
      choices: [
        __eventChoice("write_it_down", "Разложить всё по полкам", "Ты собираешь голову заново и возвращаешь себе центр.", [
          __resource("stress", -6),
          __condition("morale", 5)
        ], { add: ["reflective"] }),
        __eventChoice("bury_it", "Закопать глубже", "На поверхность ничего не выходит, но внутри становится теснее.", [
          __resource("stress", 4),
          __condition("morale", -3)
        ])
      ]
    },
    {
      id: "worn_body_warning",
      title: "Тело просит разговора",
      text: "Накопленный износ уже не прячется и напоминает о себе в обычных движениях.",
      conditions: { minWear: 55 },
      weight: 8,
      cooldown: 8,
      repeatable: true,
      choices: [
        __eventChoice("respect_body", "Услышать тело", "Ты даёшь организму шанс дожить до следующих больших недель.", [
          __condition("wear", -6),
          __resource("health", 5),
          __condition("morale", 2)
        ]),
        __eventChoice("ignore_body", "Давить дальше", "На характере можно проехать ещё немного. Счёт всё равно придёт.", [
          __condition("wear", 5),
          __resource("health", -5),
          __resource("stress", 3)
        ], { add: ["ignores_limits"] })
      ]
    },
    {
      id: "grinder_breakthrough",
      title: "Рутина начинает отдавать",
      text: "Долгий одинаковый труд отвечает короткой вспышкой качества.",
      conditions: { recentActionAny: ["train"], biographyFlagsAny: ["grinder"], minWeek: 4 },
      weight: 5,
      cooldown: 12,
      repeatable: true,
      choices: [
        __eventChoice("lock_in", "Закрепить", "Ты фиксируешь прогресс и чувствуешь, что путь не был пустым.", [
          __resource("skillPoints", 8),
          __condition("morale", 4)
        ]),
        __eventChoice("overcook", "Попробовать выжать больше", "Ты хочешь добрать ещё и немного перегибаешь.", [
          __resource("skillPoints", 5),
          __condition("fatigue", 6),
          __resource("health", -3)
        ])
      ]
    },
    {
      id: "community_support",
      title: "Район становится теплее",
      text: "Когда имя долго звучит без фальши, район начинает подталкивать тебя вперёд сам.",
      conditions: { homeOnly: true, minFame: 25, biographyFlagsAny: ["helped_kid", "stood_by_friend", "kept_clean"] },
      weight: 4,
      cooldown: 14,
      once: true,
      choices: [
        __eventChoice("accept", "Принять поддержку", "Ты чувствуешь, что тянешь уже не только сам себя.", [
          __resource("fame", 5),
          __condition("morale", 5),
          __resource("stress", -3)
        ], { add: ["community_backing"] }),
        __eventChoice("stay_hungry", "Остаться голодным", "Ты не даёшь себе расслабиться даже на фоне любви района.", [
          __resource("skillPoints", 4),
          __condition("morale", 1)
        ], { add: ["community_backing"] })
      ]
    },
  ]
};
