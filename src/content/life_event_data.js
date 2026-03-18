var LIFE_EVENT_DATA = {
  events: [
    {
      id: "rough_room_leak",
      title: "������� ����� ������",
      text: "������ ����� ���������� � ���� ���� �����: ����, ������� � ��������� ���.",
      conditions: { housingIs: "rough", minWeek: 2 },
      weight: 8,
      cooldown: 6,
      repeatable: true,
      choices: [
        __eventChoice("patch_it", "������ ������", "�� �������� �� ����, �� ���� �� ����������� ������� ������.", [
          __resource("money", -16),
          __resource("stress", -3),
          __condition("wear", -2)
        ]),
        __eventChoice("live_with_it", "�����������", "��� ������� ���. ������, ������� ������� � ����� ��� �� ������.", [
          __resource("stress", 4),
          __condition("morale", -3),
          __condition("wear", 2)
        ])
      ]
    },
    {
      id: "rough_neighbors_noise",
      title: "������ �� ���� ������",
      text: "������ ����� � ����� �������� ������� ������ ������� ����� ����������.",
      conditions: { housingIs: "rough", minStress: 20 },
      weight: 7,
      cooldown: 5,
      repeatable: true,
      choices: [
        __eventChoice("snap_back", "���������", "�� ��������� ���� ������, �� �� ������.", [
          __resource("stress", 3),
          __condition("morale", -1)
        ]),
        __eventChoice("walk_it_off", "����� ������������", "���� ������� ������, �� ������ �� ���� �� �� �������� ���������.", [
          __resource("stress", -2),
          __condition("fatigue", 2)
        ])
      ]
    },
    {
      id: "normal_room_small_order",
      title: "������� ������� �������� ��� ���",
      text: "������ ��������� ��������� ����� � �������� ���� ������ ������, ��� ���� ������ ��������.",
      conditions: { housingIs: "normal", maxStress: 70 },
      weight: 5,
      cooldown: 8,
      repeatable: true,
      choices: [
        __eventChoice("keep_order", "������������ �������", "���������� ����� ������� ���� ������.", [
          __resource("stress", -3),
          __condition("morale", 3)
        ], { add: ["keeps_order"] }),
        __eventChoice("ignore_order", "����� ��� ����", "������ �� �������, �� � ���������� ������ �� ������������.", [
          __condition("morale", -1)
        ])
      ]
    },
    {
      id: "comfort_first_good_sleep",
      title: "�������-�� ���������� ���",
      text: "���������� ������� ���������� ����������, ��� �������� ��������� ��������������.",
      conditions: { housingIs: "comfortable", minFatigue: 20 },
      weight: 7,
      cooldown: 8,
      repeatable: true,
      choices: [
        __eventChoice("lean_into_rest", "���� ���� ���������", "���� ������ ���������� ����� �������.", [
          __resource("health", 7),
          __condition("fatigue", -6),
          __condition("morale", 3)
        ]),
        __eventChoice("wake_early", "�� ������ �����", "�� �������� � ����������, �� ��� ������� ������ ���������.", [
          __condition("morale", 1),
          __life("support", 1)
        ])
      ]
    },
    {
      id: "comfort_bills_press",
      title: "������� ����� ������",
      text: "������� ��� ������ ����� ������, �� ������ ����������, ��� ��� �� ���������.",
      conditions: { housingIs: "comfortable", maxMoney: 70 },
      weight: 7,
      cooldown: 6,
      repeatable: true,
      choices: [
        __eventChoice("hold_it", "������ ������", "�� ���������� ������� �����, �� ������ �� ������.", [
          __resource("money", -20),
          __resource("stress", 3)
        ]),
        __eventChoice("downgrade", "������� �� ������� ����", "������� ������, ���� ���������� ����� ������ �� �������.", [
          __life("housingId", 0, "normal"),
          __condition("morale", -3),
          __resource("stress", 1)
        ])
      ]
    },
    {
      id: "friend_pulls_you_out",
      title: "{friend} ����������� ���� � ����",
      text: "{friend} �����, ��� �� ��������� ���������� � ����, � �� ��� ���� � ������ � �������.",
      actors: [{ slot: "friend", role: "friend", required: true }],
      conditions: { requiresRolesAll: ["friend"], maxSupport: 45, minStress: 30 },
      weight: 8,
      cooldown: 6,
      repeatable: true,
      choices: [
        __eventChoice("go_with_friend", "����� � ���", "���� ����� �������� ������������� ����� ���������� ���� � ����������.", [
          __resource("stress", -7),
          __condition("morale", 5),
          __life("support", 8),
          __relation("friend", 5, 1, 4, -2)
        ]),
        __eventChoice("stay_closed", "�������� � ����", "������ ��������� �����, ��� ���������, ��� � ���� ������.", [
          __resource("stress", 3),
          __condition("morale", -4),
          __life("support", -4),
          __relation("friend", -2, 0, -3, 1)
        ])
      ]
    },
    {
      id: "team_dinner_after_camp",
      title: "������� ���� �� ����� �����",
      text: "����� ������ ������ ������� ���������� ������ ������ ��� ������ ����.",
      conditions: { requiresRolesAny: ["trainer", "sparring"], recentActionAny: ["train", "fight"] },
      weight: 7,
      cooldown: 7,
      repeatable: true,
      choices: [
        __eventChoice("join_team", "�����", "������������ ����� ������ ������ ����� � �����.", [
          __resource("money", -12),
          __resource("stress", -5),
          __condition("morale", 4),
          __life("support", 6)
        ]),
        __eventChoice("skip_team", "����������", "�� ���������� ���� ����, �� ������� ������� ����� ����� �������.", [
          __condition("fatigue", -2),
          __life("support", -2)
        ])
      ]
    },
    {
      id: "family_call_holds_you",
      title: "������ �� �������",
      text: "������ ���� �������� ���������� ������ �������, ��� ����� ��������� ������.",
      conditions: { maxSupport: 70, minStress: 18 },
      weight: 8,
      cooldown: 6,
      repeatable: true,
      choices: [
        __eventChoice("answer", "�������� � �� ����������", "�������� ����������� ������, ��� �� �����.", [
          __resource("stress", -6),
          __condition("morale", 5),
          __life("support", 7)
        ], { add: ["family_grounded"] }),
        __eventChoice("rush_it", "�������� ������", "�� ������� ������ �������, �� �� ���� ���� � ���� ������.", [
          __condition("morale", -2),
          __life("support", -2)
        ])
      ]
    },
    {
      id: "missed_family_day",
      title: "����������� �������� ����",
      text: "���� �� ������� �������, ����� ���� ��� ��� ����� � �� ������ ��� ������ ����.",
      conditions: { minWeek: 4, maxSupport: 65, abroadOnly: true },
      weight: 6,
      cooldown: 8,
      repeatable: true,
      choices: [
        __eventChoice("make_time", "����� ����� � ������", "��� �� �������� ����������, �� ������ ���� �����.", [
          __resource("money", -15),
          __condition("morale", 4),
          __life("support", 6)
        ]),
        __eventChoice("let_it_pass", "�������� �� �����", "��������� ���� ������� ��� ���� ����� ������� �����.", [
          __condition("morale", -4),
          __life("support", -5),
          __resource("stress", 3)
        ])
      ]
    },
    {
      id: "quiet_evening_clarity",
      title: "����� ����� �������� �������",
      text: "������ ����������� �� �����, � �������� �������� ���� �������.",
      conditions: { maxSupport: 60, maxStress: 55 },
      weight: 5,
      cooldown: 7,
      repeatable: true,
      choices: [
        __eventChoice("write_plan", "����� � ��������� �� �� ������", "������� � ������ ���������� ������� �����.", [
          __condition("morale", 4),
          __resource("stress", -3)
        ], { add: ["reflective"] }),
        __eventChoice("drift", "������� ����� ��� �����", "��������� ��� �� �����, �� � �� ��������.", [
          __life("support", -1)
        ])
      ]
    },
    {
      id: "hotel_loneliness_abroad",
      title: "����� ����� ����� ������� ��������",
      text: "�� ������� ���� ������ ������ ������ ��� �������.",
      conditions: { abroadOnly: true, maxSupport: 40 },
      weight: 8,
      cooldown: 5,
      repeatable: true,
      choices: [
        __eventChoice("call_home", "�������� � �����", "�� �������������� ����� ����� � ����, ��� ����� ���� ��� �����.", [
          __condition("morale", 4),
          __life("support", 6),
          __resource("stress", -3)
        ]),
        __eventChoice("sit_with_it", "������ � ���� ����", "������ ��� ������ ������ �������.", [
          __resource("stress", 5),
          __condition("morale", -4),
          __life("support", -3)
        ])
      ]
    },
    {
      id: "trainer_sees_stability",
      title: "{trainer} ��������, ��� �� ���� ���������",
      text: "{trainer} ����� ������� ����, �� �����, ����� ����� ������ ���� �������� �������������.",
      actors: [{ slot: "trainer", role: "trainer", required: true }],
      conditions: { requiresRolesAll: ["trainer"], minMorale: 60, minDiscipline: 55 },
      weight: 6,
      cooldown: 10,
      repeatable: true,
      choices: [
        __eventChoice("accept_praise", "������� ��� ��������", "�� �� ���������� ������, �� �� ������� ������ ��� ������� �����.", [
          __condition("morale", 3),
          __relation("trainer", 2, 4, 3, -1)
        ]),
        __eventChoice("ask_for_more", "��������, ��� ������", "������ �������� ���������� � ���� ��� � ��������, ������� �������� ������.", [
          __resource("skillPoints", 4),
          __relation("trainer", 1, 5, 4, 0)
        ])
      ]
    },
    {
      id: "trainer_calls_out_slip",
      title: "{trainer} �����, ��� ��� ���� ���������",
      text: "{trainer} �������� ���� ������ ������, ��� �� ��� ����� ��� ��������.",
      actors: [{ slot: "trainer", role: "trainer", required: true }],
      conditions: { requiresRolesAll: ["trainer"], maxDiscipline: 40, minStress: 40 },
      weight: 7,
      cooldown: 7,
      repeatable: true,
      choices: [
        __eventChoice("take_note", "������� ���������", "��� ��������� �������, �� ��� ���������� ���� � �����.", [
          __condition("morale", 2),
          __life("support", 2),
          __relation("trainer", 1, 3, 3, -2)
        ]),
        __eventChoice("snap_back", "�������� �����", "�������� ������� ��� ����� �� ������ � ����� �� ������.", [
          __condition("morale", -3),
          __relation("trainer", -2, -3, -4, 5)
        ])
      ]
    },
    {
      id: "friend_after_loss",
      title: "{friend} �� ��� ���� ��������� ����� ���������",
      text: "{friend} �������� ��� ������ ���� � ������ ������� �����.",
      actors: [{ slot: "friend", role: "friend", required: true }],
      conditions: { requiresRolesAll: ["friend"], lastActionType: "fight", lastFightResult: "loss" },
      weight: 9,
      cooldown: 6,
      repeatable: true,
      choices: [
        __eventChoice("let_them_in", "�� ����� ���", "��� �� ����� ���������, �� �� ��� ��� �������� ������.", [
          __resource("stress", -6),
          __condition("morale", 5),
          __life("support", 6),
          __relation("friend", 5, 1, 5, -2)
        ]),
        __eventChoice("push_away", "����� ���������", "����� �� �����, �� ������ ���������� ������.", [
          __condition("morale", -5),
          __life("support", -5),
          __relation("friend", -3, 0, -4, 2)
        ])
      ]
    },
    {
      id: "team_after_hard_fight",
      title: "������� ������ ���� ����� ������� ���",
      text: "����� ��-���������� ������ ������ ����� ����� ������� �� �����, � ����������� ����� �����.",
      conditions: { requiresRolesAny: ["trainer", "sparring"], lastActionType: "fight", minWear: 20 },
      weight: 7,
      cooldown: 8,
      repeatable: true,
      choices: [
        __eventChoice("lean_on_team", "�������� ����� ����� � ����", "������ �������� ���� �� ����� �� ������.", [
          __resource("health", 5),
          __resource("stress", -4),
          __life("support", 5)
        ]),
        __eventChoice("keep_mask", "������� ����", "������� �� �����, �� ������ ����� �� ����������.", [
          __condition("morale", -3),
          __life("support", -2)
        ])
      ]
    },
    {
      id: "home_needs_repair",
      title: "����� ����� ����� ������",
      text: "��� �� ����������, ����� �� �� ������ ������� �� ���� ������.",
      conditions: { housingAny: ["rough", "normal"], maxMoney: 90, minWeek: 3 },
      weight: 6,
      cooldown: 7,
      repeatable: true,
      choices: [
        __eventChoice("pay_for_fix", "������� ������ ��������", "��� ������ �� �������, �� ����� �� ������.", [
          __resource("money", -22),
          __resource("stress", -4),
          __condition("morale", 2)
        ]),
        __eventChoice("delay_fix", "�������� ��� �� ������", "�������� ������� � ������� ��� ����� �� ������.", [
          __resource("stress", 4),
          __condition("wear", 2)
        ])
      ]
    },
    {
      id: "rival_smells_isolation",
      title: "{rival} ���������, ��� �� ����",
      text: "{rival} ��������, ����� ������ ���� ���������� ������ ���������, � ����� ������ ����.",
      actors: [{ slot: "rival", role: "rival", required: true }],
      conditions: { requiresRolesAll: ["rival"], maxSupport: 40, minFame: 10 },
      weight: 6,
      cooldown: 8,
      repeatable: true,
      choices: [
        __eventChoice("use_it_as_fuel", "������� �� ����� ������", "���� ��� �����, �� �������� � ����� ������ �����.", [
          __resource("skillPoints", 4),
          __condition("morale", 1),
          __relation("rival", 0, 2, 0, 5)
        ]),
        __eventChoice("let_it_sink", "���������� ������� �������", "�������� ������ ����, ��� � ��� ���� ���� �����.", [
          __condition("morale", -4),
          __resource("stress", 4),
          __life("support", -3)
        ])
      ]
    },
    {
      id: "doctor_sleep_warning",
      title: "{doctor} �������, ��� ���� ����� ������ ���",
      text: "{doctor} ����� ��������, ��� ����� ������� ��� �� �� ���, � �� ����, ��� �� ����� ����� ��������.",
      actors: [{ slot: "doctor", role: "doctor", required: true }],
      conditions: { requiresRolesAll: ["doctor"], housingAny: ["rough", "normal"], minWear: 35 },
      weight: 7,
      cooldown: 10,
      repeatable: true,
      choices: [
        __eventChoice("listen_to_doctor", "��������� � �������", "�� �������, ��� ��� ���� ���� ������ �� �������.", [
          __resource("money", -18),
          __condition("wear", -3),
          __condition("morale", 2)
        ]),
        __eventChoice("brush_it_off", "������� �� ������� ������", "��� ������� �� �������, ���� ���� ����� �� ��������.", [
          __condition("wear", 3),
          __relation("doctor", -1, 0, -2, 2)
        ])
      ]
    },
    {
      id: "family_pride_message",
      title: "������� ����� ���� ����",
      text: "�� ��� ��������� �������� ������. ������ ��� �������� ����� �������� ���������� �������.",
      conditions: { minFame: 14, maxSupport: 80 },
      weight: 5,
      cooldown: 12,
      repeatable: true,
      choices: [
        __eventChoice("take_it_in", "������������ � ��������� �����������", "�� �����������, ��� �� ��������� ����� �� �� ��� ���-�� �������.", [
          __condition("morale", 5),
          __life("support", 5)
        ]),
        __eventChoice("keep_moving", "���������� � ���� ������", "��� �� ����� �����, �� ���������.", [
          __condition("morale", 1)
        ])
      ]
    },
    {
      id: "good_home_good_habits",
      title: "���������� ��� �������� ��������",
      text: "����� ������ ������ �����, ���������� ����� ������ ���������� ��������� ���� ������.",
      conditions: { housingAny: ["normal", "comfortable"], minDiscipline: 50 },
      weight: 5,
      cooldown: 10,
      repeatable: true,
      choices: [
        __eventChoice("keep_routine", "�������� ������", "������ ������������ ����� �������� �������� �� ����.", [
          __condition("morale", 3),
          __resource("stress", -2),
          __resource("skillPoints", 3)
        ], { add: ["life_in_order"] }),
        __eventChoice("ease_off", "���� ���� ������ ������", "������ ���� ������� ��� ������� ������ ������� ��� ����������.", [
          __resource("health", 4),
          __condition("fatigue", -3)
        ])
      ]
    }
  ]
};

