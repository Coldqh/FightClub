function validateState(gameState) {
  var errors = [];
  var stats;
  var conditions;
  var eventState;
  var requiredSections = ["meta", "player", "career", "world", "battle", "ui", "feed"];
  var i;

  if (!gameState || typeof gameState !== "object") {
    return {
      valid: false,
      errors: ["GameState отсутствует или не является объектом."]
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

  if (gameState.world && gameState.world.offers && !(gameState.world.offers.available instanceof Array)) {
    errors.push("world.offers.available должен быть массивом.");
  }

  if (gameState.world && !(gameState.world.npcs instanceof Array)) {
    errors.push("world.npcs должен быть массивом.");
  }

  if (gameState.world && !(gameState.world.relationships instanceof Array)) {
    errors.push("world.relationships должен быть массивом.");
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

  return {
    valid: errors.length === 0,
    errors: errors
  };
}
