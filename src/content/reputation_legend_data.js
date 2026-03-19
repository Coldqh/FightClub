var REPUTATION_LEGEND_DATA = {
  reputationTags: [
    {
      id: "fan_favorite",
      label: "Народный любимец",
      conditions: {
        minFame: 35,
        minSupport: 60,
        minWins: 4,
        maxScandals: 1
      }
    },
    {
      id: "dirty_fighter",
      label: "Грязный боец",
      conditions: {
        minScandals: 2
      }
    },
    {
      id: "giant_killer",
      label: "Убийца фаворитов",
      conditions: {
        minUpsetWins: 2
      }
    },
    {
      id: "home_hero",
      label: "Домашний герой",
      conditions: {
        minHomeWins: 4,
        minFame: 20
      }
    },
    {
      id: "wanderer",
      label: "Кочевник",
      conditions: {
        minCountriesVisited: 4
      }
    },
    {
      id: "fragile_talent",
      label: "Хрупкий талант",
      conditions: {
        minFame: 20,
        minChronicInjuries: 2
      }
    },
    {
      id: "ko_machine",
      label: "Машина KO",
      conditions: {
        minKos: 5,
        minWins: 6
      }
    },
    {
      id: "eternal_contender",
      label: "Вечный претендент",
      conditions: {
        minFights: 10,
        minFame: 25,
        maxWinsOverLosses: 3
      }
    }
  ],
  mediaTemplates: [
    {
      id: "career_start",
      type: "career_start",
      tone: "warn",
      titles: [
        "{name} начинает путь в {country}.",
        "В {country} появляется новый боец: {name}."
      ],
      texts: [
        "Пока это только старт, но имя уже прозвучало.",
        "{name} делает первый шаг в новой карьере."
      ]
    },
    {
      id: "travel_move",
      type: "travel",
      tone: "warn",
      titles: [
        "{name} едет в {country}.",
        "{name} меняет город и летит в {country}."
      ],
      texts: [
        "Новая арена, новые люди и новый риск.",
        "Переезд может дать новый шанс или новую проблему."
      ]
    },
    {
      id: "fight_win",
      type: "fight_result",
      result: "win",
      tone: "good",
      titles: [
        "{name} выигрывает у {opponent}.",
        "{name} забирает бой против {opponent}."
      ],
      texts: [
        "Победа добавляет шум вокруг имени {name}.",
        "{name} снова уходит с ринга победителем."
      ]
    },
    {
      id: "fight_loss",
      type: "fight_result",
      result: "loss",
      tone: "bad",
      titles: [
        "{name} уступает {opponent}.",
        "{opponent} останавливает ход {name}."
      ],
      texts: [
        "Поражение бьёт по ходу карьеры.",
        "{name} придётся собираться заново."
      ]
    },
    {
      id: "fight_draw",
      type: "fight_result",
      result: "draw",
      tone: "warn",
      titles: [
        "Бой {name} и {opponent} уходит в ничью.",
        "Судьи не смогли развести {name} и {opponent}."
      ],
      texts: [
        "История явно не закончена.",
        "После такой ничьей разговоры только начинаются."
      ]
    },
    {
      id: "fight_ko",
      type: "fight_result",
      result: "win",
      methodContains: "KO",
      tone: "good",
      titles: [
        "{name} вырубает {opponent}.",
        "{name} закрывает бой досрочно."
      ],
      texts: [
        "Нокаут быстро разносит имя по залам.",
        "{opponent} не выдержал силовой развязки."
      ]
    },
    {
      id: "fight_upset",
      type: "fight_result",
      result: "win",
      requiresPayloadTag: "upset",
      tone: "good",
      titles: [
        "{name} ломает расклад против {opponent}.",
        "{name} снимает ещё одного фаворита."
      ],
      texts: [
        "После такого боя в него начинают верить иначе.",
        "Сцена любит тех, кто переворачивает прогнозы."
      ]
    },
    {
      id: "fight_rematch",
      type: "fight_result",
      requiresPayloadTag: "rematch",
      tone: "warn",
      titles: [
        "Реванш {name} и {opponent} снова гремит.",
        "{name} и {opponent} снова закрывают старый счёт."
      ],
      texts: [
        "Серия получает новую главу.",
        "Такие бои помнят дольше обычных."
      ]
    },
    {
      id: "fight_rival",
      type: "fight_result",
      requiresPayloadTag: "rival",
      tone: "warn",
      titles: [
        "{name} снова пересекается с {opponent}.",
        "Личная война {name} и {opponent} только крепнет."
      ],
      texts: [
        "Когда дело уже не только в победе, публика это чувствует.",
        "Такое противостояние кормит ленту само по себе."
      ]
    },
    {
      id: "injury_story",
      type: "injury",
      tone: "bad",
      titles: [
        "{name} уносит из боя проблему: {injury}.",
        "{name} снова расплачивается телом: {injury}."
      ],
      texts: [
        "Теперь лагерь придётся строить осторожнее.",
        "Тело напоминает цену карьеры."
      ]
    },
    {
      id: "gym_story",
      type: "gym",
      tone: "good",
      titles: [
        "{name} входит в зал {gym}.",
        "{name} меняет базу и переходит в {gym}."
      ],
      texts: [
        "Новый зал часто меняет и ритм карьеры.",
        "Иногда один адрес значит больше, чем кажется."
      ]
    },
    {
      id: "trainer_hired",
      type: "trainer",
      subtype: "hired",
      tone: "good",
      titles: [
        "{trainer} начинает работать с {name}.",
        "{name} собирает новый угол с {trainer}."
      ],
      texts: [
        "Теперь многое будет зависеть от того, как они сработаются.",
        "Свежий голос в углу может многое поменять."
      ]
    },
    {
      id: "trainer_left",
      type: "trainer",
      subtype: "left",
      tone: "bad",
      titles: [
        "{name} остаётся без тренера.",
        "{trainer} уходит из лагеря {name}."
      ],
      texts: [
        "Потеря угла редко проходит без следа.",
        "Теперь придётся заново собирать лагерь."
      ]
    },
    {
      id: "contract_signed",
      type: "contract",
      subtype: "signed",
      tone: "good",
      titles: [
        "{name} подписывает контракт: {contract}.",
        "У {name} появляется новая сделка: {contract}."
      ],
      texts: [
        "Теперь вокруг карьеры будет больше движения.",
        "Контракт даёт шанс, но почти всегда просит что-то взамен."
      ]
    },
    {
      id: "contract_broken",
      type: "contract",
      subtype: "broken",
      tone: "bad",
      titles: [
        "{name} рвёт контракт {contract}.",
        "Сделка {name} сгорает со скандалом."
      ],
      texts: [
        "Такие шаги всегда бьют по репутации.",
        "После разрыва контракта мир долго помнит осадок."
      ]
    },
    {
      id: "scandal_story",
      type: "event",
      requiresPayloadTag: "scandal",
      tone: "bad",
      titles: [
        "Вокруг {name} снова шум: {event}.",
        "{name} влетает в новый скандал."
      ],
      texts: [
        "Одни любят такой шум, другие запоминают его надолго.",
        "Скандал быстро липнет к имени бойца."
      ]
    },
    {
      id: "interview_story",
      type: "event",
      requiresPayloadTag: "interview",
      tone: "warn",
      titles: [
        "{name} попадает в разговоры прессы.",
        "Имя {name} снова мелькает в интервью и пересказах."
      ],
      texts: [
        "Медиа любят тех, кто даёт материал.",
        "Пара слов иногда меняет неделю сильнее боя."
      ]
    },
    {
      id: "ending_retired",
      type: "ending",
      endingReason: "retired",
      tone: "good",
      titles: [
        "{name} сам ставит точку в карьере.",
        "{name} уходит из игры по своей воле."
      ],
      texts: [
        "Такой выход редко бывает лёгким, но в нём есть сила.",
        "Иногда вовремя уйти так же важно, как вовремя выйти на бой."
      ]
    },
    {
      id: "ending_body",
      type: "ending",
      endingReason: "body",
      tone: "bad",
      titles: [
        "Тело останавливает путь {name}.",
        "Карьера {name} ломается об износ."
      ],
      texts: [
        "Накопленная цена карьеры всё-таки пришла за своим.",
        "Иногда ринг забирает больше, чем отдаёт."
      ]
    },
    {
      id: "ending_stress",
      type: "ending",
      endingReason: "stress",
      tone: "bad",
      titles: [
        "Голова не выдерживает путь {name}.",
        "Психика ставит точку в истории {name}."
      ],
      texts: [
        "Не каждый бой остаётся на ринге.",
        "Давление добирается до бойца даже после побед."
      ]
    },
    {
      id: "ending_debt",
      type: "ending",
      endingReason: "debt",
      tone: "bad",
      titles: [
        "Долги глушат карьеру {name}.",
        "{name} вылетает из игры из-за денег."
      ],
      texts: [
        "Иногда не кулак, а счёт за неделю решает судьбу.",
        "Без денег ринг быстро перестаёт быть главным врагом."
      ]
    }
  ],
  endingArchetypes: [
    {
      id: "champion",
      label: "Чемпион",
      conditions: {
        minFame: 90,
        minWins: 12,
        maxLosses: 4
      },
      summary: "К концу пути его уже воспринимали как главную фигуру сцены."
    },
    {
      id: "cult_veteran",
      label: "Культовый ветеран",
      conditions: {
        minFights: 14,
        minFame: 40
      },
      summary: "Про него говорили не из-за одного вечера, а из-за длинной дороги."
    },
    {
      id: "broken_talent",
      label: "Сломанный талант",
      conditions: {
        minFame: 20,
        minChronicInjuries: 2,
        endingReasonIn: ["body", "stress"]
      },
      summary: "Талант был виден всем, но дорога оказалась жёстче, чем казалось в начале."
    },
    {
      id: "forgotten_wanderer",
      label: "Забытый бродяга ринга",
      conditions: {
        minCountriesVisited: 4,
        maxFame: 30
      },
      summary: "Он много ездил и много видел, но имя так и не стало большим."
    },
    {
      id: "local_legend",
      label: "Локальная легенда",
      conditions: {
        minHomeWins: 5,
        minFame: 25
      },
      summary: "Для своего района он остался человеком, которого будут вспоминать ещё долго."
    },
    {
      id: "scandal_star",
      label: "Скандальная звезда",
      conditions: {
        minScandals: 2,
        minFame: 30
      },
      summary: "Его обсуждали не меньше, чем его бои."
    },
    {
      id: "great_comeback",
      label: "Великий камбэк",
      conditions: {
        minComebackWins: 2,
        minWins: 6
      },
      summary: "Он не раз падал, но каждый раз находил путь обратно."
    },
    {
      id: "street_fighter",
      label: "Боец улиц",
      conditions: {},
      summary: "Он прошёл свой путь, как мог, и оставил после себя живую историю."
    }
  ]
};
