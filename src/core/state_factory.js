var SAVE_VERSION = 4;

function clonePlainData(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function basePlayerStatsSchema() {
  return {
    str: 1,
    tec: 1,
    spd: 1,
    end: 1,
    vit: 1
  };
}

function basePlayerConditionsSchema() {
  return {
    fatigue: 0,
    wear: 0,
    morale: 55,
    startingAge: 22
  };
}

function baseWorldSchema() {
  return {
    opponents: [],
    offers: {
      weekStamp: 0,
      available: [],
      headline: ""
    },
    npcs: [],
    relationships: [],
    contracts: [],
    lastWeekAction: {
      type: "idle",
      label: "",
      meta: null
    },
    scene: {
      updatedWeek: 0,
      buzz: 0,
      temperature: 50
    }
  };
}

function createGameState(options) {
  var opts = options || {};
  var debugEnabled = !!opts.debugMode;
  return {
    meta: {
      appVersion: opts.appVersion || "",
      saveVersion: SAVE_VERSION,
      rng: RNG.cloneState(opts.rng),
      updateAvailable: false,
      remoteVersion: "",
      debugMode: debugEnabled
    },
    player: {
      profile: {
        name: "",
        homeCountry: "",
        currentCountry: ""
      },
      stats: basePlayerStatsSchema(),
      resources: {
        skillPoints: 0,
        money: 0,
        health: 100,
        stress: 0,
        fame: 0
      },
      conditions: basePlayerConditionsSchema(),
      record: {
        wins: 0,
        losses: 0,
        kos: 0,
        deathsCaused: 0
      }
    },
    career: {
      week: 1,
      calendar: TimeSystem.createCalendar(),
      create: null,
      endingReason: ""
    },
    world: baseWorldSchema(),
    battle: {
      current: null
    },
    ui: {
      screen: "menu",
      panel: "home",
      savedPreview: null,
      debug: {
        enabled: debugEnabled,
        open: debugEnabled
      }
    },
    feed: {
      log: []
    }
  };
}

function normalizeWorldState(sourceWorld) {
  var normalized = baseWorldSchema();
  if (!sourceWorld || typeof sourceWorld !== "object") {
    return normalized;
  }
  normalized.opponents = sourceWorld.opponents instanceof Array ? clonePlainData(sourceWorld.opponents) : [];
  if (sourceWorld.offers && typeof sourceWorld.offers === "object") {
    normalized.offers.weekStamp = typeof sourceWorld.offers.weekStamp === "number" ? sourceWorld.offers.weekStamp : 0;
    normalized.offers.available = sourceWorld.offers.available instanceof Array ? clonePlainData(sourceWorld.offers.available) : [];
    normalized.offers.headline = sourceWorld.offers.headline || "";
  }
  normalized.npcs = sourceWorld.npcs instanceof Array ? clonePlainData(sourceWorld.npcs) : [];
  normalized.relationships = sourceWorld.relationships instanceof Array ? clonePlainData(sourceWorld.relationships) : [];
  normalized.contracts = sourceWorld.contracts instanceof Array ? clonePlainData(sourceWorld.contracts) : [];
  if (sourceWorld.lastWeekAction && typeof sourceWorld.lastWeekAction === "object") {
    normalized.lastWeekAction.type = sourceWorld.lastWeekAction.type || "idle";
    normalized.lastWeekAction.label = sourceWorld.lastWeekAction.label || "";
    normalized.lastWeekAction.meta = sourceWorld.lastWeekAction.meta ? clonePlainData(sourceWorld.lastWeekAction.meta) : null;
  }
  if (sourceWorld.scene && typeof sourceWorld.scene === "object") {
    normalized.scene.updatedWeek = typeof sourceWorld.scene.updatedWeek === "number" ? sourceWorld.scene.updatedWeek : 0;
    normalized.scene.buzz = typeof sourceWorld.scene.buzz === "number" ? sourceWorld.scene.buzz : 0;
    normalized.scene.temperature = typeof sourceWorld.scene.temperature === "number" ? sourceWorld.scene.temperature : 50;
  }
  return normalized;
}

function normalizeGameState(gameState, options) {
  var normalized = createGameState(options);
  var source = gameState || {};
  var key;

  if (source.meta) {
    normalized.meta.appVersion = source.meta.appVersion || normalized.meta.appVersion;
    normalized.meta.saveVersion = typeof source.meta.saveVersion === "number" ? source.meta.saveVersion : normalized.meta.saveVersion;
    normalized.meta.rng = RNG.cloneState(source.meta.rng);
    normalized.meta.updateAvailable = !!source.meta.updateAvailable;
    normalized.meta.remoteVersion = source.meta.remoteVersion || "";
    normalized.meta.debugMode = !!source.meta.debugMode;
  }

  if (source.player) {
    if (source.player.profile) {
      normalized.player.profile.name = source.player.profile.name || "";
      normalized.player.profile.homeCountry = source.player.profile.homeCountry || "";
      normalized.player.profile.currentCountry = source.player.profile.currentCountry || "";
    }
    if (source.player.stats) {
      for (key in normalized.player.stats) {
        if (normalized.player.stats.hasOwnProperty(key) && typeof source.player.stats[key] === "number") {
          normalized.player.stats[key] = source.player.stats[key];
        }
      }
    }
    if (source.player.resources) {
      if (typeof source.player.resources.skillPoints === "number") { normalized.player.resources.skillPoints = source.player.resources.skillPoints; }
      if (typeof source.player.resources.money === "number") { normalized.player.resources.money = source.player.resources.money; }
      if (typeof source.player.resources.health === "number") { normalized.player.resources.health = source.player.resources.health; }
      if (typeof source.player.resources.stress === "number") { normalized.player.resources.stress = source.player.resources.stress; }
      if (typeof source.player.resources.fame === "number") { normalized.player.resources.fame = source.player.resources.fame; }
    }
    if (source.player.conditions) {
      if (typeof source.player.conditions.fatigue === "number") { normalized.player.conditions.fatigue = source.player.conditions.fatigue; }
      if (typeof source.player.conditions.wear === "number") { normalized.player.conditions.wear = source.player.conditions.wear; }
      if (typeof source.player.conditions.morale === "number") { normalized.player.conditions.morale = source.player.conditions.morale; }
      if (typeof source.player.conditions.startingAge === "number") { normalized.player.conditions.startingAge = source.player.conditions.startingAge; }
    }
    if (source.player.record) {
      if (typeof source.player.record.wins === "number") { normalized.player.record.wins = source.player.record.wins; }
      if (typeof source.player.record.losses === "number") { normalized.player.record.losses = source.player.record.losses; }
      if (typeof source.player.record.kos === "number") { normalized.player.record.kos = source.player.record.kos; }
      if (typeof source.player.record.deathsCaused === "number") { normalized.player.record.deathsCaused = source.player.record.deathsCaused; }
    }
  }

  if (source.career) {
    if (typeof source.career.week === "number") {
      normalized.career.week = source.career.week;
    }
    if (source.career.calendar) {
      normalized.career.calendar = TimeSystem.normalizeCalendar(clonePlainData(source.career.calendar));
    } else if (typeof source.career.week === "number") {
      normalized.career.calendar = TimeSystem.createCalendar({ totalWeeks: Math.max(0, source.career.week - 1) });
    }
    normalized.career.create = source.career.create ? clonePlainData(source.career.create) : null;
    normalized.career.endingReason = source.career.endingReason || "";
  }

  normalized.world = normalizeWorldState(source.world);

  if (source.battle) {
    normalized.battle.current = source.battle.current ? clonePlainData(source.battle.current) : null;
  }

  if (source.ui) {
    normalized.ui.screen = source.ui.screen || normalized.ui.screen;
    normalized.ui.panel = source.ui.panel || normalized.ui.panel;
    normalized.ui.savedPreview = source.ui.savedPreview || null;
    if (source.ui.debug) {
      normalized.ui.debug.enabled = !!source.ui.debug.enabled;
      normalized.ui.debug.open = !!source.ui.debug.open;
    }
  }

  if (source.feed && source.feed.log) {
    normalized.feed.log = clonePlainData(source.feed.log);
  }

  normalized.career.week = TimeSystem.getCalendarView(normalized.career.calendar).weekNumber;
  normalized.meta.saveVersion = SAVE_VERSION;
  return normalized;
}

function buildGameStateFromLegacySnapshot(snapshot, options) {
  var gameState = createGameState(options);
  var fighter = snapshot && snapshot.fighter ? snapshot.fighter : null;
  var calendarSource = null;
  gameState.meta.appVersion = snapshot && snapshot.appVersion ? snapshot.appVersion : gameState.meta.appVersion;
  gameState.meta.rng = RNG.cloneState(snapshot && snapshot.rng);
  gameState.meta.updateAvailable = !!(snapshot && snapshot.updateAvailable);
  gameState.meta.remoteVersion = snapshot && snapshot.remoteVersion ? snapshot.remoteVersion : "";
  gameState.ui.screen = snapshot && snapshot.screen ? snapshot.screen : gameState.ui.screen;
  gameState.ui.panel = snapshot && snapshot.panel ? snapshot.panel : gameState.ui.panel;
  gameState.ui.savedPreview = snapshot && snapshot.savedPreview ? clonePlainData(snapshot.savedPreview) : null;
  if (snapshot && snapshot.debug) {
    gameState.ui.debug.enabled = !!snapshot.debug.enabled;
    gameState.ui.debug.open = !!snapshot.debug.open;
  }
  gameState.career.create = snapshot && snapshot.create ? clonePlainData(snapshot.create) : null;
  gameState.battle.current = snapshot && snapshot.fight ? clonePlainData(snapshot.fight) : null;
  gameState.feed.log = snapshot && snapshot.log ? clonePlainData(snapshot.log) : [];
  gameState.career.endingReason = snapshot && snapshot.endingReason ? snapshot.endingReason : "";
  if (snapshot && snapshot.world) {
    gameState.world = normalizeWorldState(snapshot.world);
  } else if (snapshot && snapshot.opponents) {
    gameState.world.opponents = clonePlainData(snapshot.opponents);
  }
  if (fighter) {
    gameState.player.profile.name = fighter.name || "";
    gameState.player.profile.homeCountry = fighter.homeCountry || "";
    gameState.player.profile.currentCountry = fighter.currentCountry || "";
    gameState.player.stats = clonePlainData(fighter.stats || basePlayerStatsSchema());
    gameState.player.resources.skillPoints = fighter.skillPoints || 0;
    gameState.player.resources.money = fighter.money || 0;
    gameState.player.resources.health = typeof fighter.health === "number" ? fighter.health : 100;
    gameState.player.resources.stress = typeof fighter.stress === "number" ? fighter.stress : 0;
    gameState.player.resources.fame = fighter.fame || 0;
    gameState.player.conditions.fatigue = typeof fighter.fatigue === "number" ? fighter.fatigue : gameState.player.conditions.fatigue;
    gameState.player.conditions.wear = typeof fighter.wear === "number" ? fighter.wear : gameState.player.conditions.wear;
    gameState.player.conditions.morale = typeof fighter.morale === "number" ? fighter.morale : gameState.player.conditions.morale;
    gameState.player.conditions.startingAge = typeof fighter.startingAge === "number" ? fighter.startingAge : gameState.player.conditions.startingAge;
    gameState.player.record.wins = fighter.wins || 0;
    gameState.player.record.losses = fighter.losses || 0;
    gameState.player.record.kos = fighter.kos || 0;
    gameState.player.record.deathsCaused = fighter.deathsCaused || 0;
    gameState.career.week = fighter.week || 1;
    calendarSource = fighter.calendar ? fighter.calendar : (snapshot && (snapshot.calendar || snapshot.careerCalendar));
  }
  if (!calendarSource && snapshot && snapshot.career && snapshot.career.calendar) {
    calendarSource = snapshot.career.calendar;
  }
  if (calendarSource) {
    gameState.career.calendar = TimeSystem.normalizeCalendar(clonePlainData(calendarSource));
  } else {
    gameState.career.calendar = TimeSystem.createCalendar({ totalWeeks: Math.max(0, gameState.career.week - 1) });
  }
  return normalizeGameState(gameState, options);
}

function buildGameStateFromRuntime(runtimeState, options) {
  return buildGameStateFromLegacySnapshot({
    appVersion: options && options.appVersion ? options.appVersion : "",
    rng: runtimeState ? runtimeState.rng : null,
    screen: runtimeState ? runtimeState.screen : "menu",
    panel: runtimeState ? runtimeState.panel : "home",
    create: runtimeState ? runtimeState.create : null,
    fighter: runtimeState ? runtimeState.fighter : null,
    world: runtimeState ? runtimeState.world : null,
    opponents: runtimeState ? runtimeState.opponents : [],
    fight: runtimeState ? runtimeState.fight : null,
    log: runtimeState ? runtimeState.log : [],
    endingReason: runtimeState ? runtimeState.endingReason : "",
    savedPreview: runtimeState ? runtimeState.savedPreview : null,
    updateAvailable: runtimeState ? runtimeState.updateAvailable : false,
    remoteVersion: runtimeState ? runtimeState.remoteVersion : "",
    debug: runtimeState ? runtimeState.debug : null
  }, options);
}

function applyGameStateToRuntime(runtimeState, gameState, options) {
  var target = runtimeState || {};
  var normalized = normalizeGameState(gameState, options);
  var hasFighter = !!normalized.player.profile.name;

  target.game = normalized;
  target.screen = normalized.ui.screen;
  target.panel = normalized.ui.panel;
  target.create = normalized.career.create ? clonePlainData(normalized.career.create) : null;
  target.opponents = clonePlainData(normalized.world.opponents);
  target.world = clonePlainData(normalized.world);
  target.world.opponents = target.opponents;
  target.fight = normalized.battle.current ? clonePlainData(normalized.battle.current) : null;
  target.log = clonePlainData(normalized.feed.log);
  target.endingReason = normalized.career.endingReason;
  target.savedPreview = normalized.ui.savedPreview;
  target.updateAvailable = !!normalized.meta.updateAvailable;
  target.remoteVersion = normalized.meta.remoteVersion || "";
  target.rng = RNG.cloneState(normalized.meta.rng);
  target.debug = clonePlainData(normalized.ui.debug);

  target.fighter = hasFighter ? {
    name: normalized.player.profile.name,
    stats: clonePlainData(normalized.player.stats),
    skillPoints: normalized.player.resources.skillPoints,
    money: normalized.player.resources.money,
    week: normalized.career.week,
    health: normalized.player.resources.health,
    stress: normalized.player.resources.stress,
    fame: normalized.player.resources.fame,
    fatigue: normalized.player.conditions.fatigue,
    wear: normalized.player.conditions.wear,
    morale: normalized.player.conditions.morale,
    startingAge: normalized.player.conditions.startingAge,
    calendar: clonePlainData(normalized.career.calendar),
    wins: normalized.player.record.wins,
    losses: normalized.player.record.losses,
    kos: normalized.player.record.kos,
    deathsCaused: normalized.player.record.deathsCaused,
    homeCountry: normalized.player.profile.homeCountry,
    currentCountry: normalized.player.profile.currentCountry
  } : null;

  return target;
}

function createLegacyRuntimeState(options) {
  return applyGameStateToRuntime({}, createGameState(options), options);
}
