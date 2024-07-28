const Bottleneck = require("bottleneck");
const { connectToMongoDB, insertPlayer, findPlayers, updateTime, updateMatches, findMatches, deletePlayers } = require('../database/player-db');
const playerModel = require('../database/schemas/player-schema');
const matchModel = require('../database/schemas/match-schema');

//Bottleneck limiter limits number of requests to 1 per 1200ms or 100 per 2 minutes
const limiterPerSecond = new Bottleneck({
  //reservoir helps with bursts of requests
  reservoir: 100,
  reservoirRefreshAmount: 100,
  reservoirRefreshInterval: 120000,

  maxConcurrent: 1,
  minTime: 1200,
  
});

//Function takes in username and tag
//Returns puuid from RIOT api or null if not found
async function fetchPuuid(username, tag) {
  const response = await fetchWithRetry(`https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${username}/${tag}?api_key=${process.env.RIOT_API_KEY}`);
  const json = await response.json();

  return response.ok ? json.puuid : null;
}

//returns database information on player that matches a certain username and tag
async function getPlayerInfo(username, tag){
  //looks through my database to find the player
  let player = await findPlayers(username,tag);
  
  //if the player doesnt exist in my database, we need to find them using riot api and then add them to my database for future reference
  if(!player){
    //use riots api to find the puuid of the user given username and tag
    const puuid = await fetchPuuid(username, tag);
    if(!puuid){
      console.log("Riot api did not find user: " + username + " " + tag);
      return null;
    }

    //add a player document to my database containing information about the player. 
    player = {
      username: username,
      tag: tag,
      puuid: puuid,
      lastUpdated: process.env.SET_START_TIME
    }
    insertPlayer(player);
  }

  return player;
}

//function takes in when my database was last updated and a player's puuid
//queries riot api for all matches played by that player after the given time
async function fetchMatchIDs(startTime = lastUpdated, puuid) {
  //we do not want duplicate matches so we use a set
  const matchIDs = new Set();
  let start = 0;

  //do have to use this do while loop because riot's api only returns a max of 200 matchIds per query
  do {
    const response = await fetchWithRetry(`https://americas.api.riotgames.com/tft/match/v1/matches/by-puuid/${puuid}/ids?start=${start}&startTime=${startTime}&count=200&api_key=${process.env.RIOT_API_KEY}`);
    const json = await response.json();
    if(json){
      const set = new Set(json);

      //combines the set of matches we just got with the overall set of total match Ids
      set.forEach(match => matchIDs.add(match));
    } else {
      console.log("failed");
    }

    start += 200;
  } while (matchIDs.size == start);

  return matchIDs;
}

//function takes in a riot api url to fetch and attempts to execute the fetch request a few times until it passes the rate limit.
async function fetchWithRetry(url, retries = 5, delay = 1200) {
  for (let i = 0; i < retries; i++) {
      const response = await limiterPerSecond.schedule(() => fetch(url));
      if (response.status === 429) {
          console.log("Rate limited, retrying...");
          //pause the program for a set delay when we face a 429 error. 
          //This works because we essentially are waiting for riot's api to give us more api calls
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2; // Exponential backoff
      } else {
          return response;
      }
  }
  throw new Error('Max retries reached');
}

//function takes in a list of matchIds and a puuid and returns only the double up matches in that list of matchIds
async function filterDoubleUpGames(matchIds, puuid) {
  let doubleUpMatchIDs = [];

  //loop through every single matchId
  await Promise.all(matchIds.map(async (matchId) => {
    //fetch the matchId from the riot api
    const response = await fetchWithRetry(`https://americas.api.riotgames.com/tft/match/v1/matches/${matchId}?api_key=${process.env.RIOT_API_KEY}`);
    console.log("looking up: " + matchId);
    
    const json = await response.json();

    const info = json.info;
    
    if (info) {
      if(info.queue_id === 1160){
        const participants = info.participants;

        // Find the player data for the given puuid
        const playerData = participants.find(player => player.puuid === puuid);

        if (playerData) {
          const team = playerData.partner_group_id;

          // Find the teammate's puuid who is in the same team but not the same player
          const teammate = participants.find(player => player.partner_group_id === team && player.puuid !== puuid);

          if (teammate) {
            doubleUpMatchIDs.push({ teammate: teammate.puuid, matchId: matchId });
          }
        }
      }
    } else {
      console.log("Error couldn't read json: " + matchId);
    }
    
  }));

  return doubleUpMatchIDs;
}

