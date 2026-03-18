var CONTENT_DATA = {
  countries: [
    {
      id: "mexico",
      name: "Мексика",
      map: { x: 0, y: 1 },
      homeMoneyMultiplier: 1.2,
      homeFameMultiplier: 1.0,
      abroadFameMultiplier: 1.2,
      baseLivingCost: 28,
      schoolStyle: "Плотный прессинг, удары по корпусу и тяжелая работа в ближней рубке.",
      arenas: [
        { id: "mexico-barrio-coliseo", name: "Баррио Колисео", city: "Мехико" },
        { id: "mexico-azteca-night", name: "Ночной зал Ацтека", city: "Гвадалахара" },
        { id: "mexico-norte-ring", name: "Северный ринг", city: "Монтеррей" }
      ]
    },
    {
      id: "usa",
      name: "США",
      map: { x: 1, y: 1 },
      homeMoneyMultiplier: 1.2,
      homeFameMultiplier: 1.0,
      abroadFameMultiplier: 1.2,
      baseLivingCost: 34,
      schoolStyle: "Коммерческий бокс, мощные лагеря и акцент на выгодный контракт.",
      arenas: [
        { id: "usa-las-vegas-underground", name: "Подпольный Вегас", city: "Лас-Вегас" },
        { id: "usa-brooklyn-docks", name: "Ринг у доков", city: "Нью-Йорк" },
        { id: "usa-southside-cage", name: "Южный бойцовский холл", city: "Чикаго" }
      ]
    },
    {
      id: "russia",
      name: "Россия",
      map: { x: 6, y: 0 },
      homeMoneyMultiplier: 1.2,
      homeFameMultiplier: 1.0,
      abroadFameMultiplier: 1.2,
      baseLivingCost: 24,
      schoolStyle: "Жесткая школа, терпение, силовая база и холодная дисциплина.",
      arenas: [
        { id: "russia-moscow-yard", name: "Московский двор", city: "Москва" },
        { id: "russia-neva-club", name: "Нева Клаб", city: "Санкт-Петербург" },
        { id: "russia-ural-pit", name: "Уральская яма", city: "Екатеринбург" }
      ]
    },
    {
      id: "cuba",
      name: "Куба",
      map: { x: 1, y: 2 },
      homeMoneyMultiplier: 1.2,
      homeFameMultiplier: 1.0,
      abroadFameMultiplier: 1.2,
      baseLivingCost: 22,
      schoolStyle: "Легкие ноги, работа на дистанции и ритм, который ломает темп соперника.",
      arenas: [
        { id: "cuba-habana-malecon", name: "Малекон Холл", city: "Гавана" },
        { id: "cuba-santiago-sun", name: "Сантьяго дель Ринг", city: "Сантьяго-де-Куба" },
        { id: "cuba-port-night", name: "Портовой зал", city: "Матансас" }
      ]
    },
    {
      id: "japan",
      name: "Япония",
      map: { x: 9, y: 0 },
      homeMoneyMultiplier: 1.2,
      homeFameMultiplier: 1.0,
      abroadFameMultiplier: 1.2,
      baseLivingCost: 36,
      schoolStyle: "Точность, дисциплина, контроль дистанции и внимание к деталям лагеря.",
      arenas: [
        { id: "japan-tokyo-basement", name: "Токио Бейсмент", city: "Токио" },
        { id: "japan-osaka-smoke", name: "Осака Смоук Холл", city: "Осака" },
        { id: "japan-nagoya-hammer", name: "Нагоя Хаммер Клаб", city: "Нагоя" }
      ]
    },
    {
      id: "china",
      name: "Китай",
      map: { x: 8, y: 1 },
      homeMoneyMultiplier: 1.2,
      homeFameMultiplier: 1.0,
      abroadFameMultiplier: 1.2,
      baseLivingCost: 30,
      schoolStyle: "Объем, дисциплина лагеря и ставка на длинную дистанцию подготовки.",
      arenas: [
        { id: "china-shanghai-red", name: "Шанхайский красный угол", city: "Шанхай" },
        { id: "china-guangzhou-rush", name: "Гуанчжоу Раш", city: "Гуанчжоу" },
        { id: "china-beijing-iron", name: "Пекин Айрон Холл", city: "Пекин" }
      ]
    },
    {
      id: "uk",
      name: "Великобритания",
      map: { x: 4, y: 0 },
      homeMoneyMultiplier: 1.2,
      homeFameMultiplier: 1.0,
      abroadFameMultiplier: 1.2,
      baseLivingCost: 32,
      schoolStyle: "Классическая школа джеба, темпа и аккуратной дистанционной работы.",
      arenas: [
        { id: "uk-london-cellar", name: "Лондонский подвал", city: "Лондон" },
        { id: "uk-manchester-brick", name: "Манчестер Брик Джим", city: "Манчестер" },
        { id: "uk-liverpool-docks", name: "Ливерпульские доки", city: "Ливерпуль" }
      ]
    },
    {
      id: "philippines",
      name: "Филиппины",
      map: { x: 9, y: 2 },
      homeMoneyMultiplier: 1.2,
      homeFameMultiplier: 1.0,
      abroadFameMultiplier: 1.2,
      baseLivingCost: 20,
      schoolStyle: "Высокий темп, серия за серией и работа на выносливости.",
      arenas: [
        { id: "philippines-manila-neon", name: "Манила Неон Ринг", city: "Манила" },
        { id: "philippines-cebu-storm", name: "Себу Шторм Джим", city: "Себу" },
        { id: "philippines-davao-brawl", name: "Давао Браул Клаб", city: "Давао" }
      ]
    }
  ],

  opponentTypes: [
    {
      id: "pressure",
      label: "Прессингует и душит темпом",
      focusId: "sparring",
      styleWeights: { tempo: 3, puncher: 2 },
      perkPool: ["swarm_breath", "body_tax", "basement_hook", "gym_rat"]
    },
    {
      id: "block_trap",
      label: "Ловит на блоке и ошибке",
      focusId: "defense",
      styleWeights: { counterpuncher: 3, outboxer: 1 },
      perkPool: ["trap_guard", "mirror_step", "cold_head", "anchor_circle"]
    },
    {
      id: "counterpace",
      label: "Терпит и отвечает в окно",
      focusId: "technique",
      styleWeights: { counterpuncher: 2, outboxer: 2 },
      perkPool: ["mirror_step", "needle_jab", "cold_head", "contract_eye"]
    },
    {
      id: "jab_control",
      label: "Держит джебом и шагом",
      focusId: "technique",
      styleWeights: { outboxer: 3, counterpuncher: 1 },
      perkPool: ["needle_jab", "rangemaster", "mirror_step", "camp_engineer"]
    },
    {
      id: "body_hunter",
      label: "Охотится за корпусом",
      focusId: "power",
      styleWeights: { puncher: 2, tempo: 2 },
      perkPool: ["body_tax", "thunder_cross", "kill_switch", "basement_hook"]
    }
  ],

  opponentTiers: {
    safe: {
      tierBonus: -1,
      purseBase: 65,
      fameBase: 6,
      rounds: [4, 5],
      danger: "Ниже по риску"
    },
    even: {
      tierBonus: 1,
      purseBase: 95,
      fameBase: 11,
      rounds: [5, 6],
      danger: "Ровный бой"
    },
    danger: {
      tierBonus: 3,
      purseBase: 150,
      fameBase: 17,
      rounds: [6, 7],
      danger: "Очень опасен"
    }
  },

  npcRoles: [
    {
      id: "trainer",
      label: "Тренер",
      description: "Человек, который собирает лагерь, держит ритм и помогает расти не только в статах, но и в стиле.",
      statusPool: ["ведёт лагерь", "ищет новую связку", "внимательно смотрит спарринги"],
      traitsPool: ["требовательный", "терпеливый", "жёсткий", "методичный", "наблюдательный"],
      relationPreset: { affinity: 36, respect: 48, trust: 34, tension: 10, relationTags: ["team"] }
    },
    {
      id: "sparring",
      label: "Спарринг-партнёр",
      description: "Твой рабочий контакт для жёстких раундов, проверки ритма и настройки ударов.",
      statusPool: ["готов к раундам", "берёт паузу после лагеря", "точит форму"],
      traitsPool: ["упрямый", "колючий", "выносливый", "спокойный", "взрывной"],
      relationPreset: { affinity: 32, respect: 38, trust: 28, tension: 14, relationTags: ["team"] }
    },
    {
      id: "friend",
      label: "Друг",
      description: "Связь вне ринга, которая держит голову на месте, когда карьера начинает давить.",
      statusPool: ["держится рядом", "зовёт выдохнуть", "помнит, кем ты был до боёв"],
      traitsPool: ["верный", "ироничный", "тёплый", "прямой", "надёжный"],
      relationPreset: { affinity: 48, respect: 30, trust: 42, tension: 6, relationTags: ["close"] }
    },
    {
      id: "rival",
      label: "Соперник",
      description: "Человек, который делает твою карьеру острее: где-то мотивирует, где-то тащит в конфликт.",
      statusPool: ["следит за твоими боями", "ищет реванш", "готовит свой лагерь"],
      traitsPool: ["злопамятный", "самоуверенный", "заводной", "опасный", "цепкий"],
      relationPreset: { affinity: 16, respect: 36, trust: 12, tension: 48, relationTags: ["rival"] }
    },
    {
      id: "promoter",
      label: "Промоутер",
      description: "Человек рынка, который приносит офферы, но почти всегда хочет забрать своё сверху.",
      statusPool: ["собирает рынок", "звонит матчмейкерам", "ищет следующий шум"],
      traitsPool: ["деловой", "скользкий", "громкий", "расчётливый", "обаятельный"],
      relationPreset: { affinity: 28, respect: 34, trust: 22, tension: 18, relationTags: ["business"] }
    },
    {
      id: "journalist",
      label: "Журналист",
      description: "Следит за твоим именем и умеет одинаково быстро поднять интерес или устроить неудобный шум.",
      statusPool: ["ищет историю", "ждёт громкий повод", "наблюдает со стороны"],
      traitsPool: ["язвительный", "дотошный", "быстрый", "любопытный", "холодный"],
      relationPreset: { affinity: 22, respect: 28, trust: 18, tension: 16, relationTags: ["media"] }
    },
    {
      id: "doctor",
      label: "Врач",
      description: "Человек, который держит тебя в строю, когда тело начинает спорить с карьерой.",
      statusPool: ["смотрит восстановление", "собирает после нагрузки", "не любит авантюры"],
      traitsPool: ["спокойный", "собранный", "строгий", "честный", "осторожный"],
      relationPreset: { affinity: 30, respect: 42, trust: 34, tension: 8, relationTags: ["medical"] }
    },
    {
      id: "gym_owner",
      label: "Владелец зала",
      description: "Человек, который решает, есть ли у тебя крыша, люди и место для следующего шага.",
      statusPool: ["держит зал на плаву", "смотрит за дисциплиной", "решает, кому давать шанс"],
      traitsPool: ["жёсткий", "деловой", "старой школы", "суровый", "прагматичный"],
      relationPreset: { affinity: 24, respect: 38, trust: 20, tension: 14, relationTags: ["gym"] }
    }
  ]
};
