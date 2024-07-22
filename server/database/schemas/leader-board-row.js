const mongoose = require("mongoose")

const leaderboardEntree = new mongoose.Schema({
    rank: Number,
    summonerName: String,
    topFourRate: Number,
    tier: String,
    division: Number,
    points: Number,
    winRate: Number,
})

const leaderboardSchema = new mongoose.Schema({
    region: {
        type: String,
        unique: true,
    },
    data: leaderboardEntree,
    updatedAt: {
        type: Date,
        default: () => Date.now(),
    }
})

module.exports = mongoose.model("Leaderboard", leaderboardSchema)