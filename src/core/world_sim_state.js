var WorldSimState = (function () {
  function clone(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  function clampNumber(value, fallback) {
    var parsed = typeof value === "number" ? value : parseInt(value, 10);
    return isNaN(parsed) ? fallback : parsed;
  }

  function cleanIdPart(value) {
    return String(value == null ? "" : value)
      .toLowerCase()
      .replace(/[^a-z0-9_]+/g, "_")
      .replace(/^_+|_+$/g, "");
  }

  function stableId(prefix, parts) {
    var list = parts instanceof Array ? parts : [parts];
    var cleaned = [];
    var i;
    for (i = 0; i < list.length; i += 1) {
      if (list[i] != null && list[i] !== "") {
        cleaned.push(cleanIdPart(list[i]));
      }
    }
    if (!cleaned.length) {
      return prefix;
    }
    return prefix + "_" + cleaned.join("_");
  }

  function currentCalendarView(gameState) {
    if (typeof TimeSystem === "undefined" || !TimeSystem.getCalendarView) {
      return {
        weekNumber: gameState && gameState.career ? gameState.career.week || 1 : 1,
        monthIndex: 2,
        year: 2026,
        weekOfMonth: 1
      };
    }
    return TimeSystem.getCalendarView(gameState && gameState.career ? gameState.career.calendar : null);
  }

  function currentAgeView(gameState) {
    var startingAge = gameState && gameState.player && gameState.player.conditions ? gameState.player.conditions.startingAge : 21;
    if (typeof TimeSystem === "undefined" || !TimeSystem.getAgeView) {
      return {
        years: clampNumber(startingAge, 21),
        months: 0
      };
    }
    return TimeSystem.getAgeView(startingAge, gameState && gameState.career ? gameState.career.calendar : null);
  }

  function baseWorldTimelineSchema() {
    return {
      id: "timeline_main",
      currentWeek: 1,
      totalWeeks: 0,
      currentMonthIndex: 2,
      currentYear: 2026,
      weekOfMonth: 1,
      playerAgeYears: 16,
      playerAgeMonths: 0
    };
  }

  function baseWorldCareerSchema() {
    return {
      id: "world_career_main",
      lastProcessedWeek: 0,
      lastProcessedYear: 2026,
      nextNewgenSerialByCountry: {},
      yearlyNewgenCountByCountry: {},
      teamStatusByFighterId: {},
      trackStatusByFighterId: {},
      processedTournamentIds: [],
      processedResultIds: [],
      encounterMemoryByFighterId: {},
      pendingNotices: [],
      worldHistory: []
    };
  }

  function baseTrackEntrySchema(id, label, unlocked) {
    return {
      id: id,
      label: label,
      unlocked: !!unlocked,
      active: !!unlocked && id === "street",
      enteredWeek: unlocked ? 1 : 0,
      rating: 0,
      rank: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      organizationIds: [],
      notes: []
    };
  }

  function baseCareerTrackStateSchema() {
    return {
      id: "career_track_player",
      currentTrackId: "street",
      tracks: {
        street: baseTrackEntrySchema("street", "Street", true),
        amateur: baseTrackEntrySchema("amateur", "Amateur", false),
        pro: baseTrackEntrySchema("pro", "Pro", false)
      },
      switches: []
    };
  }

  function baseFighterEntitySchema() {
    return {
      id: "",
      name: "",
      country: "",
      age: 16,
      isPlayer: false,
      status: "active",
      trackId: "street",
      stats: {
        str: 1,
        tec: 1,
        spd: 1,
        end: 1,
        vit: 1
      },
      record: {
        wins: 0,
        losses: 0,
        draws: 0,
        kos: 0
      },
      fame: 0,
      gymId: "",
      trainerId: "",
      currentCoachId: "",
      currentOrganizationId: "",
      streetRating: 0,
      streetData: {
        districtId: "",
        cityStreetStanding: 0,
        nationalStreetStanding: 0,
        undergroundTitles: [],
        localPromoterIds: [],
        undergroundPressureTags: [],
        currentSceneId: "",
        currentStatusId: "neighborhood_unknown"
      },
      styleId: "",
      archetypeId: "",
      amateurRank: "",
      nationalTeamStatus: "none",
      amateurGoals: [],
      goalProfileId: "",
      worldHistoryHooks: [],
      encounterHooks: [],
      lastTrackTransitionWeek: 0,
      lastTeamStatusChangeWeek: 0,
      lastGymChangeWeek: 0,
      lastCoachChangeWeek: 0,
      lastUpdatedWeek: 0,
      tags: []
    };
  }

  function baseGymEntitySchema() {
    return {
      id: "",
      name: "",
      country: "",
      city: "",
      monthlyCost: 0,
      weeklyCost: 0,
      reputation: 0,
      trainerIds: [],
      bonuses: {},
      specialization: [],
      orgType: "",
      minRankId: "",
      trainingFocus: []
    };
  }

  function baseTrainerEntitySchema() {
    return {
      id: "",
      name: "",
      country: "",
      city: "",
      gymId: "",
      monthlyFee: 0,
      weeklyFee: 0,
      reputation: 0,
      bonuses: {},
      specialization: [],
      coachRoleId: "",
      minRankId: ""
    };
  }

  function baseCompetitionEntitySchema() {
    return {
      id: "",
      label: "",
      type: "fight_offer",
      status: "available",
      organizationId: "",
      trackId: "street",
      country: "",
      city: "",
      opponentFighterId: "",
      weekStamp: 0,
      purse: 0,
      rematchOf: "",
      tags: []
    };
  }

  function baseOrganizationEntitySchema() {
    return {
      id: "",
      name: "",
      country: "",
      city: "",
      type: "promotion",
      trackId: "street",
      reputation: 0,
      tags: []
    };
  }

  function baseRankingTableSchema() {
    return {
      id: "",
      trackId: "street",
      organizationId: "",
      entries: []
    };
  }

  function baseTournamentBracketSchema() {
    return {
      id: "",
      label: "",
      organizationId: "",
      trackId: "street",
      round: 0,
      status: "planned",
      competitionIds: []
    };
  }

  function defaultSections() {
    return {
      playerState: {
        id: "player_state_main",
        playerId: "player_main",
        fighterEntityId: "fighter_player_main",
        currentTrackId: "street",
        careerTrack: baseCareerTrackStateSchema(),
        knownNpcIds: [],
        linkedGymId: "",
        linkedTrainerId: ""
      },
      worldState: {
        id: "world_state_main",
        timeline: baseWorldTimelineSchema(),
        currentCountry: "",
        currentCity: "",
        streetSeedId: "track_seed_street",
        amateurSeedId: "track_seed_amateur",
        proSeedId: "track_seed_pro",
        worldFlags: [],
        recentCompetitionIds: [],
        worldCareer: baseWorldCareerSchema()
      },
      rosterState: {
        id: "roster_state_main",
        fighterIds: [],
        fightersById: {},
        gymIds: [],
        gymsById: {},
        trainerIds: [],
        trainersById: {}
      },
      organizationState: {
        id: "organization_state_main",
        organizationIds: [],
        organizationsById: {},
        rankingTableIds: [],
        rankingTablesById: {},
        teamIds: [],
        teamsById: {}
      },
      competitionState: {
        id: "competition_state_main",
        competitionIds: [],
        competitionsById: {},
        bracketIds: [],
        bracketsById: {},
        activeCompetitionId: "",
        amateurHooks: {
          seasonEligibilityByFighterId: {},
          federationPointsByFighterId: {},
          tournamentRegistrationByFighterId: {},
          teamEligibilityByFighterId: {}
        },
        amateurSeason: null
      },
      narrativeState: {
        id: "narrative_state_main",
        biographyFlags: [],
        activeArcIds: [],
        rivalryIds: [],
        knownNpcIds: [],
        mediaCount: 0,
        historyCount: 0
      }
    };
  }

  function deriveTrackState(gameState, existingPlayerState) {
    var trackState = clone((existingPlayerState && existingPlayerState.careerTrack) || baseCareerTrackStateSchema());
    var wins = gameState && gameState.player && gameState.player.record ? gameState.player.record.wins : 0;
    var losses = gameState && gameState.player && gameState.player.record ? gameState.player.record.losses : 0;
    var draws = gameState && gameState.player && gameState.player.record ? gameState.player.record.draws || 0 : 0;
    var activeId = existingPlayerState && existingPlayerState.currentTrackId ? existingPlayerState.currentTrackId : "street";
    if (!trackState.tracks) {
      trackState = baseCareerTrackStateSchema();
    }
    if (!trackState.tracks.street) {
      trackState.tracks.street = baseTrackEntrySchema("street", "Street", true);
    }
    if (!trackState.tracks.amateur) {
      trackState.tracks.amateur = baseTrackEntrySchema("amateur", "Amateur", false);
    }
    if (!trackState.tracks.pro) {
      trackState.tracks.pro = baseTrackEntrySchema("pro", "Pro", false);
    }
    trackState.currentTrackId = activeId;
    trackState.tracks.street.active = activeId === "street";
    trackState.tracks.amateur.active = activeId === "amateur";
    trackState.tracks.pro.active = activeId === "pro";
    trackState.tracks.street.wins = wins;
    trackState.tracks.street.losses = losses;
    trackState.tracks.street.draws = draws;
    trackState.tracks.street.rating = wins * 3 - losses;
    return trackState;
  }

  function buildPlayerStateSection(gameState, existingPlayerState) {
    var section = clone(defaultSections().playerState);
    var knownNpcIds = [];
    var i;
    section.id = existingPlayerState && existingPlayerState.id ? existingPlayerState.id : section.id;
    section.playerId = existingPlayerState && existingPlayerState.playerId ? existingPlayerState.playerId : section.playerId;
    section.fighterEntityId = existingPlayerState && existingPlayerState.fighterEntityId ? existingPlayerState.fighterEntityId : section.fighterEntityId;
    section.currentTrackId = existingPlayerState && existingPlayerState.currentTrackId ? existingPlayerState.currentTrackId : "street";
    section.careerTrack = deriveTrackState(gameState, existingPlayerState);
    if (gameState && gameState.world && gameState.world.npcs instanceof Array) {
      for (i = 0; i < gameState.world.npcs.length; i += 1) {
        if (gameState.world.npcs[i] && gameState.world.npcs[i].knownToPlayer && gameState.world.npcs[i].id) {
          knownNpcIds.push(gameState.world.npcs[i].id);
        }
      }
    }
    section.knownNpcIds = knownNpcIds;
    section.linkedGymId = gameState && gameState.world && gameState.world.gymMembership ? gameState.world.gymMembership.gymId || "" : "";
    section.linkedTrainerId = gameState && gameState.world && gameState.world.trainerAssignment ? gameState.world.trainerAssignment.npcId || gameState.world.trainerAssignment.trainerTypeId || "" : "";
    return section;
  }

  function buildWorldStateSection(gameState, existingWorldState) {
    var section = clone(defaultSections().worldState);
    var calendarView = currentCalendarView(gameState);
    var ageView = currentAgeView(gameState);
    section.id = existingWorldState && existingWorldState.id ? existingWorldState.id : section.id;
    section.currentCountry = gameState && gameState.player && gameState.player.profile ? gameState.player.profile.currentCountry || "" : "";
    section.currentCity = gameState && gameState.world && gameState.world.gymMembership ? gameState.world.gymMembership.city || "" : "";
    if (!section.currentCity && typeof ContentLoader !== "undefined" && ContentLoader.getCountry) {
      var country = ContentLoader.getCountry(section.currentCountry);
      section.currentCity = country && country.city ? country.city : "";
    }
    section.timeline.id = existingWorldState && existingWorldState.timeline && existingWorldState.timeline.id ? existingWorldState.timeline.id : section.timeline.id;
    section.timeline.currentWeek = calendarView.weekNumber || (gameState && gameState.career ? gameState.career.week : 1);
    section.timeline.totalWeeks = gameState && gameState.career && gameState.career.calendar ? gameState.career.calendar.totalWeeks || 0 : 0;
    section.timeline.currentMonthIndex = calendarView.monthIndex || 0;
    section.timeline.currentYear = calendarView.year || 2026;
    section.timeline.weekOfMonth = calendarView.weekOfMonth || 1;
    section.timeline.playerAgeYears = ageView.years || 21;
    section.timeline.playerAgeMonths = ageView.months || 0;
    section.worldFlags = gameState && gameState.player && gameState.player.biography ? clone(gameState.player.biography.flags || []) : [];
    section.recentCompetitionIds = existingWorldState && existingWorldState.recentCompetitionIds instanceof Array ? clone(existingWorldState.recentCompetitionIds) : [];
    section.worldCareer = existingWorldState && existingWorldState.worldCareer ? clone(existingWorldState.worldCareer) : baseWorldCareerSchema();
    return section;
  }

  function buildPlayerFighterEntity(gameState, existingEntity) {
    var entity = clone(existingEntity || baseFighterEntitySchema());
    var styleId = "";
    var styleProgress;
    var key;
    var bestScore = -1;
    entity.id = entity.id || "fighter_player_main";
    entity.name = gameState && gameState.player && gameState.player.profile ? gameState.player.profile.name || "" : "";
    entity.country = gameState && gameState.player && gameState.player.profile ? gameState.player.profile.currentCountry || "" : "";
    entity.age = currentAgeView(gameState).years || 21;
    entity.isPlayer = true;
    entity.status = gameState && gameState.career && gameState.career.endingReason ? "retired" : "active";
    entity.trackId = gameState && gameState.playerState ? gameState.playerState.currentTrackId || "street" : "street";
    entity.stats = clone(gameState && gameState.player ? gameState.player.stats : entity.stats);
    entity.record.wins = gameState && gameState.player && gameState.player.record ? gameState.player.record.wins || 0 : 0;
    entity.record.losses = gameState && gameState.player && gameState.player.record ? gameState.player.record.losses || 0 : 0;
    entity.record.draws = gameState && gameState.player && gameState.player.record ? gameState.player.record.draws || 0 : 0;
    entity.record.kos = gameState && gameState.player && gameState.player.record ? gameState.player.record.kos || 0 : 0;
    entity.fame = gameState && gameState.player && gameState.player.resources ? gameState.player.resources.fame || 0 : 0;
    entity.gymId = gameState && gameState.world && gameState.world.gymMembership ? gameState.world.gymMembership.gymId || "" : "";
    entity.trainerId = gameState && gameState.world && gameState.world.trainerAssignment ? gameState.world.trainerAssignment.npcId || gameState.world.trainerAssignment.trainerTypeId || "" : "";
    entity.currentCoachId = gameState && gameState.world && gameState.world.trainerAssignment ? gameState.world.trainerAssignment.npcId || "" : "";
    entity.currentOrganizationId = gameState && gameState.player && gameState.player.amateur ? gameState.player.amateur.currentOrganizationId || "" : "";
    entity.streetRating = gameState && gameState.player && gameState.player.street ? gameState.player.street.streetRating || 0 : 0;
    entity.streetData = gameState && gameState.player && gameState.player.street ? clone(gameState.player.street) : clone(entity.streetData);
    styleProgress = gameState && gameState.player && gameState.player.development ? gameState.player.development.styleProgress : null;
    if (styleProgress) {
      for (key in styleProgress) {
        if (styleProgress.hasOwnProperty(key) && typeof styleProgress[key] === "number" && styleProgress[key] > bestScore) {
          bestScore = styleProgress[key];
          styleId = key;
        }
      }
    }
    entity.styleId = styleId;
    entity.amateurRank = gameState && gameState.player && gameState.player.amateur ? gameState.player.amateur.rankId || "" : "";
    entity.nationalTeamStatus = gameState && gameState.player && gameState.player.amateur ? gameState.player.amateur.nationalTeamStatus || "none" : "none";
    entity.amateurGoals = gameState && gameState.player && gameState.player.amateur && gameState.player.amateur.eligibleLevels instanceof Array ? clone(gameState.player.amateur.eligibleLevels) : [];
    entity.lastUpdatedWeek = gameState && gameState.career ? gameState.career.week || 1 : 1;
    entity.tags = gameState && gameState.player && gameState.player.biography ? clone(gameState.player.biography.reputationTags || []) : [];
    return entity;
  }

  function buildOpponentFighterEntity(opponent, week) {
    var entity = baseFighterEntitySchema();
    var stats = opponent && opponent.stats ? opponent.stats : {};
    entity.id = stableId("fighter_opponent", [opponent && (opponent.key || opponent.id || opponent.name || "unknown")]);
    entity.name = opponent && opponent.name ? opponent.name : "";
    entity.country = opponent && (opponent.countryKey || opponent.country) ? (opponent.countryKey || opponent.country) : "";
    entity.age = clampNumber(opponent && opponent.age, 24);
    entity.isPlayer = false;
    entity.status = "active";
    entity.stats.str = clampNumber(stats.str, 1);
    entity.stats.tec = clampNumber(stats.tec, 1);
    entity.stats.spd = clampNumber(stats.spd, 1);
    entity.stats.end = clampNumber(stats.end, 1);
    entity.stats.vit = clampNumber(stats.vit, 1);
    entity.record.wins = clampNumber(opponent && opponent.wins, 0);
    entity.record.losses = clampNumber(opponent && opponent.losses, 0);
    entity.record.draws = clampNumber(opponent && opponent.draws, 0);
    entity.record.kos = clampNumber(opponent && opponent.kos, 0);
    entity.fame = clampNumber(opponent && opponent.fame, 0);
    entity.gymId = opponent && opponent.gymId ? opponent.gymId : "";
    entity.trainerId = opponent && (opponent.trainerId || opponent.trainerTypeId) ? (opponent.trainerId || opponent.trainerTypeId) : "";
    entity.currentCoachId = opponent && opponent.trainerId ? opponent.trainerId : "";
    entity.currentOrganizationId = opponent && opponent.currentOrganizationId ? opponent.currentOrganizationId : "";
    entity.streetRating = clampNumber(opponent && opponent.streetRating, 0);
    entity.streetData = opponent && opponent.streetData ? clone(opponent.streetData) : clone(entity.streetData);
    entity.styleId = opponent && opponent.styleId ? opponent.styleId : "";
    entity.archetypeId = opponent && opponent.archetypeId ? opponent.archetypeId : "";
    entity.amateurRank = opponent && (opponent.amateurRank || opponent.amateurClass) ? (opponent.amateurRank || opponent.amateurClass) : "";
    entity.nationalTeamStatus = opponent && opponent.nationalTeamStatus ? opponent.nationalTeamStatus : "none";
    entity.amateurGoals = opponent && opponent.amateurGoals instanceof Array ? clone(opponent.amateurGoals) : [];
    entity.lastUpdatedWeek = clampNumber(week, 1);
    return entity;
  }

  function buildRosterStateSection(gameState, existingRosterState) {
    var section = clone(defaultSections().rosterState);
    var countries;
    var i;
    var j;
    var country;
    var gyms;
    var trainers;
    var gym;
    var trainer;
    var fighterEntity;
    var opponentPool = [];
    var existingId;
    section.id = existingRosterState && existingRosterState.id ? existingRosterState.id : section.id;
    fighterEntity = buildPlayerFighterEntity(gameState, existingRosterState && existingRosterState.fightersById ? existingRosterState.fightersById.fighter_player_main : null);
    section.fighterIds.push(fighterEntity.id);
    section.fightersById[fighterEntity.id] = fighterEntity;
    if (existingRosterState && existingRosterState.fighterIds instanceof Array && existingRosterState.fightersById) {
      for (i = 0; i < existingRosterState.fighterIds.length; i += 1) {
        existingId = existingRosterState.fighterIds[i];
        if (!existingId || existingId === fighterEntity.id || !existingRosterState.fightersById[existingId]) {
          continue;
        }
        if (!section.fightersById[existingId]) {
          section.fighterIds.push(existingId);
        }
        section.fightersById[existingId] = clone(existingRosterState.fightersById[existingId]);
      }
    }
    if (typeof ContentLoader !== "undefined" && ContentLoader.listCountries) {
      countries = ContentLoader.listCountries();
      for (i = 0; i < countries.length; i += 1) {
        country = countries[i];
        gyms = ContentLoader.listGymsByCountry ? ContentLoader.listGymsByCountry(country.id) : [];
        for (j = 0; j < gyms.length; j += 1) {
          gym = clone(gyms[j]);
          section.gymIds.push(gym.id);
          section.gymsById[gym.id] = {
            id: gym.id,
            name: gym.name || "",
            country: gym.country || country.id,
            city: gym.city || "",
            monthlyCost: clampNumber(gym.cost, 0),
            weeklyCost: clampNumber(gym.weeklyCost, 0),
            reputation: clampNumber(gym.reputation, 0),
            trainerIds: gym.trainerTypeIds instanceof Array ? clone(gym.trainerTypeIds) : [],
            bonuses: clone(gym.bonuses || {}),
            specialization: [],
            orgType: gym.orgType || "",
            minRankId: gym.minRankId || "",
            trainingFocus: gym.trainingFocus instanceof Array ? clone(gym.trainingFocus) : []
          };
        }
        trainers = ContentLoader.listTrainerTypesByCountry ? ContentLoader.listTrainerTypesByCountry(country.id) : [];
        for (j = 0; j < trainers.length; j += 1) {
          trainer = clone(trainers[j]);
          section.trainerIds.push(trainer.id);
          section.trainersById[trainer.id] = {
            id: trainer.id,
            name: trainer.label || "",
            country: trainer.country || country.id,
            city: trainer.city || "",
            gymId: trainer.gymId || "",
            monthlyFee: clampNumber(trainer.monthlyFee, 0),
            weeklyFee: clampNumber(trainer.weeklyFee, 0),
            reputation: clampNumber(trainer.reputation, 0),
            bonuses: clone(trainer.bonuses || {}),
            specialization: [],
            coachRoleId: trainer.coachRoleId || "",
            minRankId: trainer.minRankId || ""
          };
        }
      }
    }
    if (gameState && gameState.world) {
      if (gameState.world.opponents instanceof Array) {
        opponentPool = opponentPool.concat(gameState.world.opponents);
      }
      if (gameState.world.offers && gameState.world.offers.fightOffers instanceof Array) {
        for (i = 0; i < gameState.world.offers.fightOffers.length; i += 1) {
          if (gameState.world.offers.fightOffers[i] && gameState.world.offers.fightOffers[i].opponent) {
            opponentPool.push(gameState.world.offers.fightOffers[i].opponent);
          }
        }
      }
      if (gameState.world.rivalries instanceof Array) {
        for (i = 0; i < gameState.world.rivalries.length; i += 1) {
          if (gameState.world.rivalries[i] && gameState.world.rivalries[i].lastOpponentSnapshot) {
            opponentPool.push(gameState.world.rivalries[i].lastOpponentSnapshot);
          }
        }
      }
    }
    for (i = 0; i < opponentPool.length; i += 1) {
      fighterEntity = buildOpponentFighterEntity(opponentPool[i], gameState && gameState.career ? gameState.career.week : 1);
      if (!section.fightersById[fighterEntity.id]) {
        section.fighterIds.push(fighterEntity.id);
      }
      section.fightersById[fighterEntity.id] = fighterEntity;
    }
    return section;
  }

  function buildOrganizationStateSection(gameState, existingOrganizationState) {
    var section = clone(defaultSections().organizationState);
    var countries;
    var i;
    var country;
    var organization;
    var ranking;
    var playerEntry;
    section.id = existingOrganizationState && existingOrganizationState.id ? existingOrganizationState.id : section.id;
    section.teamIds = existingOrganizationState && existingOrganizationState.teamIds instanceof Array ? clone(existingOrganizationState.teamIds) : [];
    section.teamsById = existingOrganizationState && existingOrganizationState.teamsById ? clone(existingOrganizationState.teamsById) : {};
    if (typeof ContentLoader !== "undefined" && ContentLoader.listCountries) {
      countries = ContentLoader.listCountries();
      for (i = 0; i < countries.length; i += 1) {
        country = countries[i];
        organization = {
          id: stableId("org_street", [country.id]),
          name: country.name + " Street Circuit",
          country: country.id,
          city: country.city || "",
          type: "promotion",
          trackId: "street",
          reputation: 25 + i * 3,
          tags: ["street"]
        };
        section.organizationIds.push(organization.id);
        section.organizationsById[organization.id] = organization;
      }
    }
    section.organizationsById.org_street_world = {
      id: "org_street_world",
      name: "Street World Network",
      country: "",
      city: "",
      type: "network",
      trackId: "street",
      reputation: 35,
      tags: ["street", "world"]
    };
    for (i = 0; i < section.organizationIds.length; i += 1) {
      if (section.organizationIds[i] === "org_street_world") {
        break;
      }
    }
    if (i >= section.organizationIds.length) {
      section.organizationIds.push("org_street_world");
    }
    section.organizationIds.push("org_amateur_world");
    section.organizationsById.org_amateur_world = {
      id: "org_amateur_world",
      name: "Amateur Circuit",
      country: "",
      city: "",
      type: "league",
      trackId: "amateur",
      reputation: 55,
      tags: ["amateur"]
    };
    section.organizationIds.push("org_pro_world");
    section.organizationsById.org_pro_world = {
      id: "org_pro_world",
      name: "Pro Circuit",
      country: "",
      city: "",
      type: "league",
      trackId: "pro",
      reputation: 80,
      tags: ["pro"]
    };
    ranking = baseRankingTableSchema();
    ranking.id = "ranking_street_global";
    ranking.trackId = "street";
    ranking.organizationId = "org_street_world";
    playerEntry = {
      fighterId: "fighter_player_main",
      label: gameState && gameState.player && gameState.player.profile ? gameState.player.profile.name || "Player" : "Player",
      points: (gameState && gameState.player && gameState.player.resources ? gameState.player.resources.fame || 0 : 0) + ((gameState && gameState.player && gameState.player.record ? gameState.player.record.wins || 0 : 0) * 3),
      wins: gameState && gameState.player && gameState.player.record ? gameState.player.record.wins || 0 : 0,
      losses: gameState && gameState.player && gameState.player.record ? gameState.player.record.losses || 0 : 0
    };
    ranking.entries.push(playerEntry);
    section.rankingTableIds.push(ranking.id);
    section.rankingTablesById[ranking.id] = ranking;
    return section;
  }

  function buildCompetitionFromOffer(offer, week) {
    var entity = baseCompetitionEntitySchema();
    var countryKey = offer && (offer.countryKey || offer.country || (offer.opponent && (offer.opponent.countryKey || offer.opponent.country))) ? (offer.countryKey || offer.country || (offer.opponent && (offer.opponent.countryKey || offer.opponent.country))) : "";
    entity.id = offer && offer.id ? offer.id : stableId("competition", [countryKey || "world", offer && offer.label ? offer.label : "offer", week || 1]);
    entity.label = offer && (offer.title || offer.label) ? (offer.title || offer.label) : "Fight offer";
    entity.type = offer && offer.type ? offer.type : "fight_offer";
    entity.status = offer && offer.status ? offer.status : "available";
    entity.organizationId = stableId("org_street", [countryKey || "world"]);
    entity.trackId = "street";
    entity.country = countryKey;
    entity.city = offer && (offer.city || (offer.arena && offer.arena.city)) ? (offer.city || offer.arena.city) : "";
    entity.opponentFighterId = offer && offer.opponent ? stableId("fighter_opponent", [offer.opponent.key || offer.opponent.id || offer.opponent.name || "unknown"]) : "";
    entity.weekStamp = clampNumber(week, 1);
    entity.purse = clampNumber(offer && (offer.guaranteedPurse || offer.purse), 0);
    entity.rematchOf = offer && (offer.rematchRivalryId || offer.rematchOf) ? (offer.rematchRivalryId || offer.rematchOf) : "";
    entity.tags = offer && offer.tags instanceof Array ? clone(offer.tags) : [];
    return entity;
  }

  function buildCompetitionStateSection(gameState, existingCompetitionState) {
    var section = clone(defaultSections().competitionState);
    var offers = gameState && gameState.world && gameState.world.offers ? gameState.world.offers.fightOffers || [] : [];
    var i;
    var competition;
    section.id = existingCompetitionState && existingCompetitionState.id ? existingCompetitionState.id : section.id;
    section.amateurHooks = existingCompetitionState && existingCompetitionState.amateurHooks ? clone(existingCompetitionState.amateurHooks) : clone(defaultSections().competitionState.amateurHooks);
    section.amateurSeason = existingCompetitionState && existingCompetitionState.amateurSeason ? clone(existingCompetitionState.amateurSeason) : null;
    for (i = 0; i < offers.length; i += 1) {
      competition = buildCompetitionFromOffer(offers[i], gameState && gameState.career ? gameState.career.week : 1);
      section.competitionIds.push(competition.id);
      section.competitionsById[competition.id] = competition;
    }
    if (gameState && gameState.battle && gameState.battle.current && gameState.battle.current.offer) {
      section.activeCompetitionId = gameState.battle.current.offer.id || "";
    }
    return section;
  }

  function buildNarrativeStateSection(gameState, existingNarrativeState) {
    var section = clone(defaultSections().narrativeState);
    var npcs = gameState && gameState.world && gameState.world.npcs instanceof Array ? gameState.world.npcs : [];
    var i;
    section.id = existingNarrativeState && existingNarrativeState.id ? existingNarrativeState.id : section.id;
    section.biographyFlags = gameState && gameState.player && gameState.player.biography ? clone(gameState.player.biography.flags || []) : [];
    section.activeArcIds = [];
    if (gameState && gameState.world && gameState.world.relationshipArcs instanceof Array) {
      for (i = 0; i < gameState.world.relationshipArcs.length; i += 1) {
        if (gameState.world.relationshipArcs[i] && gameState.world.relationshipArcs[i].id) {
          section.activeArcIds.push(gameState.world.relationshipArcs[i].id);
        }
      }
    }
    section.rivalryIds = [];
    if (gameState && gameState.world && gameState.world.rivalries instanceof Array) {
      for (i = 0; i < gameState.world.rivalries.length; i += 1) {
        if (gameState.world.rivalries[i] && gameState.world.rivalries[i].id) {
          section.rivalryIds.push(gameState.world.rivalries[i].id);
        }
      }
    }
    section.mediaCount = gameState && gameState.player && gameState.player.biography && gameState.player.biography.mediaFeed instanceof Array ? gameState.player.biography.mediaFeed.length : 0;
    section.historyCount = gameState && gameState.player && gameState.player.biography && gameState.player.biography.history instanceof Array ? gameState.player.biography.history.length : 0;
    section.knownNpcIds = [];
    for (i = 0; i < npcs.length; i += 1) {
      if (npcs[i] && npcs[i].knownToPlayer && npcs[i].id) {
        section.knownNpcIds.push(npcs[i].id);
      }
    }
    return section;
  }

  function attachSections(gameState, sourceState) {
    var sections = defaultSections();
    var source = sourceState || {};
    if (!gameState || typeof gameState !== "object") {
      return gameState;
    }
    gameState.playerState = buildPlayerStateSection(gameState, source.playerState || gameState.playerState || sections.playerState);
    gameState.worldState = buildWorldStateSection(gameState, source.worldState || gameState.worldState || sections.worldState);
    gameState.rosterState = buildRosterStateSection(gameState, source.rosterState || gameState.rosterState || sections.rosterState);
    gameState.organizationState = buildOrganizationStateSection(gameState, source.organizationState || gameState.organizationState || sections.organizationState);
    gameState.competitionState = buildCompetitionStateSection(gameState, source.competitionState || gameState.competitionState || sections.competitionState);
    gameState.narrativeState = buildNarrativeStateSection(gameState, source.narrativeState || gameState.narrativeState || sections.narrativeState);
    return gameState;
  }

  return {
    stableId: stableId,
    baseWorldTimelineSchema: baseWorldTimelineSchema,
    baseWorldCareerSchema: baseWorldCareerSchema,
    baseCareerTrackStateSchema: baseCareerTrackStateSchema,
    baseFighterEntitySchema: baseFighterEntitySchema,
    baseGymEntitySchema: baseGymEntitySchema,
    baseTrainerEntitySchema: baseTrainerEntitySchema,
    baseCompetitionEntitySchema: baseCompetitionEntitySchema,
    baseOrganizationEntitySchema: baseOrganizationEntitySchema,
    baseRankingTableSchema: baseRankingTableSchema,
    baseTournamentBracketSchema: baseTournamentBracketSchema,
    defaultSections: defaultSections,
    attachSections: attachSections
  };
}());
