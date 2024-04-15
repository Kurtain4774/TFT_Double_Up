const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const Leaderboard = require("./leader-board-row");
const Region = require("./region");
const mongoURI = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.vqo1fcm.mongodb.net/`;
const app = express();

app.use(cors());
app.use(express.json());



mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected successfully to MongoDB Atlas cluster');
    })
    .catch((err) => {
        console.error('Error occurred while connecting to MongoDB Atlas cluster', err);
    });

    const regions = [
      "BR1",
      "EUN1",
      "EUW1",
      "JP1",
      "KR",
      "LA1",
      "LA2",
      "NA1",
      "OCE1",
      "PH2",
      "RU",
      "SG2",
      "TH2",
      "TR1",
      "TW2",
      "VN2",
    ];

async function addRegions(){
  try {
    await Region.deleteMany({});

    for(const region of regions){
      await Region.create({
        name: region,
      })
    }

    return Region.find({});
  } catch(e){
    console.log(e.message);
  }

}
app.get("/", async (req, res) => {
  try{
    
  }catch(e){
    console.log(e.message);
  }

  
});

async function getLeaderboard(region){
  return await Leaderboard.find({region: `${region}`});
}

async function sortLeaderboard(region){
  await Leaderboard.find({region: `${region}`}).sort({"tier": 1, "division": 1, "points": -1})
}

async function updateLeaderboardRanks(region){
  const leaderboard = getLeaderboard(region);

  let i = 1;

  while(i < leaderboard.length){
    leaderboard[i].rank = i;
  }

  await leaderboard.save();
}

function getRegion(region){
  let routing = "";

    switch(region){
        case na:
        case br:
        case lan:
        case las:
            routing = "americas";
            break;
        case kr:
        case jp:
            routing = "asia";
            break;
        case eune:
        case euw:
        case tr:
        case ru:
            routing = "europe";
            break;
        default:
            routing = "sea";
            break;
    }
}

app.get("/player", (req, res) => {
  const username = req.query.username;
  const region = req.query.region;

  fetch(
    `https://${region}.api.riotgames.com/tft/summoner/v1/summoners/by-name/${username}?api_key=${process.env.RIOT_API_KEY}`,
    {
      method: "GET",
      mode: "cors",
    }
  )
    .then((response) => {
        if(!response.ok){
            res.status(400)
        }
        return response.json()
    })
    .then((data) => {
      res.json(data);
    })
    .catch((error) => {
      console.error(error);
      res.status(400).send({
        message: "Could not find summoner data",
      });
    });
});

app.get("/player/matches", (req, res) => {
    const puuid = req.query.puuid;
    const region = req.query.region;
    const start = req.query.start;

    let routing = getRegion(region);

    fetch(
        `https://${routing}.api.riotgames.com/tft/match/v1/matches/by-puuid/${puuid}?api_key=${process.env.RIOT_API_KEY}`,
        {
          method: "GET",
          mode: "cors",
        }
      )
        .then((response) => response.json())
        .then((data) => {
          res.json(data);
        })
        .catch((error) => {
          console.error(error);
          res.status(400).send({
            message: "Could not find summoner data",
          });
        });
});

async function fetchLeaderboardByTier(tier,division,region){
  tierString = "";
  divisionString = "";

  switch(tier){
    case 0:
      tierString = "DIAMOND";
      break;
    case 1: 
      tierString = "EMERALD";
      break;
    case 2:
      tierString = "PLATINUM";
      break;
    case 3:
      tierString = "GOLD";
      break;
    case 4:
      tierString = "SILVER";
      break;
    case 5:
      tierString = "BRONZE";
      break;
    case 6:
      tierString = "IRON";
      break;
    default:
      tierString = "";
      break;
  }

  switch(division){
    case 1: 
    divisionString = "I";
    break;
    case 2: 
    divisionString = "II";
    break;
    case 3:
      divisionString = "III";
      break;
    case 4:
      divisionString = "IV";
      break;
    default:
      divisionString = "";
      break;
  }

  console.log("Checking " + tierString + " " + divisionString);

  return fetch(
    `https://${region}.api.riotgames.com/tft/league/v1/entries/${tierString}/${divisionString}?queue=RANKED_TFT_DOUBLE_UP&page=1&api_key=${process.env.RIOT_API_KEY}`,
    {
      method: "GET",
      mode: "cors",
    }
  )
    .then((response) => response.json())
    .then((data) => {
      return data;
    })
    .catch((error) => {
      console.error(error);
      res.status(400).send({
        message: "Could not find summoner data",
      });
    });



}
app.get("/leaderboard", async (req, res) => {
  const region = req.query.region;

  console.log("REGION: " + region);
  const urls = [
      `https://${region}.api.riotgames.com/tft/league/v1/challenger?queue=RANKED_TFT_DOUBLE_UP&api_key=${process.env.RIOT_API_KEY}`,
      `https://${region}.api.riotgames.com/tft/league/v1/grandmaster?queue=RANKED_TFT_DOUBLE_UP&api_key=${process.env.RIOT_API_KEY}`,
      `https://${region}.api.riotgames.com/tft/league/v1/master?queue=RANKED_TFT_DOUBLE_UP&api_key=${process.env.RIOT_API_KEY}`
  ];

  const fetchPromises = urls.map(url => fetch(url));

  try {
      const responses = await Promise.all(fetchPromises);
      const data = await Promise.all(responses.map(response => response.json()));
      let allData = [...data[0].entries, ...data[1].entries, ...data[2].entries];

      if (allData.length >= 500) {
          res.json(allData);
          return; // Return to prevent further execution
      }

      let tier = 0;
      let division = 1;
      while (allData.length < 500) {
          const newData = await fetchLeaderboardByTier(tier, division, region);
          allData = [...allData, ...newData];
          console.log(allData.length);

          division++;
          if (division > 4) {
              division = 1;
              tier++;
          }

          if (tier > 6) {
              break;
          }
      }

      res.json(allData);
  } catch (error) {
      console.error(error);
      res.status(400).send({
          message: "Could not find summoner data",
      });
  }
});
app.listen(3001, () => {
  console.log("Server started at port 3001");
});
