function validateState(gameState) {
  var errors = [];
  var stats;
  var conditions;
  var development;
  var eventState;
  var requiredSections = ["meta", "player", "career", "world", "battle", "ui", "feed"];
  var i;

  if (!gameState || typeof gameState !== "object") {
    return {
      valid: false,
      errors: ["GameState отсутствует или имеет неверный тип."]
    };
  }

  for (i = 0; i < requiredSections.length; i += 1) {
    if (!gameState[requiredSections[i]] || typeof gameState[requiredSections[i]] !== "object") {
      errors.push("Отсутствует секция state." + requiredSections[i] + ".");
    }
  }

  if (!gameState.meta || typeof gameState.meta.saveVersion !== "number") {
    errors.push("meta.saveVersion должен быть числом.");
  }

  if (!gameState.ui || typeof gameState.ui.screen !== "string" || typeof gameState.ui.panel !== "string") {
    errors.push("ui.screen и ui.panel должны быть строками.");
  }

  if (gameState.ui && gameState.ui.activeEvent != null && typeof gameState.ui.activeEvent !== "object") {
    errors.push("ui.activeEvent должен быть null или объектом.");
  }

  if (!gameState.feed || !(gameState.feed.log instanceof Array)) {
    errors.push("feed.log должен быть массивом.");
  }

  if (!gameState.world || !(gameState.world.opponents instanceof Array)) {
    errors.push("world.opponents должен быть массивом.");
  }

  if (!gameState.player || !gameState.player.stats) {
    errors.push("player.stats отсутствует.");
  } else {
    stats = gameState.player.stats;
    if (typeof stats.str !== "number" || typeof stats.tec !== "number" || typeof stats.spd !== "number" || typeof stats.end !== "number" || typeof stats.vit !== "number") {
      errors.push("player.stats должен содержать числовые str/tec/spd/end/vit.");
    }
  }

  if (!gameState.player || !gameState.player.conditions) {
    errors.push("player.conditions отсутствует.");
  } else {
    conditions = gameState.player.conditions;
    if (typeof conditions.fatigue !== "number" || typeof conditions.wear !== "number" || typeof conditions.morale !== "number" || typeof conditions.startingAge !== "number") {
      errors.push("player.conditions должен содержать fatigue/wear/morale/startingAge.");
    }
  }

  if (!gameState.player || !gameState.player.life) {
    errors.push("player.life отсутствует.");
  } else {
    if (typeof gameState.player.life.housingId !== "string") {
      errors.push("player.life.housingId должен быть строкой.");
    }
    if (typeof gameState.player.life.support !== "number") {
      errors.push("player.life.support должен быть числом.");
    }
  }

  if (!gameState.player || !gameState.player.development) {
    errors.push("player.development отсутствует.");
  } else {
    development = gameState.player.development;
    if (typeof development.focusId !== "string") {
      errors.push("player.development.focusId должен быть строкой.");
    }
    if (typeof development.totalXp !== "number") {
      errors.push("player.development.totalXp должен быть числом.");
    }
    if (typeof development.perkPoints !== "number") {
      errors.push("player.development.perkPoints должен быть числом.");
    }
    if (!development.focusProgress || typeof development.focusProgress !== "object") {
      errors.push("player.development.focusProgress должен быть объектом.");
    }
    if (!development.styleProgress || typeof development.styleProgress !== "object") {
      errors.push("player.development.styleProgress должен быть объектом.");
    }
    if (!(development.activePerks instanceof Array)) {
      errors.push("player.development.activePerks должен быть массивом.");
    }
  }

  if (!gameState.player || !gameState.player.biography) {
    errors.push("player.biography отсутствует.");
  } else {
    if (!(gameState.player.biography.flags instanceof Array)) {
      errors.push("player.biography.flags должен быть массивом.");
    }
    if (!(gameState.player.biography.history instanceof Array)) {
      errors.push("player.biography.history должен быть массивом.");
    }
  }

  if (!gameState.career || !gameState.career.calendar || typeof gameState.career.calendar.totalWeeks !== "number") {
    errors.push("career.calendar должен содержать totalWeeks.");
  }

  if (gameState.meta && gameState.meta.rng && typeof gameState.meta.rng.mode !== "string") {
    errors.push("meta.rng имеет некорректную структуру.");
  }

  if (gameState.world && gameState.world.offers) {
    if (!(gameState.world.offers.available instanceof Array)) {
      errors.push("world.offers.available должен быть массивом.");
    }
    if (!(gameState.world.offers.fightOffers instanceof Array)) {
      errors.push("world.offers.fightOffers должен быть массивом.");
    }
    if (!(gameState.world.offers.contractOffers instanceof Array)) {
      errors.push("world.offers.contractOffers должен быть массивом.");
    }
  }

  if (gameState.world && !(gameState.world.npcs instanceof Array)) {
    errors.push("world.npcs должен быть массивом.");
  }

  if (gameState.world && !(gameState.world.relationships instanceof Array)) {
    errors.push("world.relationships должен быть массивом.");
  }

  if (gameState.world && !(gameState.world.relationshipArcs instanceof Array)) {
    errors.push("world.relationshipArcs должен быть массивом.");
  }

  if (gameState.world && !(gameState.world.rivalries instanceof Array)) {
    errors.push("world.rivalries должен быть массивом.");
  }

  if (gameState.world && !(gameState.world.contracts instanceof Array)) {
    errors.push("world.contracts должен быть массивом.");
  }

  if (gameState.world && gameState.world.gymMembership != null && typeof gameState.world.gymMembership !== "object") {
    errors.push("world.gymMembership должен быть null или объектом.");
  }

  if (gameState.world && gameState.world.trainerAssignment != null && typeof gameState.world.trainerAssignment !== "object") {
    errors.push("world.trainerAssignment должен быть null или объектом.");
  }

  if (gameState.world && gameState.world.activeContract != null && typeof gameState.world.activeContract !== "object") {
    errors.push("world.activeContract должен быть null или объектом.");
  }

  if (gameState.world) {
    eventState = gameState.world.eventState;
    if (!eventState || typeof eventState !== "object") {
      errors.push("world.eventState отсутствует.");
    } else {
      if (!eventState.cooldowns || typeof eventState.cooldowns !== "object") {
        errors.push("world.eventState.cooldowns должен быть объектом.");
      }
      if (!(eventState.onceResolved instanceof Array)) {
        errors.push("world.eventState.onceResolved должен быть массивом.");
      }
      if (!(eventState.recentEvents instanceof Array)) {
        errors.push("world.eventState.recentEvents должен быть массивом.");
      }
      if (!(eventState.actionHistory instanceof Array)) {
        errors.push("world.eventState.actionHistory должен быть массивом.");
      }
    }
  }

  if (gameState.world && gameState.world.npcs instanceof Array) {
    for (i = 0; i < gameState.world.npcs.length; i += 1) {
      if (!gameState.world.npcs[i] || typeof gameState.world.npcs[i].id !== "string" || typeof gameState.world.npcs[i].role !== "string") {
        errors.push("world.npcs[" + i + "] должен содержать id и role.");
        break;
      }
    }
  }

  if (gameState.world && gameState.world.relationships instanceof Array) {
    for (i = 0; i < gameState.world.relationships.length; i += 1) {
      if (!gameState.world.relationships[i] || typeof gameState.world.relationships[i].npcId !== "string") {
        errors.push("world.relationships[" + i + "] должен содержать npcId.");
        break;
      }
    }
  }

  if (gameState.world && gameState.world.relationshipArcs instanceof Array) {
    for (i = 0; i < gameState.world.relationshipArcs.length; i += 1) {
      if (!gameState.world.relationshipArcs[i] || typeof gameState.world.relationshipArcs[i].id !== "string" || typeof gameState.world.relationshipArcs[i].templateId !== "string") {
        errors.push("world.relationshipArcs[" + i + "] должен содержать id и templateId.");
        break;
      }
    }
  }

  if (gameState.world && gameState.world.rivalries instanceof Array) {
    for (i = 0; i < gameState.world.rivalries.length; i += 1) {
      if (!gameState.world.rivalries[i] || typeof gameState.world.rivalries[i].id !== "string" || typeof gameState.world.rivalries[i].opponentKey !== "string") {
        errors.push("world.rivalries[" + i + "] должен содержать id и opponentKey.");
        break;
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors
  };
}
