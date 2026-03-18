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

function __life(key, delta, value) {
  var effect = { type: "life", key: key };
  if (typeof delta === "number") {
    effect.delta = delta;
  }
  if (typeof value !== "undefined") {
    effect.value = value;
  }
  return effect;
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
      title: "������ ������� ������ � �����",
      text: "������ ����� ���� �������, ��� �������� ������.",
      conditions: { maxMoney: 50, minWeek: 2 },
      weight: 8,
      cooldown: 5,
      repeatable: true,
      choices: [
        __eventChoice("pay", "������ �����", "�� ���������� ������ �������� � ���� ����� ������.", [
          __resource("money", -30),
          __resource("stress", -3)
        ], { add: ["paid_rent"], remove: ["rent_delay"] }),
        __eventChoice("delay", "������ �����", "�������� ������ �� ������. ��� ������ ����� ������ � ������.", [
          __resource("stress", 8),
          __condition("morale", -4)
        ], { add: ["rent_delay"] })
      ]
    },
    {
      id: "friend_spare_couch",
      title: "{friend} ���������� �����",
      text: "{friend} �����, ��� � ���� ������ ��� ������, � ���������� ��������������� � ����.",
      actors: [{ slot: "friend", role: "friend", required: true }],
      conditions: { maxMoney: 35, relationAtLeast: [{ role: "friend", affinity: 45, trust: 40 }] },
      weight: 7,
      cooldown: 8,
      repeatable: true,
      choices: [
        __eventChoice("accept", "������� ������", "�� ���������� ������ � ����������� ���� ������� �����.", [
          __resource("stress", -8),
          __condition("morale", 5),
          __relation("friend", 4, 1, 5, -2)
        ], { add: ["accepted_help"] }),
        __eventChoice("refuse", "����������", "�������� ������� ��� ���� ������ � ������ �����������.", [
          __resource("stress", 4),
          __relation("friend", -2, 2, -2, 1)
        ], { add: ["too_proud"] })
      ]
    },
    {
      id: "gym_owner_cash_shift",
      title: "{gym_owner} ����������� �����",
      text: "{gym_owner} ���������� ��� ���� ������ ����� � ����.",
      actors: [{ slot: "gym_owner", role: "gym_owner", required: true }],
      conditions: { maxMoney: 80, requiresRolesAll: ["gym_owner"] },
      weight: 7,
      cooldown: 6,
      repeatable: true,
      choices: [
        __eventChoice("take_shift", "����� ������", "����� ����� ����, �� ������ ���������� �����.", [
          __resource("money", 55),
          __resource("health", -6),
          __resource("stress", 5),
          __condition("fatigue", 8),
          __relation("gym_owner", 1, 4, 2, -1)
        ]),
        __eventChoice("decline_shift", "����������", "�� ���������� ����, �� ��� ��������.", [
          __condition("morale", 1),
          __relation("gym_owner", 0, -2, -1, 2)
        ])
      ]
    },
    {
      id: "broken_wraps_market",
      title: "������ ����� ������ ������",
      text: "������� ��������. ����� ���������� ��� ����� ����������.",
      conditions: { maxMoney: 120, minWeek: 2 },
      weight: 6,
      cooldown: 7,
      repeatable: true,
      choices: [
        __eventChoice("buy_gear", "������ ��������", "�� ���������, �� ���� ������� �������.", [
          __resource("money", -25),
          __condition("wear", -3),
          __condition("morale", 2)
        ]),
        __eventChoice("save_money", "����������", "������ ��������, �� ����� �������� ������������.", [
          __condition("wear", 3),
          __resource("stress", 2)
        ])
      ]
    },
    {
      id: "cheap_street_food",
      title: "��� �� ����",
      text: "����� ����� ����� ������� ��������� � ���������� ���������������.",
      conditions: { maxHealth: 85, minWeek: 2 },
      weight: 6,
      cooldown: 4,
      repeatable: true,
      choices: [
        __eventChoice("eat_clean", "������ ���������", "�� ������� ������, �� ����������� ����� �������.", [
          __resource("money", -18),
          __resource("health", 6),
          __resource("stress", -2)
        ]),
        __eventChoice("eat_cheap", "����� ����� �������", "�� ��������� ������, � �������� ������ �� ��� ���.", [
          __resource("money", 8),
          __resource("health", -4),
          __condition("wear", 2)
        ])
      ]
    },
    {
      id: "sleep_debt_week",
      title: "������ ��� ���",
      text: "���, ����� � ������ ��������� � ���� ������ ���������.",
      conditions: { minFatigue: 35, minStress: 25 },
      weight: 7,
      cooldown: 5,
      repeatable: true,
      choices: [
        __eventChoice("force_rest", "�������� ����", "�� ������ ���� � ����������� ���� �����.", [
          __condition("fatigue", -10),
          __condition("morale", 3)
        ], { add: ["learned_to_rest"] }),
        __eventChoice("push_through", "�����������", "�� �������� �� ���������, �� ���� ���������� ��� � ����.", [
          __condition("fatigue", 10),
          __resource("stress", 5),
          __condition("morale", -3)
        ], { add: ["grinder"] })
      ]
    },
    {
      id: "trainer_double_session",
      title: "{trainer} ����� ������� ������",
      text: "{trainer} ������, ��� ���� ����� ��������� ����� ������ �����.",
      actors: [{ slot: "trainer", role: "trainer", required: true }],
      conditions: { requiresRolesAll: ["trainer"], recentActionAny: ["train"], relationAtLeast: [{ role: "trainer", respect: 45 }] },
      weight: 8,
      cooldown: 6,
      repeatable: true,
      choices: [
        __eventChoice("agree", "�����������", "������ ���������� �������, �� ������ �����, ��� �� �� ����������.", [
          __resource("skillPoints", 6),
          __resource("health", -5),
          __condition("fatigue", 6),
          __relation("trainer", 1, 5, 3, -1)
        ], { add: ["grinder"] }),
        __eventChoice("decline", "�������, ��� ����������", "�� ��������� ���� � ���������� ����� �������.", [
          __condition("fatigue", -4),
          __condition("morale", 2),
          __relation("trainer", 0, -1, 1, 1)
        ])
      ]
    },
    {
      id: "trainer_calls_for_rest",
      title: "{trainer} �����, ��� �� �������",
      text: "{trainer} ����� �������, ��� ��� ����� ��� �������� �����.",
      actors: [{ slot: "trainer", role: "trainer", required: true }],
      conditions: { requiresRolesAll: ["trainer"], minWear: 40 },
      weight: 7,
      cooldown: 8,
      repeatable: true,
      choices: [
        __eventChoice("listen", "��������� �������", "�� ������� ��� ����� � ����������� ������ �� ���������.", [
          __condition("wear", -5),
          __resource("health", 6),
          __condition("morale", 2),
          __relation("trainer", 0, 2, 4, -2)
        ]),
        __eventChoice("ignore", "������������", "�� ������ ������ � ��������������� �����.", [
          __condition("wear", 6),
          __resource("health", -4),
          __relation("trainer", 0, -2, -4, 4)
        ], { add: ["ignores_limits"] })
      ]
    },
    {
      id: "sparring_invitation",
      title: "{sparring} ���� ������ ������",
      text: "{sparring} ���������� �������� ��������.",
      actors: [{ slot: "sparring", role: "sparring", required: true }],
      conditions: { requiresRolesAll: ["sparring"], minHealth: 55 },
      weight: 7,
      cooldown: 5,
      repeatable: true,
      choices: [
        __eventChoice("go_hard", "����� �����", "������ ����� ������, �� ���� ����.", [
          __resource("skillPoints", 5),
          __resource("health", -6),
          __condition("fatigue", 5),
          __relation("sparring", 1, 4, 0, 2)
        ]),
        __eventChoice("keep_light", "������� ����� �����", "�� ��������� ������ ��� ������� �����.", [
          __resource("skillPoints", 2),
          __condition("fatigue", 1),
          __relation("sparring", 0, 1, 2, -1)
        ])
      ]
    },
    {
      id: "rival_barb_public",
      title: "{rival} ������� ���� �� �����",
      text: "{rival} ������� �������� ���, ����� � �������� ������ ���.",
      actors: [{ slot: "rival", role: "rival", required: true }],
      conditions: { requiresRolesAll: ["rival"], minFame: 10 },
      weight: 7,
      cooldown: 6,
      repeatable: true,
      choices: [
        __eventChoice("answer_cold", "�������� ��������", "�� �� ���� ���� ��������� � ��������� �������� ���� �����.", [
          __resource("fame", 2),
          __condition("morale", 1),
          __relation("rival", -1, 3, 0, -1)
        ]),
        __eventChoice("snap_back", "��������� � �����", "����� ��� �����, �� �������� ���������� �����.", [
          __resource("fame", 3),
          __resource("stress", 4),
          __relation("rival", -4, 1, 0, 8)
        ], { add: ["public_spat"] })
      ]
    },
    {
      id: "rival_secret_respect",
      title: "{rival} ����� ������� ��� ���",
      text: "��� ����� {rival} �������, ��� �� ���� ���������.",
      actors: [{ slot: "rival", role: "rival", required: true }],
      conditions: { requiresRolesAll: ["rival"], relationAtLeast: [{ role: "rival", tension: 45, respect: 40 }] },
      weight: 4,
      cooldown: 10,
      repeatable: true,
      choices: [
        __eventChoice("take_respect", "������� ���� ������", "������ ������ �� ������, �� � ��� ���������� ��������.", [
          __relation("rival", 1, 6, 2, -4)
        ], { add: ["earned_rival_respect"] }),
        __eventChoice("twist_knife", "������ ������", "�� ������ ������ � ������� ���� ��� ���.", [
          __resource("fame", 1),
          __relation("rival", -2, 0, -3, 7)
        ])
      ]
    },
    {
      id: "promoter_small_sponsor",
      title: "{promoter} ������� ������ ��������",
      text: "{promoter} ����� ��������� ��������� ��������� ����������� �����.",
      actors: [{ slot: "promoter", role: "promoter", required: true }],
      conditions: { requiresRolesAll: ["promoter"], minFame: 12 },
      weight: 6,
      cooldown: 8,
      repeatable: true,
      choices: [
        __eventChoice("take_it", "�����������", "������ ��������, � ��� ������ ����.", [
          __resource("money", 65),
          __resource("fame", 3),
          __relation("promoter", 1, 2, 4, 0)
        ], { add: ["media_friendly"] }),
        __eventChoice("stay_raw", "�������� �����", "�� �� ������� �����, �� ������ ������ ����.", [
          __condition("morale", 1),
          __relation("promoter", 0, -1, -2, 2)
        ])
      ]
    },
    {
      id: "promoter_dirty_cash",
      title: "{promoter} ���������� ������� ������",
      text: "{promoter} ����� �����, ������� ������ ��������� ������. ����� ��� ��� ����� �� �����.",
      actors: [{ slot: "promoter", role: "promoter", required: true }],
      conditions: { requiresRolesAll: ["promoter"], minFame: 18, biographyFlagsNot: ["kept_clean"] },
      weight: 5,
      cooldown: 12,
      repeatable: true,
      choices: [
        __eventChoice("take_dirty", "����� ������", "��� �������� ������. ������� � �� ��� ������.", [
          __resource("money", 120),
          __resource("stress", 7),
          __relation("promoter", 0, 2, 5, 1)
        ], { add: ["took_dirty_money"], remove: ["kept_clean"] }),
        __eventChoice("refuse_dirty", "����������", "�� ������� ������� ���������, �� ���������� ���������� �����.", [
          __condition("morale", 4),
          __resource("fame", 1),
          __relation("promoter", 0, 1, -3, 3)
        ], { add: ["kept_clean"] })
      ]
    },
    {
      id: "promoter_foreign_card",
      title: "{promoter} ��������� ���������� ���",
      text: "{promoter} �������, ��� �� ��������� ���� ��� ��� ������ ���������� ��������.",
      actors: [{ slot: "promoter", role: "promoter", required: true }],
      conditions: { requiresRolesAll: ["promoter"], abroadOnly: true, minFame: 25 },
      weight: 5,
      cooldown: 10,
      repeatable: true,
      choices: [
        __eventChoice("lean_in", "������� ���", "�� ������������� � ��������� � ���������� ������� � ����.", [
          __resource("money", -25),
          __resource("fame", 6),
          __resource("stress", 3),
          __relation("promoter", 0, 2, 4, 0)
        ]),
        __eventChoice("stay_low", "�������� ����", "�� ������� ������ ����, �� ������� ����� ��������.", [
          __resource("stress", -2),
          __relation("promoter", 0, 0, -1, 1)
        ])
      ]
    },
    {
      id: "journalist_interview",
      title: "{journalist} ����� ��������",
      text: "{journalist} ������ �������� ��������. �� ����� �� ����� �����������.",
      actors: [{ slot: "journalist", role: "journalist", required: true }],
      conditions: { requiresRolesAll: ["journalist"], minFame: 16 },
      weight: 6,
      cooldown: 8,
      repeatable: true,
      choices: [
        __eventChoice("open_up", "���������", "�������� ������� �����, � ���� �������� ������ � ���� �� ������ ����.", [
          __resource("fame", 4),
          __relation("journalist", 2, 1, 4, 0)
        ], { add: ["media_friendly"] }),
        __eventChoice("stay_closed", "�������� ����", "�� ������ ������� �� ������, �� �������� ������� ��������.", [
          __resource("fame", 1),
          __relation("journalist", 0, 0, -2, 2)
        ])
      ]
    },
    {
      id: "journalist_smear",
      title: "{journalist} ������ � �����",
      text: "{journalist} ������� �����, �� ������� ����� ��������. ������ ������� ������������ ����.",
      actors: [{ slot: "journalist", role: "journalist", required: true }],
      conditions: { requiresRolesAll: ["journalist"], minFame: 20, biographyFlagsAny: ["took_dirty_money", "public_spat"] },
      weight: 4,
      cooldown: 12,
      repeatable: true,
      choices: [
        __eventChoice("buy_silence", "�������� ������� ��������", "������� ���������� ����, �� ������ �������.", [
          __resource("money", -60),
          __resource("stress", 3),
          __relation("journalist", -2, 0, -4, 4)
        ]),
        __eventChoice("stand_tall", "������� ����", "��� ��� �� ����, �� �� �� ���������� ��� �������� ����.", [
          __resource("fame", -2),
          __condition("morale", 3),
          __resource("stress", 5)
        ], { add: ["weathered_scandal"] })
      ]
    },
    {
      id: "doctor_discount",
      title: "{doctor} ��� ���������",
      text: "{doctor} �����, ��� �� ��������� �� ������� �����, � ����� ������ ������� ��������.",
      actors: [{ slot: "doctor", role: "doctor", required: true }],
      conditions: { requiresRolesAll: ["doctor"], maxHealth: 65, relationAtLeast: [{ role: "doctor", trust: 35 }] },
      weight: 5,
      cooldown: 10,
      repeatable: true,
      choices: [
        __eventChoice("take_help", "������� ������", "�� ���� �������� ������� ��� ������� ����� �� �������.", [
          __resource("money", -20),
          __resource("health", 10),
          __resource("stress", -3),
          __relation("doctor", 1, 2, 4, -1)
        ]),
        __eventChoice("save_cash", "����������", "������ ��������, � ���� �� ����� �����������.", [
          __resource("money", 10),
          __condition("wear", 3)
        ])
      ]
    },
    {
      id: "doctor_hide_injury",
      title: "{doctor} ����� �������� ��������",
      text: "{doctor} ��������, ��� ����� ������� ����� �� ������� ����� ������� ������.",
      actors: [{ slot: "doctor", role: "doctor", required: true }],
      conditions: { requiresRolesAll: ["doctor"], minFame: 18, maxHealth: 75 },
      weight: 4,
      cooldown: 12,
      repeatable: true,
      choices: [
        __eventChoice("hide_it", "��������", "�� ���������� ��������� ����, �� ���� ������� � ����.", [
          __resource("fame", 2),
          __condition("wear", 5),
          __relation("doctor", 0, 1, 3, 1)
        ], { add: ["hides_injuries"] }),
        __eventChoice("tell_truth", "������� ������", "��� �� ������� ��� �����, ���� ������ ��� ����.", [
          __resource("fame", -1),
          __resource("health", 4),
          __condition("morale", 2)
        ])
      ]
    },
    {
      id: "friend_neighborhood_night",
      title: "{friend} ���� ���������",
      text: "{friend} ����� ���� �� ����� ����� ��� ���� � ��� ���������� � ����.",
      actors: [{ slot: "friend", role: "friend", required: true }],
      conditions: { requiresRolesAll: ["friend"], minStress: 30 },
      weight: 6,
      cooldown: 7,
      repeatable: true,
      choices: [
        __eventChoice("go_out", "����� � ���", "������ ���������� ����, � ����� ������.", [
          __resource("stress", -7),
          __condition("morale", 4),
          __relation("friend", 5, 1, 3, -2)
        ]),
        __eventChoice("stay_locked", "�������� � ����", "�� ���������� �����, �� ����� �������� ���� �� ���� � �����.", [
          __condition("morale", -2),
          __relation("friend", -1, 0, -2, 1)
        ])
      ]
    },
    {
      id: "friend_needs_cash",
      title: "{friend} ��� ����� � �������",
      text: "{friend} ������ ������ ��� �������, � ��� �� �������� ��� ������.",
      actors: [{ slot: "friend", role: "friend", required: true }],
      conditions: { requiresRolesAll: ["friend"], minMoney: 40 },
      weight: 5,
      cooldown: 10,
      repeatable: true,
      choices: [
        __eventChoice("lend", "���� �����", "�� �������� ���, ��� � ���� � ��� �� ������ ����� ����.", [
          __resource("money", -25),
          __relation("friend", 4, 1, 5, -2)
        ], { add: ["stood_by_friend"] }),
        __eventChoice("refuse", "��������", "�� ���������� ������, �� ������ �� ���� �� ����������.", [
          __relation("friend", -4, 0, -5, 3),
          __condition("morale", -1)
        ])
      ]
    },
    {
      id: "friend_covers_for_you",
      title: "{friend} ���������� ����",
      text: "{friend} ��� ������ ���� ��������� ����, ������� �� ��� �� ������� �������.",
      actors: [{ slot: "friend", role: "friend", required: true }],
      conditions: { requiresRolesAll: ["friend"], maxStress: 70, relationAtLeast: [{ role: "friend", trust: 50 }] },
      weight: 4,
      cooldown: 12,
      repeatable: true,
      choices: [
        __eventChoice("accept_cover", "�������", "��� ��������� ����, ������� ������ ���� �� ����� ������� �����.", [
          __resource("stress", -5),
          __condition("morale", 4),
          __relation("friend", 3, 0, 5, -2)
        ]),
        __eventChoice("pay_back_now", "����� ������", "�� �� ������ ������ � ����� ���� ����� ������.", [
          __resource("money", -20),
          __relation("friend", 1, 2, 2, -1)
        ])
      ]
    },
    {
      id: "gym_owner_help_kid",
      title: "{gym_owner} ������ �������� ������",
      text: "{gym_owner} ������ ������ ������, ������� ������ ������ � ���.",
      actors: [{ slot: "gym_owner", role: "gym_owner", required: true }],
      conditions: { requiresRolesAll: ["gym_owner"], homeOnly: true },
      weight: 5,
      cooldown: 9,
      repeatable: true,
      choices: [
        __eventChoice("help", "��������� �����", "�� �� ��������� �� ���� �����, �� ����� ��� ������.", [
          __resource("fame", 2),
          __condition("morale", 3),
          __relation("gym_owner", 1, 4, 2, -1)
        ], { add: ["helped_kid"] }),
        __eventChoice("skip", "�����������", "�� ���������� ��� ������ � ���� ������� ������������ ������ ����.", [
          __relation("gym_owner", 0, -3, -1, 2)
        ])
      ]
    },
    {
      id: "gym_owner_demands_respect",
      title: "{gym_owner} ����������, ��� ��� ���",
      text: "{gym_owner} �� �����, ����� ������ ������� ����� ���� ��� �������� � ����.",
      actors: [{ slot: "gym_owner", role: "gym_owner", required: true }],
      conditions: { requiresRolesAll: ["gym_owner"], recentActionAny: ["work", "train"] },
      weight: 4,
      cooldown: 8,
      repeatable: true,
      choices: [
        __eventChoice("show_respect", "������� ��� ����", "�� ������������� � ��� � ���������� ���� ��� ������ ����.", [
          __condition("morale", 2),
          __relation("gym_owner", 0, 5, 2, -1)
        ]),
        __eventChoice("brush_off", "�����������", "����� ������ � ������, �� ������� � ������ �������.", [
          __relation("gym_owner", 0, -4, 0, 4)
        ])
      ]
    },
    {
      id: "road_customs_hassle",
      title: "������ ����� ��������",
      text: "������� � ��� �� ������ ����� ������. ������ ��� ����� � ���������� ����.",
      conditions: { abroadOnly: true, recentActionAny: ["travel"] },
      weight: 7,
      cooldown: 8,
      repeatable: true,
      choices: [
        __eventChoice("pay_fast", "������ ������", "������ ������, �� �� �� ������� � ������ ������ �������.", [
          __resource("money", -20),
          __resource("stress", 2)
        ]),
        __eventChoice("endure", "�����������", "�� ��������� ������, �� ������� ������� � ����������.", [
          __resource("stress", 6),
          __condition("fatigue", 5)
        ], { add: ["road_hardened"] })
      ]
    },
    {
      id: "new_city_loneliness",
      title: "����� ����� �� ����� ���������",
      text: "���� ����� ������ �����, ����� ����� ����� ������ �������� ��������.",
      conditions: { abroadOnly: true, minStress: 30 },
      weight: 6,
      cooldown: 8,
      repeatable: true,
      choices: [
        __eventChoice("explore", "����� � �����", "����� ����� ���������� ���� ����� �����.", [
          __resource("stress", -4),
          __condition("morale", 3)
        ], { add: ["road_hardened"] }),
        __eventChoice("hide", "��������� � ����", "�� ���������� ����, �� ����� ����� ����� �������.", [
          __resource("stress", 4),
          __condition("morale", -3)
        ], { add: ["homesick"] })
      ]
    },
    {
      id: "abroad_local_respect",
      title: "�� ������� ���� �������� ��������",
      text: "�� ����� ���������� �������� ����� ������ ���������� �������� � ����.",
      conditions: { abroadOnly: true, minFame: 18 },
      weight: 5,
      cooldown: 8,
      repeatable: true,
      choices: [
        __eventChoice("lean_into_it", "���������� �����", "�� ����������� �������� � ���������� ��������� �����.", [
          __resource("fame", 4),
          __resource("stress", 2)
        ]),
        __eventChoice("stay_workman", "�������� �������", "�� �� ����������� ���, �� ������ ����� ����� ��������.", [
          __condition("morale", 2)
        ], { add: ["quiet_worker"] })
      ]
    },
    {
      id: "home_call_from_family",
      title: "��� ������ � ������������ ������",
      text: "���� �������� ������ �� ���� ������� �������, ����� �� � ��� ���������.",
      conditions: { homeOnly: true, minStress: 40 },
      weight: 5,
      cooldown: 10,
      repeatable: true,
      choices: [
        __eventChoice("pick_up", "����� ������", "�������� �� ������ �����, �� ���������� ����� ����� ��� ������.", [
          __resource("stress", -6),
          __condition("morale", 4)
        ], { add: ["stays_connected"] }),
        __eventChoice("ignore", "��������", "�� ���������� ��� �� ����� � ���������� ��� ������, ��� ����� ��.", [
          __resource("stress", 3),
          __condition("morale", -4)
        ])
      ]
    },
    {
      id: "after_win_buzz",
      title: "����� ������ ����� �����",
      text: "������ ��� �� ������ ������, � ��������� ��� ������������ ��� ���.",
      conditions: { lastActionType: "fight", lastFightResult: "win" },
      weight: 7,
      cooldown: 5,
      repeatable: true,
      choices: [
        __eventChoice("ride_buzz", "���������� �����", "�� ���������� ����������� ������ � ���������� ���� ������.", [
          __resource("fame", 4),
          __condition("morale", 3)
        ], { add: ["public_name"] }),
        __eventChoice("stay_quiet", "�� ������", "�� �� �������������� ������� � ���������� � ������ ������.", [
          __resource("stress", -2),
          __condition("morale", 1)
        ])
      ]
    },
    {
      id: "after_loss_doubt",
      title: "����� ��������� �� ������ �����",
      text: "����� ������� ��� ���� ��������� ���� �������� ������� ��� ��������.",
      conditions: { lastActionType: "fight", lastFightResult: "loss" },
      weight: 8,
      cooldown: 5,
      repeatable: true,
      choices: [
        __eventChoice("watch_tape", "��������� ���", "��� ������, �� �������. �� ��������� ���������� ������.", [
          __resource("skillPoints", 5),
          __condition("morale", -1)
        ], { add: ["learns_from_losses"] }),
        __eventChoice("avoid_it", "�� �������� �����", "�� ��������� ������ ����, �� ��� ������� � ������.", [
          __resource("stress", 5),
          __condition("morale", -4)
        ])
      ]
    },
    {
      id: "after_ko_noise",
      title: "����� ������� ��� ������� ������",
      text: "����� ��� ������������� �����, ��� ��� ��� �� ����� ������ ��������.",
      conditions: { lastActionType: "fight", lastFightMethodContains: "KO" },
      weight: 6,
      cooldown: 8,
      repeatable: true,
      choices: [
        __eventChoice("embrace", "������� ���", "�� �� ��������� �� ������ ��������, ������� ����� ��������� ����.", [
          __resource("fame", 5),
          __resource("stress", 2)
        ], { add: ["finisher"] }),
        __eventChoice("downplay", "������� ������", "�� ���������� �� ���������� ��� � ����� �� ����.", [
          __condition("morale", 2),
          __resource("stress", -1)
        ])
      ]
    },
    {
      id: "trainer_rebuild_after_loss",
      title: "{trainer} ����� ������� ���� ����� �������",
      text: "{trainer} �� ����� �����, �� ����� �������� � ��������� ����� ������� ����������.",
      actors: [{ slot: "trainer", role: "trainer", required: true }],
      conditions: { requiresRolesAll: ["trainer"], lastActionType: "fight", lastFightResult: "loss" },
      weight: 7,
      cooldown: 8,
      repeatable: true,
      choices: [
        __eventChoice("trust_process", "���������� ��������", "�� ����� ������� � ���� ������ � ��������.", [
          __resource("skillPoints", 4),
          __condition("morale", 4),
          __relation("trainer", 2, 3, 5, 0)
        ]),
        __eventChoice("close_off", "���������", "�� ������� � ����. ������ ��� ����� � ����������.", [
          __resource("stress", 4),
          __relation("trainer", 0, 0, -4, 4)
        ])
      ]
    },
    {
      id: "promoter_after_win_offer",
      title: "{promoter} �������������� ����� ������",
      text: "���������� ����� ����� ������ ���� ������ ������.",
      actors: [{ slot: "promoter", role: "promoter", required: true }],
      conditions: { requiresRolesAll: ["promoter"], lastActionType: "fight", lastFightResult: "win" },
      weight: 6,
      cooldown: 8,
      repeatable: true,
      choices: [
        __eventChoice("meet", "�����������", "�� ���������� ������� ����� � ��������� ���� ������ ������������.", [
          __resource("fame", 2),
          __relation("promoter", 1, 3, 4, 0)
        ]),
        __eventChoice("stay_busy", "�� �����������", "�� �������� � ������, �� ��������� ��������� ���������.", [
          __condition("morale", 1),
          __relation("promoter", 0, 0, -2, 1)
        ])
      ]
    },
    {
      id: "rival_after_win_callout",
      title: "{rival} ������� ���������� ����",
      text: "����� ����� ������ {rival} ����� ��������� ���� � ���� ������.",
      actors: [{ slot: "rival", role: "rival", required: true }],
      conditions: { requiresRolesAll: ["rival"], lastActionType: "fight", lastFightResult: "win" },
      weight: 6,
      cooldown: 8,
      repeatable: true,
      choices: [
        __eventChoice("accept_heat", "������� ���", "�� �� ������� �� ���������� � ������� ������� �������.", [
          __resource("fame", 3),
          __relation("rival", 0, 2, 0, 7)
        ], { add: ["rival_feud"] }),
        __eventChoice("freeze_out", "�������� ��� ������", "�� �� ���� ��� �����, �� ���������� �� ��������.", [
          __resource("stress", -1),
          __relation("rival", 0, -1, 0, 2)
        ])
      ]
    },
    {
      id: "empty_wallet_temptation",
      title: "������� ������ ����� �����",
      text: "����� ������ ������, ��������� ����� �������� ��������� ������ ��������.",
      conditions: { maxMoney: 25, minWeek: 3 },
      weight: 7,
      cooldown: 10,
      repeatable: true,
      choices: [
        __eventChoice("take_risk_cash", "����� � ������ ����", "������ �������� ������, �� ��������� �� ����� �� ����������.", [
          __resource("money", 70),
          __resource("stress", 8)
        ], { add: ["street_debt", "took_dirty_money"] }),
        __eventChoice("stay_clean", "�������� ������", "������, �� �� ����� �� ���� ����� �������� �� ���� ���������.", [
          __condition("morale", 4)
        ], { add: ["kept_clean"] })
      ]
    },
    {
      id: "quiet_self_reflection",
      title: "����� ������ � ������",
      text: "������ ����� ������� �������� ��� �� � ������ ������, � � �����.",
      conditions: { minStress: 50, maxMorale: 55 },
      weight: 6,
      cooldown: 8,
      repeatable: true,
      choices: [
        __eventChoice("write_it_down", "��������� �� �� ������", "�� ��������� ������ ������ � ����������� ���� �����.", [
          __resource("stress", -6),
          __condition("morale", 5)
        ], { add: ["reflective"] }),
        __eventChoice("bury_it", "�������� ������", "�� ����������� ������ �� �������, �� ������ ���������� ������.", [
          __resource("stress", 4),
          __condition("morale", -3)
        ])
      ]
    },
    {
      id: "worn_body_warning",
      title: "���� ������ ���������",
      text: "����������� ����� ��� �� �������� � ���������� � ���� � ������� ���������.",
      conditions: { minWear: 55 },
      weight: 8,
      cooldown: 8,
      repeatable: true,
      choices: [
        __eventChoice("respect_body", "�������� ����", "�� ���� ��������� ���� ������ �� ��������� ������� ������.", [
          __condition("wear", -6),
          __resource("health", 5),
          __condition("morale", 2)
        ]),
        __eventChoice("ignore_body", "������ ������", "�� ��������� ����� �������� ��� �������. ���� �� ����� �����.", [
          __condition("wear", 5),
          __resource("health", -5),
          __resource("stress", 3)
        ], { add: ["ignores_limits"] })
      ]
    },
    {
      id: "grinder_breakthrough",
      title: "������ �������� ��������",
      text: "������ ���������� ���� �������� �������� �������� ��������.",
      conditions: { recentActionAny: ["train"], biographyFlagsAny: ["grinder"], minWeek: 4 },
      weight: 5,
      cooldown: 12,
      repeatable: true,
      choices: [
        __eventChoice("lock_in", "���������", "�� ���������� �������� � ����������, ��� ���� �� ��� ������.", [
          __resource("skillPoints", 8),
          __condition("morale", 4)
        ]),
        __eventChoice("overcook", "����������� ������ ������", "�� ������ ������� ��� � ������� �����������.", [
          __resource("skillPoints", 5),
          __condition("fatigue", 6),
          __resource("health", -3)
        ])
      ]
    },
    {
      id: "community_support",
      title: "����� ���������� ������",
      text: "����� ��� ����� ������ ��� ������, ����� �������� ������������ ���� ����� ���.",
      conditions: { homeOnly: true, minFame: 25, biographyFlagsAny: ["helped_kid", "stood_by_friend", "kept_clean"] },
      weight: 4,
      cooldown: 14,
      once: true,
      choices: [
        __eventChoice("accept", "������� ���������", "�� ����������, ��� ������ ��� �� ������ ��� ����.", [
          __resource("fame", 5),
          __condition("morale", 5),
          __resource("stress", -3)
        ], { add: ["community_backing"] }),
        __eventChoice("stay_hungry", "�������� ��������", "�� �� ���� ���� ������������ ���� �� ���� ����� ������.", [
          __resource("skillPoints", 4),
          __condition("morale", 1)
        ], { add: ["community_backing"] })
      ]
    },
  ]
};

