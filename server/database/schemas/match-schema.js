const mongoose = require('mongoose')

const puuidSchema = mongoose.Schema({puuid: {type: String, required: true, unique: true}})

const metadataSchema = mongoose.Schema({
    data_version: {type: String, required: true, unique: false},
    match_id: {type: String, required: true, unique: true},
    participants: [puuidSchema],
})

const infoSchema = mongoose.Schema({
    game_datetime: {type: Long, required: true, unique: false},
    game_length: {type: Float32Array, required: true, unique: false},
    game_variation: {type: String, required: true, unique: false},
    game_version: {type: String, required: true, unique: false},
    participants: [participantSchema],
    queue_id: {type: Int16Array, required: true, unique: false},
    tft_set_number: {type: Int16Array, required: true, unique: false},
})

const participantSchema = mongoose.Schema({
    companion: {type: companionSchema, required: true, unique: false},
    gold_left: {type: Int16Array, required: true, unique: false},
    last_round: {type: Int16Array, required: true, unique: false},
    level: {type: Int16Array, required: true, unique: false},
    placement: {type: Int16Array, required: true, unique: false},
    players_eliminated: {type: Int16Array, required: true, unique: false},
    puuid: {type: String, required: true, unique: true},
    time_eliminated: {type: Float64Array, required: true, unique: false},
    total_damage_to_players: {type: Int16Array, required: true, unique: false},
    traits: [traitSchema],
    units: [unitSchema],
})

const traitSchema = mongoose.Schema({
    name: {type: String, required: true, unique: false},
    num_units: {type: Int16Array, required: true, unique: false},
    style: {type: Int16Array, required: true, unique: false}, //0 no style 1 bronze 2 silver 3 gold 4 prismatic
    tier_current: {type: Int16Array, required: true, unique: false},
    tier_total: {type: Int16Array, required: true, unique: false},
})

const unitSchema = mongoose.Schema({
    items: [itemSchema],
    character_id: {type: String, required: true, unique: false},
    chosen: {type: String, required: false, unique: false},
    name: {type: String, required: false, unique: false},
    rarity: {type: String, required: true, unique: false},
    tier: {type: String, required: true, unique: false},
})

const itemSchema = mongoose.Schema({
    id: {type: Int16Array, required: true, unique: false}
})

const companionSchema = mongoose.Schema({
    content_ID: {type: String, required: true, unique: false},
    item_ID: {type: Int32Array, required: true, unique: false},
    skin_ID: {type: Int16Array, required: true, unique: false},
    species: {type: String, required: true, unique: false},
})

const matchSchema = mongoose.Schema({
    metadata: {type: metadataSchema, required: true, unique: true},
    info: {type: infoSchema, required: true, unique: false},
})

const Match = mongoose.model('Match', matchSchema);

module.exports = Match;