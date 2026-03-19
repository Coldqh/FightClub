function validateState(gameState) {
  var errors = [];
  var stats;
  var conditions;
  var development;
  var eventState;
  var i;
  var requiredSections = ["meta", "player", "career", "world", "battle", "ui", "feed"];

  function pushError(message) {
    errors.push(message);
  }

  if (!gameState || typeof gameState !== "object") {
    return {
      valid: false,
      errors: ["GameState отсутствует или имеет неверный тип."]
    };
  }

  for (i = 0; i < requiredSections.length; i += 1) {
    if (!gameState[requiredSections[i]] || typeof gameState[requiredSections[i]] !== "object") {
      pushError("Отсутствует секция state." + requiredSections[i] + ".");
    }
  }

  if (!gameState.meta || typeof gameState.meta.saveVersion !== "number") {
    pushError("meta.saveVersion должен быть числом.");
  }
  if (gameState.meta && gameState.meta.rng && typeof gameState.meta.rng.mode !== "string") {
    pushError("meta.rng должен содержать корректный режим.");
  }

  if (!gameState.ui || typeof gameState.ui.screen !== "string" || typeof gameState.ui.panel !== "string") {
    pushError("ui.screen и ui.panel должны быть строками.");
  }
  if (gameState.ui && gameState.ui.activeEvent != null && typeof gameState.ui.activeEvent !== "object") {
    pushError("ui.activeEvent должен быть null или объектом.");
  }

  if (!gameState.feed || !(gameState.feed.log instanceof Array)) {
    pushError("feed.log должен быть массивом.");
  }

  if (!gameState.player || !gameState.player.stats) {
    pushError("player.stats отсутствует.");
  } else {
    stats = gameState.player.stats;
    if (typeof stats.str !== "number" || typeof stats.tec !== "number" || typeof stats.spd !== "number" || typeof stats.end !== "number" || typeof stats.vit !== "number") {
      pushError("player.stats должен содержать числовые str/tec/spd/end/vit.");
    }
  }

  if (!gameState.player || !gameState.player.conditions) {
    pushError("player.conditions отсутствует.");
  } else {
    conditions = gameState.player.conditions;
    if (typeof conditions.fatigue !== "number" || typeof conditions.wear !== "number" || typeof conditions.morale !== "number" || typeof conditions.startingAge !== "number") {
      pushError("player.conditions должен содержать fatigue/wear/morale/startingAge.");
    }
    if (!(conditions.injuries instanceof Array)) {
      pushError("player.conditions.injuries должен быть массивом.");
    } else {
      for (i = 0; i < conditions.injuries.length; i += 1) {
        if (!conditions.injuries[i] || typeof conditions.injuries[i].id !== "string") {
          pushError("player.conditions.injuries[" + i + "] должен содержать id.");
          break;
        }
      }
    }
  }

  if (!gameState.player || !gameState.player.life) {
    pushError("player.life отсутствует.");
  } else {
    if (typeof gameState.player.life.housingId !== "string") {
      pushError("player.life.housingId должен быть строкой.");
    }
    if (typeof gameState.player.life.support !== "number") {
      pushError("player.life.support должен быть числом.");
    }
    if (typeof gameState.player.life.debtWeeks !== "number") {
      pushError("player.life.debtWeeks должен быть числом.");
    }
  }

  if (!gameState.player || !gameState.player.development) {
    pushError("player.development отсутствует.");
  } else {
    development = gameState.player.development;
    if (typeof development.focusId !== "string") {
      pushError("player.development.focusId должен быть строкой.");
    }
    if (typeof development.totalXp !== "number") {
      pushError("player.development.totalXp должен быть числом.");
    }
    if (typeof development.perkPoints !== "number") {
      pushError("player.development.perkPoints должен быть числом.");
    }
    if (!development.focusProgress || typeof development.focusProgress !== "object") {
      pushError("player.development.focusProgress должен быть объектом.");
    }
    if (!development.styleProgress || typeof development.styleProgress !== "object") {
      pushError("player.development.styleProgress должен быть объектом.");
    }
    if (!(development.activePerks instanceof Array)) {
      pushError("player.development.activePerks должен быть массивом.");
    }
  }

  if (!gameState.player || !gameState.player.biography) {
    pushError("player.biography отсутствует.");
  } else {
    if (!(gameState.player.biography.flags instanceof Array)) {
      pushError("player.biography.flags должен быть массивом.");
    }
    if (!(gameState.player.biography.history instanceof Array)) {
      pushError("player.biography.history должен быть массивом.");
    }
  }

  if (!gameState.career || !gameState.career.calendar || typeof gameState.career.calendar.totalWeeks !== "number") {
    pushError("career.calendar должен содержать totalWeeks.");
  }

  if (!gameState.world || !(gameState.world.opponents instanceof Array)) {
    pushError("world.opponents должен быть массивом.");
  }
  if (gameState.world && !(gameState.world.npcs instanceof Array)) {
    pushError("world.npcs должен быть массивом.");
  }
  if (gameState.world && !(gameState.world.relationships instanceof Array)) {
    pushError("world.relationships должен быть массивом.");
  }
  if (gameState.world && !(gameState.world.relationshipArcs instanceof Array)) {
    pushError("world.relationshipArcs должен быть массивом.");
  }
  if (gameState.world && !(gameState.world.rivalries instanceof Array)) {
    pushError("world.rivalries должен быть массивом.");
  }
  if (gameState.world && !(gameState.world.contracts instanceof Array)) {
    pushError("world.contracts должен быть массивом.");
  }
  if (gameState.world && gameState.world.gymMembership != null && typeof gameState.world.gymMembership !== "object") {
    pushError("world.gymMembership должен быть null или объектом.");
  }
  if (gameState.world && gameState.world.trainerAssignment != null && typeof gameState.world.trainerAssignment !== "object") {
    pushError("world.trainerAssignment должен быть null или объектом.");
  }
  if (gameState.world && gameState.world.activeContract != null && typeof gameState.world.activeContract !== "object") {
    pushError("world.activeContract должен быть null или объектом.");
  }

  if (gameState.world && gameState.world.offers) {
    if (!(gameState.world.offers.available instanceof Array)) {
      pushError("world.offers.available должен быть массивом.");
    }
    if (!(gameState.world.offers.fightOffers instanceof Array)) {
      pushError("world.offers.fightOffers должен быть массивом.");
    }
    if (!(gameState.world.offers.contractOffers instanceof Array)) {
      pushError("world.offers.contractOffers должен быть массивом.");
    }
  }

  if (gameState.world) {
    eventState = gameState.world.eventState;
    if (!eventState || typeof eventState !== "object") {
      pushError("world.eventState отсутствует.");
    } else {
      if (!eventState.cooldowns || typeof eventState.cooldowns !== "object") {
        pushError("world.eventState.cooldowns должен быть объектом.");
      }
      if (!(eventState.onceResolved instanceof Array)) {
        pushError("world.eventState.onceResolved должен быть массивом.");
      }
      if (!(eventState.recentEvents instanceof Array)) {
        pushError("world.eventState.recentEvents должен быть массивом.");
      }
      if (!(eventState.actionHistory instanceof Array)) {
        pushError("world.eventState.actionHistory должен быть массивом.");
      }
    }
  }

  if (gameState.world && gameState.world.npcs instanceof Array) {
    for (i = 0; i < gameState.world.npcs.length; i += 1) {
      if (!gameState.world.npcs[i] || typeof gameState.world.npcs[i].id !== "string" || typeof gameState.world.npcs[i].role !== "string") {
        pushError("world.npcs[" + i + "] должен содержать id и role.");
        break;
      }
    }
  }

  if (gameState.world && gameState.world.relationships instanceof Array) {
    for (i = 0; i < gameState.world.relationships.length; i += 1) {
      if (!gameState.world.relationships[i] || typeof gameState.world.relationships[i].npcId !== "string") {
        pushError("world.relationships[" + i + "] должен содержать npcId.");
        break;
      }
    }
  }

  if (gameState.world && gameState.world.relationshipArcs instanceof Array) {
    for (i = 0; i < gameState.world.relationshipArcs.length; i += 1) {
      if (!gameState.world.relationshipArcs[i] || typeof gameState.world.relationshipArcs[i].id !== "string" || typeof gameState.world.relationshipArcs[i].templateId !== "string") {
        pushError("world.relationshipArcs[" + i + "] должен содержать id и templateId.");
        break;
      }
    }
  }

  if (gameState.world && gameState.world.rivalries instanceof Array) {
    for (i = 0; i < gameState.world.rivalries.length; i += 1) {
      if (!gameState.world.rivalries[i] || typeof gameState.world.rivalries[i].id !== "string" || typeof gameState.world.rivalries[i].opponentKey !== "string") {
        pushError("world.rivalries[" + i + "] должен содержать id и opponentKey.");
        break;
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors
  };
}