//function updates player information in my database
async function checkPlayer(username, tag){
  //check if the player currently exists in my database or in the riot database/add them to my database
  const player = await getPlayerInfo(username, tag);

  //if the player with the tag cannot be found then return an error back to the front end
  if(player == null){
    res.status(404).send({username: username, tag: tag});
    return;
  }

  //get information about the current player including their puuid and when I last pulled information about them
  const puuid = player.puuid;

  const lastUpdated = player.lastUpdated;

  //fetch the matchIds of any new matches they have played since my database was last updated.
  const newMatches = await fetchMatchIDs(lastUpdated, puuid);

  //get the number of new matches
  //if there is a low number of new matches we can change the limiter settings since we are unlikely to run into api rate limits
  const totalMatches = newMatches.size;

  if(totalMatches < 90 && await limiterPerSecond.currentReservoir() >= totalMatches){
    console.log("changed to 50ms");
    limiterPerSecond.updateSettings({minTime: 50});
  } else {
    console.log("changed to 1200ms");
    limiterPerSecond.updateSettings({minTime: 1200});
  }

  //filter out any useless games that aren't double up games
  const newDoubleUpGames = await filterDoubleUpGames(Array.from(newMatches), puuid);

  //update the last updated time in my database
  updateTime(username,tag);

  //add the new matches into my database for future reference
  await updateMatches(username,tag,newDoubleUpGames);

  return puuid;
}

//function gets information on double up games given all the matchIds to look for
async function fetchGameStats(commonIds, puuidArray) {
  const stats = [];
  const placementCounts = [0,0,0,0];

  //go through all the double up game Ids that both players have in common and collect stats on them
  await Promise.all(commonIds.map(async (matchID) => {
    const response = await limiterPerSecond.schedule(() => fetch(`https://americas.api.riotgames.com/tft/match/v1/matches/${matchID}?api_key=${process.env.RIOT_API_KEY}`));
    const json = await response.json();

    const info = json.info;
    
    if (info && info.queue_id === 1160) {
      const participants = info.participants;
      let player1Data;
      let player2Data;

      for(let player of participants){
        if(player.puuid === puuidArray[0]){
          player1Data = player;
        } else if(player.puuid === puuidArray[1]){
          player2Data = player;
        }
      }
      if (player1Data && player2Data && player1Data.partner_group_id === player2Data.partner_group_id) {
        let gameStats = [];
        const placement = Math.ceil(player1Data.placement/2);
        placementCounts[placement-1]++;
        gameStats.push(placement);
        gameStats.push(player1Data.total_damage_to_players);
        gameStats.push(player2Data.total_damage_to_players);
        gameStats.push(matchID);
        stats.push(gameStats);
      }
    } else {
      console.log("skipped: " + matchID);
    }
  }));

  stats.push(placementCounts);
  return stats;
}

//code generates an array of match IDs that two players have in common
const getMatches = async (req, res) => {
    const username1 = req.query.username;
    const tag1 = req.query.tag;
    const username2 = req.query.username2;
    const tag2 = req.query.tag2;
    console.log("Parameters: " + username1 + "#" + tag1 + " " + username2 + "#" + tag2);

    //connect to mongoDB
    await connectToMongoDB();

    //update my database with games and stats of both players
    const puuid1 = await checkPlayer(username1,tag1);

    const puuid2 = await checkPlayer(username2, tag2);


    //find the games where both players were teammates
    const commonIds = await findMatches(puuid1, puuid2);
    
    //collect stats on those games
    //array of stats containing [placement,player1damage,player2damage,matchID]
    const matchStats = await fetchGameStats(commonIds.matchIds, [puuid1,puuid2]);

    //send data to the frontend
    res.status(200).send([...matchStats]);
    return;
  };

  module.exports = {
    getMatches
  };