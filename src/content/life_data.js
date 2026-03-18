var LIFE_DATA = {
  housingOptions: [
    {
      id: "rough",
      label: "Плохие условия",
      weeklyCost: 0,
      weeklyStress: 4,
      weeklyMorale: -4,
      weeklyWear: 2,
      recoveryHealthBonus: -4,
      recoveryStressRelief: -1,
      disciplineBonus: -6,
      description: "Съёмная комната, шум, теснота и постоянное ощущение, что ты живёшь на краю."
    },
    {
      id: "normal",
      label: "Нормальные условия",
      weeklyCost: 12,
      weeklyStress: 0,
      weeklyMorale: 1,
      weeklyWear: 0,
      recoveryHealthBonus: 0,
      recoveryStressRelief: 0,
      disciplineBonus: 0,
      description: "Стабильный быт без роскоши: можно жить, держать режим и не разваливаться."
    },
    {
      id: "comfortable",
      label: "Комфортные условия",
      weeklyCost: 28,
      weeklyStress: -3,
      weeklyMorale: 4,
      weeklyWear: -1,
      recoveryHealthBonus: 4,
      recoveryStressRelief: 3,
      disciplineBonus: 6,
      description: "Нормальный сон, тишина и порядок. Лагерь дышит свободнее, но платить приходится больше."
    }
  ],

  socialActions: [
    {
      id: "friend",
      label: "Встретиться с другом",
      money: -8,
      health: 2,
      stress: -8,
      support: 8,
      delta: { fatigue: -2, wear: 0, morale: 5 },
      description: "Немного выйти из бойцовского круга и вспомнить, что жизнь шире следующего раунда.",
      relationEffects: [
        { role: "friend", affinity: 6, respect: 1, trust: 4, tension: -3, note: "время с другом" }
      ]
    },
    {
      id: "team",
      label: "Провести время с командой",
      money: -12,
      health: 2,
      stress: -5,
      support: 6,
      delta: { fatigue: -1, wear: -1, morale: 4 },
      description: "Побыть среди своих: поговорить, посмеяться, обсудить бой и лагерь без официоза.",
      relationEffects: [
        { role: "trainer", affinity: 2, respect: 3, trust: 2, tension: -1, note: "время с командой" },
        { role: "sparring", affinity: 3, respect: 2, trust: 1, tension: -1, note: "время с командой" }
      ]
    },
    {
      id: "family",
      label: "Повидать семью / близких",
      money: -6,
      health: 2,
      stress: -7,
      support: 10,
      delta: { fatigue: -3, wear: -1, morale: 7 },
      description: "Вернуться к людям, которые помнят тебя не только по боям и слухам.",
      relationEffects: []
    },
    {
      id: "solo",
      label: "Остаться одному / отдохнуть",
      money: 0,
      health: 4,
      stress: -4,
      support: -2,
      delta: { fatigue: -6, wear: -1, morale: 2 },
      description: "Тихая неделя для сна, режима и головы. Помогает телу, но не укрепляет связи.",
      relationEffects: []
    }
  ]
};
