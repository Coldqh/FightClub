var SAVE_VERSION = 12;

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
    startingAge: 22,
    injuries: []
  };
}

function baseInjurySchema() {
  return {
    id: "",
    severity: 1,
    weeksLeft: 0,
    chronic: false,
    source: "",
    appliedWeek: 0
  };
}

function basePlayerLifeSchema() {
  return {
    housingId: "normal",
    support: 50
  };
}

function basePlayerDevelopmentSchema() {
  return {
    focusId: "technique",
    totalXp: 0,
    perkPoints: 0,
    focusProgress: {
      endurance: 0,
      technique: 0,
      power: 0,
      defense: 0,
      sparring: 0,
      recovery: 0
    },
    styleProgress: {
      outboxer: 0,
      puncher: 0,
      counterpuncher: 0,
      tempo: 0
    },
    activePerks: []
  };
}

function basePlayerBiographySchema() {
  return {
    flags: [],
    history: []
  };
}

function baseGymMembershipSchema() {
  return {
    gymId: "",
    joinedWeek: 0,
    country: "",
    city: "",
    weeklyCost: 0,
    reputation: 0,
    specialization: "",
    bonuses: {}
  };
}

function baseTrainerAssignmentSchema() {
  return {
    npcId: "",
    trainerTypeId: "",
    gymId: "",
    hiredWeek: 0,
    weeklyFee: 0,
    status: "active"
  };
}

function baseContractSchema() {
  return {
    id: "",
    templateId: "",
    promoterId: "",
    label: "",
    signedWeek: 0,
    endsWeek: 0,
    guaranteedPurse: 0,
    winBonus: 0,
    koBonus: 0,
    fameMultiplier: 1,
    fightFrequency: 1,
    toxicRisk: 0,
    reputationDelta: 0,
    conditionsText: "",
    status: "inactive"
  };
}

function baseRelationshipArcSchema() {
  return {
    id: "",
    templateId: "",
    label: "",
    status: "active",
    startedWeek: 0,
    lastStageWeek: 0,
    currentStageId: "",
    lastChoiceId: "",
    outcome: "",
    tags: [],
    actors: {},
    history: [],
    rivalryId: ""
  };
}

function baseRivalrySchema() {
  return {
    id: "",
    opponentKey: "",
    opponentName: "",
    countryKey: "",
    npcId: "",
    fightsCount: 0,
    playerWins: 0,
    opponentWins: 0,
    draws: 0,
    knockouts: 0,
    tension: 0,
    stakes: 0,
    active: true,
    pendingRematch: false,
    holdUntilWeek: 0,
    lastWeek: 0,
    lastResult: "",
    lastMethod: "",
    lastOpponentSnapshot: null,
    tags: [],
    history: []
  };
}

