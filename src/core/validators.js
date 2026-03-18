function validateState(gameState) {
  var errors = [];
  var stats;
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

  if (gameState.meta && gameState.meta.rng && typeof gameState.meta.rng.mode !== "string") {
    errors.push("meta.rng имеет некорректную структуру.");
  }

  return {
    valid: errors.length === 0,
    errors: errors
  };
}
