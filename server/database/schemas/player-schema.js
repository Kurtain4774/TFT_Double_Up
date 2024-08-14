const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
    teammate: {type: String, required: true, unique: false},
    matchId: {type: String, required: true, unique: false},
    league: {type: String, required: false, unique: false},
    tier: {type: Number, required: false, unique: false},
    points: {type: Number, required: false, unique: false},
})
const playerSchema = new mongoose.Schema({
    username: {type: String, required: true, unique: false},
    tag: {type: String, required: true, unique: false},
    puuid: {type: String, required: true, unique: true},
    lastUpdated: {type: Number, required: true, unique: false},
    matchIds: [matchSchema],
})

const Player = mongoose.model("players", playerSchema);

module.exports = Player;