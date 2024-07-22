const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
    teammate: {type: String, required: true, unique: false},
    matchId: {type: String, required: true, unique: true}
})
const playerSchema = new mongoose.Schema({
    username: {type: String, required: true, unique: false},
    tag: {type: String, required: true, unique: false},
    puuid: {type: String, required: true, unique: true},
    matchIds: [matchSchema],
})

const Player = mongoose.model('Player', playerSchema);

module.exports = Player;