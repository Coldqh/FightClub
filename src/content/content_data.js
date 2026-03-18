var CONTENT_DATA = {
  countries: [
    {
      id: "mexico",
      name: "Мексика",
      map: { x: 0, y: 1 },
      homeMoneyMultiplier: 1.2,
      homeFameMultiplier: 1.0,
      abroadFameMultiplier: 1.2,
      baseLivingCost: 30,
      schoolStyle: "Прессинг, работа по корпусу и плотный размен.",
      arenas: [
        { id: "mexico-barrio-coliseo", name: "Колизей Баррио", city: "Мехико" },
        { id: "mexico-azteca-night", name: "Azteca Night Gym", city: "Гвадалахара" },
        { id: "mexico-norte-ring", name: "Rincon del Norte", city: "Монтеррей" }
      ]
    },
    {
      id: "usa",
      name: "США",
      map: { x: 1, y: 1 },
      homeMoneyMultiplier: 1.2,
      homeFameMultiplier: 1.0,
      abroadFameMultiplier: 1.2,
      baseLivingCost: 30,
      schoolStyle: "Атлетичный темп, джеб и силовые серии.",
      arenas: [
        { id: "usa-las-vegas-underground", name: "Underground Vegas", city: "Лас-Вегас" },
        { id: "usa-brooklyn-docks", name: "Brooklyn Docks Ring", city: "Нью-Йорк" },
        { id: "usa-southside-cage", name: "Southside Fight Hall", city: "Чикаго" }
      ]
    },
    {
      id: "russia",
      name: "Россия",
      map: { x: 6, y: 0 },
      homeMoneyMultiplier: 1.2,
      homeFameMultiplier: 1.0,
      abroadFameMultiplier: 1.2,
      baseLivingCost: 30,
      schoolStyle: "Жесткая встречная работа и силовой тайминг.",
      arenas: [
        { id: "russia-moscow-yard", name: "Дворовой Ринг", city: "Москва" },
        { id: "russia-neva-club", name: "Невский Клуб", city: "Санкт-Петербург" },
        { id: "russia-ural-pit", name: "Уральская Яма", city: "Екатеринбург" }
      ],
      identityOverride: {
        first: ["Иван", "Дмитрий", "Сергей", "Алексей", "Михаил", "Виктор", "Николай", "Андрей", "Павел", "Юрий", "Константин", "Артем", "Денис", "Егор", "Максим", "Роман", "Кирилл", "Олег", "Тимур", "Илья"],
        last: ["Иванов", "Петров", "Сидоров", "Смирнов", "Кузнецов", "Попов", "Васильев", "Федоров", "Волков", "Соловьев", "Морозов", "Лебедев", "Козлов", "Новиков", "Павлов", "Соколов", "Виноградов", "Макаров", "Орлов", "Егоров"],
        nick: ["Северный Волк", "Железный Молот", "Дикий Волк", "Ледяной Шторм", "Стальной Кулак", "Ночной Ворон", "Грозный Таран", "Красный Град", "Русский Медведь", "Сибирский Лис"]
      }
    },
    {
      id: "cuba",
      name: "Куба",
      map: { x: 1, y: 2 },
      homeMoneyMultiplier: 1.2,
      homeFameMultiplier: 1.0,
      abroadFameMultiplier: 1.2,
      baseLivingCost: 30,
      schoolStyle: "Школа ритма, ног и вязкой защиты.",
      arenas: [
        { id: "cuba-habana-malecon", name: "Malecon Fight Hall", city: "Гавана" },
        { id: "cuba-santiago-sun", name: "Santiago del Ring", city: "Сантьяго-де-Куба" },
        { id: "cuba-port-night", name: "Puerto Oscuro", city: "Матансас" }
      ]
    },
    {
      id: "japan",
      name: "Япония",
      map: { x: 9, y: 0 },
      homeMoneyMultiplier: 1.2,
      homeFameMultiplier: 1.0,
      abroadFameMultiplier: 1.2,
      baseLivingCost: 30,
      schoolStyle: "Дисциплина, тайминг и выверенный вход.",
      arenas: [
        { id: "japan-tokyo-basement", name: "Tokyo Basement Ring", city: "Токио" },
        { id: "japan-osaka-smoke", name: "Osaka Smoke Hall", city: "Осака" },
        { id: "japan-nagoya-hammer", name: "Nagoya Hammer Club", city: "Нагоя" }
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
      schoolStyle: "Дистанция, терпение и резкий взрыв серии.",
      arenas: [
        { id: "china-shanghai-red", name: "Shanghai Red Corner", city: "Шанхай" },
        { id: "china-guangzhou-rush", name: "Guangzhou Rush Club", city: "Гуанчжоу" },
        { id: "china-beijing-iron", name: "Beijing Iron Hall", city: "Пекин" }
      ]
    },
    {
      id: "uk",
      name: "Великобритания",
      map: { x: 4, y: 0 },
      homeMoneyMultiplier: 1.2,
      homeFameMultiplier: 1.0,
      abroadFameMultiplier: 1.2,
      baseLivingCost: 30,
      schoolStyle: "Классический джеб, терпение и плотный центр.",
      arenas: [
        { id: "uk-london-cellar", name: "London Cellar Ring", city: "Лондон" },
        { id: "uk-manchester-brick", name: "Manchester Brick Gym", city: "Манчестер" },
        { id: "uk-liverpool-docks", name: "Liverpool Docks Hall", city: "Ливерпуль" }
      ]
    },
    {
      id: "philippines",
      name: "Филиппины",
      map: { x: 9, y: 2 },
      homeMoneyMultiplier: 1.2,
      homeFameMultiplier: 1.0,
      abroadFameMultiplier: 1.2,
      baseLivingCost: 30,
      schoolStyle: "Мотор, объем ударов и постоянное давление.",
      arenas: [
        { id: "philippines-manila-neon", name: "Manila Neon Ring", city: "Манила" },
        { id: "philippines-cebu-storm", name: "Cebu Storm Gym", city: "Себу" },
        { id: "philippines-davao-brawl", name: "Davao Brawl Club", city: "Давао" }
      ]
    }
  ],
  opponentTypes: [
    { id: "pressure", label: "Давит по центру" },
    { id: "block_trap", label: "Любит ловить на блоке" },
    { id: "counterpace", label: "Работает вторым номером" },
    { id: "jab_control", label: "Сушит темп и колет джебом" },
    { id: "body_hunter", label: "Лезет в корпус" }
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
      statusPool: ["ведет лагерь", "ищет новый подход", "собирает план на бой"],
      traitsPool: ["жесткий", "требовательный", "старой школы", "вдумчивый", "терпеливый"]
    },
    {
      id: "sparring",
      label: "Спарринг-партнер",
      statusPool: ["держит форму", "ищет раунды", "входит в лагерь"],
      traitsPool: ["выносливый", "резкий", "упорный", "молчаливый", "горячий"]
    },
    {
      id: "friend",
      label: "Друг",
      statusPool: ["держится рядом", "верит в твой рывок", "живет делами района"],
      traitsPool: ["верный", "общительный", "легкий на подъем", "ироничный", "заботливый"]
    },
    {
      id: "rival",
      label: "Соперник",
      statusPool: ["следит за твоими боями", "ищет повод для реванша", "подогревает напряжение"],
      traitsPool: ["гордый", "ядовитый", "амбициозный", "холодный", "упрямый"]
    },
    {
      id: "promoter",
      label: "Промоутер",
      statusPool: ["присматривается к именам", "ищет продаваемый бой", "собирает контакты"],
      traitsPool: ["расчетливый", "харизматичный", "цепкий", "деловой", "хитрый"]
    },
    {
      id: "journalist",
      label: "Журналист",
      statusPool: ["гоняется за историями", "ищет громкое имя", "собирает слухи"],
      traitsPool: ["любопытный", "колкий", "наблюдательный", "язвительный", "быстрый"]
    },
    {
      id: "doctor",
      label: "Врач",
      statusPool: ["латaет бойцов", "смотрит старые травмы", "не любит спешку"],
      traitsPool: ["спокойный", "точный", "строгий", "практичный", "надежный"]
    },
    {
      id: "gym_owner",
      label: "Владелец зала",
      statusPool: ["следит за залом", "ищет выгодные лица", "держит районный баланс"],
      traitsPool: ["властный", "деловой", "строгий", "подозрительный", "уважаемый"]
    }
  ]
};
