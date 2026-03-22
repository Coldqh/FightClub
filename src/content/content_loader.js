var ContentLoader = (function () {
  var cache = null;

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

  function proCareerDataRoot() {
    return typeof PRO_CAREER_DATA !== "undefined" && PRO_CAREER_DATA ? PRO_CAREER_DATA : {
      contenderStatuses: [],
      reputationTags: [],
      promoterTemplates: [],
      managerTemplates: [],
      offerTemplates: [],
      explanationTexts: {},
      transitionRules: {}
    };
  }

  function proTitleDataRoot() {
    return typeof PRO_TITLE_DATA !== "undefined" && PRO_TITLE_DATA ? PRO_TITLE_DATA : {
      organizations: [],
      rankingRules: {}
    };
  }

  function worldFacilityDataRoot() {
    return typeof WORLD_FACILITY_DATA !== "undefined" && WORLD_FACILITY_DATA ? WORLD_FACILITY_DATA : {
      gymTypes: [],
      trainerTypes: [],
      gymTemplates: [],
      trainerTemplates: []
    };
  }

  function sparringCampDataRoot() {
    return typeof SPARRING_CAMP_DATA !== "undefined" && SPARRING_CAMP_DATA ? SPARRING_CAMP_DATA : {
      offerSources: [],
      campTemplates: [],
      styleFocusHints: {},
      countryFocusHints: {},
      habitTextsByStyle: {}
    };
  }

  function battleRulesetDataRoot() {
    return typeof BATTLE_RULESET_DATA !== "undefined" && BATTLE_RULESET_DATA ? BATTLE_RULESET_DATA : {
      rulesets: []
    };
  }

  function careerTransitionDataRoot() {
    return typeof CAREER_TRANSITION_DATA !== "undefined" && CAREER_TRANSITION_DATA ? CAREER_TRANSITION_DATA : {
      transitions: [],
      transitionEvents: []
    };
  }

  function encounterMemoryDataRoot() {
    return typeof ENCOUNTER_MEMORY_DATA !== "undefined" && ENCOUNTER_MEMORY_DATA ? ENCOUNTER_MEMORY_DATA : {
      crossoverTags: [],
      events: []
    };
  }

  function worldStoryDataRoot() {
    return typeof WORLD_STORY_DATA !== "undefined" && WORLD_STORY_DATA ? WORLD_STORY_DATA : {
      worldMediaTemplates: [],
      worldLegendArchetypes: []
    };
  }

  function worldQaDataRoot() {
    return typeof WORLD_QA_DATA !== "undefined" && WORLD_QA_DATA ? WORLD_QA_DATA : {
      batchPresets: [],
      validationRules: [],
      teamStatusActions: [],
      trackActions: [],
      retirementReasons: []
    };
  }

  function generatedGymTemplates() {
    return clone(worldFacilityDataRoot().gymTemplates || []);
  }

  function generatedTrainerTemplates() {
    return clone(worldFacilityDataRoot().trainerTemplates || []);
  }

  function cityFromDefinition(definition, index) {
    var arenas = definition && definition.arenas ? definition.arenas : [];
    if (arenas.length) {
      return arenas[index % arenas.length].city;
    }
    return definition && definition.name ? definition.name : "";
  }

  function cityFromSource(definition, template, fallbackIndex) {
    var source = template ? template.citySource || "" : "";
    var arenas = definition && definition.arenas ? definition.arenas : [];
    var index;
    if (String(source).indexOf("arena_") === 0) {
      index = parseInt(String(source).split("_")[1], 10);
      if (!isNaN(index) && arenas[index - 1]) {
        return arenas[index - 1].city;
      }
    }
    if (String(source).indexOf("gym_") === 0) {
      index = parseInt(String(source).split("_")[1], 10);
      return cityFromDefinition(definition, isNaN(index) ? fallbackIndex : (index - 1));
    }
    return cityFromDefinition(definition, fallbackIndex || 0);
  }

  function pickFromPool(list, index, fallback) {
    if (list instanceof Array && list.length) {
      return list[Math.abs(index) % list.length];
    }
    return fallback;
  }

  function generatedTrainerIdentity(definition, index) {
    var pools = COUNTRY_DATA.pools[definition.id] || {};
    var firstName = pickFromPool(pools.firstNames, (index * 3) + 1, "Coach");
    var lastName = pickFromPool(pools.lastNames, (index * 5) + 2, "One");
    return {
      firstName: firstName,
      lastName: lastName,
      fullName: firstName + " " + lastName
    };
  }

  function buildGeneratedTrainerTypes(countryDefinitions) {
    var templates = generatedTrainerTemplates();
    var trainerTypes = [];
    var i;
    var j;
    var definition;
    var template;
    var city;
    var identity;
    for (i = 0; i < countryDefinitions.length; i += 1) {
      definition = countryDefinitions[i];
      for (j = 0; j < templates.length; j += 1) {
        template = templates[j];
        city = cityFromSource(definition, template, j);
        identity = generatedTrainerIdentity(definition, j);
        trainerTypes.push({
          id: definition.id + "_trainer_" + (template.slot || (j + 1)),
          country: definition.id,
          city: city,
          fullName: identity.fullName,
          name: identity.fullName,
          label: identity.fullName,
          firstName: identity.firstName,
          lastName: identity.lastName,
          trainerType: template.trainerType || "",
          coachRoleId: template.coachRoleId || "",
          currentGymId: definition.id + "_gym_" + (template.gymSlot || 1),
          gymId: definition.id + "_gym_" + (template.gymSlot || 1),
          salary: typeof template.salary === "number" ? template.salary : 0,
          monthlyFee: typeof template.salary === "number" ? template.salary : 0,
          weeklyFee: monthlyToWeekly(typeof template.salary === "number" ? template.salary : 0),
          reputation: typeof template.reputation === "number" ? template.reputation : (35 + j * 5),
          minRankId: template.minRankId || "",
          bonuses: clone(template.bonuses || {}),
          trainingBonuses: clone(template.bonuses || {}),
          developmentProfile: clone(template.developmentProfile || {}),
          preferredStyles: clone(template.preferredStyles || []),
          specialization: clone(template.specialization || []),
          allowedTracks: clone(template.allowedTracks || [])
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
    var k;
    var definition;
    var template;
    var city;
    var trainerIds;
    for (i = 0; i < countryDefinitions.length; i += 1) {
      definition = countryDefinitions[i];
      for (j = 0; j < templates.length; j += 1) {
        template = templates[j];
        city = cityFromSource(definition, template, j);
        trainerIds = template.trainerSlots instanceof Array ? clone(template.trainerSlots) : [];
        for (k = 0; k < trainerIds.length; k += 1) {
          trainerIds[k] = definition.id + "_trainer_" + trainerIds[k];
        }
        gyms.push({
          id: definition.id + "_gym_" + (template.slot || (j + 1)),
          country: definition.id,
          city: city,
          name: city + " " + template.label,
          gymType: template.gymType || "",
          orgType: template.orgType || "",
          cost: typeof template.cost === "number" ? template.cost : 0,
          monthlyCost: typeof template.cost === "number" ? template.cost : 0,
          weeklyCost: monthlyToWeekly(typeof template.cost === "number" ? template.cost : 0),
          reputation: typeof template.reputation === "number" ? template.reputation : (30 + j * 6),
          minRankId: template.minRankId || "",
          bonuses: clone(template.trainingBonuses || {}),
          trainingBonuses: clone(template.trainingBonuses || {}),
          trainerTypeIds: trainerIds.slice(0),
          coachIds: trainerIds.slice(0),
          trainerIds: trainerIds.slice(0),
          rosterIds: [],
          allowedTracks: clone(template.allowedTracks || []),
          allowedAgeRange: template.allowedAgeRange ? clone(template.allowedAgeRange) : null,
          specialization: clone(template.specialization || []),
          developmentProfile: clone(template.developmentProfile || {})
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
      facilityGymTypes: clone((worldFacilityDataRoot().gymTypes) || []),
      facilityGymTypesById: {},
      facilityTrainerTypes: clone((worldFacilityDataRoot().trainerTypes) || []),
      facilityTrainerTypesById: {},
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
      proContenderStatuses: clone((proCareerDataRoot().contenderStatuses) || []),
      proContenderStatusesById: {},
      proReputationTags: clone((proCareerDataRoot().reputationTags) || []),
      proPromoterTemplates: clone((proCareerDataRoot().promoterTemplates) || []),
      proPromoterTemplatesById: {},
      proManagerTemplates: clone((proCareerDataRoot().managerTemplates) || []),
      proManagerTemplatesById: {},
      proOfferTemplates: clone((proCareerDataRoot().offerTemplates) || []),
      proOfferTemplatesById: {},
      proExplanationTexts: clone((proCareerDataRoot().explanationTexts) || {}),
      proTransitionRules: clone((proCareerDataRoot().transitionRules) || {}),
      proOrganizations: clone((proTitleDataRoot().organizations) || []),
      proOrganizationsById: {},
      proRankingRules: clone((proTitleDataRoot().rankingRules) || {}),
      contractTemplates: clone((typeof CAREER_ECOSYSTEM_DATA !== "undefined" && CAREER_ECOSYSTEM_DATA.contractTemplates) || []),
      contractTemplatesById: {},
      fightOfferTemplates: clone(((typeof CAREER_ECOSYSTEM_DATA !== "undefined" && CAREER_ECOSYSTEM_DATA.fightOfferTemplates) || []).concat((youthDataRoot().amateurFightOfferTemplates) || []).concat((proCareerDataRoot().offerTemplates) || [])),
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
      battleRulesets: clone((battleRulesetDataRoot().rulesets) || []),
      battleRulesetsById: {},
      battleRulesetsByTrack: {},
      careerTransitions: clone((careerTransitionDataRoot().transitions) || []),
      careerTransitionsById: {},
      careerTransitionEvents: clone((careerTransitionDataRoot().transitionEvents) || []),
      careerTransitionEventsById: {},
      encounterCrossoverTags: clone((encounterMemoryDataRoot().crossoverTags) || []),
      encounterCrossoverTagsById: {},
      sparringOfferSources: clone((sparringCampDataRoot().offerSources) || []),
      sparringOfferSourcesById: {},
      trainingCampTemplates: clone((sparringCampDataRoot().campTemplates) || []),
      trainingCampTemplatesById: {},
      styleFocusHints: clone((sparringCampDataRoot().styleFocusHints) || {}),
      countryFocusHints: clone((sparringCampDataRoot().countryFocusHints) || {}),
      habitTextsByStyle: clone((sparringCampDataRoot().habitTextsByStyle) || {}),
      relationshipArcTemplates: clone((typeof RELATIONSHIP_ARC_DATA !== "undefined" && RELATIONSHIP_ARC_DATA.templates) || []),
      reputationTags: clone((typeof REPUTATION_LEGEND_DATA !== "undefined" && REPUTATION_LEGEND_DATA.reputationTags) || []),
      mediaTemplates: clone((typeof REPUTATION_LEGEND_DATA !== "undefined" && REPUTATION_LEGEND_DATA.mediaTemplates) || []),
      endingArchetypes: clone((typeof REPUTATION_LEGEND_DATA !== "undefined" && REPUTATION_LEGEND_DATA.endingArchetypes) || []),
      worldMediaTemplates: clone((worldStoryDataRoot().worldMediaTemplates) || []),
      worldMediaTemplatesById: {},
      worldLegendArchetypes: clone((worldStoryDataRoot().worldLegendArchetypes) || []),
      worldLegendArchetypesById: {},
      worldBatchPresets: clone((worldQaDataRoot().batchPresets) || []),
      worldBatchPresetsById: {},
      worldValidationRules: clone((worldQaDataRoot().validationRules) || []),
      worldValidationRulesById: {},
      worldQaTeamStatusActions: clone((worldQaDataRoot().teamStatusActions) || []),
      worldQaTeamStatusActionsById: {},
      worldQaTrackActions: clone((worldQaDataRoot().trackActions) || []),
      worldQaTrackActionsById: {},
      worldQaRetirementReasons: clone((worldQaDataRoot().retirementReasons) || []),
      worldQaRetirementReasonsById: {},
      contextEventTriggerChance: typeof EVENT_DATA !== "undefined" && typeof EVENT_DATA.triggerChance === "number" ? EVENT_DATA.triggerChance : 0,
      contextEvents: []
    };
    if (typeof EVENT_DATA !== "undefined" && EVENT_DATA.events instanceof Array) {
      contextEvents = contextEvents.concat(clone(EVENT_DATA.events));
    }
    if (typeof LIFE_EVENT_DATA !== "undefined" && LIFE_EVENT_DATA.events instanceof Array) {
      contextEvents = contextEvents.concat(clone(LIFE_EVENT_DATA.events));
    }
    if (encounterMemoryDataRoot().events instanceof Array) {
      contextEvents = contextEvents.concat(clone(encounterMemoryDataRoot().events));
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
    for (i = 0; i < cache.facilityGymTypes.length; i += 1) {
      cache.facilityGymTypesById[cache.facilityGymTypes[i].id] = cache.facilityGymTypes[i];
    }
    for (i = 0; i < cache.facilityTrainerTypes.length; i += 1) {
      cache.facilityTrainerTypesById[cache.facilityTrainerTypes[i].id] = cache.facilityTrainerTypes[i];
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
    for (i = 0; i < cache.proContenderStatuses.length; i += 1) {
      cache.proContenderStatusesById[cache.proContenderStatuses[i].id] = cache.proContenderStatuses[i];
    }
    for (i = 0; i < cache.proPromoterTemplates.length; i += 1) {
      cache.proPromoterTemplatesById[cache.proPromoterTemplates[i].id] = cache.proPromoterTemplates[i];
    }
    for (i = 0; i < cache.proManagerTemplates.length; i += 1) {
      cache.proManagerTemplatesById[cache.proManagerTemplates[i].id] = cache.proManagerTemplates[i];
    }
    for (i = 0; i < cache.proOfferTemplates.length; i += 1) {
      cache.proOfferTemplatesById[cache.proOfferTemplates[i].id] = cache.proOfferTemplates[i];
    }
    for (i = 0; i < cache.proOrganizations.length; i += 1) {
      cache.proOrganizationsById[cache.proOrganizations[i].id] = cache.proOrganizations[i];
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
    cache.trainers = cache.trainerTypes;
    cache.trainersById = cache.trainerTypesById;
    cache.trainersByCountry = cache.trainerTypesByCountry;
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
    for (i = 0; i < cache.worldMediaTemplates.length; i += 1) {
      cache.worldMediaTemplatesById[cache.worldMediaTemplates[i].id] = cache.worldMediaTemplates[i];
    }
    for (i = 0; i < cache.worldLegendArchetypes.length; i += 1) {
      cache.worldLegendArchetypesById[cache.worldLegendArchetypes[i].id] = cache.worldLegendArchetypes[i];
    }
    for (i = 0; i < cache.worldBatchPresets.length; i += 1) {
      cache.worldBatchPresetsById[cache.worldBatchPresets[i].id] = cache.worldBatchPresets[i];
    }
    for (i = 0; i < cache.worldValidationRules.length; i += 1) {
      cache.worldValidationRulesById[cache.worldValidationRules[i].id] = cache.worldValidationRules[i];
    }
    for (i = 0; i < cache.worldQaTeamStatusActions.length; i += 1) {
      cache.worldQaTeamStatusActionsById[cache.worldQaTeamStatusActions[i].id] = cache.worldQaTeamStatusActions[i];
    }
    for (i = 0; i < cache.worldQaTrackActions.length; i += 1) {
      cache.worldQaTrackActionsById[cache.worldQaTrackActions[i].id] = cache.worldQaTrackActions[i];
    }
    for (i = 0; i < cache.worldQaRetirementReasons.length; i += 1) {
      cache.worldQaRetirementReasonsById[cache.worldQaRetirementReasons[i].id] = cache.worldQaRetirementReasons[i];
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
    for (i = 0; i < cache.battleRulesets.length; i += 1) {
      cache.battleRulesetsById[cache.battleRulesets[i].id] = cache.battleRulesets[i];
      cache.battleRulesetsByTrack[cache.battleRulesets[i].trackType] = cache.battleRulesets[i];
    }
    for (i = 0; i < cache.careerTransitions.length; i += 1) {
      cache.careerTransitionsById[cache.careerTransitions[i].id] = cache.careerTransitions[i];
    }
    for (i = 0; i < cache.careerTransitionEvents.length; i += 1) {
      cache.careerTransitionEventsById[cache.careerTransitionEvents[i].id] = cache.careerTransitionEvents[i];
    }
    for (i = 0; i < cache.encounterCrossoverTags.length; i += 1) {
      cache.encounterCrossoverTagsById[cache.encounterCrossoverTags[i].id] = cache.encounterCrossoverTags[i];
    }
    for (i = 0; i < cache.sparringOfferSources.length; i += 1) {
      cache.sparringOfferSourcesById[cache.sparringOfferSources[i].id] = cache.sparringOfferSources[i];
    }
    for (i = 0; i < cache.trainingCampTemplates.length; i += 1) {
      cache.trainingCampTemplatesById[cache.trainingCampTemplates[i].id] = cache.trainingCampTemplates[i];
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

  function listTrainers() {
    return ensureCache().trainers;
  }

  function listTrainerTypes() {
    return ensureCache().trainerTypes;
  }

  function listTrainersByCountry(countryId) {
    return clone(ensureCache().trainersByCountry[countryId] || []);
  }

  function listTrainerTypesByCountry(countryId) {
    return clone(ensureCache().trainerTypesByCountry[countryId] || []);
  }

  function getTrainer(trainerId) {
    return ensureCache().trainersById[trainerId] || null;
  }

  function getTrainerType(typeId) {
    return ensureCache().trainerTypesById[typeId] || null;
  }

  function getFacilityGymTypeLabel(typeId) {
    var entry = ensureCache().facilityGymTypesById[typeId];
    return entry ? entry.label : "";
  }

  function getFacilityTrainerTypeLabel(typeId) {
    var entry = ensureCache().facilityTrainerTypesById[typeId];
    return entry ? entry.label : "";
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

  function listEncounterCrossoverTags() {
    return ensureCache().encounterCrossoverTags;
  }

  function getEncounterCrossoverTag(tagId) {
    return ensureCache().encounterCrossoverTagsById[tagId] || null;
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

  function listProContenderStatuses() {
    return ensureCache().proContenderStatuses;
  }

  function getProContenderStatus(statusId) {
    return ensureCache().proContenderStatusesById[statusId] || null;
  }

  function listProPromoterTemplates() {
    return ensureCache().proPromoterTemplates;
  }

  function getProPromoterTemplate(templateId) {
    return ensureCache().proPromoterTemplatesById[templateId] || null;
  }

  function listProManagerTemplates() {
    return ensureCache().proManagerTemplates;
  }

  function getProManagerTemplate(templateId) {
    return ensureCache().proManagerTemplatesById[templateId] || null;
  }

  function listProOfferTemplates() {
    return ensureCache().proOfferTemplates;
  }

  function getProOfferTemplate(templateId) {
    return ensureCache().proOfferTemplatesById[templateId] || null;
  }

  function getProExplanationText(explanationId) {
    return ensureCache().proExplanationTexts[explanationId] || "";
  }

  function getProTransitionRules() {
    return clone(ensureCache().proTransitionRules || {});
  }

  function listProOrganizations() {
    return ensureCache().proOrganizations;
  }

  function getProOrganization(orgId) {
    return ensureCache().proOrganizationsById[orgId] || null;
  }

  function getProRankingRules() {
    return clone(ensureCache().proRankingRules || {});
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

  function listBattleRulesets() {
    return ensureCache().battleRulesets;
  }

  function getBattleRuleset(rulesetId) {
    return ensureCache().battleRulesetsById[rulesetId] || null;
  }

  function getBattleRulesetForTrack(trackId) {
    return ensureCache().battleRulesetsByTrack[trackId] || null;
  }

  function listCareerTransitions() {
    return ensureCache().careerTransitions;
  }

  function getCareerTransition(transitionId) {
    return ensureCache().careerTransitionsById[transitionId] || null;
  }

  function listCareerTransitionEvents() {
    return ensureCache().careerTransitionEvents;
  }

  function getCareerTransitionEvent(eventId) {
    return ensureCache().careerTransitionEventsById[eventId] || null;
  }

  function listSparringOfferSources() {
    return ensureCache().sparringOfferSources;
  }

  function getSparringOfferSource(sourceId) {
    return ensureCache().sparringOfferSourcesById[sourceId] || null;
  }

  function listTrainingCampTemplates() {
    return ensureCache().trainingCampTemplates;
  }

  function getTrainingCampTemplate(templateId) {
    return ensureCache().trainingCampTemplatesById[templateId] || null;
  }

  function getSparringStyleFocusHint(styleId) {
    return ensureCache().styleFocusHints[styleId] || "";
  }

  function getSparringCountryFocusHint(countryId) {
    return ensureCache().countryFocusHints[countryId] || "";
  }

  function getSparringHabitTexts(styleId) {
    return ensureCache().habitTextsByStyle[styleId] || [];
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

  function listWorldMediaTemplates() {
    return ensureCache().worldMediaTemplates;
  }

  function getWorldMediaTemplate(templateId) {
    return ensureCache().worldMediaTemplatesById[templateId] || null;
  }

  function listWorldLegendArchetypes() {
    return ensureCache().worldLegendArchetypes;
  }

  function getWorldLegendArchetype(archetypeId) {
    return ensureCache().worldLegendArchetypesById[archetypeId] || null;
  }

  function listWorldBatchPresets() {
    return ensureCache().worldBatchPresets;
  }

  function getWorldBatchPreset(presetId) {
    return ensureCache().worldBatchPresetsById[presetId] || null;
  }

  function listWorldValidationRules() {
    return ensureCache().worldValidationRules;
  }

  function getWorldValidationRule(ruleId) {
    return ensureCache().worldValidationRulesById[ruleId] || null;
  }

  function listWorldQaTeamStatusActions() {
    return ensureCache().worldQaTeamStatusActions;
  }

  function listWorldQaTrackActions() {
    return ensureCache().worldQaTrackActions;
  }

  function listWorldQaRetirementReasons() {
    return ensureCache().worldQaRetirementReasons;
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
    listTrainers: listTrainers,
    listTrainersByCountry: listTrainersByCountry,
    getTrainer: getTrainer,
    listTrainerTypes: listTrainerTypes,
    listTrainerTypesByCountry: listTrainerTypesByCountry,
    getTrainerType: getTrainerType,
    getFacilityGymTypeLabel: getFacilityGymTypeLabel,
    getFacilityTrainerTypeLabel: getFacilityTrainerTypeLabel,
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
    listEncounterCrossoverTags: listEncounterCrossoverTags,
    getEncounterCrossoverTag: getEncounterCrossoverTag,
    listStreetOrganizationTypes: listStreetOrganizationTypes,
    getStreetOrganizationType: getStreetOrganizationType,
    listStreetLadderStages: listStreetLadderStages,
    getStreetLadderStage: getStreetLadderStage,
    listStreetDistrictTemplates: listStreetDistrictTemplates,
    getStreetDistrictTemplate: getStreetDistrictTemplate,
    listStreetOfferTemplates: listStreetOfferTemplates,
    getStreetOfferTemplate: getStreetOfferTemplate,
    getStreetTransitionRules: getStreetTransitionRules,
    listProContenderStatuses: listProContenderStatuses,
    getProContenderStatus: getProContenderStatus,
    listProPromoterTemplates: listProPromoterTemplates,
    getProPromoterTemplate: getProPromoterTemplate,
    listProManagerTemplates: listProManagerTemplates,
    getProManagerTemplate: getProManagerTemplate,
    listProOfferTemplates: listProOfferTemplates,
    getProOfferTemplate: getProOfferTemplate,
    getProExplanationText: getProExplanationText,
    getProTransitionRules: getProTransitionRules,
    listProOrganizations: listProOrganizations,
    getProOrganization: getProOrganization,
    getProRankingRules: getProRankingRules,
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
    listBattleRulesets: listBattleRulesets,
    getBattleRuleset: getBattleRuleset,
    getBattleRulesetForTrack: getBattleRulesetForTrack,
    listCareerTransitions: listCareerTransitions,
    getCareerTransition: getCareerTransition,
    listCareerTransitionEvents: listCareerTransitionEvents,
    getCareerTransitionEvent: getCareerTransitionEvent,
    listSparringOfferSources: listSparringOfferSources,
    getSparringOfferSource: getSparringOfferSource,
    listTrainingCampTemplates: listTrainingCampTemplates,
    getTrainingCampTemplate: getTrainingCampTemplate,
    getSparringStyleFocusHint: getSparringStyleFocusHint,
    getSparringCountryFocusHint: getSparringCountryFocusHint,
    getSparringHabitTexts: getSparringHabitTexts,
    listRelationshipArcTemplates: listRelationshipArcTemplates,
    listReputationTags: listReputationTags,
    listMediaTemplates: listMediaTemplates,
    listEndingArchetypes: listEndingArchetypes,
    listWorldMediaTemplates: listWorldMediaTemplates,
    getWorldMediaTemplate: getWorldMediaTemplate,
    listWorldLegendArchetypes: listWorldLegendArchetypes,
    getWorldLegendArchetype: getWorldLegendArchetype,
    listWorldBatchPresets: listWorldBatchPresets,
    getWorldBatchPreset: getWorldBatchPreset,
    listWorldValidationRules: listWorldValidationRules,
    getWorldValidationRule: getWorldValidationRule,
    listWorldQaTeamStatusActions: listWorldQaTeamStatusActions,
    listWorldQaTrackActions: listWorldQaTrackActions,
    listWorldQaRetirementReasons: listWorldQaRetirementReasons,
    getContextEventTriggerChance: getContextEventTriggerChance,
    getContextEvents: getContextEvents
  };
}());

