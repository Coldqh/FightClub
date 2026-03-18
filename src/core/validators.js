function validateState(gameState) {
  var errors = [];
  var stats;
  var conditions;
  var requiredSections = ["meta", "player", "career", "world", "battle", "ui", "feed"];
  var i;

  if (!gameState || typeof gameState !== "object") {
    return {
      valid: false,
      errors: ["GameState РѕС‚СЃСѓС‚СЃС‚РІСѓРµС‚ РёР»Рё РЅРµ СЏРІР»СЏРµС‚СЃСЏ РѕР±СЉРµРєС‚РѕРј."]
    };
  }

  for (i = 0; i < requiredSections.length; i += 1) {
    if (!gameState[requiredSections[i]] || typeof gameState[requiredSections[i]] !== "object") {
      errors.push("РћС‚СЃСѓС‚СЃС‚РІСѓРµС‚ СЃРµРєС†РёСЏ state." + requiredSections[i] + ".");
    }
  }

  if (!gameState.meta || typeof gameState.meta.saveVersion !== "number") {
    errors.push("meta.saveVersion РґРѕР»Р¶РµРЅ Р±С‹С‚СЊ С‡РёСЃР»РѕРј.");
  }

  if (!gameState.ui || typeof gameState.ui.screen !== "string" || typeof gameState.ui.panel !== "string") {
    errors.push("ui.screen Рё ui.panel РґРѕР»Р¶РЅС‹ Р±С‹С‚СЊ СЃС‚СЂРѕРєР°РјРё.");
  }

  if (!gameState.feed || !(gameState.feed.log instanceof Array)) {
    errors.push("feed.log РґРѕР»Р¶РµРЅ Р±С‹С‚СЊ РјР°СЃСЃРёРІРѕРј.");
  }

  if (!gameState.world || !(gameState.world.opponents instanceof Array)) {
    errors.push("world.opponents РґРѕР»Р¶РµРЅ Р±С‹С‚СЊ РјР°СЃСЃРёРІРѕРј.");
  }

  if (!gameState.player || !gameState.player.stats) {
    errors.push("player.stats РѕС‚СЃСѓС‚СЃС‚РІСѓРµС‚.");
  } else {
    stats = gameState.player.stats;
    if (typeof stats.str !== "number" || typeof stats.tec !== "number" || typeof stats.spd !== "number" || typeof stats.end !== "number" || typeof stats.vit !== "number") {
      errors.push("player.stats РґРѕР»Р¶РµРЅ СЃРѕРґРµСЂР¶Р°С‚СЊ С‡РёСЃР»РѕРІС‹Рµ str/tec/spd/end/vit.");
    }
  }

  if (!gameState.player || !gameState.player.conditions) {
    errors.push("player.conditions РѕС‚СЃСѓС‚СЃС‚РІСѓРµС‚.");
  } else {
    conditions = gameState.player.conditions;
    if (typeof conditions.fatigue !== "number" || typeof conditions.wear !== "number" || typeof conditions.morale !== "number" || typeof conditions.startingAge !== "number") {
      errors.push("player.conditions РґРѕР»Р¶РµРЅ СЃРѕРґРµСЂР¶Р°С‚СЊ С‡РёСЃР»РѕРІС‹Рµ fatigue/wear/morale/startingAge.");
    }
  }

  if (!gameState.career || !gameState.career.calendar || typeof gameState.career.calendar.totalWeeks !== "number") {
    errors.push("career.calendar РґРѕР»Р¶РµРЅ СЃРѕРґРµСЂР¶Р°С‚СЊ totalWeeks.");
  }

  if (gameState.meta && gameState.meta.rng && typeof gameState.meta.rng.mode !== "string") {
    errors.push("meta.rng РёРјРµРµС‚ РЅРµРєРѕСЂСЂРµРєС‚РЅСѓСЋ СЃС‚СЂСѓРєС‚СѓСЂСѓ.");
  }

  if (gameState.world && gameState.world.offers && !(gameState.world.offers.available instanceof Array)) {
    errors.push("world.offers.available РґРѕР»Р¶РµРЅ Р±С‹С‚СЊ РјР°СЃСЃРёРІРѕРј.");
  }

  if (gameState.world && !(gameState.world.npcs instanceof Array)) {
    errors.push("world.npcs РґРѕР»Р¶РµРЅ Р±С‹С‚СЊ РјР°СЃСЃРёРІРѕРј.");
  }

  if (gameState.world && !(gameState.world.relationships instanceof Array)) {
    errors.push("world.relationships РґРѕР»Р¶РµРЅ Р±С‹С‚СЊ РјР°СЃСЃРёРІРѕРј.");
  }

  if (gameState.world && gameState.world.npcs instanceof Array) {
    for (i = 0; i < gameState.world.npcs.length; i += 1) {
      if (!gameState.world.npcs[i] || typeof gameState.world.npcs[i].id !== "string" || typeof gameState.world.npcs[i].role !== "string") {
        errors.push("world.npcs[" + i + "] РґРѕР»Р¶РµРЅ СЃРѕРґРµСЂР¶Р°С‚СЊ id Рё role.");
        break;
      }
    }
  }

  if (gameState.world && gameState.world.relationships instanceof Array) {
    for (i = 0; i < gameState.world.relationships.length; i += 1) {
      if (!gameState.world.relationships[i] || typeof gameState.world.relationships[i].npcId !== "string") {
        errors.push("world.relationships[" + i + "] РґРѕР»Р¶РµРЅ СЃРѕРґРµСЂР¶Р°С‚СЊ npcId.");
        break;
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors
  };
}
