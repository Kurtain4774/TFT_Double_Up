const express = require("express");
const cors = require("cors");
const playerRoutes = require('./routes/playerRoute');
const dotenv = require("dotenv");


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/player', playerRoutes);




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

app.get("/", async (req, res) => {
  try {
  } catch (e) {
    console.log(e.message);
  }
});

function getRegion(region) {
  let routing = "";

  switch (region) {
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

  return router;
}

app.get("/leaderboard", async (req, res) => {
  
});

app.listen(3001, () => {
  console.log("Server started at port 3001");
});
