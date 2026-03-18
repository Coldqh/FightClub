function validateState(gameState) {
  var errors = [];
  var stats;
  var conditions;
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
      errors.push("player.conditions должен содержать числовые fatigue/wear/morale/startingAge.");
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

  return {
    valid: errors.length === 0,
    errors: errors
  };
}
