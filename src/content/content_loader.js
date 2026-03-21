var ContentLoader = (function () {
  var cache = null;
  var GENERATED_GYM_COSTS = [15, 35, 60, 100, 150];
  var GENERATED_TRAINER_FEES = [15, 35, 60, 100, 150];

  function clone(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  function monthlyToWeekly(value) {
    return Math.max(4, Math.ceil((value || 0) / 4));
  }

  function normalizeSeedRosterEntry(entry, trackId) {
    var normalized = clone(entry || {});
    normalized.currentTrack = normalized.currentTrack || trackId || "street";
    normalized.trackId = normalized.trackId || normalized.currentTrack;
    return normalized;
  }

  function buildSeedRoster(trackId, sourceList) {
    var roster = [];
    var i;
    for (i = 0; i < sourceList.length; i += 1) {
      roster.push(normalizeSeedRosterEntry(sourceList[i], trackId));
    }
    return roster;
  }

  function youthDataRoot() {
    return typeof YOUTH_AMATEUR_DATA !== "undefined" && YOUTH_AMATEUR_DATA ? YOUTH_AMATEUR_DATA : {
      agePhases: [],
      livingModes: [],
      amateurRanks: [],
      rankLabelsByCountry: { "default": {} },
      amateurFightOfferTemplates: []
    };
  }

  function amateurDataRoot() {
    return typeof AMATEUR_ECOSYSTEM_DATA !== "undefined" && AMATEUR_ECOSYSTEM_DATA ? AMATEUR_ECOSYSTEM_DATA : {
      organizationTypes: [],
      trainerRoleTypes: [],
      organizationTemplates: [],
      teamTemplate: null,
      nationalTeamStatuses: [],
      amateurGoals: []
    };
  }

  function amateurSeasonDataRoot() {
    return typeof AMATEUR_SEASON_DATA !== "undefined" && AMATEUR_SEASON_DATA ? AMATEUR_SEASON_DATA : {
      seasonTemplate: null,
      tournamentTypes: [],
      tournamentTemplates: []
    };
  }

  function worldCareerDataRoot() {
    return typeof WORLD_CAREER_SIM_DATA !== "undefined" && WORLD_CAREER_SIM_DATA ? WORLD_CAREER_SIM_DATA : {
      goalProfiles: [],
      transitionRules: {},
      worldHistoryHooks: [],
      encounterTags: []
    };
  }

  function streetCareerDataRoot() {
    return typeof STREET_CAREER_DATA !== "undefined" && STREET_CAREER_DATA ? STREET_CAREER_DATA : {
      organizationTypes: [],
      ladderStages: [],
      districtTemplates: [],
      offerTemplates: [],
      reputationTags: [],
      mediaTemplates: [],
      transitionRules: {}
    };
  }

  function generatedMinRankByIndex(index) {
    var rankIds = ["", "junior_class_3", "junior_class_2", "adult_class_3", "adult_class_2"];
    return rankIds[index] || "";
  }

  function generatedGymTemplates() {
    return [
      { slug: "yard", label: "Районный зал", bonuses: { trainingPoints: 1, safeBias: 1 }, developmentProfile: { focusBoosts: { power: 1 }, styleWeights: { puncher: 1 } } },
      { slug: "school", label: "Городской зал", bonuses: { trainingPoints: 2, recoveryHealth: 1, safeBias: 1 }, developmentProfile: { focusBoosts: { endurance: 1, defense: 1 }, styleWeights: { tempo: 1, counterpuncher: 1 } } },
      { slug: "club", label: "Спортивный зал", bonuses: { trainingPoints: 3, fameBonus: 1, purseBonus: 3 }, developmentProfile: { focusBoosts: { technique: 1, endurance: 1 }, styleWeights: { outboxer: 1, tempo: 1 } } },
      { slug: "camp", label: "Профессиональный зал", bonuses: { trainingPoints: 4, fameBonus: 2, purseBonus: 7, recoveryHealth: 2 }, developmentProfile: { focusBoosts: { power: 1, technique: 1, defense: 1 }, styleWeights: { puncher: 1, outboxer: 1, counterpuncher: 1 } } },
      { slug: "elite", label: "Большой зал", bonuses: { trainingPoints: 5, fameBonus: 3, purseBonus: 12, koBonus: 15, toxicGuard: 5, safeBias: 1 }, developmentProfile: { focusBoosts: { power: 2, technique: 1, defense: 1, recovery: 1 }, styleWeights: { puncher: 1, outboxer: 1, counterpuncher: 1 } } }
    ];
  }

  function generatedTrainerTemplates() {
    return [
      { slug: "trainer_1", label: "Тренер 1", coachRoleId: "youth_trainer", bonuses: { trainingPoints: 1, recoveryHealth: 1 }, developmentProfile: { focusBoosts: { technique: 1 }, styleWeights: { outboxer: 1 } } },
      { slug: "trainer_2", label: "Тренер 2", coachRoleId: "amateur_trainer", bonuses: { trainingPoints: 2, recoveryHealth: 1, stressRelief: 1 }, developmentProfile: { focusBoosts: { endurance: 1, defense: 1 }, styleWeights: { tempo: 1, counterpuncher: 1 } } },
      { slug: "trainer_3", label: "Тренер 3", coachRoleId: "amateur_trainer", bonuses: { trainingPoints: 3, fameBonus: 1, safeBias: 1 }, developmentProfile: { focusBoosts: { technique: 2, defense: 1 }, styleWeights: { outboxer: 1, counterpuncher: 1 } } },
      { slug: "trainer_4", label: "Тренер 4", coachRoleId: "elite_amateur_coach", bonuses: { trainingPoints: 4, purseBonus: 6, koBonus: 10, toxicGuard: 2 }, developmentProfile: { focusBoosts: { power: 2, endurance: 1 }, styleWeights: { puncher: 2, tempo: 1 } } },
      { slug: "trainer_5", label: "Тренер 5", coachRoleId: "national_team_coach", bonuses: { trainingPoints: 5, fameBonus: 3, purseBonus: 10, koBonus: 18, toxicGuard: 5, recoveryHealth: 2 }, developmentProfile: { focusBoosts: { power: 2, technique: 1, defense: 1, recovery: 1 }, styleWeights: { puncher: 1, outboxer: 1, counterpuncher: 1 } } }
    ];
  }

  function cityFromDefinition(definition, index) {
    var arenas = definition && definition.arenas ? definition.arenas : [];
    if (arenas.length) {
      return arenas[index % arenas.length].city;
    }
    return definition && definition.name ? definition.name : "";
  }

  function buildGeneratedTrainerTypes(countryDefinitions) {
    var templates = generatedTrainerTemplates();
    var trainerTypes = [];
    var i;
    var j;
    var definition;
    var template;
    var city;
    for (i = 0; i < countryDefinitions.length; i += 1) {
      definition = countryDefinitions[i];
      for (j = 0; j < templates.length; j += 1) {
        template = templates[j];
        city = cityFromDefinition(definition, j);
        trainerTypes.push({
          id: definition.id + "_trainer_" + (j + 1),
          country: definition.id,
          city: city,
          label: template.label,
          coachRoleId: template.coachRoleId || "",
          monthlyFee: GENERATED_TRAINER_FEES[j],
          weeklyFee: monthlyToWeekly(GENERATED_TRAINER_FEES[j]),
          reputation: 35 + j * 5,
          minRankId: generatedMinRankByIndex(j),
          bonuses: clone(template.bonuses),
          developmentProfile: clone(template.developmentProfile)
        });
      }
    }
    return trainerTypes;
  }

  function buildGeneratedGyms(countryDefinitions) {
    var templates = generatedGymTemplates();
    var gyms = [];
    var i;
    var j;
    var definition;
    var template;
    var city;
    var trainerIds;
    for (i = 0; i < countryDefinitions.length; i += 1) {
      definition = countryDefinitions[i];
      trainerIds = [];
      for (j = 0; j < templates.length; j += 1) {
        trainerIds.push(definition.id + "_trainer_" + (j + 1));
      }
      for (j = 0; j < templates.length; j += 1) {
        template = templates[j];
        city = cityFromDefinition(definition, j);
        gyms.push({
          id: definition.id + "_gym_" + (j + 1),
          country: definition.id,
          city: city,
          name: city + " " + template.label,
          cost: GENERATED_GYM_COSTS[j],
          weeklyCost: monthlyToWeekly(GENERATED_GYM_COSTS[j]),
          reputation: 30 + j * 6,
          minRankId: generatedMinRankByIndex(j),
          bonuses: clone(template.bonuses),
          trainerTypeIds: trainerIds.slice(0),
          developmentProfile: clone(template.developmentProfile)
        });
      }
    }
    return gyms;
  }

  function buildCountry(definition) {
    var sourcePools = COUNTRY_DATA.pools[definition.id] || null;
    var seedConfig = COUNTRY_DATA.seeds[definition.id] || null;
    var primaryArena = definition.arenas && definition.arenas.length ? definition.arenas[0] : null;
    return {
      id: definition.id,
      key: definition.id,
      name: definition.name,
      pools: sourcePools ? clone(sourcePools) : null,
      seedConfig: seedConfig ? clone(seedConfig) : null,
      identityOverride: definition.identityOverride ? clone(definition.identityOverride) : null,
      homeMoneyMultiplier: definition.homeMoneyMultiplier,
      homeFameMultiplier: definition.homeFameMultiplier,
      abroadFameMultiplier: definition.abroadFameMultiplier,
      baseLivingCost: definition.baseLivingCost,
      schoolStyle: definition.schoolStyle,
      arenas: clone(definition.arenas || []),
      x: definition.map ? definition.map.x : 0,
      y: definition.map ? definition.map.y : 0,
      city: primaryArena ? primaryArena.city : "",
      venueName: primaryArena ? primaryArena.name : ""
    };
  }

  function ensureCache() {
    var i;
    var country;
    var gym;
    var trainerType;
    var contractTemplate;
    var fightOfferTemplate;
    var housingOption;
    var socialAction;
    var developmentStyle;
    var trainingFocus;
    var perk;
    var injuryType;
    var opponentArchetype;
    var contextEvents = [];
    if (cache) {
      return cache;
    }
    cache = {
      countries: [],
      countriesById: {},
      seedRosters: {
        street: buildSeedRoster("street", typeof STREET_SEED_ROSTER !== "undefined" && STREET_SEED_ROSTER instanceof Array ? STREET_SEED_ROSTER : []),
        amateur: buildSeedRoster("amateur", typeof AMATEUR_SEED_ROSTER !== "undefined" && AMATEUR_SEED_ROSTER instanceof Array ? AMATEUR_SEED_ROSTER : []),
        pro: buildSeedRoster("pro", typeof PRO_SEED_ROSTER !== "undefined" && PRO_SEED_ROSTER instanceof Array ? PRO_SEED_ROSTER : [])
      },
      seedRosterById: {},
      opponentTypes: clone(CONTENT_DATA.opponentTypes || []),
      opponentTiers: clone(CONTENT_DATA.opponentTiers || {}),
      npcRoles: clone(CONTENT_DATA.npcRoles || []),
      npcRolesById: {},
      gyms: buildGeneratedGyms(CONTENT_DATA.countries || []),
      gymsById: {},
      gymsByCountry: {},
      trainerTypes: buildGeneratedTrainerTypes(CONTENT_DATA.countries || []),
      trainerTypesById: {},
      trainerTypesByCountry: {},
      amateurOrganizationTypes: clone((amateurDataRoot().organizationTypes) || []),
      amateurOrganizationTypesById: {},
      amateurTrainerRoles: clone((amateurDataRoot().trainerRoleTypes) || []),
      amateurTrainerRolesById: {},
      amateurOrganizationTemplates: clone((amateurDataRoot().organizationTemplates) || []),
      amateurOrganizationTemplatesById: {},
      amateurTeamTemplate: clone((amateurDataRoot().teamTemplate) || null),
      nationalTeamStatuses: clone((amateurDataRoot().nationalTeamStatuses) || []),
      nationalTeamStatusesById: {},
      amateurGoals: clone((amateurDataRoot().amateurGoals) || []),
      amateurSeasonTemplate: clone((amateurSeasonDataRoot().seasonTemplate) || null),
      tournamentTypes: clone((amateurSeasonDataRoot().tournamentTypes) || []),
      tournamentTypesById: {},
      amateurTournamentTemplates: clone((amateurSeasonDataRoot().tournamentTemplates) || []),
      amateurTournamentTemplatesById: {},
      worldGoalProfiles: clone((worldCareerDataRoot().goalProfiles) || []),
      worldGoalProfilesById: {},
      worldTransitionRules: clone((worldCareerDataRoot().transitionRules) || {}),
      worldHistoryHooks: clone((worldCareerDataRoot().worldHistoryHooks) || []),
      worldEncounterTags: clone((worldCareerDataRoot().encounterTags) || []),
      streetOrganizationTypes: clone((streetCareerDataRoot().organizationTypes) || []),
      streetOrganizationTypesById: {},
      streetLadderStages: clone((streetCareerDataRoot().ladderStages) || []),
      streetLadderStagesById: {},
      streetDistrictTemplates: clone((streetCareerDataRoot().districtTemplates) || []),
      streetDistrictTemplatesById: {},
      streetOfferTemplates: clone((streetCareerDataRoot().offerTemplates) || []),
      streetOfferTemplatesById: {},
      streetReputationTags: clone((streetCareerDataRoot().reputationTags) || []),
      streetMediaTemplates: clone((streetCareerDataRoot().mediaTemplates) || []),
      streetTransitionRules: clone((streetCareerDataRoot().transitionRules) || {}),
      contractTemplates: clone((typeof CAREER_ECOSYSTEM_DATA !== "undefined" && CAREER_ECOSYSTEM_DATA.contractTemplates) || []),
      contractTemplatesById: {},
      fightOfferTemplates: clone(((typeof CAREER_ECOSYSTEM_DATA !== "undefined" && CAREER_ECOSYSTEM_DATA.fightOfferTemplates) || []).concat((youthDataRoot().amateurFightOfferTemplates) || [])),
      fightOfferTemplatesById: {},
      housingOptions: clone((typeof LIFE_DATA !== "undefined" && LIFE_DATA.housingOptions) || []),
      housingOptionsById: {},
      livingModes: clone((youthDataRoot().livingModes) || []),
      livingModesById: {},
      agePhases: clone((youthDataRoot().agePhases) || []),
      agePhasesById: {},
      amateurRanks: clone((youthDataRoot().amateurRanks) || []),
      amateurRanksById: {},
      rankLabelsByCountry: clone((youthDataRoot().rankLabelsByCountry) || { "default": {} }),
      socialActions: clone((typeof LIFE_DATA !== "undefined" && LIFE_DATA.socialActions) || []),
      socialActionsById: {},
      developmentStyles: clone((typeof DEVELOPMENT_DATA !== "undefined" && DEVELOPMENT_DATA.styles) || []),
      developmentStylesById: {},
      trainingFocuses: clone((typeof DEVELOPMENT_DATA !== "undefined" && DEVELOPMENT_DATA.trainingFocuses) || []),
      trainingFocusesById: {},
      developmentPerks: clone((typeof DEVELOPMENT_DATA !== "undefined" && DEVELOPMENT_DATA.perks) || []),
      developmentPerksById: {},
      trainerDevelopmentProfiles: clone((typeof DEVELOPMENT_DATA !== "undefined" && DEVELOPMENT_DATA.trainerProfiles) || {}),
      gymDevelopmentProfiles: clone((typeof DEVELOPMENT_DATA !== "undefined" && DEVELOPMENT_DATA.gymProfiles) || {}),
      injuryTypes: clone((typeof COMBAT_STATE_DATA !== "undefined" && COMBAT_STATE_DATA.injuryTypes) || []),
      injuryTypesById: {},
      opponentArchetypes: clone((typeof COMBAT_STATE_DATA !== "undefined" && COMBAT_STATE_DATA.opponentArchetypes) || []),
      opponentArchetypesById: {},
      campFightProfiles: clone((typeof COMBAT_STATE_DATA !== "undefined" && COMBAT_STATE_DATA.campFightProfiles) || {}),
      relationshipArcTemplates: clone((typeof RELATIONSHIP_ARC_DATA !== "undefined" && RELATIONSHIP_ARC_DATA.templates) || []),
      reputationTags: clone((typeof REPUTATION_LEGEND_DATA !== "undefined" && REPUTATION_LEGEND_DATA.reputationTags) || []),
      mediaTemplates: clone((typeof REPUTATION_LEGEND_DATA !== "undefined" && REPUTATION_LEGEND_DATA.mediaTemplates) || []),
      endingArchetypes: clone((typeof REPUTATION_LEGEND_DATA !== "undefined" && REPUTATION_LEGEND_DATA.endingArchetypes) || []),
      contextEventTriggerChance: typeof EVENT_DATA !== "undefined" && typeof EVENT_DATA.triggerChance === "number" ? EVENT_DATA.triggerChance : 0,
      contextEvents: []
    };
    if (typeof EVENT_DATA !== "undefined" && EVENT_DATA.events instanceof Array) {
      contextEvents = contextEvents.concat(clone(EVENT_DATA.events));
    }
    if (typeof LIFE_EVENT_DATA !== "undefined" && LIFE_EVENT_DATA.events instanceof Array) {
      contextEvents = contextEvents.concat(clone(LIFE_EVENT_DATA.events));
    }
    cache.contextEvents = contextEvents;
    for (i = 0; i < CONTENT_DATA.countries.length; i += 1) {
      country = buildCountry(CONTENT_DATA.countries[i]);
      cache.countries.push(country);
      cache.countriesById[country.id] = country;
    }
    for (i = 0; i < cache.seedRosters.street.length; i += 1) {
      cache.seedRosterById[cache.seedRosters.street[i].id] = cache.seedRosters.street[i];
    }
    for (i = 0; i < cache.seedRosters.amateur.length; i += 1) {
      cache.seedRosterById[cache.seedRosters.amateur[i].id] = cache.seedRosters.amateur[i];
    }
    for (i = 0; i < cache.seedRosters.pro.length; i += 1) {
      cache.seedRosterById[cache.seedRosters.pro[i].id] = cache.seedRosters.pro[i];
    }
    for (i = 0; i < cache.npcRoles.length; i += 1) {
      cache.npcRolesById[cache.npcRoles[i].id] = cache.npcRoles[i];
    }
    for (i = 0; i < cache.amateurOrganizationTypes.length; i += 1) {
      cache.amateurOrganizationTypesById[cache.amateurOrganizationTypes[i].id] = cache.amateurOrganizationTypes[i];
    }
    for (i = 0; i < cache.amateurTrainerRoles.length; i += 1) {
      cache.amateurTrainerRolesById[cache.amateurTrainerRoles[i].id] = cache.amateurTrainerRoles[i];
    }
    for (i = 0; i < cache.amateurOrganizationTemplates.length; i += 1) {
      cache.amateurOrganizationTemplatesById[cache.amateurOrganizationTemplates[i].id] = cache.amateurOrganizationTemplates[i];
    }
    for (i = 0; i < cache.nationalTeamStatuses.length; i += 1) {
      cache.nationalTeamStatusesById[cache.nationalTeamStatuses[i].id] = cache.nationalTeamStatuses[i];
    }
    for (i = 0; i < cache.tournamentTypes.length; i += 1) {
      cache.tournamentTypesById[cache.tournamentTypes[i].id] = cache.tournamentTypes[i];
    }
    for (i = 0; i < cache.amateurTournamentTemplates.length; i += 1) {
      cache.amateurTournamentTemplatesById[cache.amateurTournamentTemplates[i].id] = cache.amateurTournamentTemplates[i];
    }
    for (i = 0; i < cache.worldGoalProfiles.length; i += 1) {
      cache.worldGoalProfilesById[cache.worldGoalProfiles[i].id] = cache.worldGoalProfiles[i];
    }
    for (i = 0; i < cache.streetOrganizationTypes.length; i += 1) {
      cache.streetOrganizationTypesById[cache.streetOrganizationTypes[i].id] = cache.streetOrganizationTypes[i];
    }
    for (i = 0; i < cache.streetLadderStages.length; i += 1) {
      cache.streetLadderStagesById[cache.streetLadderStages[i].id] = cache.streetLadderStages[i];
    }
    for (i = 0; i < cache.streetDistrictTemplates.length; i += 1) {
      cache.streetDistrictTemplatesById[cache.streetDistrictTemplates[i].id] = cache.streetDistrictTemplates[i];
    }
    for (i = 0; i < cache.streetOfferTemplates.length; i += 1) {
      cache.streetOfferTemplatesById[cache.streetOfferTemplates[i].id] = cache.streetOfferTemplates[i];
      cache.fightOfferTemplates.push(cache.streetOfferTemplates[i]);
    }
    for (i = 0; i < cache.gyms.length; i += 1) {
      gym = cache.gyms[i];
      cache.gymsById[gym.id] = gym;
      if (!cache.gymsByCountry[gym.country]) {
        cache.gymsByCountry[gym.country] = [];
      }
      cache.gymsByCountry[gym.country].push(gym);
    }
    for (i = 0; i < cache.trainerTypes.length; i += 1) {
      trainerType = cache.trainerTypes[i];
      cache.trainerTypesById[trainerType.id] = trainerType;
      if (!cache.trainerTypesByCountry[trainerType.country]) {
        cache.trainerTypesByCountry[trainerType.country] = [];
      }
      cache.trainerTypesByCountry[trainerType.country].push(trainerType);
    }
    for (i = 0; i < cache.contractTemplates.length; i += 1) {
      contractTemplate = cache.contractTemplates[i];
      cache.contractTemplatesById[contractTemplate.id] = contractTemplate;
    }
    for (i = 0; i < cache.fightOfferTemplates.length; i += 1) {
      fightOfferTemplate = cache.fightOfferTemplates[i];
      cache.fightOfferTemplatesById[fightOfferTemplate.id] = fightOfferTemplate;
    }
    for (i = 0; i < cache.streetReputationTags.length; i += 1) {
      cache.reputationTags.push(cache.streetReputationTags[i]);
    }
    for (i = 0; i < cache.streetMediaTemplates.length; i += 1) {
      cache.mediaTemplates.push(cache.streetMediaTemplates[i]);
    }
    for (i = 0; i < cache.housingOptions.length; i += 1) {
      housingOption = cache.housingOptions[i];
      cache.housingOptionsById[housingOption.id] = housingOption;
    }
    for (i = 0; i < cache.livingModes.length; i += 1) {
      cache.livingModesById[cache.livingModes[i].id] = cache.livingModes[i];
    }
    for (i = 0; i < cache.agePhases.length; i += 1) {
      cache.agePhasesById[cache.agePhases[i].id] = cache.agePhases[i];
    }
    for (i = 0; i < cache.amateurRanks.length; i += 1) {
      cache.amateurRanksById[cache.amateurRanks[i].id] = cache.amateurRanks[i];
    }
    for (i = 0; i < cache.socialActions.length; i += 1) {
      socialAction = cache.socialActions[i];
      cache.socialActionsById[socialAction.id] = socialAction;
    }
    for (i = 0; i < cache.developmentStyles.length; i += 1) {
      developmentStyle = cache.developmentStyles[i];
      cache.developmentStylesById[developmentStyle.id] = developmentStyle;
    }
    for (i = 0; i < cache.trainingFocuses.length; i += 1) {
      trainingFocus = cache.trainingFocuses[i];
      cache.trainingFocusesById[trainingFocus.id] = trainingFocus;
    }
    for (i = 0; i < cache.developmentPerks.length; i += 1) {
      perk = cache.developmentPerks[i];
      cache.developmentPerksById[perk.id] = perk;
    }
    for (i = 0; i < cache.injuryTypes.length; i += 1) {
      injuryType = cache.injuryTypes[i];
      cache.injuryTypesById[injuryType.id] = injuryType;
    }
    for (i = 0; i < cache.opponentArchetypes.length; i += 1) {
      opponentArchetype = cache.opponentArchetypes[i];
      cache.opponentArchetypesById[opponentArchetype.id] = opponentArchetype;
    }
    return cache;
  }

  function listCountries() {
    return ensureCache().countries;
  }

  function getCountry(countryId) {
    return ensureCache().countriesById[countryId] || null;
  }

  function getCountryPool(countryId) {
    var country = getCountry(countryId);
    return country ? country.pools : null;
  }

  function getCountrySeedConfig(countryId) {
    var country = getCountry(countryId);
    return country ? country.seedConfig : null;
  }

  function getCountryEffects(countryId) {
    var country = getCountry(countryId);
    if (!country) {
      return null;
    }
    return {
      homeMoneyMultiplier: country.homeMoneyMultiplier,
      homeFameMultiplier: country.homeFameMultiplier,
      abroadFameMultiplier: country.abroadFameMultiplier,
      baseLivingCost: country.baseLivingCost,
      schoolStyle: country.schoolStyle
    };
  }

  function getCountryArenas(countryId) {
    var country = getCountry(countryId);
    return country ? clone(country.arenas) : [];
  }

  function getRandomArena(countryId) {
    var country = getCountry(countryId);
    if (!country || !country.arenas.length) {
      return null;
    }
    return choice(country.arenas);
  }

  function listSeedRoster(trackId) {
    return clone(ensureCache().seedRosters[trackId] || []);
  }

  function listAllSeedRosterFighters() {
    var cacheRef = ensureCache();
    var all = [];
    var i;
    for (i = 0; i < cacheRef.seedRosters.street.length; i += 1) {
      all.push(clone(cacheRef.seedRosters.street[i]));
    }
    for (i = 0; i < cacheRef.seedRosters.amateur.length; i += 1) {
      all.push(clone(cacheRef.seedRosters.amateur[i]));
    }
    for (i = 0; i < cacheRef.seedRosters.pro.length; i += 1) {
      all.push(clone(cacheRef.seedRosters.pro[i]));
    }
    return all;
  }

  function getSeedRosterFighter(fighterId) {
    return clone(ensureCache().seedRosterById[fighterId] || null);
  }

  function listOpponentTypes() {
    return ensureCache().opponentTypes;
  }

  function getOpponentTier(tierId) {
    return ensureCache().opponentTiers[tierId] || ensureCache().opponentTiers.even;
  }

  function getContextEventTriggerChance() {
    return ensureCache().contextEventTriggerChance;
  }

  function getContextEvents() {
    return ensureCache().contextEvents;
  }

  function listGyms() {
    return ensureCache().gyms;
  }

  function getGym(gymId) {
    return ensureCache().gymsById[gymId] || null;
  }

  function listGymsByCountry(countryId) {
    return clone(ensureCache().gymsByCountry[countryId] || []);
  }

  function listTrainerTypes() {
    return ensureCache().trainerTypes;
  }

  function listTrainerTypesByCountry(countryId) {
    return clone(ensureCache().trainerTypesByCountry[countryId] || []);
  }

  function getTrainerType(typeId) {
    return ensureCache().trainerTypesById[typeId] || null;
  }

  function listAmateurOrganizationTypes() {
    return ensureCache().amateurOrganizationTypes;
  }

  function getAmateurOrganizationType(typeId) {
    return ensureCache().amateurOrganizationTypesById[typeId] || null;
  }

  function listAmateurTrainerRoles() {
    return ensureCache().amateurTrainerRoles;
  }

  function getAmateurTrainerRole(roleId) {
    return ensureCache().amateurTrainerRolesById[roleId] || null;
  }

  function listAmateurOrganizationTemplates() {
    return ensureCache().amateurOrganizationTemplates;
  }

  function getAmateurOrganizationTemplate(templateId) {
    return ensureCache().amateurOrganizationTemplatesById[templateId] || null;
  }

  function getAmateurTeamTemplate() {
    return ensureCache().amateurTeamTemplate;
  }

  function listNationalTeamStatuses() {
    return ensureCache().nationalTeamStatuses;
  }

  function getNationalTeamStatus(statusId) {
    return ensureCache().nationalTeamStatusesById[statusId] || null;
  }

  function listAmateurGoals() {
    return ensureCache().amateurGoals;
  }

  function getAmateurSeasonTemplate() {
    return clone(ensureCache().amateurSeasonTemplate || null);
  }

  function listTournamentTypes() {
    return ensureCache().tournamentTypes;
  }

  function getTournamentType(typeId) {
    return ensureCache().tournamentTypesById[typeId] || null;
  }

  function listAmateurTournamentTemplates() {
    return ensureCache().amateurTournamentTemplates;
  }

  function getAmateurTournamentTemplate(templateId) {
    return ensureCache().amateurTournamentTemplatesById[templateId] || null;
  }

  function listWorldGoalProfiles() {
    return ensureCache().worldGoalProfiles;
  }

  function getWorldGoalProfile(goalProfileId) {
    return ensureCache().worldGoalProfilesById[goalProfileId] || null;
  }

  function getWorldTransitionRules() {
    return clone(ensureCache().worldTransitionRules || {});
  }

  function listWorldHistoryHooks() {
    return ensureCache().worldHistoryHooks;
  }

  function listWorldEncounterTags() {
    return ensureCache().worldEncounterTags;
  }

  function listStreetOrganizationTypes() {
    return ensureCache().streetOrganizationTypes;
  }

  function getStreetOrganizationType(typeId) {
    return ensureCache().streetOrganizationTypesById[typeId] || null;
  }

  function listStreetLadderStages() {
    return ensureCache().streetLadderStages;
  }

  function getStreetLadderStage(stageId) {
    return ensureCache().streetLadderStagesById[stageId] || null;
  }

  function listStreetDistrictTemplates() {
    return ensureCache().streetDistrictTemplates;
  }

  function getStreetDistrictTemplate(templateId) {
    return ensureCache().streetDistrictTemplatesById[templateId] || null;
  }

  function listStreetOfferTemplates() {
    return ensureCache().streetOfferTemplates;
  }

  function getStreetOfferTemplate(templateId) {
    return ensureCache().streetOfferTemplatesById[templateId] || null;
  }

  function getStreetTransitionRules() {
    return clone(ensureCache().streetTransitionRules || {});
  }

  function listContractTemplates() {
    return ensureCache().contractTemplates;
  }

  function getContractTemplate(templateId) {
    return ensureCache().contractTemplatesById[templateId] || null;
  }

  function listFightOfferTemplates() {
    return ensureCache().fightOfferTemplates;
  }

  function getFightOfferTemplate(templateId) {
    return ensureCache().fightOfferTemplatesById[templateId] || null;
  }

  function listAgePhases() {
    return ensureCache().agePhases;
  }

  function getAgePhase(phaseId) {
    return ensureCache().agePhasesById[phaseId] || null;
  }

  function listLivingModes() {
    return ensureCache().livingModes;
  }

  function getLivingMode(modeId) {
    return ensureCache().livingModesById[modeId] || null;
  }

  function listAmateurRanks() {
    return ensureCache().amateurRanks;
  }

  function getAmateurRank(rankId) {
    return ensureCache().amateurRanksById[rankId] || null;
  }

  function getLocalizedRankLabel(countryId, rankId) {
    var cacheRef = ensureCache();
    var labels = cacheRef.rankLabelsByCountry[countryId] || cacheRef.rankLabelsByCountry["default"] || {};
    return labels[rankId] || rankId;
  }

  function listHousingOptions() {
    return ensureCache().housingOptions;
  }

  function getHousingOption(housingId) {
    return ensureCache().housingOptionsById[housingId] || null;
  }

  function listSocialActions() {
    return ensureCache().socialActions;
  }

  function getSocialAction(actionId) {
    return ensureCache().socialActionsById[actionId] || null;
  }

  function listNpcRoles() {
    return ensureCache().npcRoles;
  }

  function getNpcRole(roleId) {
    return ensureCache().npcRolesById[roleId] || null;
  }

  function listDevelopmentStyles() {
    return ensureCache().developmentStyles;
  }

  function getDevelopmentStyle(styleId) {
    return ensureCache().developmentStylesById[styleId] || null;
  }

  function listTrainingFocuses() {
    return ensureCache().trainingFocuses;
  }

  function getTrainingFocus(focusId) {
    return ensureCache().trainingFocusesById[focusId] || null;
  }

  function listDevelopmentPerks() {
    return ensureCache().developmentPerks;
  }

  function getDevelopmentPerk(perkId) {
    return ensureCache().developmentPerksById[perkId] || null;
  }

  function getTrainerDevelopmentProfile(trainerTypeId) {
    var cacheRef = ensureCache();
    var trainerType = cacheRef.trainerTypesById[trainerTypeId] || null;
    return cacheRef.trainerDevelopmentProfiles[trainerTypeId] || (trainerType && trainerType.developmentProfile ? clone(trainerType.developmentProfile) : null);
  }

  function getGymDevelopmentProfile(gymId) {
    var cacheRef = ensureCache();
    var gym = cacheRef.gymsById[gymId] || null;
    return cacheRef.gymDevelopmentProfiles[gymId] || (gym && gym.developmentProfile ? clone(gym.developmentProfile) : null);
  }

  function listInjuryTypes() {
    return ensureCache().injuryTypes;
  }

  function getInjuryType(injuryId) {
    return ensureCache().injuryTypesById[injuryId] || null;
  }

  function listOpponentArchetypes() {
    return ensureCache().opponentArchetypes;
  }

  function getOpponentArchetype(archetypeId) {
    return ensureCache().opponentArchetypesById[archetypeId] || null;
  }

  function getCampFightProfile(focusId) {
    return ensureCache().campFightProfiles[focusId] || null;
  }

  function listRelationshipArcTemplates() {
    return ensureCache().relationshipArcTemplates;
  }

  function listReputationTags() {
    return ensureCache().reputationTags;
  }

  function listMediaTemplates() {
    return ensureCache().mediaTemplates;
  }

  function listEndingArchetypes() {
    return ensureCache().endingArchetypes;
  }

  return {
    listCountries: listCountries,
    getCountry: getCountry,
    getCountryPool: getCountryPool,
    getCountrySeedConfig: getCountrySeedConfig,
    getCountryEffects: getCountryEffects,
    getCountryArenas: getCountryArenas,
    getRandomArena: getRandomArena,
    listSeedRoster: listSeedRoster,
    listAllSeedRosterFighters: listAllSeedRosterFighters,
    getSeedRosterFighter: getSeedRosterFighter,
    listOpponentTypes: listOpponentTypes,
    getOpponentTier: getOpponentTier,
    listGyms: listGyms,
    getGym: getGym,
    listGymsByCountry: listGymsByCountry,
    listTrainerTypes: listTrainerTypes,
    listTrainerTypesByCountry: listTrainerTypesByCountry,
    getTrainerType: getTrainerType,
    listAmateurOrganizationTypes: listAmateurOrganizationTypes,
    getAmateurOrganizationType: getAmateurOrganizationType,
    listAmateurTrainerRoles: listAmateurTrainerRoles,
    getAmateurTrainerRole: getAmateurTrainerRole,
    listAmateurOrganizationTemplates: listAmateurOrganizationTemplates,
    getAmateurOrganizationTemplate: getAmateurOrganizationTemplate,
    getAmateurTeamTemplate: getAmateurTeamTemplate,
    listNationalTeamStatuses: listNationalTeamStatuses,
    getNationalTeamStatus: getNationalTeamStatus,
    listAmateurGoals: listAmateurGoals,
    getAmateurSeasonTemplate: getAmateurSeasonTemplate,
    listTournamentTypes: listTournamentTypes,
    getTournamentType: getTournamentType,
    listAmateurTournamentTemplates: listAmateurTournamentTemplates,
    getAmateurTournamentTemplate: getAmateurTournamentTemplate,
    listWorldGoalProfiles: listWorldGoalProfiles,
    getWorldGoalProfile: getWorldGoalProfile,
    getWorldTransitionRules: getWorldTransitionRules,
    listWorldHistoryHooks: listWorldHistoryHooks,
    listWorldEncounterTags: listWorldEncounterTags,
    listStreetOrganizationTypes: listStreetOrganizationTypes,
    getStreetOrganizationType: getStreetOrganizationType,
    listStreetLadderStages: listStreetLadderStages,
    getStreetLadderStage: getStreetLadderStage,
    listStreetDistrictTemplates: listStreetDistrictTemplates,
    getStreetDistrictTemplate: getStreetDistrictTemplate,
    listStreetOfferTemplates: listStreetOfferTemplates,
    getStreetOfferTemplate: getStreetOfferTemplate,
    getStreetTransitionRules: getStreetTransitionRules,
    listContractTemplates: listContractTemplates,
    getContractTemplate: getContractTemplate,
    listFightOfferTemplates: listFightOfferTemplates,
    getFightOfferTemplate: getFightOfferTemplate,
    listAgePhases: listAgePhases,
    getAgePhase: getAgePhase,
    listLivingModes: listLivingModes,
    getLivingMode: getLivingMode,
    listAmateurRanks: listAmateurRanks,
    getAmateurRank: getAmateurRank,
    getLocalizedRankLabel: getLocalizedRankLabel,
    listHousingOptions: listHousingOptions,
    getHousingOption: getHousingOption,
    listSocialActions: listSocialActions,
    getSocialAction: getSocialAction,
    listNpcRoles: listNpcRoles,
    getNpcRole: getNpcRole,
    listDevelopmentStyles: listDevelopmentStyles,
    getDevelopmentStyle: getDevelopmentStyle,
    listTrainingFocuses: listTrainingFocuses,
    getTrainingFocus: getTrainingFocus,
    listDevelopmentPerks: listDevelopmentPerks,
    getDevelopmentPerk: getDevelopmentPerk,
    getTrainerDevelopmentProfile: getTrainerDevelopmentProfile,
    getGymDevelopmentProfile: getGymDevelopmentProfile,
    listInjuryTypes: listInjuryTypes,
    getInjuryType: getInjuryType,
    listOpponentArchetypes: listOpponentArchetypes,
    getOpponentArchetype: getOpponentArchetype,
     getCampFightProfile: getCampFightProfile,
     listRelationshipArcTemplates: listRelationshipArcTemplates,
     listReputationTags: listReputationTags,
     listMediaTemplates: listMediaTemplates,
     listEndingArchetypes: listEndingArchetypes,
     getContextEventTriggerChance: getContextEventTriggerChance,
     getContextEvents: getContextEvents
   };
}());

