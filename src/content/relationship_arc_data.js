var RELATIONSHIP_ARC_DATA = {
  templates: [
    {
      id: "rival_after_decision",
      label: "Искры после спорного боя",
      weight: 4,
      repeatable: false,
      startConditions: {
        lastActionType: "fight",
        lastFightMethodContains: "Решение",
        requiresRolesAll: ["rival"],
        minFame: 8
      },
      actors: [
        { slot: "rival", role: "rival", required: true, sortBy: "tension", sortDir: "desc" },
        { slot: "journalist", role: "journalist", required: false }
      ],
      stages: [
        {
          id: "spark",
          title: "{rival} не отпускает решение",
          text: "После спорного боя {rival} разгоняет разговоры о том, что вердикт пахнет плохо. Вокруг имени начинает собираться шум.",
          choices: [
            {
              id: "answer",
              label: "Ответить жёстко",
              resultText: "Ты открыто отвечаешь и подбрасываешь дров в конфликт.",
              effects: [
                { type: "resource", key: "fame", delta: 3 },
                { type: "resource", key: "stress", delta: 4 },
                { type: "relation", slot: "rival", tension: 10, respect: 1 },
                { type: "relation", slot: "journalist", respect: 1 }
              ],
              tagChanges: {
                add: ["public_spat"],
                npcFlags: [{ slot: "rival", add: ["called_out_player"] }],
                arcTags: { add: ["heated", "public"] }
              },
              nextStageId: "media"
            },
            {
              id: "cool",
              label: "Сохранять хладнокровие",
              resultText: "Ты не берёшь микрофон и оставляешь сопернику право кричать в пустоту.",
              effects: [
                { type: "resource", key: "stress", delta: -2 },
                { type: "relation", slot: "rival", respect: 2, tension: -2 },
                { type: "relation", slot: "journalist", trust: -1 }
              ],
              tagChanges: {
                add: ["kept_calm_under_fire"],
                arcTags: { add: ["cold"] }
              },
              nextStageId: "media"
            }
          ]
        },
        {
          id: "media",
          trigger: {
            minWeeksSinceLastStage: 1
          },
          title: "Шум вокруг {rival} набирает ход",
          text: "{journalist} чувствует запах истории и пытается сделать из этого полноценную афишу. Даже если ты молчал, тема уже гуляет по району.",
          choices: [
            {
              id: "feed_fire",
              label: "Дать резкую цитату",
              resultText: "Пара точных слов, и история превращается в серию заголовков.",
              effects: [
                { type: "resource", key: "fame", delta: 4 },
                { type: "resource", key: "stress", delta: 3 },
                { type: "relation", slot: "journalist", affinity: 2, respect: 2 },
                { type: "relation", slot: "rival", tension: 7 }
              ],
              tagChanges: {
                add: ["headline_war"],
                arcTags: { add: ["headline"] }
              },
              nextStageId: "showdown"
            },
            {
              id: "decline",
              label: "Не кормить прессу",
              resultText: "Ты не даёшь шоу бесплатной пресс-службе и оставляешь конфликт недосказанным.",
              effects: [
                { type: "resource", key: "stress", delta: -1 },
                { type: "relation", slot: "journalist", respect: -1, tension: 1 },
                { type: "relation", slot: "rival", respect: 1 }
              ],
              tagChanges: {
                arcTags: { add: ["private"] }
              },
              nextStageId: "showdown"
            }
          ]
        },
        {
          id: "showdown",
          trigger: {
            minWeeksSinceLastStage: 1
          },
          title: "{rival} хочет закрыть вопрос",
          text: "{rival} больше не хочет жить в полутоне. Нужен либо реванш, либо точка.",
          choices: [
            {
              id: "take_rematch",
              label: "Принять реванш как личное дело",
              resultText: "Ты делаешь реванш личной историей и поднимаешь ставки.",
              effects: [
                { type: "resource", key: "fame", delta: 2 },
                { type: "relation", slot: "rival", respect: 3, tension: 6 },
                { type: "rivalry", mode: "promote", deltaTension: 18, stakes: 10, pendingRematch: true }
              ],
              tagChanges: {
                add: ["grudge_match"],
                arcTags: { add: ["conflict", "rematch_ready"] }
              },
              outcome: "feud"
            },
            {
              id: "walk_away",
              label: "Закрыть тему и идти дальше",
              resultText: "Ты не даёшь чужой злости диктовать маршрут своей карьеры.",
              effects: [
                { type: "resource", key: "morale", delta: 2 },
                { type: "relation", slot: "rival", respect: 1, tension: -4 }
              ],
              tagChanges: {
                add: ["chose_career_over_drama"],
                arcTags: { add: ["closed"] }
              },
              outcome: "cooled"
            }
          ]
        }
      ]
    },
    {
      id: "friend_turns_enemy",
      label: "Друг треснул по шву",
      weight: 3,
      repeatable: false,
      startConditions: {
        requiresRolesAll: ["friend"],
        relationAtLeast: [{ role: "friend", tension: 52 }],
        maxSupport: 72
      },
      actors: [
        { slot: "friend", role: "friend", required: true, sortBy: "tension", sortDir: "desc" }
      ],
      stages: [
        {
          id: "distance",
          title: "{friend} больше не говорит как раньше",
          text: "В голосе {friend} стало меньше тепла и больше старых обид. То, что раньше проходило шуткой, теперь цепляет.",
          choices: [
            {
              id: "reach_out",
              label: "Попробовать сгладить угол",
              resultText: "Ты первым делаешь шаг и показываешь, что связь ещё можно спасти.",
              effects: [
                { type: "relation", slot: "friend", affinity: 5, trust: 4, tension: -5 },
                { type: "resource", key: "stress", delta: -2 }
              ],
              tagChanges: {
                arcTags: { add: ["repair_attempt"] }
              },
              nextStageId: "split"
            },
            {
              id: "snap_back",
              label: "Ответить колко",
              resultText: "Ты не проглатываешь выпад и только увеличиваешь трещину.",
              effects: [
                { type: "relation", slot: "friend", affinity: -6, trust: -7, tension: 8 },
                { type: "resource", key: "stress", delta: 3 }
              ],
              tagChanges: {
                add: ["friend_fracture"],
                npcFlags: [{ slot: "friend", add: ["resents_player"] }],
                arcTags: { add: ["hostile"] }
              },
              nextStageId: "split"
            }
          ]
        },
        {
          id: "split",
          trigger: {
            minWeeksSinceLastStage: 1
          },
          title: "{friend} выбирает сторону",
          text: "{friend} больше не держится в серой зоне. Или вы чините связь, или этот человек уходит в лагерь, где тебя вспоминают без тепла.",
          choices: [
            {
              id: "repair",
              label: "Сесть и честно поговорить",
              resultText: "Разговор неприятный, но он возвращает опору под ноги.",
              effects: [
                { type: "relation", slot: "friend", affinity: 8, trust: 6, tension: -8 },
                { type: "life", key: "support", delta: 6 }
              ],
              tagChanges: {
                remove: ["friend_fracture"],
                npcFlags: [{ slot: "friend", remove: ["resents_player"] }],
                arcTags: { add: ["repaired"] }
              },
              outcome: "repaired"
            },
            {
              id: "break",
              label: "Рубить связь",
              resultText: "Старый друг перестаёт быть тылом и становится частью чужого шума.",
              effects: [
                { type: "relation", slot: "friend", affinity: -10, trust: -10, tension: 12 },
                { type: "life", key: "support", delta: -8 },
                { type: "resource", key: "stress", delta: 4 }
              ],
              tagChanges: {
                add: ["friend_lost"],
                npcFlags: [{ slot: "friend", add: ["former_friend", "turned_enemy"] }],
                relationTags: [{ slot: "friend", add: ["hostile", "broken"] }],
                arcTags: { add: ["conflict"] }
              },
              outcome: "broken"
            }
          ]
        }
      ]
    },
    {
      id: "trainer_walks_out",
      label: "Тренер смотрит на другой угол",
      weight: 3,
      repeatable: false,
      startConditions: {
        requiresRolesAll: ["trainer"],
        relationAtLeast: [{ role: "trainer", tension: 55 }],
        minFame: 10
      },
      actors: [
        { slot: "trainer", role: "trainer", required: true, sortBy: "tension", sortDir: "desc" }
      ],
      stages: [
        {
          id: "strain",
          title: "{trainer} устал тянуть тебя за шиворот",
          text: "{trainer} всё чаще говорит о дисциплине так, будто речь уже не о неделе, а о твоём потолке.",
          choices: [
            {
              id: "double_down",
              label: "Ужесточить режим и слушать угол",
              resultText: "Ты принимаешь давление и показываешь, что ещё можешь быть удобным бойцом для лагеря.",
              effects: [
                { type: "condition", key: "morale", delta: -2 },
                { type: "condition", key: "fatigue", delta: 2 },
                { type: "relation", slot: "trainer", respect: 4, trust: 3, tension: -5 }
              ],
              tagChanges: {
                add: ["ate_hard_camp"],
                arcTags: { add: ["saved"] }
              },
              outcome: "stabilized"
            },
            {
              id: "brush_off",
              label: "Отмахнуться и идти по-своему",
              resultText: "Тренер слышит в этом не характер, а нежелание работать с углом.",
              effects: [
                { type: "relation", slot: "trainer", trust: -8, tension: 8 },
                { type: "resource", key: "stress", delta: 2 }
              ],
              tagChanges: {
                npcFlags: [{ slot: "trainer", add: ["eyeing_other_corner"] }],
                arcTags: { add: ["unstable"] }
              },
              nextStageId: "departure"
            }
          ]
        },
        {
          id: "departure",
          trigger: {
            minWeeksSinceLastStage: 1
          },
          title: "{trainer} получил другой вариант",
          text: "{trainer} не скрывает, что его зовут в чужой лагерь. Вопрос уже не в слухах, а в твоей реакции.",
          choices: [
            {
              id: "fight_for_him",
              label: "Попробовать удержать",
              resultText: "Ты вовремя признаёшь, что потеря угла ударит по карьере сильнее гордости.",
              effects: [
                { type: "resource", key: "money", delta: -25 },
                { type: "relation", slot: "trainer", trust: 5, respect: 3, tension: -4 }
              ],
              tagChanges: {
                add: ["paid_to_keep_corner"]
              },
              outcome: "kept"
            },
            {
              id: "let_go",
              label: "Отпустить и искать новый угол",
              resultText: "Ты остаёшься без привычного штаба и вынужден перестраивать лагерь на ходу.",
              effects: [
                { type: "resource", key: "stress", delta: 5 },
                { type: "life", key: "support", delta: -4 }
              ],
              tagChanges: {
                add: ["trainer_left"],
                npcFlags: [{ slot: "trainer", add: ["left_camp", "working_elsewhere"] }],
                relationTags: [{ slot: "trainer", add: ["cold"] }],
                arcTags: { add: ["career_loss"] }
              },
              outcome: "lost_trainer"
            }
          ]
        }
      ]
    },
    {
      id: "journalist_feeds_fire",
      label: "Журналист строит конфликт",
      weight: 3,
      repeatable: false,
      startConditions: {
        requiresRolesAll: ["journalist", "rival"],
        minFame: 14,
        biographyFlagsAny: ["public_spat", "headline_war"]
      },
      actors: [
        { slot: "journalist", role: "journalist", required: true },
        { slot: "rival", role: "rival", required: true, sortBy: "tension", sortDir: "desc" }
      ],
      stages: [
        {
          id: "hook",
          title: "{journalist} предлагает красивую грязь",
          text: "{journalist} пришёл не за правдой, а за углом, который продаётся. Имя {rival} уже лежит у него в кармане.",
          choices: [
            {
              id: "play_along",
              label: "Дать материал для конфликта",
              resultText: "Интервью разлетается и делает вас обоих частью афиши.",
              effects: [
                { type: "resource", key: "fame", delta: 5 },
                { type: "resource", key: "stress", delta: 4 },
                { type: "relation", slot: "journalist", respect: 2, trust: 1 },
                { type: "relation", slot: "rival", tension: 7 }
              ],
              tagChanges: {
                add: ["media_feud"],
                arcTags: { add: ["public", "conflict"] }
              },
              nextStageId: "fallout"
            },
            {
              id: "deny",
              label: "Оставить конфликт без цитаты",
              resultText: "Ты срезаешь журналисту лёгкий угол, но теряешь часть шума.",
              effects: [
                { type: "resource", key: "stress", delta: -1 },
                { type: "relation", slot: "journalist", trust: -2, tension: 2 }
              ],
              tagChanges: {
                arcTags: { add: ["restrained"] }
              },
              nextStageId: "fallout"
            }
          ]
        },
        {
          id: "fallout",
          trigger: {
            minWeeksSinceLastStage: 1
          },
          title: "Шум требует цены",
          text: "После материала вокруг тебя стало громче. Кто-то видит в этом рост, кто-то — дешёвую драму.",
          choices: [
            {
              id: "embrace",
              label: "Использовать шум как рычаг",
              resultText: "Ты принимаешь, что часть карьеры теперь строится не только на раундах, но и на заголовках.",
              effects: [
                { type: "resource", key: "fame", delta: 3 },
                { type: "relation", slot: "journalist", affinity: 2, respect: 1 },
                { type: "relation", slot: "rival", tension: 4 }
              ],
              tagChanges: {
                add: ["learned_media_game"]
              },
              outcome: "weaponized"
            },
            {
              id: "reset",
              label: "Свернуть шум и вернуться к делу",
              resultText: "Ты режешь лишний фон и не даёшь медийке полностью проглотить бойцовскую линию.",
              effects: [
                { type: "resource", key: "stress", delta: -3 },
                { type: "relation", slot: "journalist", trust: -1 },
                { type: "relation", slot: "rival", tension: -2, respect: 1 }
              ],
              tagChanges: {
                add: ["closed_media_loop"]
              },
              outcome: "cooled"
            }
          ]
        }
      ]
    },
    {
      id: "promoter_false_promise",
      label: "Промоутер подвёл со шансом",
      weight: 3,
      repeatable: false,
      startConditions: {
        requiresRolesAll: ["promoter"],
        minFame: 12,
        maxMoney: 220,
        recentActionAny: ["fight"]
      },
      actors: [
        { slot: "promoter", role: "promoter", required: true, sortBy: "trust", sortDir: "asc" }
      ],
      stages: [
        {
          id: "promise",
          title: "{promoter} рисует слишком красивый маршрут",
          text: "{promoter} обещает скорый рывок, но детали плавают. Ты чувствуешь запах риска, но шанс всё ещё манит.",
          choices: [
            {
              id: "trust",
              label: "Поверить и вложиться",
              resultText: "Ты ставишь на обещание и идёшь за ним дальше.",
              effects: [
                { type: "resource", key: "money", delta: -20 },
                { type: "relation", slot: "promoter", trust: 3, respect: 1 }
              ],
              tagChanges: {
                arcTags: { add: ["invested"] }
              },
              nextStageId: "drop"
            },
            {
              id: "hedge",
              label: "Держать дистанцию",
              resultText: "Ты не рвёшь связь, но и не ставишь на обещание всё.",
              effects: [
                { type: "relation", slot: "promoter", trust: -1 },
                { type: "resource", key: "stress", delta: -1 }
              ],
              tagChanges: {
                arcTags: { add: ["skeptical"] }
              },
              nextStageId: "drop"
            }
          ]
        },
        {
          id: "drop",
          trigger: {
            minWeeksSinceLastStage: 1
          },
          title: "Шанса нет, а осадок есть",
          text: "Обещанный шаг в карьере не приходит. {promoter} тянет время, а ты остаёшься с вопросом, что было правдой, а что — наживкой.",
          choices: [
            {
              id: "call_out",
              label: "Прижать промоутера к стене",
              resultText: "Ты не даёшь ситуации раствориться и поднимаешь цену обмана.",
              effects: [
                { type: "resource", key: "stress", delta: 2 },
                { type: "relation", slot: "promoter", trust: -8, tension: 10 },
                { type: "rivalry", mode: "sceneBuzz", deltaBuzz: 4 }
              ],
              tagChanges: {
                add: ["promoter_let_down"],
                npcFlags: [{ slot: "promoter", add: ["let_down_player"] }],
                arcTags: { add: ["conflict"] }
              },
              outcome: "burned"
            },
            {
              id: "swallow",
              label: "Проглотить и ждать другой шанс",
              resultText: "Ты не выигрываешь конфликт, но сохраняешь часть рабочего коридора.",
              effects: [
                { type: "resource", key: "morale", delta: -2 },
                { type: "relation", slot: "promoter", trust: -4, respect: -1 }
              ],
              tagChanges: {
                add: ["bit_back_frustration"]
              },
              outcome: "swallowed"
            }
          ]
        }
      ]
    },
    {
      id: "old_enemy_rematch",
      label: "Старый враг снова рядом",
      weight: 5,
      repeatable: true,
      cooldown: 8,
      startConditions: {
        requiresRivalry: true,
        minRivalryTension: 38,
        minRivalryFights: 1
      },
      actors: [
        { slot: "enemy", type: "rivalry", required: true }
      ],
      stages: [
        {
          id: "offer",
          title: "{enemy} снова стучит в дверь",
          text: "Старый враг напоминает о себе. Серия ещё не закрыта, и рынок чувствует запах реванша.",
          choices: [
            {
              id: "sign",
              label: "Поднять ставки на реванш",
              resultText: "Ты сам двигаешь историю вперёд и делаешь серию официальной линией карьеры.",
              effects: [
                { type: "resource", key: "fame", delta: 3 },
                { type: "resource", key: "stress", delta: 2 },
                { type: "rivalry", slot: "enemy", mode: "promote", deltaTension: 12, stakes: 14, pendingRematch: true }
              ],
              tagChanges: {
                add: ["accepted_rematch_call"],
                arcTags: { add: ["conflict", "rematch_ready"] }
              },
              outcome: "rematch_set"
            },
            {
              id: "delay",
              label: "Отложить и набрать форму",
              resultText: "Ты не закрываешь дверь, но заставляешь историю подождать.",
              effects: [
                { type: "resource", key: "stress", delta: -1 },
                { type: "rivalry", slot: "enemy", mode: "tension", deltaTension: 4, delayWeeks: 2 }
              ],
              tagChanges: {
                arcTags: { add: ["delayed"] }
              },
              outcome: "delayed"
            }
          ]
        }
      ]
    },
    {
      id: "friend_crisis_help",
      label: "Друг приходит в кризис",
      weight: 4,
      repeatable: true,
      cooldown: 10,
      startConditions: {
        requiresRolesAll: ["friend"],
        relationAtLeast: [{ role: "friend", affinity: 55, trust: 55 }],
        minStress: 42
      },
      actors: [
        { slot: "friend", role: "friend", required: true, sortBy: "trust", sortDir: "desc" }
      ],
      stages: [
        {
          id: "help",
          title: "{friend} видит, как ты трещишь",
          text: "{friend} без лишних слов понимает, что сейчас тебе нужен не совет со стороны, а человек рядом.",
          choices: [
            {
              id: "accept",
              label: "Принять помощь",
              resultText: "Ты даёшь себе право опереться на близкого человека и не тащить всё в одиночку.",
              effects: [
                { type: "resource", key: "stress", delta: -8 },
                { type: "condition", key: "morale", delta: 5 },
                { type: "life", key: "support", delta: 8 },
                { type: "relation", slot: "friend", affinity: 5, trust: 5, tension: -4 }
              ],
              tagChanges: {
                add: ["accepted_help"],
                npcFlags: [{ slot: "friend", add: ["helped_player"] }]
              },
              outcome: "supported"
            },
            {
              id: "refuse",
              label: "Сделать вид, что всё нормально",
              resultText: "Ты отталкиваешь руку помощи и оставляешь кризис внутри лагеря.",
              effects: [
                { type: "resource", key: "stress", delta: 3 },
                { type: "condition", key: "morale", delta: -3 },
                { type: "relation", slot: "friend", trust: -3, tension: 2 }
              ],
              tagChanges: {
                add: ["refused_help"]
              },
              outcome: "refused"
            }
          ]
        }
      ]
    },
    {
      id: "team_after_loss",
      label: "Команда держит тебя после поражения",
      weight: 3,
      repeatable: true,
      cooldown: 12,
      startConditions: {
        lastFightResult: "loss",
        requiresRolesAll: ["trainer", "sparring"],
        minSupport: 38
      },
      actors: [
        { slot: "trainer", role: "trainer", required: true },
        { slot: "sparring", role: "sparring", required: true }
      ],
      stages: [
        {
          id: "circle",
          title: "Угол собирает тебя заново",
          text: "{trainer} и {sparring} не дают поражению остаться в комнате одному. Вопрос только в том, что ты возьмёшь из этой недели.",
          choices: [
            {
              id: "listen",
              label: "Слушать и разбирать ошибки",
              resultText: "Тяжёлый разговор делает тебя устойчивее, а не мягче.",
              effects: [
                { type: "resource", key: "stress", delta: -5 },
                { type: "condition", key: "morale", delta: 4 },
                { type: "relation", slot: "trainer", trust: 3, respect: 2 },
                { type: "relation", slot: "sparring", respect: 2, trust: 2 }
              ],
              tagChanges: {
                add: ["used_loss_well"]
              },
              outcome: "grew"
            },
            {
              id: "shut_down",
              label: "Закрыться и не слушать никого",
              resultText: "Команда рядом, но ты сам отрезаешь себе часть опоры.",
              effects: [
                { type: "resource", key: "stress", delta: 2 },
                { type: "condition", key: "morale", delta: -3 },
                { type: "relation", slot: "trainer", trust: -3 },
                { type: "relation", slot: "sparring", affinity: -2 }
              ],
              tagChanges: {
                add: ["sank_after_loss"]
              },
              outcome: "closed_up"
            }
          ]
        }
      ]
    },
    {
      id: "doctor_vs_pride",
      label: "Врач спорит с твоей гордостью",
      weight: 2,
      repeatable: true,
      cooldown: 10,
      startConditions: {
        requiresRolesAll: ["doctor"],
        maxHealth: 72,
        minWear: 38
      },
      actors: [
        { slot: "doctor", role: "doctor", required: true }
      ],
      stages: [
        {
          id: "warning",
          title: "{doctor} видит больше, чем ты хочешь",
          text: "{doctor} говорит не про один плохой вечер, а про накопленный износ. Пауза сейчас или больший счёт позже.",
          choices: [
            {
              id: "rest",
              label: "Слушать врача",
              resultText: "Ты сознательно тормозишь темп, но спасаешь ресурс тела.",
              effects: [
                { type: "resource", key: "health", delta: 8 },
                { type: "resource", key: "stress", delta: -3 },
                { type: "condition", key: "wear", delta: -4 },
                { type: "relation", slot: "doctor", trust: 4, respect: 2 }
              ],
              tagChanges: {
                add: ["respected_doctor_warning"]
              },
              outcome: "protected"
            },
            {
              id: "push",
              label: "Игнорировать и давить дальше",
              resultText: "Ты оставляешь врачу последнее слово, но не последнее решение.",
              effects: [
                { type: "condition", key: "wear", delta: 4 },
                { type: "condition", key: "morale", delta: -2 },
                { type: "relation", slot: "doctor", trust: -4, tension: 2 }
              ],
              tagChanges: {
                add: ["ignored_doctor_warning"]
              },
              outcome: "ignored"
            }
          ]
        }
      ]
    },
    {
      id: "promoter_vs_trainer",
      label: "Промоутер спорит с тренером",
      weight: 2,
      repeatable: true,
      cooldown: 14,
      startConditions: {
        requiresRolesAll: ["promoter", "trainer"],
        minFame: 18
      },
      actors: [
        { slot: "promoter", role: "promoter", required: true },
        { slot: "trainer", role: "trainer", required: true }
      ],
      stages: [
        {
          id: "pull",
          title: "Тебя тянут в две стороны",
          text: "{promoter} хочет рывок и шум. {trainer} хочет тихую подготовку и порядок. Ты между ними.",
          choices: [
            {
              id: "back_trainer",
              label: "Встать на сторону тренера",
              resultText: "Ты режешь шум ради качества лагеря и сохраняешь доверие угла.",
              effects: [
                { type: "relation", slot: "trainer", trust: 4, respect: 3 },
                { type: "relation", slot: "promoter", trust: -3, tension: 4 },
                { type: "resource", key: "stress", delta: -2 }
              ],
              tagChanges: {
                add: ["corner_first"]
              },
              outcome: "trainer_side"
            },
            {
              id: "back_promoter",
              label: "Дать промоутеру рулить",
              resultText: "Ты идёшь за быстрым продвижением, но угол чувствует, что его мнение стало вторым.",
              effects: [
                { type: "relation", slot: "promoter", trust: 4, respect: 2 },
                { type: "relation", slot: "trainer", trust: -4, tension: 4 },
                { type: "resource", key: "fame", delta: 2 }
              ],
              tagChanges: {
                add: ["market_first"]
              },
              outcome: "promoter_side"
            }
          ]
        }
      ]
    },
    {
      id: "rival_respect_crossroads",
      label: "Соперник перестаёт быть только шумом",
      weight: 2,
      repeatable: true,
      cooldown: 16,
      startConditions: {
        requiresRolesAll: ["rival"],
        relationAtLeast: [{ role: "rival", tension: 45, respect: 50 }],
        minFame: 18
      },
      actors: [
        { slot: "rival", role: "rival", required: true, sortBy: "respect", sortDir: "desc" }
      ],
      stages: [
        {
          id: "crossroads",
          title: "{rival} предлагает не только вражду",
          text: "В глазах {rival} всё ещё есть огонь, но теперь там появился и вес. Иногда лучшая история — не ненависть, а признание цены друг друга.",
          choices: [
            {
              id: "respect",
              label: "Ответить уважением",
              resultText: "Вы не становитесь друзьями, но линия конфликта перестаёт быть дешёвой.",
              effects: [
                { type: "relation", slot: "rival", respect: 5, trust: 1, tension: -3 },
                { type: "resource", key: "morale", delta: 2 }
              ],
              tagChanges: {
                add: ["earned_rival_respect"]
              },
              outcome: "respectful_rivalry"
            },
            {
              id: "spit",
              label: "Плюнуть на примирение",
              resultText: "Ты оставляешь линию жёсткой и не даёшь ей уйти в спортивную вежливость.",
              effects: [
                { type: "relation", slot: "rival", tension: 6, trust: -2 },
                { type: "resource", key: "stress", delta: 2 }
              ],
              tagChanges: {
                add: ["kept_feud_alive"],
                arcTags: { add: ["conflict"] }
              },
              outcome: "kept_hostile"
            }
          ]
        }
      ]
    }
  ]
};
