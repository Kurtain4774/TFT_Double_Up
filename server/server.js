const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/player", (req, res) => {
  username = req.query.username;
  region = req.query.region;

  //console.log(username + " " + region + " " + process.env.RIOT_API_KEY);

  fetch(
    "https://" +
      region +
      ".api.riotgames.com/tft/summoner/v1/summoners/by-name/" +
      username +
      "?api_key=" +
      process.env.RIOT_API_KEY,
    {
      method: "GET",
      mode: "cors",
    }
  )
    .then((response) => response.json())
    .then((data) => {
      //console.log("Printing Data:")
      //console.log(data);
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
