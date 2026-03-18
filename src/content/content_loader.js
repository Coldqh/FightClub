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
      contextEventTriggerChance: typeof EVENT_DATA !== "undefined" && typeof EVENT_DATA.triggerChance === "number" ? EVENT_DATA.triggerChance : 0,
      contextEvents: typeof EVENT_DATA !== "undefined" && EVENT_DATA.events instanceof Array ? EVENT_DATA.events : []
    };
    for (i = 0; i < CONTENT_DATA.countries.length; i += 1) {
      country = buildCountry(CONTENT_DATA.countries[i]);
      cache.countries.push(country);
      cache.countriesById[country.id] = country;
    }
    for (i = 0; i < cache.npcRoles.length; i += 1) {
      cache.npcRolesById[cache.npcRoles[i].id] = cache.npcRoles[i];
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

  function getOpponentTypeLabels() {
    var list = ensureCache().opponentTypes;
    var values = [];
    var i;
    for (i = 0; i < list.length; i += 1) {
      values.push(list[i].label);
    }
    return values;
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

  function listNpcRoles() {
    return ensureCache().npcRoles;
  }

  function getNpcRole(roleId) {
    return ensureCache().npcRolesById[roleId] || null;
  }

  return {
    listCountries: listCountries,
    getCountry: getCountry,
    getCountryPool: getCountryPool,
    getCountrySeedConfig: getCountrySeedConfig,
    getCountryEffects: getCountryEffects,
    getCountryArenas: getCountryArenas,
    getRandomArena: getRandomArena,
    getOpponentTypeLabels: getOpponentTypeLabels,
    getOpponentTier: getOpponentTier,
    listNpcRoles: listNpcRoles,
    getNpcRole: getNpcRole,
    getContextEventTriggerChance: getContextEventTriggerChance,
    getContextEvents: getContextEvents
  };
}());
