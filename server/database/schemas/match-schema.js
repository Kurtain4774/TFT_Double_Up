const mongoose = require("mongoose");

const companionSchema = mongoose.Schema({
  content_ID: { type: String, required: true, unique: false },
  item_ID: { type: Number, required: true, unique: false },
  skin_ID: { type: Number, required: true, unique: false },
  species: { type: String, required: true, unique: false },
});

const traitSchema = mongoose.Schema({
  name: { type: String, required: true, unique: false },
  num_units: { type: Number, required: true, unique: false },
  style: { type: Number, required: true, unique: false }, //0 no style 1 bronze 2 silver 3 gold 4 prismatic
  tier_current: { type: Number, required: true, unique: false },
  tier_total: { type: Number, required: true, unique: false },
});

const unitSchema = mongoose.Schema({
  items: [String],
  character_id: { type: String, required: true, unique: false },
  chosen: { type: String, required: false, unique: false },
  name: { type: String, required: false, unique: false },
  rarity: { type: String, required: true, unique: false },
  tier: { type: String, required: true, unique: false },
});

const missionSchema = mongoose.Schema({
  Assists: { type: Number, required: false, unique: false },
  DamageDealt: { type: Number, required: false, unique: false },
  DamageDealtToObjectives: { type: Number, required: false, unique: false },
  DamageDealtToTurrets: { type: Number, required: false, unique: false },
  DamageTaken: { type: Number, required: false, unique: false },
  Deaths: { type: Number, required: false, unique: false },
  DoubleKills: { type: Number, required: false, unique: false },
  GoldEarned: { type: Number, required: false, unique: false },
  GoldSpent: { type: Number, required: false, unique: false },
  InhibitorsDestroyed: { type: Number, required: false, unique: false },
  KillingSprees: { type: Number, required: false, unique: false },
  Kills: { type: Number, required: false, unique: false },
  LargestKillingSpree: { type: Number, required: false, unique: false },
  LargestMultiKill: { type: Number, required: false, unique: false },
  MagicDamageDealt: { type: Number, required: false, unique: false },
  MagicDamageDealtToChampions: { type: Number, required: false, unique: false },
  MagicDamageTaken: { type: Number, required: false, unique: false },
  NeutralMinionsKilledTeamJungle: {
    type: Number,
    required: false,
    unique: false,
  },
  PentaKills: { type: Number, required: false, unique: false },
  PhysicalDamageDealt: { type: Number, required: false, unique: false },
  PhysicalDamageDealtToChampions: {
    type: Number,
    required: false,
    unique: false,
  },
  PhysicalDamageTaken: { type: Number, required: false, unique: false },
  PlayerScore0: { type: Number, required: false, unique: false },
  PlayerScore1: { type: Number, required: false, unique: false },
  PlayerScore10: { type: Number, required: false, unique: false },
  PlayerScore11: { type: Number, required: false, unique: false },
  PlayerScore2: { type: Number, required: false, unique: false },
  PlayerScore3: { type: Number, required: false, unique: false },
  PlayerScore4: { type: Number, required: false, unique: false },
  PlayerScore5: { type: Number, required: false, unique: false },
  PlayerScore6: { type: Number, required: false, unique: false },
  PlayerScore9: { type: Number, required: false, unique: false },
  QuadraKills: { type: Number, required: false, unique: false },
  Spell1Casts: { type: Number, required: false, unique: false },
  Spell2Casts: { type: Number, required: false, unique: false },
  Spell3Casts: { type: Number, required: false, unique: false },
  Spell4Casts: { type: Number, required: false, unique: false },
  SummonSpell1Casts: { type: Number, required: false, unique: false },
  TimeCCOthers: { type: Number, required: false, unique: false },
  TotalDamageDealtToChampions: { type: Number, required: false, unique: false },
  TotalMinionsKilled: { type: Number, required: false, unique: false },
  TripleKills: { type: Number, required: false, unique: false },
  TrueDamageDealt: { type: Number, required: false, unique: false },
  TrueDamageDealtToChampions: { type: Number, required: false, unique: false },
  TrueDamageTaken: { type: Number, required: false, unique: false },
  UnrealKills: { type: Number, required: false, unique: false },
  VisionScore: { type: Number, required: false, unique: false },
  WardsKilled: { type: Number, required: false, unique: false },
});

const participantSchema = mongoose.Schema({
  augments: [String],
  companion: { type: companionSchema, required: true, unique: false },
  gold_left: { type: Number, required: true, unique: false },
  last_round: { type: Number, required: true, unique: false },
  missions: { type: missionSchema, required: false, unique: false },
  partner_group_id: { type: Number, required: false, unique: false },
  level: { type: Number, required: true, unique: false },
  placement: { type: Number, required: true, unique: false },
  players_eliminated: { type: Number, required: true, unique: false },
  puuid: { type: String, required: true, unique: false },
  time_eliminated: { type: Number, required: true, unique: false },
  total_damage_to_players: { type: Number, required: true, unique: false },
  traits: [traitSchema],
  units: [unitSchema],
});

const metadataSchema = mongoose.Schema({
  data_version: { type: String, required: true, unique: false },
  match_id: { type: String, required: true, unique: true },
  participants: [String],
});

const infoSchema = mongoose.Schema({
  endOfGameResult: { type: String, required: false, unique: false },
  gameCreation: { type: Number, required: false, unique: false },
  gameId: { type: Number, required: false, unique: false },
  game_datetime: { type: Number, required: true, unique: false },
  game_length: { type: Number, required: true, unique: false },
  game_variation: { type: String, required: false, unique: false },
  mapId: { type: Number, required: false, unique: false },
  game_version: { type: String, required: true, unique: false },
  participants: [participantSchema],
  queue_id: { type: Number, required: true, unique: false },
  queueId: { type: Number, required: false, unique: false },
  tft_game_type: { type: String, required: false, unique: false },
  tft_set_core_name: { type: String, required: false, unique: false },
  tft_set_number: { type: Number, required: true, unique: false },
});

const matchSchema = mongoose.Schema({
  metadata: { type: metadataSchema, required: true, unique: false },
  info: { type: infoSchema, required: true, unique: false },
});

const Match = mongoose.model("matches", matchSchema);

module.exports = Match;
