var LIFE_DATA = {
  "housingOptions": [
    {
      "id": "rough",
      "label": "Плохие условия",
      "weeklyCost": 0,
      "weeklyStress": 4,
      "weeklyMorale": -4,
      "weeklyWear": 2,
      "recoveryHealthBonus": -4,
      "recoveryStressRelief": -1,
      "disciplineBonus": -6,
      "description": "Тесно, шумно и нормально не отдохнёшь."
    },
    {
      "id": "normal",
      "label": "Нормальные условия",
      "weeklyCost": 12,
      "weeklyStress": 0,
      "weeklyMorale": 1,
      "weeklyWear": 0,
      "recoveryHealthBonus": 0,
      "recoveryStressRelief": 0,
      "disciplineBonus": 0,
      "description": "Обычный быт без роскоши и без лишней боли."
    },
    {
      "id": "comfortable",
      "label": "Комфортные условия",
      "weeklyCost": 28,
      "weeklyStress": -3,
      "weeklyMorale": 4,
      "weeklyWear": -1,
      "recoveryHealthBonus": 4,
      "recoveryStressRelief": 3,
      "disciplineBonus": 6,
      "description": "Тихо, чисто и легче держать режим."
    }
  ],
  "socialActions": [
    {
      "id": "friend",
      "label": "Встретиться с другом",
      "money": -8,
      "health": 2,
      "stress": -8,
      "support": 8,
      "delta": {
        "fatigue": -2,
        "wear": 0,
        "morale": 5
      },
      "description": "Просто выйти из бойцовской суеты и побыть с другом.",
      "relationEffects": [
        {
          "role": "friend",
          "affinity": 6,
          "respect": 1,
          "trust": 4,
          "tension": -3,
          "note": "����� � ������"
        }
      ]
    },
    {
      "id": "team",
      "label": "Побыть с командой",
      "money": -12,
      "health": 2,
      "stress": -5,
      "support": 6,
      "delta": {
        "fatigue": -1,
        "wear": -1,
        "morale": 4
      },
      "description": "Спокойно посидеть со своими после лагеря.",
      "relationEffects": [
        {
          "role": "trainer",
          "affinity": 2,
          "respect": 3,
          "trust": 2,
          "tension": -1,
          "note": "����� � ��������"
        },
        {
          "role": "sparring",
          "affinity": 3,
          "respect": 2,
          "trust": 1,
          "tension": -1,
          "note": "����� � ��������"
        }
      ]
    },
    {
      "id": "family",
      "label": "Повидать близких",
      "money": -6,
      "health": 2,
      "stress": -7,
      "support": 10,
      "delta": {
        "fatigue": -3,
        "wear": -1,
        "morale": 7
      },
      "description": "Напомнить себе, что жизнь не только про бои.",
      "relationEffects": []
    },
    {
      "id": "solo",
      "label": "Остаться одному",
      "money": 0,
      "health": 4,
      "stress": -4,
      "support": -2,
      "delta": {
        "fatigue": -6,
        "wear": -1,
        "morale": 2
      },
      "description": "Тихая неделя для сна, головы и режима.",
      "relationEffects": []
    }
  ]
};
