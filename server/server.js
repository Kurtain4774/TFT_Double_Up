const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

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

app.listen(3001, () => {
  console.log("Server started at port 3001");
});
