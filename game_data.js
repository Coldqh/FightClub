var DATA = {
  statLabels: {
    str: "РЎРёР»Р°",
    tec: "РўРµС…РЅРёРєР°",
    spd: "РЎРєРѕСЂРѕСЃС‚СЊ",
    end: "Р’С‹РЅРѕСЃР»РёРІРѕСЃС‚СЊ",
    vit: "Р—РґРѕСЂРѕРІСЊРµ"
  },
  statDescriptions: {
    str: "РЈРІРµР»РёС‡РёРІР°РµС‚ РјРЅРѕР¶РёС‚РµР»СЊ СѓСЂРѕРЅР°.",
    tec: "РџРѕРґРЅРёРјР°РµС‚ С‚РѕС‡РЅРѕСЃС‚СЊ Рё С€Р°РЅСЃ РєСЂРёС‚Р°.",
    spd: "Р”Р°С‘С‚ СѓРєР»РѕРЅ Рё СѓСЃРёР»РёРІР°РµС‚ РєРѕРЅС‚СЂР°С‚Р°РєСѓ.",
    end: "РџРѕРІС‹С€Р°РµС‚ РјР°РєСЃРёРјСѓРј СЃС‚Р°РјРёРЅС‹.",
    vit: "РџРѕРІС‹С€Р°РµС‚ РјР°РєСЃРёРјСѓРј Р·РґРѕСЂРѕРІСЊСЏ."
  }
};

var FIGHT_ACTIONS = {
  move_up: { type: "move", label: "РЁР°Рі РІРІРµСЂС…", dx: 0, dy: -1, stamina: 5 },
  move_left: { type: "move", label: "РЁР°Рі РІР»РµРІРѕ", dx: -1, dy: 0, stamina: 5 },
  move_right: { type: "move", label: "РЁР°Рі РІРїСЂР°РІРѕ", dx: 1, dy: 0, stamina: 5 },
  move_down: { type: "move", label: "РЁР°Рі РІРЅРёР·", dx: 0, dy: 1, stamina: 5 },
  jab: { type: "attack", label: "Р”Р¶РµР±", reach: "line", hitBonus: 10, damage: 8, stamina: 7 },
  cross: { type: "attack", label: "РљСЂРѕСЃСЃ", reach: "line", hitBonus: 0, damage: 12, stamina: 11 },
  body: { type: "attack", label: "РЈРґР°СЂ РІ РєРѕСЂРїСѓСЃ", reach: "line", hitBonus: 5, damage: 10, stamina: 10 },
  hook: { type: "attack", label: "РҐСѓРє", reach: "close", hitBonus: -6, damage: 16, stamina: 15 },
  uppercut: { type: "attack", label: "РђРїРїРµСЂРєРѕС‚", reach: "close", hitBonus: -12, damage: 21, stamina: 18 },
  block: { type: "defense", label: "Р‘Р»РѕРє", staminaGain: 30 },
  counter: { type: "defense", label: "РљРѕРЅС‚СЂР°С‚Р°РєР°", staminaGain: 15 }
};

var TRAINING_OPTIONS = {
  light: { label: "Р›С‘РіРєР°СЏ", points: 10, health: -6, stress: 6 },
  medium: { label: "РЎСЂРµРґРЅСЏСЏ", points: 20, health: -12, stress: 12 },
  hard: { label: "Р–С‘СЃС‚РєР°СЏ", points: 30, health: -18, stress: 18 }
};

var RECOVERY_OPTIONS = {
  home: { label: "РћС‚Р»РµР¶Р°С‚СЊСЃСЏ РґРѕРјР°", cost: 0, health: 18, stress: -10 },
  doctor: { label: "РЎРїРѕСЂС‚РёРІРЅС‹Р№ РІСЂР°С‡", cost: 60, health: 30, stress: -6 },
  therapy: { label: "РўРµСЂР°РїРёСЏ Рё РјР°СЃСЃР°Р¶", cost: 35, health: 20, stress: -16 }
};

var WEEKLY_EXPENSE = 30;

var LEGAL_JOB = {
  label: "Р Р°Р±РѕС‚Р° РІ Р·Р°Р»Рµ",
  money: 90,
  health: -15,
  stress: 10
};

var NAV_TABS = [
  { key: "home", label: "РћСЃРЅРѕРІРЅРѕРµ" },
  { key: "character", label: "РџРµСЂСЃРѕРЅР°Р¶" },
  { key: "people", label: "Р›СЋРґРё" },
  { key: "skills", label: "РќР°РІС‹РєРё" },
  { key: "careerLog", label: "Р›РµРЅС‚Р°" }
];
