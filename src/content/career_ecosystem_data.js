var CAREER_ECOSYSTEM_DATA = {
  "gyms": [
    {
      "id": "mexico_barrio_pit",
      "country": "mexico",
      "city": "Mexico City",
      "name": "Barrio Pit",
      "cost": 15,
      "specialization": "рубка и корпус",
      "reputation": 42,
      "bonuses": {
        "trainingPoints": 2,
        "safeBias": 1,
        "dangerBias": 1
      },
      "trainerTypeIds": [
        "body_lab",
        "conditioning"
      ],
      "description": "Маленький жёсткий зал. Тут учат идти вперёд и бить по телу."
    },
    {
      "id": "mexico_norte_boxing",
      "country": "mexico",
      "city": "Guadalajara",
      "name": "Norte Boxing House",
      "cost": 24,
      "specialization": "мощь и жёсткие серии",
      "reputation": 55,
      "bonuses": {
        "trainingPoints": 1,
        "purseBonus": 8,
        "homeBias": 1
      },
      "trainerTypeIds": [
        "old_school",
        "finisher"
      ],
      "description": "Тут любят тяжёлые руки и короткую драку."
    },
    {
      "id": "usa_vegas_workshop",
      "country": "usa",
      "city": "Las Vegas",
      "name": "Vegas Workshop",
      "cost": 48,
      "specialization": "контракт и витрина",
      "reputation": 68,
      "bonuses": {
        "purseBonus": 18,
        "fameBonus": 2,
        "awayBias": 1
      },
      "trainerTypeIds": [
        "media_operator",
        "sharp_technician"
      ],
      "description": "Зал для тех, кто хочет не только драться, но и продавать имя."
    },
    {
      "id": "usa_brooklyn_grind",
      "country": "usa",
      "city": "Brooklyn",
      "name": "Brooklyn Grind Gym",
      "cost": 35,
      "specialization": "грязная работа и объём",
      "reputation": 51,
      "bonuses": {
        "trainingPoints": 2,
        "safeBias": 1,
        "recoveryHealth": 2
      },
      "trainerTypeIds": [
        "conditioning",
        "old_school"
      ],
      "description": "Старый зал, где бойца делают через пот и режим."
    },
    {
      "id": "russia_yard_team",
      "country": "russia",
      "city": "Moscow",
      "name": "Yard Team",
      "cost": 18,
      "specialization": "жёсткая база",
      "reputation": 44,
      "bonuses": {
        "trainingPoints": 2,
        "toxicGuard": 6,
        "safeBias": 1
      },
      "trainerTypeIds": [
        "old_school",
        "conditioning"
      ],
      "description": "Место для тех, кто вывозит характером и дисциплиной."
    },
    {
      "id": "russia_neva_line",
      "country": "russia",
      "city": "Saint Petersburg",
      "name": "Neva Line",
      "cost": 32,
      "specialization": "дистанция и холодная голова",
      "reputation": 60,
      "bonuses": {
        "trainingPoints": 1,
        "fameBonus": 1,
        "safeBias": 2
      },
      "trainerTypeIds": [
        "sharp_technician",
        "old_school"
      ],
      "description": "Тут любят терпеть, шагать и ловить ошибки."
    },
    {
      "id": "cuba_malecon_school",
      "country": "cuba",
      "city": "Havana",
      "name": "Malecon School",
      "cost": 22,
      "specialization": "ноги и ритм",
      "reputation": 58,
      "bonuses": {
        "recoveryHealth": 3,
        "safeBias": 2,
        "trainingPoints": 1
      },
      "trainerTypeIds": [
        "sharp_technician",
        "conditioning"
      ],
      "description": "Много движения, чистый темп и аккуратный бой."
    },
    {
      "id": "cuba_santiago_rhythm",
      "country": "cuba",
      "city": "Santiago de Cuba",
      "name": "Santiago Rhythm Hall",
      "cost": 27,
      "specialization": "ритм и объём",
      "reputation": 49,
      "bonuses": {
        "trainingPoints": 2,
        "awayBias": 1,
        "fameBonus": 1
      },
      "trainerTypeIds": [
        "conditioning",
        "media_operator"
      ],
      "description": "Школа темпа, дыхания и длинной работы."
    },
    {
      "id": "japan_tokyo_discipline",
      "country": "japan",
      "city": "Tokyo",
      "name": "Tokyo Discipline Club",
      "cost": 55,
      "specialization": "точность и режим",
      "reputation": 66,
      "bonuses": {
        "trainingPoints": 2,
        "toxicGuard": 8,
        "safeBias": 2
      },
      "trainerTypeIds": [
        "sharp_technician",
        "old_school"
      ],
      "description": "Порядок, техника и минимум лишнего шума."
    },
    {
      "id": "japan_osaka_smoke",
      "country": "japan",
      "city": "Osaka",
      "name": "Osaka Smoke Works",
      "cost": 40,
      "specialization": "техника под давлением",
      "reputation": 53,
      "bonuses": {
        "trainingPoints": 1,
        "purseBonus": 6,
        "fameBonus": 1
      },
      "trainerTypeIds": [
        "sharp_technician",
        "media_operator"
      ],
      "description": "Современный зал, где технику гоняют под жёсткий темп."
    },
    {
      "id": "china_shanghai_engine",
      "country": "china",
      "city": "Shanghai",
      "name": "Shanghai Engine",
      "cost": 60,
      "specialization": "объём и мотор",
      "reputation": 61,
      "bonuses": {
        "trainingPoints": 2,
        "awayBias": 1,
        "purseBonus": 7
      },
      "trainerTypeIds": [
        "sharp_technician",
        "conditioning"
      ],
      "description": "Ставка на длинную подготовку и стабильный темп."
    },
    {
      "id": "china_beijing_iron",
      "country": "china",
      "city": "Beijing",
      "name": "Beijing Iron Works",
      "cost": 45,
      "specialization": "жёсткая защита",
      "reputation": 50,
      "bonuses": {
        "safeBias": 1,
        "dangerBias": 1,
        "recoveryHealth": 2
      },
      "trainerTypeIds": [
        "old_school",
        "finisher"
      ],
      "description": "Тут важнее плотность и защита, чем красота боя."
    },
    {
      "id": "uk_london_cellar",
      "country": "uk",
      "city": "London",
      "name": "London Cellar",
      "cost": 72,
      "specialization": "джеб и шаг",
      "reputation": 63,
      "bonuses": {
        "trainingPoints": 1,
        "safeBias": 2,
        "purseBonus": 6
      },
      "trainerTypeIds": [
        "sharp_technician",
        "old_school"
      ],
      "description": "Классический зал под джеб, шаг и дистанцию."
    },
    {
      "id": "uk_manchester_brick",
      "country": "uk",
      "city": "Manchester",
      "name": "Manchester Brick Gym",
      "cost": 50,
      "specialization": "выносливость и характер",
      "reputation": 47,
      "bonuses": {
        "trainingPoints": 2,
        "toxicGuard": 4,
        "homeBias": 1
      },
      "trainerTypeIds": [
        "conditioning",
        "old_school"
      ],
      "description": "Глянец тут не любят. Здесь делают выносливых."
    },
    {
      "id": "philippines_manila_motor",
      "country": "philippines",
      "city": "Manila",
      "name": "Manila Motor House",
      "cost": 100,
      "specialization": "темп и серия",
      "reputation": 57,
      "bonuses": {
        "trainingPoints": 2,
        "awayBias": 1,
        "fameBonus": 1
      },
      "trainerTypeIds": [
        "conditioning",
        "finisher"
      ],
      "description": "Зал для тех, кто хочет задавить мотором."
    },
    {
      "id": "philippines_cebu_storm",
      "country": "philippines",
      "city": "Cebu",
      "name": "Cebu Storm Camp",
      "cost": 85,
      "specialization": "жёсткий спарринг",
      "reputation": 46,
      "bonuses": {
        "trainingPoints": 1,
        "dangerBias": 2,
        "purseBonus": 4
      },
      "trainerTypeIds": [
        "finisher",
        "conditioning"
      ],
      "description": "Много тяжёлых раундов и злой темп."
    }
  ],
  "trainerTypes": [
    {
      "id": "old_school",
      "label": "Старая школа",
      "weeklyFee": 24,
      "specialization": "база, дисциплина и терпение",
      "reputation": 58,
      "bonuses": {
        "trainingPoints": 3,
        "safeBias": 2,
        "toxicGuard": 8,
        "recoveryHealth": 1
      },
      "description": "Ставит фундамент и не любит суету."
    },
    {
      "id": "conditioning",
      "label": "Физподготовка",
      "weeklyFee": 18,
      "specialization": "выносливость, мотор и режим",
      "reputation": 49,
      "bonuses": {
        "trainingPoints": 2,
        "recoveryHealth": 4,
        "stressRelief": 2,
        "safeBias": 1
      },
      "description": "Делает тело крепче и не даёт рассыпаться в бою."
    },
    {
      "id": "sharp_technician",
      "label": "Технарь",
      "weeklyFee": 30,
      "specialization": "точность, тайминг и план на бой",
      "reputation": 64,
      "bonuses": {
        "trainingPoints": 3,
        "purseBonus": 8,
        "safeBias": 1,
        "fameBonus": 1
      },
      "description": "Разбирает бой по кускам и делает всё чище."
    },
    {
      "id": "finisher",
      "label": "Финишёр",
      "weeklyFee": 26,
      "specialization": "мощь и концовка",
      "reputation": 52,
      "bonuses": {
        "dangerBias": 2,
        "koBonus": 20,
        "purseBonus": 4,
        "trainingPoints": 1
      },
      "description": "Любит, когда бой заканчивается до гонга."
    },
    {
      "id": "media_operator",
      "label": "Медийный тренер",
      "weeklyFee": 34,
      "specialization": "шум, картинка и рынок",
      "reputation": 61,
      "bonuses": {
        "fameBonus": 3,
        "purseBonus": 12,
        "awayBias": 1,
        "toxicGuard": -8
      },
      "description": "Помогает расти в имени, но тащит и лишний шум."
    },
    {
      "id": "body_lab",
      "label": "Лаборатория корпуса",
      "weeklyFee": 22,
      "specialization": "корпус и ближний бой",
      "reputation": 51,
      "bonuses": {
        "trainingPoints": 2,
        "dangerBias": 1,
        "recoveryHealth": 1
      },
      "description": "Ставит давление, корпус и тяжёлую рубку рядом."
    }
  ],
  "contractTemplates": [
    {
      "id": "local_handshake",
      "label": "Локальное соглашение",
      "durationWeeks": 6,
      "guaranteedPurse": 85,
      "winBonus": 35,
      "koBonus": 20,
      "fameMultiplier": 1,
      "fightFrequency": 1,
      "toxicRisk": 8,
      "conditionsText": "Спокойный контракт без сюрпризов.",
      "reputationDelta": 1,
      "description": "Простой рабочий контракт на старте."
    },
    {
      "id": "road_grinder",
      "label": "Гастрольный контракт",
      "durationWeeks": 7,
      "guaranteedPurse": 105,
      "winBonus": 45,
      "koBonus": 30,
      "fameMultiplier": 1.1,
      "fightFrequency": 2,
      "toxicRisk": 16,
      "conditionsText": "Больше поездок и плотнее график.",
      "reputationDelta": 2,
      "description": "Денег больше, но и суеты вокруг тоже."
    },
    {
      "id": "spotlight_push",
      "label": "Толчок в витрину",
      "durationWeeks": 8,
      "guaranteedPurse": 125,
      "winBonus": 60,
      "koBonus": 45,
      "fameMultiplier": 1.25,
      "fightFrequency": 2,
      "toxicRisk": 28,
      "conditionsText": "Больше внимания и больше давления.",
      "reputationDelta": 4,
      "description": "Контракт для выхода в свет."
    },
    {
      "id": "shark_clause",
      "label": "Акулий пункт",
      "durationWeeks": 8,
      "guaranteedPurse": 155,
      "winBonus": 75,
      "koBonus": 60,
      "fameMultiplier": 1.15,
      "fightFrequency": 3,
      "toxicRisk": 46,
      "conditionsText": "Много денег, но условия злые.",
      "reputationDelta": 3,
      "description": "Хорошие деньги, плохие пункты."
    }
  ],
  "fightOfferTemplates": [
    {
      "id": "home_safe",
      "label": "Домашний безопасный бой",
      "travel": "home",
      "tier": "safe",
      "description": "Домашний бой с понятным соперником.",
      "purseBase": 70,
      "winBonus": 20,
      "koBonus": 20,
      "fameBase": 6,
      "toxicBase": 6,
      "declineRep": 0,
      "acceptRep": 1
    },
    {
      "id": "home_even",
      "label": "Домашний ровный бой",
      "travel": "home",
      "tier": "even",
      "description": "Нормальная домашняя проверка.",
      "purseBase": 95,
      "winBonus": 30,
      "koBonus": 28,
      "fameBase": 10,
      "toxicBase": 10,
      "declineRep": -1,
      "acceptRep": 2
    },
    {
      "id": "home_danger",
      "label": "Домашний опасный бой",
      "travel": "home",
      "tier": "danger",
      "description": "Сильный соперник, но свои стены рядом.",
      "purseBase": 120,
      "winBonus": 40,
      "koBonus": 36,
      "fameBase": 15,
      "toxicBase": 14,
      "declineRep": -1,
      "acceptRep": 3
    },
    {
      "id": "away_safe",
      "label": "Выездной осторожный бой",
      "travel": "away",
      "tier": "safe",
      "description": "Поездка за опытом без лишнего риска.",
      "purseBase": 85,
      "winBonus": 25,
      "koBonus": 25,
      "fameBase": 9,
      "toxicBase": 12,
      "declineRep": -1,
      "acceptRep": 2
    },
    {
      "id": "away_even",
      "label": "Выездной ровный бой",
      "travel": "away",
      "tier": "even",
      "description": "Ровная проверка в чужом городе.",
      "purseBase": 110,
      "winBonus": 35,
      "koBonus": 32,
      "fameBase": 14,
      "toxicBase": 18,
      "declineRep": -2,
      "acceptRep": 3
    },
    {
      "id": "away_danger",
      "label": "Выездной рискованный бой",
      "travel": "away",
      "tier": "danger",
      "description": "Большой риск, но и громче имя.",
      "purseBase": 145,
      "winBonus": 45,
      "koBonus": 45,
      "fameBase": 19,
      "toxicBase": 24,
      "declineRep": -2,
      "acceptRep": 4
    },
    {
      "id": "rematch_offer",
      "label": "Реванш",
      "travel": "rematch",
      "tier": "even",
      "description": "Прошлый бой не закрыл вопрос.",
      "purseBase": 125,
      "winBonus": 40,
      "koBonus": 35,
      "fameBase": 16,
      "toxicBase": 16,
      "declineRep": -3,
      "acceptRep": 4
    }
  ]
};