function baseWorldSchema() {
  return {
    opponents: [],
    offers: {
      weekStamp: 0,
      available: [],
      headline: "",
      fightOffers: [],
      contractOffers: []
    },
    npcs: [],
    relationships: [],
    relationshipArcs: [],
    rivalries: [],
    contracts: [],
    gymMembership: null,
    trainerAssignment: null,
    activeContract: null,
    eventState: {
      cooldowns: {},
      onceResolved: [],
      recentEvents: [],
      actionHistory: []
    },
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

function normalizeInjuryEntry(source) {
  var normalized = baseInjurySchema();
  if (!source || typeof source !== "object") {
    return normalized;
  }
  normalized.id = source.id || "";
  normalized.severity = typeof source.severity === "number" ? source.severity : normalized.severity;
  normalized.weeksLeft = typeof source.weeksLeft === "number" ? source.weeksLeft : normalized.weeksLeft;
  normalized.chronic = !!source.chronic;
  normalized.source = source.source || "";
  normalized.appliedWeek = typeof source.appliedWeek === "number" ? source.appliedWeek : normalized.appliedWeek;
  return normalized;
}

function baseNpcSchema() {
  return {
    id: "",
    name: "",
    country: "",
    role: "",
    age: 24,
    traits: [],
    status: "",
    knownToPlayer: false,
    discoveredWeek: 0,
    relationToPlayer: {
      score: 0,
      summary: ""
    },
    history: [],
    flags: []
  };
}

function baseRelationshipSchema() {
  return {
    npcId: "",
    score: 0,
    lastInteractionWeek: 0,
    historyEntries: [],
    relationTags: []
  };
}

function legacyRelationScore(source) {
  var affinity;
  var respect;
  var trust;
  var tension;
  if (!source || typeof source !== "object") {
    return 0;
  }
  if (typeof source.score === "number") {
    return Math.max(-100, Math.min(100, Math.round(source.score)));
  }
  affinity = typeof source.affinity === "number" ? source.affinity : 35;
  respect = typeof source.respect === "number" ? source.respect : 35;
  trust = typeof source.trust === "number" ? source.trust : 30;
  tension = typeof source.tension === "number" ? source.tension : 10;
  return Math.max(-100, Math.min(100, Math.round(((affinity + respect + trust) / 3) - tension)));
}

function normalizeNpcEntry(sourceNpc) {
  var normalized = baseNpcSchema();
  if (!sourceNpc || typeof sourceNpc !== "object") {
    return normalized;
  }
  normalized.id = sourceNpc.id || "";
  normalized.name = sourceNpc.name || "";
  normalized.country = sourceNpc.country || "";
  normalized.role = sourceNpc.role || "";
  normalized.age = typeof sourceNpc.age === "number" ? sourceNpc.age : normalized.age;
  normalized.traits = sourceNpc.traits instanceof Array ? clonePlainData(sourceNpc.traits) : [];
  normalized.status = sourceNpc.status || "";
  normalized.knownToPlayer = typeof sourceNpc.knownToPlayer === "boolean" ? sourceNpc.knownToPlayer : false;
  normalized.discoveredWeek = typeof sourceNpc.discoveredWeek === "number" ? sourceNpc.discoveredWeek : 0;
  if (sourceNpc.relationToPlayer && typeof sourceNpc.relationToPlayer === "object") {
    normalized.relationToPlayer.score = legacyRelationScore(sourceNpc.relationToPlayer);
    normalized.relationToPlayer.summary = sourceNpc.relationToPlayer.summary || "";
  }
  normalized.history = sourceNpc.history instanceof Array ? clonePlainData(sourceNpc.history) : [];
  normalized.flags = sourceNpc.flags instanceof Array ? clonePlainData(sourceNpc.flags) : [];
  return normalized;
}

function normalizeRelationshipEntry(sourceRelationship) {
  var normalized = baseRelationshipSchema();
  if (!sourceRelationship || typeof sourceRelationship !== "object") {
    return normalized;
  }
  normalized.npcId = sourceRelationship.npcId || "";
  normalized.score = legacyRelationScore(sourceRelationship);
  if (typeof sourceRelationship.lastInteractionWeek === "number") { normalized.lastInteractionWeek = sourceRelationship.lastInteractionWeek; }
  normalized.historyEntries = sourceRelationship.historyEntries instanceof Array ? clonePlainData(sourceRelationship.historyEntries) : [];
  normalized.relationTags = sourceRelationship.relationTags instanceof Array ? clonePlainData(sourceRelationship.relationTags) : [];
  return normalized;
}

function normalizeRelationshipArcEntry(sourceArc) {
  var normalized = baseRelationshipArcSchema();
  if (!sourceArc || typeof sourceArc !== "object") {
    return normalized;
  }
  normalized.id = sourceArc.id || "";
  normalized.templateId = sourceArc.templateId || "";
  normalized.label = sourceArc.label || "";
  normalized.status = sourceArc.status || "active";
  if (typeof sourceArc.startedWeek === "number") { normalized.startedWeek = sourceArc.startedWeek; }
  if (typeof sourceArc.lastStageWeek === "number") { normalized.lastStageWeek = sourceArc.lastStageWeek; }
  normalized.currentStageId = sourceArc.currentStageId || "";
  normalized.lastChoiceId = sourceArc.lastChoiceId || "";
  normalized.outcome = sourceArc.outcome || "";
  normalized.tags = sourceArc.tags instanceof Array ? clonePlainData(sourceArc.tags) : [];
  normalized.actors = sourceArc.actors && typeof sourceArc.actors === "object" ? clonePlainData(sourceArc.actors) : {};
  normalized.history = sourceArc.history instanceof Array ? clonePlainData(sourceArc.history) : [];
  normalized.rivalryId = sourceArc.rivalryId || "";
  return normalized;
}

function normalizeRivalryEntry(sourceRivalry) {
  var normalized = baseRivalrySchema();
  if (!sourceRivalry || typeof sourceRivalry !== "object") {
    return normalized;
  }
  normalized.id = sourceRivalry.id || "";
  normalized.opponentKey = sourceRivalry.opponentKey || "";
  normalized.opponentName = sourceRivalry.opponentName || "";
  normalized.countryKey = sourceRivalry.countryKey || "";
  normalized.npcId = sourceRivalry.npcId || "";
  if (typeof sourceRivalry.fightsCount === "number") { normalized.fightsCount = sourceRivalry.fightsCount; }
  if (typeof sourceRivalry.playerWins === "number") { normalized.playerWins = sourceRivalry.playerWins; }
  if (typeof sourceRivalry.opponentWins === "number") { normalized.opponentWins = sourceRivalry.opponentWins; }
  if (typeof sourceRivalry.draws === "number") { normalized.draws = sourceRivalry.draws; }
  if (typeof sourceRivalry.knockouts === "number") { normalized.knockouts = sourceRivalry.knockouts; }
  if (typeof sourceRivalry.tension === "number") { normalized.tension = sourceRivalry.tension; }
  if (typeof sourceRivalry.stakes === "number") { normalized.stakes = sourceRivalry.stakes; }
  if (typeof sourceRivalry.active === "boolean") { normalized.active = sourceRivalry.active; }
  if (typeof sourceRivalry.pendingRematch === "boolean") { normalized.pendingRematch = sourceRivalry.pendingRematch; }
  if (typeof sourceRivalry.holdUntilWeek === "number") { normalized.holdUntilWeek = sourceRivalry.holdUntilWeek; }
  if (typeof sourceRivalry.lastWeek === "number") { normalized.lastWeek = sourceRivalry.lastWeek; }
  normalized.lastResult = sourceRivalry.lastResult || "";
  normalized.lastMethod = sourceRivalry.lastMethod || "";
  normalized.lastOpponentSnapshot = sourceRivalry.lastOpponentSnapshot ? clonePlainData(sourceRivalry.lastOpponentSnapshot) : null;
  normalized.tags = sourceRivalry.tags instanceof Array ? clonePlainData(sourceRivalry.tags) : [];
  normalized.history = sourceRivalry.history instanceof Array ? clonePlainData(sourceRivalry.history) : [];
  return normalized;
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
      life: basePlayerLifeSchema(),
      development: basePlayerDevelopmentSchema(),
      biography: basePlayerBiographySchema(),
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
      activeEvent: null,
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
  var i;
  if (!sourceWorld || typeof sourceWorld !== "object") {
    return normalized;
  }
  normalized.opponents = sourceWorld.opponents instanceof Array ? clonePlainData(sourceWorld.opponents) : [];
  if (sourceWorld.offers && typeof sourceWorld.offers === "object") {
    normalized.offers.weekStamp = typeof sourceWorld.offers.weekStamp === "number" ? sourceWorld.offers.weekStamp : 0;
    normalized.offers.available = sourceWorld.offers.available instanceof Array ? clonePlainData(sourceWorld.offers.available) : [];
    normalized.offers.headline = sourceWorld.offers.headline || "";
    normalized.offers.fightOffers = sourceWorld.offers.fightOffers instanceof Array ? clonePlainData(sourceWorld.offers.fightOffers) : [];
    normalized.offers.contractOffers = sourceWorld.offers.contractOffers instanceof Array ? clonePlainData(sourceWorld.offers.contractOffers) : [];
  }
  if (sourceWorld.npcs instanceof Array) {
    normalized.npcs = [];
    for (i = 0; i < sourceWorld.npcs.length; i += 1) {
      normalized.npcs.push(normalizeNpcEntry(sourceWorld.npcs[i]));
    }
  }
  if (sourceWorld.relationships instanceof Array) {
    normalized.relationships = [];
    for (i = 0; i < sourceWorld.relationships.length; i += 1) {
      normalized.relationships.push(normalizeRelationshipEntry(sourceWorld.relationships[i]));
    }
  }
  if (sourceWorld.relationshipArcs instanceof Array) {
    normalized.relationshipArcs = [];
    for (i = 0; i < sourceWorld.relationshipArcs.length; i += 1) {
      normalized.relationshipArcs.push(normalizeRelationshipArcEntry(sourceWorld.relationshipArcs[i]));
    }
  }
  if (sourceWorld.rivalries instanceof Array) {
    normalized.rivalries = [];
    for (i = 0; i < sourceWorld.rivalries.length; i += 1) {
      normalized.rivalries.push(normalizeRivalryEntry(sourceWorld.rivalries[i]));
    }
  }
  normalized.contracts = sourceWorld.contracts instanceof Array ? clonePlainData(sourceWorld.contracts) : [];
  if (sourceWorld.gymMembership && typeof sourceWorld.gymMembership === "object") {
    normalized.gymMembership = clonePlainData(baseGymMembershipSchema());
    if (sourceWorld.gymMembership.gymId) { normalized.gymMembership.gymId = sourceWorld.gymMembership.gymId; }
    if (typeof sourceWorld.gymMembership.joinedWeek === "number") { normalized.gymMembership.joinedWeek = sourceWorld.gymMembership.joinedWeek; }
    normalized.gymMembership.country = sourceWorld.gymMembership.country || "";
    normalized.gymMembership.city = sourceWorld.gymMembership.city || "";
    if (typeof sourceWorld.gymMembership.weeklyCost === "number") { normalized.gymMembership.weeklyCost = sourceWorld.gymMembership.weeklyCost; }
    if (typeof sourceWorld.gymMembership.reputation === "number") { normalized.gymMembership.reputation = sourceWorld.gymMembership.reputation; }
    normalized.gymMembership.specialization = sourceWorld.gymMembership.specialization || "";
    normalized.gymMembership.bonuses = sourceWorld.gymMembership.bonuses ? clonePlainData(sourceWorld.gymMembership.bonuses) : {};
  }
  if (sourceWorld.trainerAssignment && typeof sourceWorld.trainerAssignment === "object") {
    normalized.trainerAssignment = clonePlainData(baseTrainerAssignmentSchema());
    if (sourceWorld.trainerAssignment.npcId) { normalized.trainerAssignment.npcId = sourceWorld.trainerAssignment.npcId; }
    if (sourceWorld.trainerAssignment.trainerTypeId) { normalized.trainerAssignment.trainerTypeId = sourceWorld.trainerAssignment.trainerTypeId; }
    if (sourceWorld.trainerAssignment.gymId) { normalized.trainerAssignment.gymId = sourceWorld.trainerAssignment.gymId; }
    if (typeof sourceWorld.trainerAssignment.hiredWeek === "number") { normalized.trainerAssignment.hiredWeek = sourceWorld.trainerAssignment.hiredWeek; }
    if (typeof sourceWorld.trainerAssignment.weeklyFee === "number") { normalized.trainerAssignment.weeklyFee = sourceWorld.trainerAssignment.weeklyFee; }
    normalized.trainerAssignment.status = sourceWorld.trainerAssignment.status || "active";
  }
  if (sourceWorld.activeContract && typeof sourceWorld.activeContract === "object") {
    normalized.activeContract = clonePlainData(baseContractSchema());
    normalized.activeContract.id = sourceWorld.activeContract.id || "";
    normalized.activeContract.templateId = sourceWorld.activeContract.templateId || "";
    normalized.activeContract.promoterId = sourceWorld.activeContract.promoterId || "";
    normalized.activeContract.label = sourceWorld.activeContract.label || "";
    if (typeof sourceWorld.activeContract.signedWeek === "number") { normalized.activeContract.signedWeek = sourceWorld.activeContract.signedWeek; }
    if (typeof sourceWorld.activeContract.endsWeek === "number") { normalized.activeContract.endsWeek = sourceWorld.activeContract.endsWeek; }
    if (typeof sourceWorld.activeContract.guaranteedPurse === "number") { normalized.activeContract.guaranteedPurse = sourceWorld.activeContract.guaranteedPurse; }
    if (typeof sourceWorld.activeContract.winBonus === "number") { normalized.activeContract.winBonus = sourceWorld.activeContract.winBonus; }
    if (typeof sourceWorld.activeContract.koBonus === "number") { normalized.activeContract.koBonus = sourceWorld.activeContract.koBonus; }
    if (typeof sourceWorld.activeContract.fameMultiplier === "number") { normalized.activeContract.fameMultiplier = sourceWorld.activeContract.fameMultiplier; }
    if (typeof sourceWorld.activeContract.fightFrequency === "number") { normalized.activeContract.fightFrequency = sourceWorld.activeContract.fightFrequency; }
    if (typeof sourceWorld.activeContract.toxicRisk === "number") { normalized.activeContract.toxicRisk = sourceWorld.activeContract.toxicRisk; }
    if (typeof sourceWorld.activeContract.reputationDelta === "number") { normalized.activeContract.reputationDelta = sourceWorld.activeContract.reputationDelta; }
    normalized.activeContract.conditionsText = sourceWorld.activeContract.conditionsText || "";
    normalized.activeContract.status = sourceWorld.activeContract.status || "active";
  }
  if (sourceWorld.eventState && typeof sourceWorld.eventState === "object") {
    normalized.eventState.cooldowns = sourceWorld.eventState.cooldowns ? clonePlainData(sourceWorld.eventState.cooldowns) : {};
    normalized.eventState.onceResolved = sourceWorld.eventState.onceResolved instanceof Array ? clonePlainData(sourceWorld.eventState.onceResolved) : [];
    normalized.eventState.recentEvents = sourceWorld.eventState.recentEvents instanceof Array ? clonePlainData(sourceWorld.eventState.recentEvents) : [];
    normalized.eventState.actionHistory = sourceWorld.eventState.actionHistory instanceof Array ? clonePlainData(sourceWorld.eventState.actionHistory) : [];
  }
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
      if (source.player.conditions.injuries instanceof Array) {
        normalized.player.conditions.injuries = [];
        for (key = 0; key < source.player.conditions.injuries.length; key += 1) {
          normalized.player.conditions.injuries.push(normalizeInjuryEntry(source.player.conditions.injuries[key]));
        }
      }
    }
    if (source.player.life) {
      normalized.player.life.housingId = source.player.life.housingId || normalized.player.life.housingId;
      if (typeof source.player.life.support === "number") { normalized.player.life.support = source.player.life.support; }
    }
    if (source.player.development) {
      normalized.player.development.focusId = source.player.development.focusId || normalized.player.development.focusId;
      if (typeof source.player.development.totalXp === "number") { normalized.player.development.totalXp = source.player.development.totalXp; }
      if (typeof source.player.development.perkPoints === "number") { normalized.player.development.perkPoints = source.player.development.perkPoints; }
      for (key in normalized.player.development.focusProgress) {
        if (normalized.player.development.focusProgress.hasOwnProperty(key) && source.player.development.focusProgress && typeof source.player.development.focusProgress[key] === "number") {
          normalized.player.development.focusProgress[key] = source.player.development.focusProgress[key];
        }
      }
      for (key in normalized.player.development.styleProgress) {
        if (normalized.player.development.styleProgress.hasOwnProperty(key) && source.player.development.styleProgress && typeof source.player.development.styleProgress[key] === "number") {
          normalized.player.development.styleProgress[key] = source.player.development.styleProgress[key];
        }
      }
      normalized.player.development.activePerks = source.player.development.activePerks instanceof Array ? clonePlainData(source.player.development.activePerks) : [];
    }
    if (source.player.biography) {
      normalized.player.biography.flags = source.player.biography.flags instanceof Array ? clonePlainData(source.player.biography.flags) : [];
      normalized.player.biography.history = source.player.biography.history instanceof Array ? clonePlainData(source.player.biography.history) : [];
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
    normalized.ui.activeEvent = source.ui.activeEvent ? clonePlainData(source.ui.activeEvent) : null;
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
  gameState.ui.activeEvent = snapshot && snapshot.activeEvent ? clonePlainData(snapshot.activeEvent) : null;
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
    if (fighter.injuries instanceof Array) {
      gameState.player.conditions.injuries = [];
      for (key = 0; key < fighter.injuries.length; key += 1) {
        gameState.player.conditions.injuries.push(normalizeInjuryEntry(fighter.injuries[key]));
      }
    }
    gameState.player.life.housingId = fighter.housingId || gameState.player.life.housingId;
    gameState.player.life.support = typeof fighter.support === "number" ? fighter.support : gameState.player.life.support;
    if (fighter.development && typeof fighter.development === "object") {
      gameState.player.development = normalizeGameState({
        player: {
          development: fighter.development
        }
      }, options).player.development;
    }
    gameState.player.biography.flags = fighter.bioFlags instanceof Array ? clonePlainData(fighter.bioFlags) : [];
    gameState.player.biography.history = fighter.bioHistory instanceof Array ? clonePlainData(fighter.bioHistory) : [];
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
    activeEvent: runtimeState ? runtimeState.activeEvent : null,
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
  target.activeEvent = normalized.ui.activeEvent ? clonePlainData(normalized.ui.activeEvent) : null;
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
    injuries: clonePlainData(normalized.player.conditions.injuries),
    housingId: normalized.player.life.housingId,
    support: normalized.player.life.support,
    development: clonePlainData(normalized.player.development),
    startingAge: normalized.player.conditions.startingAge,
    bioFlags: clonePlainData(normalized.player.biography.flags),
    bioHistory: clonePlainData(normalized.player.biography.history),
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
