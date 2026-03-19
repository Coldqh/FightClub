var ContentLoader = (function () {
  var cache = null;

  function clone(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
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
      opponentTypes: clone(CONTENT_DATA.opponentTypes || []),
      opponentTiers: clone(CONTENT_DATA.opponentTiers || {}),
      npcRoles: clone(CONTENT_DATA.npcRoles || []),
      npcRolesById: {},
      gyms: clone((typeof CAREER_ECOSYSTEM_DATA !== "undefined" && CAREER_ECOSYSTEM_DATA.gyms) || []),
      gymsById: {},
      gymsByCountry: {},
      trainerTypes: clone((typeof CAREER_ECOSYSTEM_DATA !== "undefined" && CAREER_ECOSYSTEM_DATA.trainerTypes) || []),
      trainerTypesById: {},
      contractTemplates: clone((typeof CAREER_ECOSYSTEM_DATA !== "undefined" && CAREER_ECOSYSTEM_DATA.contractTemplates) || []),
      contractTemplatesById: {},
      fightOfferTemplates: clone((typeof CAREER_ECOSYSTEM_DATA !== "undefined" && CAREER_ECOSYSTEM_DATA.fightOfferTemplates) || []),
      fightOfferTemplatesById: {},
      housingOptions: clone((typeof LIFE_DATA !== "undefined" && LIFE_DATA.housingOptions) || []),
      housingOptionsById: {},
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
    for (i = 0; i < cache.npcRoles.length; i += 1) {
      cache.npcRolesById[cache.npcRoles[i].id] = cache.npcRoles[i];
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
    }
    for (i = 0; i < cache.contractTemplates.length; i += 1) {
      contractTemplate = cache.contractTemplates[i];
      cache.contractTemplatesById[contractTemplate.id] = contractTemplate;
    }
    for (i = 0; i < cache.fightOfferTemplates.length; i += 1) {
      fightOfferTemplate = cache.fightOfferTemplates[i];
      cache.fightOfferTemplatesById[fightOfferTemplate.id] = fightOfferTemplate;
    }
    for (i = 0; i < cache.housingOptions.length; i += 1) {
      housingOption = cache.housingOptions[i];
      cache.housingOptionsById[housingOption.id] = housingOption;
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

  function getTrainerType(typeId) {
    return ensureCache().trainerTypesById[typeId] || null;
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
    return ensureCache().trainerDevelopmentProfiles[trainerTypeId] || null;
  }

  function getGymDevelopmentProfile(gymId) {
    return ensureCache().gymDevelopmentProfiles[gymId] || null;
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
    listOpponentTypes: listOpponentTypes,
    getOpponentTier: getOpponentTier,
    listGyms: listGyms,
    getGym: getGym,
    listGymsByCountry: listGymsByCountry,
    listTrainerTypes: listTrainerTypes,
    getTrainerType: getTrainerType,
    listContractTemplates: listContractTemplates,
    getContractTemplate: getContractTemplate,
    listFightOfferTemplates: listFightOfferTemplates,
    getFightOfferTemplate: getFightOfferTemplate,
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

